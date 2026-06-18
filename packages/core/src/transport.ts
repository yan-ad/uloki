import type { LokiLogEntry, LokiTransportOptions, LokiPushPayload } from "./types";

/**
 * Low-level HTTP transport that pushes a batch to Loki's /loki/api/v1/push.
 */
export class LokiTransport {
  private endpoint: string;
  private labels: Record<string, string>;
  private auth?: string;
  private headers: Record<string, string>;

  constructor(options: LokiTransportOptions) {
    this.endpoint = options.endpoint.replace(/\/$/, "");
    this.labels = options.labels ?? {};
    this.headers = options.headers ?? {};

    if (options.username && options.password) {
      this.auth = btoa(`${options.username}:${options.password}`);
    }
  }

  /** Push a batch of log entries to Loki */
  async push(entries: LokiLogEntry[]): Promise<{ ok: boolean; status?: number; error?: string }> {
    if (entries.length === 0) return { ok: true };

    try {
      const streams: LokiPushPayload["streams"] = [
        {
          stream: this.labels,
          values: entries.map((e) => [e.ts, e.line]),
        },
      ];

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.headers,
      };
      if (this.auth) headers["Authorization"] = `Basic ${this.auth}`;

      const res = await fetch(`${this.endpoint}/loki/api/v1/push`, {
        method: "POST",
        headers,
        body: JSON.stringify({ streams }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, status: res.status, error: text };
      }

      return { ok: true, status: res.status };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
