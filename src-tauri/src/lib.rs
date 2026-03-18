mod commands;
mod db;

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{
    AppHandle, Emitter, Manager,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    WebviewUrl, WebviewWindowBuilder,
};

static LAST_SHOW_TIME: AtomicU64 = AtomicU64::new(0);

fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

fn toggle_panel(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            LAST_SHOW_TIME.store(now_millis(), Ordering::SeqCst);
            let _ = window.show();
            let _ = window.set_focus();
        }
    } else {
        create_main_window(app);
    }
}

fn create_main_window(app: &AppHandle) {
    LAST_SHOW_TIME.store(now_millis(), Ordering::SeqCst);
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title("Simple Note")
        .inner_size(360.0, 500.0)
        .resizable(false)
        .decorations(false)
        .transparent(true)
        .background_color(tauri::window::Color(0, 0, 0, 0))
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(true)
        .focused(true)
        .build();

    if let Ok(win) = window {
        let _ = position_window_near_tray(app, &win);

        let win_clone = win.clone();
        win.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(false) = event {
                if now_millis() - LAST_SHOW_TIME.load(Ordering::SeqCst) < 300 {
                    return;
                }
                for (label, win) in win_clone.app_handle().webview_windows() {
                    if (label.starts_with("editor") || label.starts_with("settings"))
                        && win.is_visible().unwrap_or(false)
                    {
                        return;
                    }
                }
                let _ = win_clone.hide();
            }
        });
    }
}

fn open_new_note_window(app: &AppHandle) {
    // Show main panel first
    toggle_panel(app);

    // Open editor in create mode
    let label = format!("editor-new-{}", now_millis());
    let _ = WebviewWindowBuilder::new(
        app,
        &label,
        WebviewUrl::App("editor.html?type=note&mode=create".into()),
    )
    .title("新建笔记")
    .inner_size(420.0, 380.0)
    .resizable(false)
    .center()
    .always_on_top(true)
    .build();
}

fn position_window_near_tray(app: &AppHandle, window: &tauri::WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        if let Some(rect) = tray.rect().ok().flatten() {
            let (tray_x, tray_y) = match rect.position {
                tauri::Position::Logical(pos) => (pos.x, pos.y),
                tauri::Position::Physical(pos) => {
                    let scale = window.scale_factor()?;
                    (pos.x as f64 / scale, pos.y as f64 / scale)
                }
            };
            let tray_height = match rect.size {
                tauri::Size::Logical(s) => s.height,
                tauri::Size::Physical(s) => {
                    let scale = window.scale_factor()?;
                    s.height as f64 / scale
                }
            };

            let window_size = window.outer_size()?;
            let scale = window.scale_factor()?;
            let window_width = window_size.width as f64 / scale;

            let x = tray_x - (window_width / 2.0);
            let y = tray_y + tray_height + 4.0;

            window.set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)))?;
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // Initialize database
            let app_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_dir)?;
            let db_path = app_dir.join("simple-note.db");
            let database = db::Database::new(db_path.to_str().unwrap())
                .expect("Failed to initialize database");
            app.manage(database);

            // Build tray right-click menu
            let menu = Menu::with_items(app, &[
                &MenuItem::with_id(app, "new_note", "新建笔记", true, None::<&str>)?,
                &MenuItem::with_id(app, "export_data", "导出数据", true, None::<&str>)?,
                &PredefinedMenuItem::separator(app)?,
                &MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?,
            ])?;

            // Create tray icon with menu
            let app_handle = app.handle().clone();
            let app_handle_menu = app.handle().clone();
            TrayIconBuilder::with_id("main-tray")
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .tooltip("Simple Note")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_panel(&app_handle);
                    }
                })
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "new_note" => {
                            open_new_note_window(&app_handle_menu);
                        }
                        "export_data" => {
                            // Emit event to frontend to handle export
                            let _ = app.emit("tray-export-data", ());
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Register global shortcut
            use tauri_plugin_global_shortcut::GlobalShortcutExt;
            let app_handle2 = app.handle().clone();
            app.global_shortcut().on_shortcut("CmdOrCtrl+Shift+N", move |_app, _shortcut, event| {
                if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    toggle_panel(&app_handle2);
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_group,
            commands::update_group,
            commands::delete_group,
            commands::get_all_groups,
            commands::create_note,
            commands::update_note,
            commands::delete_note,
            commands::get_all_notes,
            commands::copy_to_clipboard,
            commands::export_data,
            commands::save_to_file,
            commands::get_app_version,
            commands::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
