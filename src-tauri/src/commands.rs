use tauri::State;
use crate::db::{Database, Group, Note};

#[tauri::command]
pub fn create_group(db: State<'_, Database>, name: String) -> Result<Group, String> {
    db.create_group(&name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_group(db: State<'_, Database>, id: i64, name: String) -> Result<(), String> {
    db.update_group(id, &name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_group(db: State<'_, Database>, id: i64) -> Result<(), String> {
    db.delete_group(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_groups(db: State<'_, Database>) -> Result<Vec<Group>, String> {
    db.get_all_groups().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_note(db: State<'_, Database>, name: String, content: String, group_id: Option<i64>) -> Result<Note, String> {
    db.create_note(&name, &content, group_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_note(db: State<'_, Database>, id: i64, name: String, content: String, group_id: Option<i64>) -> Result<(), String> {
    db.update_note(id, &name, &content, group_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_note(db: State<'_, Database>, id: i64) -> Result<(), String> {
    db.delete_note(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_notes(db: State<'_, Database>) -> Result<Vec<Note>, String> {
    db.get_all_notes().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn copy_to_clipboard(content: String) -> Result<(), String> {
    use arboard::Clipboard;
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(content).map_err(|e| e.to_string())
}
