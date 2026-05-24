import { dependencyGraphAnalysis } from "./dependencyGraph";
import type { DependencyGraphAnalysis } from "./dependencyGraph";
import type { Severity } from "../types";

export type SecurityRiskKind =
  | "trust-boundary-crossing"
  | "external-data-transfer"
  | "secret-access"
  | "pii-exposure"
  | "auth-permission-assumption"
  | "unsafe-logging"
  | "new-external-runtime-dependency"
  | "ai-direct-security-bypass";

export type DataClassification = "public" | "internal" | "pii" | "secret";

export type SecurityDataFlow = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  edgeId: string;
  classification: DataClassification;
  introducedByChange: boolean;
  crossesTrustBoundary: boolean;
  evidence: string;
};

export type SecurityOperation = {
  id: string;
  nodeId: string;
  kind: "read-secret" | "log-data" | "assume-permission" | "send-external";
  classification: DataClassification;
  introducedByChange: boolean;
  aiGenerated: boolean;
  evidence: string;
};

export type SecurityDataset = {
  dataFlows: SecurityDataFlow[];
  operations: SecurityOperation[];
};

export type SecurityFinding = {
  id: string;
  kind: SecurityRiskKind;
  severity: Severity;
  title: string;
  evidence: string;
  question: string;
  nodeIds: string[];
  edgeIds: string[];
  dataClassifications: DataClassification[];
};

export type SecuritySummary = {
  dangerPathCount: number;
  trustBoundaryCrossingCount: number;
  externalTransferCount: number;
  secretAccessCount: number;
  piiExposureCount: number;
  unsafeLoggingCount: number;
  aiBypassCount: number;
};

export type SecurityAnalysis = {
  findings: SecurityFinding[];
  dataFlows: SecurityDataFlow[];
  operations: SecurityOperation[];
  summary: SecuritySummary;
};

export const mockSecurityDataset: SecurityDataset = {
  dataFlows: [
    {
      id: "flow-prompt-openai-pii",
      fromNodeId: "platform.prompt-runner",
      toNodeId: "external.openai-sdk",
      edgeId: "edge-prompt-openai",
      classification: "pii",
      introducedByChange: true,
      crossesTrustBoundary: true,
      evidence: "PromptRunner can send review context containing author identity and file paths to the OpenAI SDK."
    },
    {
      id: "flow-orchestrator-github-token",
      fromNodeId: "app.review-orchestrator",
      toNodeId: "platform.github-client",
      edgeId: "edge-orchestrator-github",
      classification: "secret",
      introducedByChange: true,
      crossesTrustBoundary: true,
      evidence: "AI-generated orchestration directly reaches GitHubClient, which owns repository token handling."
    },
    {
      id: "flow-review-panel-orchestrator",
      fromNodeId: "ui.review-lens",
      toNodeId: "app.review-orchestrator",
      edgeId: "edge-ui-orchestrator",
      classification: "internal",
      introducedByChange: false,
      crossesTrustBoundary: false,
      evidence: "Review UI passes selected repository context into the orchestration layer."
    }
  ],
  operations: [
    {
      id: "op-github-token-read",
      nodeId: "platform.github-client",
      kind: "read-secret",
      classification: "secret",
      introducedByChange: true,
      aiGenerated: false,
      evidence: "GitHubClient reads repository provider tokens for future pull request access."
    },
    {
      id: "op-prompt-logs-pii",
      nodeId: "platform.prompt-runner",
      kind: "log-data",
      classification: "pii",
      introducedByChange: true,
      aiGenerated: true,
      evidence: "PromptRunner debug logging includes full prompt context before redaction is modeled."
    },
    {
      id: "op-orchestrator-assumes-admin",
      nodeId: "app.review-orchestrator",
      kind: "assume-permission",
      classification: "internal",
      introducedByChange: true,
      aiGenerated: true,
      evidence: "Generated orchestration assumes repository access has already been authorized upstream."
    }
  ]
};

export function analyzeSecurityRisk(
  securityDataset: SecurityDataset,
  dependencyAnalysis: DependencyGraphAnalysis
): SecurityAnalysis {
  const findings = [
    ...findTrustBoundaryCrossings(securityDataset),
    ...findExternalDataTransfers(securityDataset, dependencyAnalysis),
    ...findSecretAccess(securityDataset),
    ...findPiiExposure(securityDataset),
    ...findAuthPermissionAssumptions(securityDataset),
    ...findUnsafeLogging(securityDataset),
    ...findAiDirectSecurityBypasses(dependencyAnalysis)
  ];

  return {
    findings,
    dataFlows: securityDataset.dataFlows,
    operations: securityDataset.operations,
    summary: {
      dangerPathCount: findings.length,
      trustBoundaryCrossingCount: findings.filter(
        (finding) => finding.kind === "trust-boundary-crossing"
      ).length,
      externalTransferCount: findings.filter(
        (finding) =>
          finding.kind === "external-data-transfer" ||
          finding.kind === "new-external-runtime-dependency"
      ).length,
      secretAccessCount: findings.filter((finding) => finding.kind === "secret-access").length,
      piiExposureCount: findings.filter((finding) => finding.kind === "pii-exposure").length,
      unsafeLoggingCount: findings.filter((finding) => finding.kind === "unsafe-logging").length,
      aiBypassCount: findings.filter((finding) => finding.kind === "ai-direct-security-bypass").length
    }
  };
}

