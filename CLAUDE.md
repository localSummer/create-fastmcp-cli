# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@tools/create-fastmcp-cli` - a CLI tool for rapidly creating MCP (Model Context Protocol) server projects based on FastMCP and TypeScript. The tool generates complete project templates with three transport types: STDIO, HTTP Stream, and SSE.

## Architecture

### Core Components
- **CLI Entry Point** (`src/index.ts`): Command line argument parsing using Commander.js, validation, and application bootstrapping
- **Interactive UI** (`src/components/`): React-based terminal interface using Ink for step-by-step project configuration
- **Project Generation** (`src/utils/projectGenerator.ts`): Core logic for copying templates, variable substitution, and dependency installation
- **Template Engine** (`src/utils/templateEngine.ts`): Handles variable replacement in template files
- **Type Definitions** (`src/types/index.ts`): TypeScript interfaces for transport types and configuration

### UI Flow
The interactive UI follows a state-driven flow:
1. Project name input (step 0)
2. Transport type selection (step 1) 
3. Port configuration for HTTP/SSE (step 2)
4. Project generation (step 3)

### Template System
Templates are stored in `templates/` directory with three variants:
- `stdio-template/` - For command line tools and local integrations
- `httpStream-template/` - For web services with HTTP streaming
- `sse-template/` - For real-time communication with Server-Sent Events

## Development Commands

```bash
# Development mode with hot reload
npm run dev

# Build the project
npm run build

# Run the built CLI
npm start

# Fix TypeScript import extensions for ESM compatibility
npm run fix-imports
```

## Key Technical Details

### ESM Configuration
- Uses ES modules (`"type": "module"` in package.json)
- TypeScript imports must use `.js` extensions for relative imports
- Use `scripts/fix-imports.js` to automatically fix import extensions

### Template Processing
- Variable substitution uses mustache-style `{{variable}}` syntax
- Only processes text files: `.ts`, `.js`, `.json`, `.md`, `.txt`, `.yml`, `.yaml`
- Skips binary files and common directories: `node_modules`, `.git`, `dist`, `.vscode`

### Transport Types
- **stdio**: Standard input/output communication (default)
- **httpStream**: HTTP-based streaming communication
- **sse**: Server-Sent Events for real-time data flow

### CLI Modes
- **Interactive**: Step-by-step UI (default)
- **Non-interactive**: Direct project generation with `--no-interactive` flag

## File Processing Notes

When modifying templates or core generation logic:
- Template files support variable substitution in content
- The `projectGenerator.ts` automatically installs npm dependencies after generation
- Error handling includes cleanup of partially created projects
- Cross-platform compatibility for Windows (npm.cmd vs npm)