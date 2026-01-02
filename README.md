# Tabby iflow Newline Plugin

一个 Tabby 终端插件，通过注册 Ctrl+Enter 快捷键向 iflow 发送  快捷键指令序列（`\u000A\u0011`），让终端中的 iflow 程序能够正确接收到换行指令，避免 Tabby 对快捷键的处理导致 iflow 无法收到该序列。

## 功能特性

- **iflow 换行支持**：按 Ctrl+Enter 发送 iflow 换行序列（`\u000A\u0011`）
- **自定义命令**：支持配置任意 Unicode 序列和自定义文本(可以用到类似的情况中)
- **多标签页支持**：在所有终端标签页和分屏视图中工作
- **智能终端检测**：自动找到活动终端实例，包括分屏视图
- **跨平台**：支持所有平台

## 背景

在使用 Tabby 终端运行 iflow 程序时，直接按 Ctrl+Enter 会被 Tabby 捕捉处理，导致 iflow 无法接收到该快捷键。本插件通过直接向终端发送 Unicode 序列 `\u000A\u0011`，绕过 Tabby 的快捷键处理，让 iflow 能够正确接收到换行指令。

### Unicode 序列说明

- `\u000A` = 换行符（LF - Line Feed）
- `\u0011` = Ctrl+Q（DC1 - Device Control 1）

这个组合对应 iflow 程序中的换行快捷键(具体原理不清楚)。

## 安装

### 手动安装

1. 将整个项目文件夹复制到 Tabby 的插件目录
2. 在项目目录中运行构建命令：`npm install && npx tsc`
3. 重启 Tabby

## 开发

### 构建命令

```bash
# 编译 TypeScript 到 JavaScript
npx tsc

# 开发模式（监听文件变化）
npx tsc --watch
```

### 项目结构

```
src/
├── index.ts          # 主插件入口
├── settings-tab-provider.ts    # 设置标签页提供者
└── settings-tab.component.ts   # 设置界面组件
dist/                 # 编译输出
package.json          # 依赖和构建配置
tsconfig.json         # TypeScript 配置
```

## 工作原理

当您按下 Ctrl+Enter 时，插件会发送 iflow 换行快捷键序列（`\u000A\u0011`），这样可以让 iflow 程序：

- 正确接收到换行快捷键
- 绕过 Tabby 的快捷键处理机制
- 实现与原生终端一致的行为

### 默认行为

**默认命令：** `\u000A\u0011`（iflow 换行快捷键）

### 自定义命令

插件支持发送任意 Unicode 序列和自定义命令，例如：

- `clear\n` - 清屏命令
- `cls\n` - Windows 清屏命令
- `\u0003` - Ctrl+C（中断信号）
- `\u001B[A` - 上箭头（历史命令）

#### Unicode 转义序列

- `\n` - 换行符
- `\t` - Tab 字符
- `\r` - 回车符
- `\\` - 反斜线
- `\uXXXX` - Unicode 字符（4 位十六进制）

#### Unicode 示例

- `\u000A\u0011` = 换行+Ctrl+Q（iflow newline）
- `\u0001` = Ctrl+A（SOH - Start of Heading）
- `\u0003` = Ctrl+C（ETX - End of Text）
- `\u0005` = Ctrl+E（ENQ - Enquiry）
- `\u001B` = Esc（Escape）
- `\u007F` = Delete

### 技术实现

1. **HotkeyProvider**：向 Tabby 注册 `ctrl-enter` 快捷键
2. **ClearHandler**：处理快捷键事件并发送命令
3. **终端检测**：找到活动终端，包括对分屏视图的特殊处理
4. **转义序列处理**：将 Unicode 转义序列转换为实际字符

## 使用场景

- **iflow 开发**：在 iflow 程序中使用换行快捷键
- **自定义快捷键**：发送任意 Unicode 序列到终端程序
- **特殊控制字符**：发送 Ctrl+A、Ctrl+C 等控制字符
- **多终端**：在多个终端标签页中快速发送命令

## 配置

### 设置快捷键

1. 进入 Tabby 设置
2. 找到 **iflow Newline** 设置页
3. 配置要发送的命令（默认：`\u000A\u0011`）
4. 进入 **快捷键** 设置
5. 找到 "iflow Newline"
6. 设置您喜欢的快捷键（默认：Ctrl+Enter）

### 配置自定义命令

在 **iflow Newline** 设置页中：

1. 输入自定义命令
2. 支持转义序列（`\n`、`\t`、`\uXXXX` 等）
3. 查看实时预览
4. 设置会自动保存

## 系统要求

- Tabby Terminal v1.0.0 或更高版本
- Node.js 和 npm（用于构建）

## 许可证

ISC License