function findTrustBoundaryCrossings(dataset: SecurityDataset): SecurityFinding[] {
  return dataset.dataFlows
    .filter((flow) => flow.crossesTrustBoundary && flow.introducedByChange)
    .map((flow) => ({
      id: `security-boundary-${flow.id}`,
      kind: "trust-boundary-crossing",
      severity: flow.classification === "secret" ? "Blocker" : "High",
      title: `New trust boundary crossing carries ${flow.classification}`,
      evidence: flow.evidence,
      question: "What validation, redaction, or policy gate makes this boundary crossing safe?",
      nodeIds: [flow.fromNodeId, flow.toNodeId],
      edgeIds: [flow.edgeId],
      dataClassifications: [flow.classification]
    }));
}

function findExternalDataTransfers(
  dataset: SecurityDataset,
  dependencyAnalysis: DependencyGraphAnalysis
): SecurityFinding[] {
  return dataset.dataFlows.flatMap((flow) => {
    const target = dependencyAnalysis.nodes.find((node) => node.id === flow.toNodeId);

    if (!target || target.kind !== "external" || !flow.introducedByChange) {
      return [];
    }

    return [
      {
        id: `security-external-transfer-${flow.id}`,
        kind: "external-data-transfer",
        severity: flow.classification === "public" ? "Medium" : "High",
        title: `${flow.classification} data can leave the repository boundary`,
        evidence: flow.evidence,
        question: "Is this external transfer intentional, minimized, and visible to reviewers?",
        nodeIds: [flow.fromNodeId, flow.toNodeId],
        edgeIds: [flow.edgeId],
        dataClassifications: [flow.classification]
      }
    ];
  });
}

function findSecretAccess(dataset: SecurityDataset): SecurityFinding[] {
  return dataset.operations
    .filter((operation) => operation.kind === "read-secret" && operation.introducedByChange)
    .map((operation) => ({
      id: `security-secret-${operation.id}`,
      kind: "secret-access",
      severity: "Blocker",
      title: "Generated review path reaches secret-handling code",
      evidence: operation.evidence,
      question: "Which permission check proves this path can read provider secrets?",
      nodeIds: [operation.nodeId],
      edgeIds: [],
      dataClassifications: [operation.classification]
    }));
}

function findPiiExposure(dataset: SecurityDataset): SecurityFinding[] {
  return dataset.dataFlows
    .filter((flow) => flow.classification === "pii" && flow.introducedByChange)
    .map((flow) => ({
      id: `security-pii-${flow.id}`,
      kind: "pii-exposure",
      severity: "High",
      title: "PII appears in a new danger path",
      evidence: flow.evidence,
      question: "Can this path preserve review meaning without transmitting identifiable data?",
      nodeIds: [flow.fromNodeId, flow.toNodeId],
      edgeIds: [flow.edgeId],
      dataClassifications: [flow.classification]
    }));
}

function findAuthPermissionAssumptions(dataset: SecurityDataset): SecurityFinding[] {
  return dataset.operations
    .filter((operation) => operation.kind === "assume-permission" && operation.introducedByChange)
    .map((operation) => ({
      id: `security-auth-${operation.id}`,
      kind: "auth-permission-assumption",
      severity: "High",
      title: "AI-generated path assumes authorization happened elsewhere",
      evidence: operation.evidence,
      question: "Where is the explicit permission boundary for this review action?",
      nodeIds: [operation.nodeId],
      edgeIds: [],
      dataClassifications: [operation.classification]
    }));
}

function findUnsafeLogging(dataset: SecurityDataset): SecurityFinding[] {
  return dataset.operations
    .filter(
      (operation) =>
        operation.kind === "log-data" &&
        operation.introducedByChange &&
        (operation.classification === "pii" || operation.classification === "secret")
    )
    .map((operation) => ({
      id: `security-logging-${operation.id}`,
      kind: "unsafe-logging",
      severity: operation.classification === "secret" ? "Blocker" : "High",
      title: `Unsafe logging may expose ${operation.classification}`,
      evidence: operation.evidence,
      question: "Should this log line be removed, redacted, or replaced with structured safe metadata?",
      nodeIds: [operation.nodeId],
      edgeIds: [],
      dataClassifications: [operation.classification]
    }));
}

function findAiDirectSecurityBypasses(
  dependencyAnalysis: DependencyGraphAnalysis
): SecurityFinding[] {
  return dependencyAnalysis.findings
    .filter(
      (finding) =>
        finding.kind === "direct-ai-import" ||
        finding.kind === "external-dependency-introduction" ||
        finding.kind === "architecture-boundary-risk"
    )
    .map((finding) => ({
      id: `security-bypass-${finding.id}`,
      kind:
        finding.kind === "external-dependency-introduction"
          ? "new-external-runtime-dependency"
          : "ai-direct-security-bypass",
      severity: finding.severity,
      title:
        finding.kind === "external-dependency-introduction"
          ? "New external runtime dependency changes the security review surface"
          : "AI-generated direct import may bypass a security boundary",
      evidence: finding.evidence,
      question:
        finding.kind === "external-dependency-introduction"
          ? "What data can reach this dependency at runtime?"
          : "Should this path go through an explicit security boundary instead?",
      nodeIds: finding.nodeIds,
      edgeIds: finding.edgeIds,
      dataClassifications: ["internal"]
    }));
}

export const securityAnalysis = analyzeSecurityRisk(
  mockSecurityDataset,
  dependencyGraphAnalysis
);
