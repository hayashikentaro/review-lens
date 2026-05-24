import type { Severity } from "../types";

export type DependencyLayer = "ui" | "application" | "domain" | "data" | "platform" | "external";

export type DependencyNodeKind = "internal" | "external";

export type DependencyEdgeKind = "import" | "runtime-call" | "schema" | "package";

export type DependencyRiskKind =
  | "hidden-coupling"
  | "new-dependency-edge"
  | "circular-dependency"
  | "god-module"
  | "external-dependency-introduction"
  | "architecture-boundary-risk"
  | "direct-ai-import";

export type DependencyNode = {
  id: string;
  label: string;
  layer: DependencyLayer;
  kind: DependencyNodeKind;
  owner: string;
  changed: boolean;
  aiGenerated: boolean;
};

export type DependencyEdge = {
  id: string;
  from: string;
  to: string;
  kind: DependencyEdgeKind;
  introducedByChange: boolean;
  directImport: boolean;
  evidence: string;
};

export type ArchitectureBoundary = {
  from: DependencyLayer;
  allowedTo: DependencyLayer[];
};

export type DependencyFinding = {
  id: string;
  kind: DependencyRiskKind;
  severity: Severity;
  title: string;
  evidence: string;
  question: string;
  nodeIds: string[];
  edgeIds: string[];
};

export type DependencyCycle = {
  id: string;
  nodeIds: string[];
  edgeIds: string[];
};

export type DependencyGraphDataset = {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  boundaries: ArchitectureBoundary[];
};

export type DependencyGraphSummary = {
  moduleCount: number;
  edgeCount: number;
  newEdgeCount: number;
  externalIntroductionCount: number;
  cycleCount: number;
  godModuleCount: number;
  boundaryRiskCount: number;
  directAiImportCount: number;
};

export type DependencyGraphAnalysis = {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  boundaries: ArchitectureBoundary[];
  findings: DependencyFinding[];
  cycles: DependencyCycle[];
  summary: DependencyGraphSummary;
};

export const mockDependencyGraphDataset: DependencyGraphDataset = {
  nodes: [
    {
      id: "ui.review-lens",
      label: "ReviewLensPanel",
      layer: "ui",
      kind: "internal",
      owner: "frontend",
      changed: true,
      aiGenerated: true
    },
    {
      id: "app.review-orchestrator",
      label: "ReviewOrchestrator",
      layer: "application",
      kind: "internal",
      owner: "review-platform",
      changed: true,
      aiGenerated: true
    },
    {
      id: "domain.semantic-model",
      label: "SemanticModel",
      layer: "domain",
      kind: "internal",
      owner: "analysis",
      changed: false,
      aiGenerated: false
    },
    {
      id: "domain.dependency-policy",
      label: "DependencyPolicy",
      layer: "domain",
      kind: "internal",
      owner: "architecture",
      changed: true,
      aiGenerated: false
    },
    {
      id: "data.git-change-store",
      label: "GitChangeStore",
      layer: "data",
      kind: "internal",
      owner: "platform",
      changed: false,
      aiGenerated: false
    },
    {
      id: "platform.github-client",
      label: "GitHubClient",
      layer: "platform",
      kind: "internal",
      owner: "integrations",
      changed: false,
      aiGenerated: false
    },
    {
      id: "platform.prompt-runner",
      label: "PromptRunner",
      layer: "platform",
      kind: "internal",
      owner: "ai-platform",
      changed: true,
      aiGenerated: true
    },
    {
      id: "external.openai-sdk",
      label: "openai",
      layer: "external",
      kind: "external",
      owner: "third-party",
      changed: true,
      aiGenerated: false
    }
  ],
  edges: [
    {
      id: "edge-ui-orchestrator",
      from: "ui.review-lens",
      to: "app.review-orchestrator",
      kind: "import",
      introducedByChange: false,
      directImport: true,
      evidence: "ReviewLensPanel delegates semantic review state to ReviewOrchestrator."
    },
    {
      id: "edge-orchestrator-semantic",
      from: "app.review-orchestrator",
      to: "domain.semantic-model",
      kind: "import",
      introducedByChange: false,
      directImport: true,
      evidence: "ReviewOrchestrator reads semantic model snapshots."
    },
    {
      id: "edge-orchestrator-policy",
      from: "app.review-orchestrator",
      to: "domain.dependency-policy",
      kind: "import",
      introducedByChange: true,
      directImport: true,
      evidence: "Generated orchestration now evaluates dependency policy inline."
    },
    {
      id: "edge-orchestrator-store",
      from: "app.review-orchestrator",
      to: "data.git-change-store",
      kind: "runtime-call",
      introducedByChange: false,
      directImport: true,
      evidence: "ReviewOrchestrator loads changed-file summaries from GitChangeStore."
    },
    {
      id: "edge-orchestrator-github",
      from: "app.review-orchestrator",
      to: "platform.github-client",
      kind: "import",
      introducedByChange: true,
      directImport: true,
      evidence: "AI-generated orchestration imports GitHubClient directly instead of a repository port."
    },
    {
      id: "edge-orchestrator-prompt",
      from: "app.review-orchestrator",
      to: "platform.prompt-runner",
      kind: "runtime-call",
      introducedByChange: true,
      directImport: true,
      evidence: "ReviewOrchestrator now triggers prompt execution from the application layer."
    },
    {
      id: "edge-prompt-openai",
      from: "platform.prompt-runner",
      to: "external.openai-sdk",
      kind: "package",
      introducedByChange: true,
      directImport: true,
      evidence: "PromptRunner adds the OpenAI SDK as a runtime package dependency."
    },
    {
      id: "edge-policy-semantic",
      from: "domain.dependency-policy",
      to: "domain.semantic-model",
      kind: "schema",
      introducedByChange: false,
      directImport: true,
      evidence: "DependencyPolicy validates semantic model relationships."
    },
    {
      id: "edge-semantic-policy",
      from: "domain.semantic-model",
      to: "domain.dependency-policy",
      kind: "import",
      introducedByChange: true,
      directImport: true,
      evidence: "Generated helper imports DependencyPolicy back into SemanticModel."
    }
  ],
  boundaries: [
    {
      from: "ui",
      allowedTo: ["application", "domain"]
    },
    {
      from: "application",
      allowedTo: ["domain", "data"]
    },
    {
      from: "domain",
      allowedTo: ["domain"]
    },
    {
      from: "data",
      allowedTo: ["domain", "platform"]
    },
    {
      from: "platform",
      allowedTo: ["external"]
    },
    {
      from: "external",
      allowedTo: []
    }
  ]
};

