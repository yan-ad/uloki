import type { LokiLogEntry, LokiLoggerOptions } from "./types";
import { LokiTransport } from "./transport";
import { compileRedactRules, redactLine, type RedactRule } from "./redact";

/**
 * High-level logger: buffers entries, redacts, and flushes to Loki in batches.
 *
 * Usage:
 *   const logger = new LokiLogger({ endpoint: "http://localhost:3100" });
 *   logger.log({ line: "Hello from Nitro!", labels: { handler: "api" } });
 *   await logger.flush();
 */
export class LokiLogger {
  private transport: LokiTransport;
  private buffer: LokiLogEntry[] = [];
  private enabled: boolean;
  private batchSize: number;
  private flushTimer?: ReturnType<typeof setInterval>;
  private redactPatterns: RegExp[];
  private onFlushCb?: (entries: LokiLogEntry[]) => void;

  constructor(options: LokiLoggerOptions) {
    this.enabled = options.enabled ?? true;
    this.batchSize = options.batchSize ?? 10;
    this.redactPatterns = compileRedactRules(options.redact ?? []).patterns;
    this.onFlushCb = options.onFlush;

    this.transport = new LokiTransport({
      endpoint: options.endpoint,
      labels: options.labels,
      username: options.username,
      password: options.password,
      headers: options.headers,
    });

    if (options.flushInterval && options.flushInterval > 0) {
      this.flushTimer = setInterval(() => this.flush(), options.flushInterval);
    }
  }

  /** Register flush callback (e.g. for dev introspection) */
  onFlush(cb: (entries: LokiLogEntry[]) => void) {
    this.onFlushCb = cb;
  }

  /** Buffer a log entry. Auto-flushes when batchSize is reached. */
  log(entry: Partial<LokiLogEntry> & { line: string }) {
    if (!this.enabled) return;

    const line = this.redactPatterns.length
      ? redactLine(entry.line, this.redactPatterns)
      : entry.line;

    const ts = entry.ts ?? String(Date.now() * 1_000_000); // ms → ns

    this.buffer.push({
      ts,
      line,
      labels: entry.labels,
    });

    if (this.buffer.length >= this.batchSize) {
      // Fire-and-forget flush (don't block the caller)
      this.flush().catch(() => {});
    }
  }

  /** Flush all buffered entries to Loki. Call on shutdown. */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0);
    await this.transport.push(batch);
    this.onFlushCb?.(batch);
  }

  /** Stop auto-flush interval and flush remaining */
  async dispose(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    await this.flush();
  }
}
