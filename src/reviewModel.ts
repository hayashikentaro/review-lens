import type { LensDefinition, LensFinding, LensName, ReviewTarget } from "./types";
import { dependencyGraphAnalysis } from "./analysis/dependencyGraph";

const topDependencyFinding = dependencyGraphAnalysis.findings[0];
const topArchitectureFinding =
  dependencyGraphAnalysis.findings.find(
    (finding) =>
      finding.kind === "architecture-boundary-risk" ||
      finding.kind === "direct-ai-import" ||
      finding.kind === "god-module"
  ) ?? topDependencyFinding;

export const lensNames: LensName[] = [
  "Overview",
  "Semantic Diff",
  "Security",
  "Architecture",
  "API Contract",
  "Dependencies",
  "Failures",
  "Packages",
  "Classic Diff",
  "AI Review Prompt"
];

export const reviewTarget: ReviewTarget = {
  repository: "hayashikentaro/review-lens",
  alternatives: ["example/web-console", "example/payments-api"],
  riskScore: 72,
  riskLabel: "Generated patch risk"
};

export const findings: LensFinding[] = [
  {
    id: "security-privilege-boundary",
    title: "Privilege boundary should be named explicitly",
    lens: "Security",
    severity: "Blocker",
    meta: "Auth, data access",
    evidence: "Mocked admin action sits next to account-level read behavior.",
    question: "Which role or policy should gate this operation?",
    sourceAnchor: "#security"
  },
  {
    id: "semantic-validation-shape",
    title: "Generated validation path accepts a wider payload shape",
    lens: "Semantic Diff",
    severity: "High",
    meta: "Behavior, contracts",
    evidence: "Input normalization moved before strict validation in the mocked controller flow.",
    question: "Does the product contract allow legacy clients to pass partial payloads?",
    sourceAnchor: "#semantic-diff"
  },
  {
    id: "api-response-semantics",
    title: "Response semantics need compatibility notes",
    lens: "API Contract",
    severity: "High",
    meta: "Clients, versions",
    evidence: "A successful response can now represent a deferred processing state.",
    question: "Do current clients treat that state as terminal success?",
    sourceAnchor: "#api-contract"
  },
  {
    id: "failures-missing-evidence",
    title: "Generated patch has no failure-path evidence",
    lens: "Failures",
    severity: "Medium",
    meta: "Tests, rollback",
    evidence: "The mocked change list includes risk but no linked failing test or incident.",
    question: "What observable failure would prove this change is unsafe?",
    sourceAnchor: "#failures"
  },
  {
    id: "classic-raw-diff",
    title: "Raw line diff remains available",
    lens: "Classic Diff",
    severity: "Note",
    meta: "Source view",
    evidence: "The detail card keeps a raw diff link for source-level inspection.",
    question: "Which semantic finding should the raw diff anchor first?",
    sourceAnchor: "#classic-diff"
  },
  {
    id: "overview-generated-risk",
    title: "Generated code changed behavior across review lenses",
    lens: "Overview",
    severity: "Medium",
    meta: "Risk synthesis",
    evidence: "The mock review target touches contracts, security boundaries, and failure behavior in one patch.",
    question: "Which semantic finding deserves source-level verification first?",
    sourceAnchor: "#overview"
  },
  {
    id: "architecture-domain-boundary",
    title: topArchitectureFinding?.title ?? "Architecture boundary needs review",
    lens: "Architecture",
    severity: topArchitectureFinding?.severity ?? "High",
    meta: "Boundary risk",
    evidence:
      topArchitectureFinding?.evidence ??
      "Architecture Boundary Lens derives boundary findings from the dependency graph analyzer.",
    question:
      topArchitectureFinding?.question ??
      "Which boundary should generated code respect before this patch is trusted?",
    sourceAnchor: "#architecture"
  },
  {
    id: "dependencies-supply-chain",
    title: topDependencyFinding?.title ?? "Dependency graph needs architecture review",
    lens: "Dependencies",
    severity: topDependencyFinding?.severity ?? "High",
    meta: "Graph risk",
    evidence:
      topDependencyFinding?.evidence ??
      "Dependency Graph Lens analyzes mock repository modules for dependency risk.",
    question:
      topDependencyFinding?.question ??
      "Which dependency edge should a reviewer inspect before trusting generated code?",
    sourceAnchor: "#dependencies"
  },
  {
    id: "packages-release-boundary",
    title: "Package impact needs release-boundary context",
    lens: "Packages",
    severity: "Low",
    meta: "Release boundary",
    evidence: "The package view is prepared as a placeholder for future workspace scanning.",
    question: "Which package would publish or deploy this behavior?",
    sourceAnchor: "#packages"
  },
  {
    id: "prompt-reviewer-skepticism",
    title: "Prompt should preserve reviewer skepticism",
    lens: "AI Review Prompt",
    severity: "Medium",
    meta: "Prompt policy",
    evidence: "Decision notes and unresolved questions are visible in the review frame.",
    question: "What should the assistant treat as non-negotiable review policy?",
    sourceAnchor: "#ai-review-prompt"
  }
];

