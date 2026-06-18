/**
 * Redact sensitive data from log entries before shipping.
 *
 * Redaction rules can be:
 * - String: field names to mask (e.g. "password", "token")
 * - RegExp: patterns to replace in line text (e.g. /Bearer\s+\S+/g)
 */
export type RedactRule = string | RegExp;

const REDACT_VALUE = "[REDACTED]";

/** Redact known sensitive field names from JSON bodies */
const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apiKey",
  "api_key",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "privateKey",
  "private_key",
]);

/** Deep-clone and redact sensitive keys in objects */
export function redactSensitiveKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveKeys);
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      redacted[key] = REDACT_VALUE;
    } else if (typeof value === "object") {
      redacted[key] = redactSensitiveKeys(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/** Apply regex redaction patterns to a log line */
export function redactLine(line: string, patterns: RegExp[]): string {
  let result = line;
  for (const pattern of patterns) {
    result = result.replace(pattern, REDACT_VALUE);
  }
  return result;
}

/** Compile user-provided redact rules into field key set + regex patterns */
export function compileRedactRules(rules: RedactRule[]): {
  patterns: RegExp[];
} {
  const patterns: RegExp[] = [];
  for (const rule of rules) {
    if (rule instanceof RegExp) {
      patterns.push(rule);
    } else {
      // String rules become regex that matches the value as a key=value or "key":"value" pattern
      patterns.push(new RegExp(`["']?${escapeRegex(rule)}["']?\\s*[:=]\\s*[^,\\s}"]+`, "gi"));
    }
  }
  return { patterns };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
