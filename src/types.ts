export type LensName =
  | "Overview"
  | "Semantic Diff"
  | "Security"
  | "Architecture"
  | "API Contract"
  | "Dependencies"
  | "Failures"
  | "Packages"
  | "Classic Diff"
  | "AI Review Prompt";

export type Severity = "Blocker" | "High" | "Medium" | "Low" | "Note";

export type LensFinding = {
  id: string;
  title: string;
  lens: LensName;
  severity: Severity;
  meta: string;
  evidence: string;
  question: string;
  sourceAnchor: string;
};

export type LensDefinition = {
  name: LensName;
  summaryTitle: string;
  summaryCopy: string;
  primaryFindingId: string;
};

export type ReviewTarget = {
  repository: string;
  alternatives: string[];
  riskScore: number;
  riskLabel: string;
};
