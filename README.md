# S-Note

S-Note 是一款专为 macOS 设计的轻量级菜单栏笔记应用。它旨在提供极致的输入体验，让你能够随时随地记录灵感、待办事项或代码片段，而无需干扰当前的工作流。

作为一款常驻菜单栏的工具，S-Note 结合了 Tauri 的高性能与 Vue 3 的灵活性，确保应用既轻快又功能丰富。

## 核心特性

S-Note 提供了多项增强生产力的功能：

*   **菜单栏常驻**：应用以 Accessory 模式运行，不占用任务栏空间，仅在菜单栏显示图标。
*   **快速唤起**：支持全局热键 `Cmd+Shift+N` 或点击菜单栏图标瞬间切换显示/隐藏状态。
*   **分类管理**：支持创建笔记分组，帮助你井然有序地组织不同类型的笔记。
*   **本地存储**：基于 SQLite 本地数据库，确保你的数据隐私与读写速度。
*   **数据迁移**：支持完整的笔记数据导入与导出功能，方便备份或在多台设备间同步。
*   **剪贴板集成**：一键将笔记内容复制到系统剪贴板。
*   **自动启动**：内置开机自启选项，确保工具随时待命。

## 技术栈

本项目采用了现代化的跨平台开发方案：

*   **前端框架**：[Vue 3](https://vuejs.org/) (Composition API) + TypeScript
*   **构建工具**：[Vite](https://vitejs.dev/)
*   **桌面框架**：[Tauri v2](https://v2.tauri.app/) (Rust)
*   **数据库**：SQLite (通过 `rusqlite` 实现)
*   **样式**：原生 CSS (保持极致轻量)

## 开发指南

### 环境准备

在开始之前，请确保你的开发环境已安装以下工具：

1.  **Rust**: [安装指南](https://www.rust-lang.org/tools/install)
2.  **Node.js**: 建议版本 18+
3.  **pnpm**: `npm install -g pnpm`
4.  **macOS 依赖**: 确保已安装 Xcode Command Line Tools。

### 快速开始

按照以下步骤在本地运行项目：

1.  **安装依赖**：
    ```bash
    pnpm install
    ```

2.  **启动开发模式**：
    ```bash
    pnpm tauri dev
    ```

### 应用打包

构建生产环境的安装包：

```bash
pnpm tauri build
```

构建完成后，你可以在 `src-tauri/target/release/bundle` 目录下找到生成的 `.app` 或 `.dmg` 文件。

## 快捷键说明

| 快捷键 | 功能 |
| :--- | :--- |
| `Cmd + Shift + N` | 显示/隐藏主面板 |
| `Esc` | 当焦点在应用上时隐藏面板 |

## 项目结构

*   `src/`: Vue 前端源代码，包含组件、组合式函数（Composables）等。
*   `src-tauri/`: Rust 后端源代码，处理窗口逻辑、数据库操作和系统集成。
    *   `src/db.rs`: 数据库初始化与操作逻辑。
    *   `src/commands.rs`: 定义前端可调用的 Rust 指令。
*   `icons/`: 应用图标资源。

## 开源协议

本项目采用 [ISC](LICENSE) 协议。
