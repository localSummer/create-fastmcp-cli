# Project Overview

This project is a CLI tool named `@tools/create-fastmcp-cli` designed to quickly scaffold new FastMCP TypeScript-based Model Context Protocol (MCP) server projects. It provides an interactive command-line interface using Ink (React for CLIs) and supports three different transport mechanisms for MCP communication: STDIO, HTTP Stream, and Server-Sent Events (SSE).

The tool works by copying a template project based on the chosen transport type, substituting placeholders with user-provided information (like project name), and then installing the necessary dependencies.

## Key Technologies

- **Node.js/TypeScript**: The core language and runtime.
- **Commander.js**: Used for parsing command-line arguments.
- **Ink/React**: Powers the interactive command-line user interface.
- **fs-extra**: For robust file system operations.
- **Template Engine**: A custom, simple engine (using regex) for substituting variables in template files.

## Core Architecture

1.  **CLI Entry Point (`src/index.ts`)**: Parses command-line arguments using Commander.js. It determines if the tool should run in interactive mode or use provided flags directly. It handles validation of arguments and then either:
    - Renders the main Ink/React component (`CreateApp`) for interactive mode
    - Directly generates the project for non-interactive mode
2.  **Interactive UI (`src/components/`)**: A series of Ink/React components manage the steps of project creation:
    - `CreateApp.tsx`: The main application state machine, controlling which step (project name, transport type, port, generation) is displayed.
    - `ProjectNameInput.tsx`: Handles input for the project name.
    - `TransportSelector.tsx`: Allows the user to choose the MCP transport type.
    - `PortInput.tsx`: Handles input for the HTTP port (for HTTP Stream and SSE).
    - `ProjectGenerator.tsx`: Triggers the actual project generation logic and displays progress/output.
3.  **Project Generation Logic (`src/utils/projectGenerator.ts`)**:
    - Selects the appropriate template directory from `templates/` based on the chosen transport.
    - Copies the entire template directory to the target project path.
    - Recursively processes all text-based files in the copied project, performing variable substitution (e.g., `{{projectName}}`).
    - Automatically runs `npm install` in the new project directory.
4.  **Templates (`templates/`)**: Separate directories containing complete, runnable FastMCP project structures for each transport type (stdio, httpStream, sse). These contain placeholder variables that are replaced during generation.

## Development Conventions

- The project uses ES Modules (`"type": "module"` in `package.json`).
- Source code is in `src/` and compiled to `dist/` using TypeScript (`tsc`).
- Dependencies are managed with `npm`.
- The CLI is defined in `package.json` under the `bin` field, making it globally executable after `npm install -g`.

## Building and Running

- **Install dependencies**: `npm install`
- **Development mode**: `npm run dev` (Uses `tsx` to run TypeScript directly)
- **Build**: `npm run build` (Compiles TypeScript to `dist/`)
- **Run (after build)**: `npm start` or `node dist/index.js`

## Usage (User Perspective)

- **Install globally**: `npm install -g @tools/create-fastmcp-cli`
- **Interactive creation**: `npx @tools/create-fastmcp-cli`
- **Direct creation**:
  - STDIO: `npx @tools/create-fastmcp-cli my-mcp-project`
  - HTTP Stream: `npx @tools/create-fastmcp-cli my-web-mcp --transport httpStream --port 8080`
  - SSE: `npx @tools/create-fastmcp-cli my-sse-mcp --transport sse --port 9090`
- **Non-interactive creation**:
  - `npx @tools/create-fastmcp-cli my-mcp-project --no-interactive`
  - `npx @tools/create-fastmcp-cli my-web-mcp --transport httpStream --port 8080 --no-interactive`