# {{projectName}}

{{description}}

这是一个基于 [FastMCP](https://github.com/punkpeye/fastmcp) 框架构建的，使用 **STDIO** 传输协议的 MCP（Model Context Protocol）服务器模板。

## 传输类型

- **STDIO (标准输入/输出)**：此模板使用标准输入/输出作为默认传输协议，非常适合命令行工具和本地脚本集成。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

此命令会启动开发服务器，文件发生变更时会自动重启，让您可以实时测试修改。

```bash
npm run dev
```

### 3. 构建项目

将 TypeScript 源代码编译为生产环境的 JavaScript 代码，输出到 `dist` 目录。

```bash
npm run build
```

### 4. 运行生产版本

在构建完成后，此命令将执行 `dist` 目录中的代码。

```bash
npm run start
```

### 5. 查看工具定义

启动一个交互式检查器，用于查看所有已注册的工具、资源和提示的定义。

```bash
npm run inspector
```

## 功能模块

此模板内置了三种类型的可扩展模块：工具、资源和提示。

### 工具 (Tools)

工具是模型可以执行的具体操作。

#### greet

- **描述**：生成一条个性化的问候消息。
- **参数**：
  - `name` (string, 必需): 要问候的人的姓名。

### 资源 (Resources)

资源是模型可以访问的数据或信息。

#### read-file

- **描述**：读取并返回指定文件的内容。
- **URI**: `file://{{path}}`
- **参数**：
  - `path` (string, 必需): 要读取的文件的路径。

### 提示 (Prompts)

提示是预定义的、可复用的模板，用于指导模型的生成行为。

#### git-commit

- **描述**：根据代码更改生成 Git 提交消息。
- **参数**：
  - `language` (string, 必需): 生成内容所用的语言 (例如: '中文', 'English')。
  - `type` (string, 必需): 提交的类型 (例如: 'feat', 'fix', 'docs')。

## 项目结构

```
{{projectName}}/
├── src/
│   ├── index.ts          # 应用程序主入口，负责启动服务器
│   ├── server.ts         # MCP 服务器的核心配置和生命周期管理
│   ├── logger.ts         # 日志工具
│   ├── tools/            # 工具定义目录
│   │   ├── index.ts      # 注册所有工具
│   │   └── greet.ts      # “greet”工具的实现
│   ├── resources/        # 资源定义目录
│   │   ├── index.ts      # 注册所有资源
│   │   └── read-file.ts  # “read-file”资源的实现
│   └── prompts/          # 提示定义目录
│       ├── index.ts      # 注册所有提示
│       └── git-commit.ts # “git-commit”提示的实现
│   └── services/         # 服务模块目录
│       └── api.ts        # API 服务模块
├── package.json
├── tsconfig.json
└── README.md
```

## 开发指南

您可以轻松地为项目添加新的工具、资源或提示。

### 1. 创建模块文件

-   **工具**: 在 `src/tools/` 目录下创建一个新文件 (例如 `myTool.ts`)。
-   **资源**: 在 `src/resources/` 目录下创建一个新文件 (例如 `myResource.ts`)。
-   **提示**: 在 `src/prompts/` 目录下创建一个新文件 (例如 `myPrompt.ts`)。

### 2. 实现并注册模块

在您创建的文件中，定义模块的功能并导出一个注册函数。

```typescript
// 示例: src/tools/myTool.ts
import { FastMCP } from 'fastmcp';

// 定义工具
const myTool = { /* ... */ };

// 导出注册函数
export function registerMyTool(server: FastMCP): void {
  server.addTool(myTool);
}
```

### 3. 在主文件中引入

打开相应模块的 `index.ts` 文件 (例如 `src/tools/index.ts`)，导入并调用您的注册函数。

```typescript
// 示例: src/tools/index.ts
import { registerGreetTool } from './greet';
import { registerMyTool } from './myTool'; // 导入您的新工具

export function registerTools(server: FastMCP): void {
  registerGreetTool(server);
  registerMyTool(server); // 在这里注册
}
```

所有模块最终都会在 `src/server.ts` 中被统一初始化。

## 基于 FastMCP

此项目基于 [FastMCP](https://github.com/punkpeye/fastmcp) 框架构建。
