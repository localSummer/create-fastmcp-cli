# cnpm-create-fastmcp-cli 使用指南

## 快速开始

### 1. 交互式创建项目

```bash
# 启动交互式界面，按照提示操作
npm run dev
# 或者
node dist/index.js
```

### 2. 命令行创建项目

```bash
# 创建 STDIO 项目（默认）
node dist/index.js my-mcp-project --no-interactive

# 创建 HTTP Stream 项目
node dist/index.js my-web-mcp --transport httpStream --port 8080 --no-interactive

# 创建 SSE 项目
node dist/index.js my-sse-mcp --transport sse --port 9090 --no-interactive
```

## 功能演示

运行演示脚本查看所有功能：

```bash
./demo.sh
```

## 生成的项目结构

```
my-project/
├── src/
│   ├── index.ts      # 主服务器文件，包含MCP服务器启动代码
│   └── tools.ts      # 工具定义，包含示例计算器和问候工具
├── package.json      # 项目配置，包含fastmcp和zod依赖
├── tsconfig.json     # TypeScript配置
└── README.md         # 项目文档
```

## MCP 传输类型对比

| 传输类型 | 适用场景 | 端口 | 启动命令 |
|---------|----------|------|----------|
| STDIO | 命令行工具、本地集成、Claude Desktop | 无 | `server.stdio()` |
| HTTP Stream | Web服务、API集成 | 可配置 | `server.httpStream(port)` |
| SSE | 实时通信、事件流 | 可配置 | `server.sse(port)` |

## 示例工具

生成的项目包含两个示例工具：

### 1. example-tool（计算器）
- 支持四则运算：add, subtract, multiply, divide
- 使用 Zod 进行参数验证
- 包含错误处理（除零检查）

### 2. greet（问候工具）
- 支持中英文问候
- 返回时间戳
- 演示可选参数处理

## 下一步

1. 进入生成的项目目录
2. 安装依赖：`npm install`
3. 开发模式：`npm run dev`
4. 根据需要修改 `src/tools.ts` 添加自定义工具
5. 在 `src/index.ts` 中注册新工具

## 集成到 Claude Desktop

对于 STDIO 项目，可以在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "my-mcp-project": {
      "command": "node",
      "args": ["path/to/my-mcp-project/dist/index.js"]
    }
  }
}
``` 