export const rankedFindingIds = [
  "security-privilege-boundary",
  "semantic-validation-shape",
  "api-response-semantics",
  "failures-missing-evidence",
  "classic-raw-diff"
];

export const lensDefinitions: LensDefinition[] = [
  {
    name: "Overview",
    summaryTitle: "Generated patch risk overview",
    summaryCopy:
      "A cognitive review surface that ranks semantic findings before a human reviewer spends attention on raw lines.",
    primaryFindingId: "overview-generated-risk"
  },
  {
    name: "Semantic Diff",
    summaryTitle: "Meaning-level change map",
    summaryCopy:
      "Highlights behavior shifts, renamed concepts, invariant changes, and code paths whose meaning changed more than their line count.",
    primaryFindingId: "semantic-validation-shape"
  },
  {
    name: "Security",
    summaryTitle: "Security review surface",
    summaryCopy:
      "Groups authorization, trust boundaries, unsafe defaults, data exposure, and dependency risk into a single review lens.",
    primaryFindingId: "security-privilege-boundary"
  },
  {
    name: "Architecture",
    summaryTitle: "Architecture impact map",
    summaryCopy:
      "Shows coupling, ownership, module boundaries, and cross-cutting consequences before a reviewer drops into raw changes.",
    primaryFindingId: "architecture-domain-boundary"
  },
  {
    name: "API Contract",
    summaryTitle: "Contract compatibility lens",
    summaryCopy:
      "Tracks request shape, response shape, versioning, status codes, schemas, and caller expectations.",
    primaryFindingId: "api-response-semantics"
  },
  {
    name: "Dependencies",
    summaryTitle: "Dependency relationship lens",
    summaryCopy:
      "Frames dependency updates by runtime exposure, transitive impact, package health, and migration work.",
    primaryFindingId: "dependencies-supply-chain"
  },
  {
    name: "Failures",
    summaryTitle: "Failure mode lens",
    summaryCopy:
      "Collects tests, incidents, retries, fallbacks, thrown errors, and operational signals that should affect review confidence.",
    primaryFindingId: "failures-missing-evidence"
  },
  {
    name: "Packages",
    summaryTitle: "Package and release lens",
    summaryCopy:
      "Surfaces workspace packages, release boundaries, ownership, generated artifacts, and package-level compatibility.",
    primaryFindingId: "packages-release-boundary"
  },
  {
    name: "Classic Diff",
    summaryTitle: "Classic diff fallback",
    summaryCopy:
      "Keeps a familiar line-oriented review mode available while preserving links back to semantic evidence.",
    primaryFindingId: "classic-raw-diff"
  },
  {
    name: "AI Review Prompt",
    summaryTitle: "AI reviewer prompt workspace",
    summaryCopy:
      "Provides a structured prompt surface for asking an assistant to evaluate meaning, risk, contracts, and missing evidence.",
    primaryFindingId: "prompt-reviewer-skepticism"
  }
];

export function getFinding(id: string): LensFinding {
  const finding = findings.find((item) => item.id === id);

  if (!finding) {
    throw new Error(`Unknown finding: ${id}`);
  }

  return finding;
}
