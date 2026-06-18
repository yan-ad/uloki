import type { LokiLogEntry } from "./types";
import type { LokiLogger } from "./logger";

/**
 * HTTP request metadata captured by the request logger middleware.
 */
export interface RequestLogMeta {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userAgent?: string;
  contentLength?: number;
}

/**
 * Build a structured log line from HTTP request metadata.
 * Produces a key=value logfmt-style line that Loki can parse easily.
 */
export function fmtRequestLog(meta: RequestLogMeta): string {
  const parts = [
    `method=${meta.method}`,
    `path=${meta.path}`,
    `status=${meta.status}`,
    `duration_ms=${meta.durationMs}`,
  ];
  if (meta.userAgent) parts.push(`ua="${meta.userAgent}"`);
  if (meta.contentLength !== undefined) parts.push(`content_length=${meta.contentLength}`);
  return parts.join(" ");
}

/**
 * Log an HTTP request with standard labels.
 * Used inside Nitro request hooks to push structured access logs to Loki.
 */
export function logRequest(
  logger: LokiLogger,
  meta: RequestLogMeta,
  extraLabels?: Record<string, string>,
) {
  const line = fmtRequestLog(meta);
  const labels: Record<string, string> = {
    ...extraLabels,
    method: meta.method,
    status: String(meta.status),
  };

  let logLevel: string;
  if (meta.status >= 500) logLevel = "error";
  else if (meta.status >= 400) logLevel = "warn";
  else logLevel = "info";

  logger.log({
    line,
    labels: { ...labels, level: logLevel },
  });
}
