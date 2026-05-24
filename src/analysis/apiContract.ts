import type { Severity } from "../types";

export type ContractSurface = "public-api" | "internal-api" | "exported-type" | "event";

export type ContractChangeKind =
  | "request-shape-change"
  | "response-shape-change"
  | "nullable-optional-change"
  | "enum-value-change"
  | "status-code-change"
  | "schema-validation-change"
  | "exported-type-change"
  | "missing-contract-note";

export type CompatibilityImpact = "breaking" | "risky" | "compatible";

export type ApiContractChange = {
  id: string;
  surface: ContractSurface;
  endpointOrType: string;
  kind: ContractChangeKind;
  before: string;
  after: string;
  compatibility: CompatibilityImpact;
  callers: string[];
  generated: boolean;
  contractNotePresent: boolean;
  evidence: string;
};

export type ApiContractFinding = {
  id: string;
  kind: ContractChangeKind | "backward-compatibility-risk";
  severity: Severity;
  title: string;
  evidence: string;
  question: string;
  changeIds: string[];
  callers: string[];
};

export type ApiContractDataset = {
  changes: ApiContractChange[];
};

export type ApiContractSummary = {
  changeCount: number;
  breakingChangeCount: number;
  generatedWithoutNoteCount: number;
  affectedCallerCount: number;
  statusCodeChangeCount: number;
  exportedTypeChangeCount: number;
};

export type ApiContractAnalysis = {
  changes: ApiContractChange[];
  findings: ApiContractFinding[];
  summary: ApiContractSummary;
};

export const mockApiContractDataset: ApiContractDataset = {
  changes: [
    {
      id: "contract-review-create-request",
      surface: "public-api",
      endpointOrType: "POST /reviews",
      kind: "request-shape-change",
      before: "sourceUrl: string",
      after: "source: { provider: string; url?: string }",
      compatibility: "breaking",
      callers: ["web-console", "cli-importer"],
      generated: true,
      contractNotePresent: false,
      evidence: "Generated handler replaced sourceUrl with a nested source object without a compatibility adapter."
    },
    {
      id: "contract-review-status-response",
      surface: "public-api",
      endpointOrType: "GET /reviews/:id",
      kind: "response-shape-change",
      before: "status: 'open' | 'completed'",
      after: "status: 'open' | 'ready_for_decision' | 'completed'",
      compatibility: "risky",
      callers: ["web-console", "slack-notifier"],
      generated: true,
      contractNotePresent: false,
      evidence: "Response status now includes ready_for_decision, but callers still branch on the previous enum."
    },
    {
      id: "contract-review-summary-nullable",
      surface: "exported-type",
      endpointOrType: "ReviewSummary",
      kind: "nullable-optional-change",
      before: "decisionNote?: string",
      after: "decisionNote: string | null",
      compatibility: "risky",
      callers: ["review-list", "exporter"],
      generated: false,
      contractNotePresent: true,
      evidence: "Exported type changed optional semantics to explicit nullability."
    },
    {
      id: "contract-review-create-status",
      surface: "public-api",
      endpointOrType: "POST /reviews",
      kind: "status-code-change",
      before: "201 Created",
      after: "202 Accepted",
      compatibility: "breaking",
      callers: ["cli-importer"],
      generated: true,
      contractNotePresent: false,
      evidence: "Create review now returns 202 for deferred analysis, while importer expects a completed review id immediately."
    },
    {
      id: "contract-lens-policy-schema",
      surface: "internal-api",
      endpointOrType: "DependencyPolicyInput",
      kind: "schema-validation-change",
      before: "lens: string",
      after: "lens: LensName enum",
      compatibility: "compatible",
      callers: ["dependency-graph-lens"],
      generated: false,
      contractNotePresent: true,
      evidence: "Schema validation narrows lens values to known review lenses."
    }
  ]
};

export function analyzeApiContracts(dataset: ApiContractDataset): ApiContractAnalysis {
  const findings = dataset.changes.flatMap((change) => [
    ...createCompatibilityFindings(change),
    ...createGeneratedNoteFindings(change),
    ...createKindSpecificFindings(change)
  ]);
  const affectedCallers = new Set(dataset.changes.flatMap((change) => change.callers));

  return {
    changes: dataset.changes,
    findings,
    summary: {
      changeCount: dataset.changes.length,
      breakingChangeCount: dataset.changes.filter((change) => change.compatibility === "breaking")
        .length,
      generatedWithoutNoteCount: dataset.changes.filter(
        (change) => change.generated && !change.contractNotePresent
      ).length,
      affectedCallerCount: affectedCallers.size,
      statusCodeChangeCount: dataset.changes.filter((change) => change.kind === "status-code-change")
        .length,
      exportedTypeChangeCount: dataset.changes.filter(
        (change) => change.kind === "exported-type-change" || change.surface === "exported-type"
      ).length
    }
  };
}

function createCompatibilityFindings(change: ApiContractChange): ApiContractFinding[] {
  if (change.compatibility === "compatible") {
    return [];
  }

  return [
    {
      id: `contract-compat-${change.id}`,
      kind: "backward-compatibility-risk",
      severity: change.compatibility === "breaking" ? "Blocker" : "High",
      title: `${change.endpointOrType} has ${change.compatibility} compatibility risk`,
      evidence: change.evidence,
      question: "Which callers have been migrated or protected by a compatibility adapter?",
      changeIds: [change.id],
      callers: change.callers
    }
  ];
}

function createGeneratedNoteFindings(change: ApiContractChange): ApiContractFinding[] {
  if (!change.generated || change.contractNotePresent) {
    return [];
  }

  return [
    {
      id: `contract-note-${change.id}`,
      kind: "missing-contract-note",
      severity: change.compatibility === "breaking" ? "Blocker" : "High",
      title: `Generated contract change lacks an explicit note`,
      evidence: `${change.endpointOrType}: ${change.evidence}`,
      question: "What public behavior changed, and where is that contract recorded for reviewers?",
      changeIds: [change.id],
      callers: change.callers
    }
  ];
}

function createKindSpecificFindings(change: ApiContractChange): ApiContractFinding[] {
  if (change.compatibility === "compatible") {
    return [];
  }

  const titleByKind: Record<ContractChangeKind, string> = {
    "request-shape-change": "Request shape changed",
    "response-shape-change": "Response shape changed",
    "nullable-optional-change": "Nullable or optional semantics changed",
    "enum-value-change": "Enum values changed",
    "status-code-change": "Status code changed",
    "schema-validation-change": "Schema validation changed",
    "exported-type-change": "Exported type changed",
    "missing-contract-note": "Contract note missing"
  };

  return [
    {
      id: `contract-kind-${change.id}`,
      kind: change.kind,
      severity: change.compatibility === "breaking" ? "High" : "Medium",
      title: `${titleByKind[change.kind]} for ${change.endpointOrType}`,
      evidence: `Before: ${change.before}. After: ${change.after}.`,
      question: "Can old and new callers both interpret this contract safely?",
      changeIds: [change.id],
      callers: change.callers
    }
  ];
}

export const apiContractAnalysis = analyzeApiContracts(mockApiContractDataset);
