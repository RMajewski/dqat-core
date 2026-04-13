export type MissionLogLevel = 'info' | 'warn' | 'error';

export type MissionLogEntry = {
  timestamp: Date;
  level: MissionLogLevel;
  message: string;
  details?: Record<string, unknown>;
};
