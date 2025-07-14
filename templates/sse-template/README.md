# {{projectName}}

{{description}}

## 传输类型

- **Server-Sent Events (SSE)**：此模板使用 SSE 作为传输协议，适用于需要从服务器到客户端进行单向实时通信和事件流的场景。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

此命令会启动开发服务器，文件发生变更时会自动重启。您可以通过连接到 `http://localhost:{{port}}` 来测试服务。

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

## 功能模块

此模板内置了三种类型的可扩展模块：工具、资源和提示。

### 工具 (Tools)

#### greet

- **功能**：生成一条个性化的问候消息。
- **参数**：
  - `name` (string, required): 要问候的人的姓名。

### 资源 (Resources)

#### Application Logs (示例)

- **功能**：提供一个静态的应用程序日志内容作为资源示例。
- **URI**: `file:///logs/app.log`
- **说明**: 这是一个演示性质的资源，返回固定的文本内容。

### 提示 (Prompts)

#### git-commit

- **功能**：根据代码变更生成一个用于撰写 Git 提交信息的提示。
- **参数**：
  - `changes` (string, required): Git diff 或变更内容的描述。

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
│   │   └── read-file.ts  # 示例资源的实现
│   └── prompts/          # 提示定义目录
│       ├── index.ts      # 注册所有提示
│       └── git-commit.ts # “git-commit”提示的实现
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

此项目基于 [FastMCP](https://github.com/cnpm/fastmcp) 框架构建。FastMCP 是一个轻量级、高性能的元计算平台 (Meta Computing Platform)，专为快速构建、管理和部署 AI Agent 而设计。 