export function analyzeDependencyGraph(dataset: DependencyGraphDataset): DependencyGraphAnalysis {
  const nodeById = new Map(dataset.nodes.map((node) => [node.id, node]));
  const edgesByFrom = groupEdgesBySource(dataset.edges);
  const cycles = detectCycles(dataset.nodes, edgesByFrom);
  const godModuleFindings = findGodModules(dataset.nodes, dataset.edges);
  const boundaryFindings = findBoundaryRisks(dataset, nodeById);
  const externalFindings = findExternalIntroductions(dataset.edges, nodeById);
  const directAiImportFindings = findDirectAiImports(dataset.edges, nodeById);
  const newEdgeFindings = findNewDependencyEdges(dataset.edges, nodeById);
  const cycleFindings = cycles.map((cycle) => createCycleFinding(cycle, nodeById));

  const findings = [
    ...cycleFindings,
    ...godModuleFindings,
    ...boundaryFindings,
    ...externalFindings,
    ...directAiImportFindings,
    ...newEdgeFindings
  ];

  return {
    nodes: dataset.nodes,
    edges: dataset.edges,
    boundaries: dataset.boundaries,
    findings,
    cycles,
    summary: {
      moduleCount: dataset.nodes.length,
      edgeCount: dataset.edges.length,
      newEdgeCount: dataset.edges.filter((edge) => edge.introducedByChange).length,
      externalIntroductionCount: externalFindings.length,
      cycleCount: cycles.length,
      godModuleCount: godModuleFindings.length,
      boundaryRiskCount: boundaryFindings.length,
      directAiImportCount: directAiImportFindings.length
    }
  };
}

function groupEdgesBySource(edges: DependencyEdge[]): Map<string, DependencyEdge[]> {
  const grouped = new Map<string, DependencyEdge[]>();

  for (const edge of edges) {
    const current = grouped.get(edge.from) ?? [];
    current.push(edge);
    grouped.set(edge.from, current);
  }

  return grouped;
}

function detectCycles(
  nodes: DependencyNode[],
  edgesByFrom: Map<string, DependencyEdge[]>
): DependencyCycle[] {
  const cycles = new Map<string, DependencyCycle>();

  function visit(nodeId: string, path: string[], edgePath: string[]) {
    const cycleStart = path.indexOf(nodeId);

    if (cycleStart >= 0) {
      const nodeIds = path.slice(cycleStart);
      const cycleEdgeIds = edgePath.slice(cycleStart);
      const key = [...nodeIds].sort().join("|");

      if (!cycles.has(key)) {
        cycles.set(key, {
          id: `cycle-${cycles.size + 1}`,
          nodeIds,
          edgeIds: cycleEdgeIds
        });
      }

      return;
    }

    for (const edge of edgesByFrom.get(nodeId) ?? []) {
      visit(edge.to, [...path, nodeId], [...edgePath, edge.id]);
    }
  }

  for (const node of nodes) {
    visit(node.id, [], []);
  }

  return [...cycles.values()];
}

