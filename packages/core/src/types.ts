/** Represents a single log entry sent to Loki */
export interface LokiLogEntry {
  /** Timestamp as nanoseconds since Unix epoch (string for Loki JSON) */
  ts: string;
  /** Log line content */
  line: string;
  /** Optional labels attached to this entry */
  labels?: Record<string, string>;
}

/** A batch of entries pushed to Loki's /loki/api/v1/push */
export interface LokiPushPayload {
  streams: LokiStream[];
}

export interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][]; // [ts_ns, line]
}

/** Options for constructing a LokiTransport */
export interface LokiTransportOptions {
  endpoint: string;
  labels?: Record<string, string>;
  /** Basic auth username */
  username?: string;
  /** Basic auth password */
  password?: string;
  /** Custom fetch headers */
  headers?: Record<string, string>;
}

/** Options for the LokiLogger */
export interface LokiLoggerOptions extends LokiTransportOptions {
  enabled?: boolean;
  batchSize?: number;
  flushInterval?: number;
  redact?: (string | RegExp)[];
  /** Callback on flush (useful for dev introspection) */
  onFlush?: (entries: LokiLogEntry[]) => void;
}
