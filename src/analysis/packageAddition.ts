import type { Severity } from "../types";
import { dependencyGraphAnalysis } from "./dependencyGraph";
import type { DependencyGraphAnalysis } from "./dependencyGraph";

export type PackageRuntimeSurface = "browser" | "node" | "build" | "test";

export type PackageRiskKind =
  | "new-package-entry"
  | "external-code-trust-boundary"
  | "runtime-execution-surface"
  | "transitive-expansion"
  | "maintainer-risk"
  | "license-review"
  | "security-policy-gap";

export type PackageAddition = {
  id: string;
  name: string;
  version: string;
  previousVersion: null;
  requestedByNodeId: string;
  runtimeSurfaces: PackageRuntimeSurface[];
  transitiveDependencyCount: number;
  maintainerCount: number;
  license: string;
  knownSecurityReview: boolean;
  aiGeneratedImport: boolean;
  evidence: string;
};

export type PackageFinding = {
  id: string;
  kind: PackageRiskKind;
  severity: Severity;
  title: string;
  evidence: string;
  question: string;
  packageIds: string[];
  nodeIds: string[];
};

export type PackageAdditionDataset = {
  additions: PackageAddition[];
};

export type PackageAdditionSummary = {
  addedPackageCount: number;
  runtimePackageCount: number;
  transitiveDependencyCount: number;
  unreviewedPackageCount: number;
  aiIntroducedPackageCount: number;
  externalBoundaryEventCount: number;
};

export type PackageAdditionAnalysis = {
  additions: PackageAddition[];
  findings: PackageFinding[];
  summary: PackageAdditionSummary;
};

export const mockPackageAdditionDataset: PackageAdditionDataset = {
  additions: [
    {
      id: "pkg-openai",
      name: "openai",
      version: "4.104.0",
      previousVersion: null,
      requestedByNodeId: "platform.prompt-runner",
      runtimeSurfaces: ["node"],
      transitiveDependencyCount: 8,
      maintainerCount: 1,
      license: "Apache-2.0",
      knownSecurityReview: false,
      aiGeneratedImport: true,
      evidence: "PromptRunner adds openai as a new runtime package to execute AI review prompts."
    },
    {
      id: "pkg-zod",
      name: "zod",
      version: "3.25.0",
      previousVersion: null,
      requestedByNodeId: "domain.dependency-policy",
      runtimeSurfaces: ["node", "browser"],
      transitiveDependencyCount: 0,
      maintainerCount: 4,
      license: "MIT",
      knownSecurityReview: true,
      aiGeneratedImport: false,
      evidence: "DependencyPolicy adds zod to describe dependency-boundary schemas."
    }
  ]
};

export function analyzePackageAdditions(
  dataset: PackageAdditionDataset,
  dependencyAnalysis: DependencyGraphAnalysis
): PackageAdditionAnalysis {
  const findings = dataset.additions.flatMap((addition) => [
    createTrustBoundaryFinding(addition),
    ...createRuntimeSurfaceFinding(addition),
    ...createTransitiveFindings(addition),
    ...createMaintainerFindings(addition),
    ...createPolicyGapFindings(addition),
    ...createAiImportFindings(addition, dependencyAnalysis)
  ]);

  return {
    additions: dataset.additions,
    findings,
    summary: {
      addedPackageCount: dataset.additions.length,
      runtimePackageCount: dataset.additions.filter((addition) =>
        addition.runtimeSurfaces.some((surface) => surface === "node" || surface === "browser")
      ).length,
      transitiveDependencyCount: dataset.additions.reduce(
        (total, addition) => total + addition.transitiveDependencyCount,
        0
      ),
      unreviewedPackageCount: dataset.additions.filter((addition) => !addition.knownSecurityReview)
        .length,
      aiIntroducedPackageCount: dataset.additions.filter((addition) => addition.aiGeneratedImport)
        .length,
      externalBoundaryEventCount: dataset.additions.length
    }
  };
}