function findGodModules(nodes: DependencyNode[], edges: DependencyEdge[]): DependencyFinding[] {
  const fanoutByNode = new Map<string, DependencyEdge[]>();

  for (const edge of edges) {
    const fanout = fanoutByNode.get(edge.from) ?? [];
    fanout.push(edge);
    fanoutByNode.set(edge.from, fanout);
  }

  return nodes.flatMap((node) => {
    const fanout = fanoutByNode.get(node.id) ?? [];

    if (fanout.length < 5) {
      return [];
    }

    return [
      {
        id: `god-module-${node.id}`,
        kind: "god-module",
        severity: "High",
        title: `${node.label} is becoming a god module`,
        evidence: `${node.label} depends on ${fanout.length} modules across review boundaries.`,
        question: "Should orchestration be split so semantic review policy stays inspectable?",
        nodeIds: [node.id, ...fanout.map((edge) => edge.to)],
        edgeIds: fanout.map((edge) => edge.id)
      }
    ];
  });
}

function findBoundaryRisks(
  dataset: DependencyGraphDataset,
  nodeById: Map<string, DependencyNode>
): DependencyFinding[] {
  return dataset.edges.flatMap((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    const boundary = from ? dataset.boundaries.find((rule) => rule.from === from.layer) : undefined;

    if (!from || !to || !boundary || boundary.allowedTo.includes(to.layer)) {
      return [];
    }

    return [
      {
        id: `boundary-${edge.id}`,
        kind: "architecture-boundary-risk",
        severity: edge.introducedByChange ? "High" : "Medium",
        title: `${from.label} crosses into ${to.layer} directly`,
        evidence: edge.evidence,
        question: "Should this dependency go through an explicit port or policy boundary instead?",
        nodeIds: [from.id, to.id],
        edgeIds: [edge.id]
      }
    ];
  });
}

function findExternalIntroductions(
  edges: DependencyEdge[],
  nodeById: Map<string, DependencyNode>
): DependencyFinding[] {
  return edges.flatMap((edge) => {
    const to = nodeById.get(edge.to);

    if (!edge.introducedByChange || to?.kind !== "external") {
      return [];
    }

    return [
      {
        id: `external-${edge.id}`,
        kind: "external-dependency-introduction",
        severity: "High",
        title: `${to.label} introduced as a runtime dependency`,
        evidence: edge.evidence,
        question: "What review policy accepts this new external runtime dependency?",
        nodeIds: [edge.from, edge.to],
        edgeIds: [edge.id]
      }
    ];
  });
}

function findDirectAiImports(
  edges: DependencyEdge[],
  nodeById: Map<string, DependencyNode>
): DependencyFinding[] {
  return edges.flatMap((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);

    if (!from?.aiGenerated || !to || !edge.directImport || from.layer === to.layer) {
      return [];
    }

    return [
      {
        id: `ai-direct-${edge.id}`,
        kind: "direct-ai-import",
        severity: edge.introducedByChange ? "High" : "Medium",
        title: `AI-generated ${from.label} imports ${to.label} directly`,
        evidence: edge.evidence,
        question: "Did generated code bypass a boundary that should remain explicit?",
        nodeIds: [from.id, to.id],
        edgeIds: [edge.id]
      }
    ];
  });
}

function findNewDependencyEdges(
  edges: DependencyEdge[],
  nodeById: Map<string, DependencyNode>
): DependencyFinding[] {
  return edges.flatMap((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);

    if (!from || !to || !edge.introducedByChange) {
      return [];
    }

    return [
      {
        id: `new-edge-${edge.id}`,
        kind: "new-dependency-edge",
        severity: to.kind === "external" ? "High" : "Medium",
        title: `New edge: ${from.label} -> ${to.label}`,
        evidence: edge.evidence,
        question: "Is this new dependency direction part of the intended architecture?",
        nodeIds: [from.id, to.id],
        edgeIds: [edge.id]
      }
    ];
  });
}

function createCycleFinding(
  cycle: DependencyCycle,
  nodeById: Map<string, DependencyNode>
): DependencyFinding {
  const labels = cycle.nodeIds.map((nodeId) => nodeById.get(nodeId)?.label ?? nodeId);

  return {
    id: `finding-${cycle.id}`,
    kind: "circular-dependency",
    severity: "Blocker",
    title: `Circular dependency: ${labels.join(" -> ")}`,
    evidence: `Cycle detected through ${labels.length} modules: ${labels.join(" -> ")}.`,
    question: "Which module owns this concept, and which import should be inverted?",
    nodeIds: cycle.nodeIds,
    edgeIds: cycle.edgeIds
  };
}

export const dependencyGraphAnalysis = analyzeDependencyGraph(mockDependencyGraphDataset);
