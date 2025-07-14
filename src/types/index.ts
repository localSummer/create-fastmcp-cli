export type TransportType = 'stdio' | 'httpStream' | 'sse';

export interface ProjectConfig {
  projectName: string;
  transport: TransportType;
  port?: string;
  interactive: boolean;
}

export interface CreateAppProps {
  projectName?: string;
  transport: TransportType;
  port?: string;
  interactive: boolean;
}

export interface TemplateData {
  projectName: string;
  transport: TransportType;
  port: string;
  description: string;
} 