function createTrustBoundaryFinding(addition: PackageAddition): PackageFinding {
  return {
    id: `package-boundary-${addition.id}`,
    kind: "external-code-trust-boundary",
    severity: addition.knownSecurityReview ? "Medium" : "High",
    title: `${addition.name} enters the repository trust boundary`,
    evidence: addition.evidence,
    question: "What review evidence makes this external code acceptable inside the repository?",
    packageIds: [addition.id],
    nodeIds: [addition.requestedByNodeId]
  };
}

function createRuntimeSurfaceFinding(addition: PackageAddition): PackageFinding[] {
  if (!addition.runtimeSurfaces.some((surface) => surface === "node" || surface === "browser")) {
    return [];
  }

  return [
    {
      id: `package-runtime-${addition.id}`,
      kind: "runtime-execution-surface",
      severity: addition.runtimeSurfaces.includes("browser") ? "High" : "Medium",
      title: `${addition.name} runs in ${addition.runtimeSurfaces.join(" and ")} code`,
      evidence: `${addition.name}@${addition.version} is present on ${addition.runtimeSurfaces.join(
        ", "
      )} execution surfaces.`,
      question: "Which runtime paths can execute this package after merge?",
      packageIds: [addition.id],
      nodeIds: [addition.requestedByNodeId]
    }
  ];
}

function createTransitiveFindings(addition: PackageAddition): PackageFinding[] {
  if (addition.transitiveDependencyCount < 5) {
    return [];
  }

  return [
    {
      id: `package-transitive-${addition.id}`,
      kind: "transitive-expansion",
      severity: "High",
      title: `${addition.name} expands the transitive dependency surface`,
      evidence: `${addition.name} introduces ${addition.transitiveDependencyCount} transitive packages.`,
      question: "Which transitive packages become part of the trusted runtime surface?",
      packageIds: [addition.id],
      nodeIds: [addition.requestedByNodeId]
    }
  ];
}

function createMaintainerFindings(addition: PackageAddition): PackageFinding[] {
  if (addition.maintainerCount > 1) {
    return [];
  }

  return [
    {
      id: `package-maintainer-${addition.id}`,
      kind: "maintainer-risk",
      severity: "Medium",
      title: `${addition.name} has a narrow maintainer surface`,
      evidence: `${addition.name} is modeled with ${addition.maintainerCount} maintainer account.`,
      question: "Is maintainer concentration acceptable for this runtime dependency?",
      packageIds: [addition.id],
      nodeIds: [addition.requestedByNodeId]
    }
  ];
}

function createPolicyGapFindings(addition: PackageAddition): PackageFinding[] {
  if (addition.knownSecurityReview) {
    return [];
  }

  return [
    {
      id: `package-policy-${addition.id}`,
      kind: "security-policy-gap",
      severity: "High",
      title: `${addition.name} lacks recorded security review`,
      evidence: "Mock package analysis has no existing approval evidence for this addition.",
      question: "Who accepts the package before generated code can rely on it?",
      packageIds: [addition.id],
      nodeIds: [addition.requestedByNodeId]
    }
  ];
}

function createAiImportFindings(
  addition: PackageAddition,
  dependencyAnalysis: DependencyGraphAnalysis
): PackageFinding[] {
  const node = dependencyAnalysis.nodes.find((candidate) => candidate.id === addition.requestedByNodeId);

  if (!addition.aiGeneratedImport && !node?.aiGenerated) {
    return [];
  }

  return [
    {
      id: `package-ai-${addition.id}`,
      kind: "new-package-entry",
      severity: "High",
      title: `AI-generated code introduced ${addition.name}`,
      evidence: `${node?.label ?? addition.requestedByNodeId} requested ${addition.name}@${addition.version}.`,
      question: "Was this package selected intentionally, or did generated code choose it by convenience?",
      packageIds: [addition.id],
      nodeIds: [addition.requestedByNodeId]
    }
  ];
}

export const packageAdditionAnalysis = analyzePackageAdditions(
  mockPackageAdditionDataset,
  dependencyGraphAnalysis
);
