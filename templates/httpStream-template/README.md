# {{projectName}}

{{description}}

这是一个基于 [FastMCP](https://github.com/punkpeye/fastmcp) 框架构建的，使用 **HTTP Stream** 传输协议的 MCP（Model-Controller-Prompt）服务器模板。

## 传输类型

- **HTTP Stream**: 此模板配置为通过 HTTP 长连接进行通信，适用于需要持续数据流的 Web 服务和 API 集成。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

此命令会启动一个开发服务器，该服务器在文件更改时自动重新加载。

```bash
npm run dev
```

默认情况下，服务器将在 `http://localhost:{{port}}` 上运行。

### 3. 构建项目

将 TypeScript 代码编译为 JavaScript，输出到 `dist` 目录。

```bash
npm run build
```

### 4. 运行生产版本

在生产环境中运行已构建的应用。

```bash
npm run start
```

### 5. 查看工具定义

启动一个交互式检查器，用于查看所有已注册的工具、资源和提示的定义。

```bash
npm run inspector
```

## 功能模块

此模板包含三个核心功能模块：工具、资源和提示。

### 工具 (Tools)

工具是模型可以执行的具体操作。

- **greet**
  - **描述**: 生成个性化的问候语。
  - **参数**:
    - `name` (string, 必需): 要问候的人的姓名。

### 资源 (Resources)

资源是模型可以访问的数据或信息。

- **Application Logs**
  - **描述**: 提供对应用程序日志的访问（当前为示例）。
  - **URI**: `file:///logs/app.log`

### 提示 (Prompts)

提示是预定义的、可复用的模板，用于指导模型的生成行为。

- **git-commit**
  - **描述**: 根据代码更改生成 Git 提交消息。
  - **参数**:
    - `changes` (string, 必需): Git diff 内容或代码更改的描述。


## 项目结构

```
{{projectName}}/
├── src/
│   ├── prompts/
│   │   ├── git-commit.ts   # 定义 'git-commit' 提示
│   │   └── index.ts        # 注册所有提示
│   ├── resources/
│   │   ├── index.ts        # 注册所有资源
│   │   └── read-file.ts    # 定义 'read-file' 资源
│   ├── tools/
│   │   ├── greet.ts        # 定义 'greet' 工具
│   │   └── index.ts        # 注册所有工具
│   ├── index.ts            # 应用程序主入口
│   ├── logger.ts           # 日志记录器配置
│   └── server.ts           # MCP 服务器的设置和配置
├── .env.example            # 环境变量示例文件
├── package.json
├── tsconfig.json
└── README.md
```

## 开发指南

1.  **添加新功能**:
    - **工具**: 在 `src/tools/` 目录下创建一个新文件，定义你的工具，然后在 `src/tools/index.ts` 中注册它。
    - **资源**: 在 `src/resources/` 目录下创建文件定义资源，并在 `src/resources/index.ts` 中注册。
    - **提示**: 在 `src/prompts/` 目录下创建文件定义提示，并在 `src/prompts/index.ts` 中注册。
2.  **测试更改**: 使用 `npm run dev` 启动开发服务器来测试你的修改。
3.  **配置端口**: 你可以通过在项目根目录创建 `.env` 文件并设置 `PORT` 变量来更改服务器端口。

## 基于 FastMCP

此项目基于 [FastMCP](https://github.com/punkpeye/fastmcp) 框架构建。FastMCP 旨在简化 AI 应用中模型、工具和数据之间交互的构建过程。 