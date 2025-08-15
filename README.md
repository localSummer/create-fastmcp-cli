# @tools/create-fastmcp-cli

快速创建基于 fastmcp TypeScript 的 MCP 服务器项目的 CLI 工具

## 功能特性

- 🚀 基于 [FastMCP](https://github.com/punkpeye/fastmcp) 框架
- 🎯 支持三种 MCP 传输方式：STDIO、HTTP Stream、SSE
- 🎨 使用 [Ink](https://github.com/vadimdemedes/ink) 提供美观的交互式界面
- 📦 自动生成完整的项目结构和配置
- 🛠️ 包含示例工具和详细文档

## 安装

```bash
npm install -g @tools/create-fastmcp-cli
```

## 使用方法

### 交互式创建项目

```bash
npx @tools/create-fastmcp-cli
```

### 使用命令行参数

```bash
# 创建 STDIO 项目
npx @tools/create-fastmcp-cli my-mcp-project

# 创建 HTTP Stream 项目
npx @tools/create-fastmcp-cli my-web-mcp --transport httpStream --port 8080

# 创建 SSE 项目  
npx @tools/create-fastmcp-cli my-sse-mcp --transport sse --port 9090
```

### 非交互模式

使用 `--no-interactive` 参数可以跳过交互式界面，直接生成项目：

```bash
# 非交互式创建 STDIO 项目
npx @tools/create-fastmcp-cli my-mcp-project --no-interactive

# 非交互式创建 HTTP Stream 项目
npx @tools/create-fastmcp-cli my-web-mcp --transport httpStream --port 8080 --no-interactive

# 非交互式创建 SSE 项目  
npx @tools/create-fastmcp-cli my-sse-mcp --transport sse --port 9090 --no-interactive
```

## 命令行选项

- `[project-name]` - 项目名称
- `-t, --transport <type>` - 传输类型 (stdio|httpStream|sse，默认: stdio)
- `-p, --port <port>` - HTTP 服务端口 (仅用于 httpStream 和 sse，默认: 3000)
- `--no-interactive` - 非交互模式

## MCP 传输类型

### STDIO
- **适用场景**: 命令行工具和本地集成
- **特点**: 通过标准输入输出进行通信
- **使用**: 适合与 Claude Desktop 等应用集成

### HTTP Stream
- **适用场景**: Web 服务和 API 集成
- **特点**: 基于 HTTP 流的实时通信
- **使用**: 适合构建 Web 应用和服务

### Server-Sent Events (SSE)
- **适用场景**: 实时通信和事件流
- **特点**: 服务器推送事件到客户端
- **使用**: 适合实时数据更新和通知

## 生成的项目结构

```
my-project/
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
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 基于技术栈

- [FastMCP](https://github.com/punkpeye/fastmcp) - MCP 服务器框架
- [Ink](https://github.com/vadimdemedes/ink) - React for CLI
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Commander.js](https://github.com/tj/commander.js/) - 命令行参数解析

## 许可证

MIT 