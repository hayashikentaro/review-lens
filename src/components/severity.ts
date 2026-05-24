import type { Severity } from "../types";

export function severityClass(severity: Severity): string {
  return `severity-${severity.toLowerCase().replace(/\s+/g, "-")}`;
}
