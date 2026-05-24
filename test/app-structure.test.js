import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const requiredTabs = [
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

test("index exposes required top-level review lenses", async () => {
  const app = await readFile(new URL("../src/reviewModel.ts", import.meta.url), "utf8");

  for (const tab of requiredTabs) {
    assert.match(app, new RegExp(`"${tab}"`));
  }
});

test("index includes the three-pane review layout", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /id="change-list-title"/);
  assert.match(app, />Change List</);
  assert.match(app, /id="graph-map-title"/);
  assert.match(app, />Graph \/ Map</);
  assert.match(app, /id="detail-card-title"/);
  assert.match(app, />Detail Card</);
  assert.match(app, /Repository selector mock/);
  assert.match(app, /Risk score/);
});

test("app data covers each required lens", async () => {
  const app = await readFile(new URL("../src/reviewModel.ts", import.meta.url), "utf8");

  for (const tab of requiredTabs) {
    assert.match(app, new RegExp(`name:\\s*"${tab}"`));
  }

  assert.match(app, /rankedFindingIds/);
  assert.match(app, /primaryFindingId/);
});

test("product guide defines Review Lens as semantic code review, not generic review management", async () => {
  const guide = await readFile(new URL("../PRODUCT_GUIDE.md", import.meta.url), "utf8");

  assert.match(guide, /cognitive semantic code review GUI/);
  assert.match(guide, /not a generic review management tool/i);
  assert.match(guide, /AI-generated code/);
});

test("TypeScript UI models are explicit", async () => {
  const types = await readFile(new URL("../src/types.ts", import.meta.url), "utf8");

  assert.match(types, /export type LensName/);
  assert.match(types, /export type Severity/);
  assert.match(types, /export type LensFinding/);
  assert.match(types, /export type LensDefinition/);
  assert.match(types, /sourceAnchor: string/);
});

test("dependency graph lens has typed analysis model and analyzer", async () => {
  const analysis = await readFile(
    new URL("../src/analysis/dependencyGraph.ts", import.meta.url),
    "utf8"
  );
  const dependencyLens = await readFile(
    new URL("../src/components/DependencyGraphLens.tsx", import.meta.url),
    "utf8"
  );

  assert.match(analysis, /export type DependencyNode/);
  assert.match(analysis, /export type DependencyEdge/);
  assert.match(analysis, /export type DependencyGraphAnalysis/);
  assert.match(analysis, /export function analyzeDependencyGraph/);
  assert.match(analysis, /circular-dependency/);
  assert.match(analysis, /architecture-boundary-risk/);
  assert.match(analysis, /direct-ai-import/);
  assert.match(dependencyLens, /DependencyGraphLens/);
  assert.match(dependencyLens, /Dependency Graph/);
});

test("architecture boundary lens uses dependency graph analysis", async () => {
  const architectureLens = await readFile(
    new URL("../src/components/ArchitectureBoundaryLens.tsx", import.meta.url),
    "utf8"
  );
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const reviewModel = await readFile(new URL("../src/reviewModel.ts", import.meta.url), "utf8");

  assert.match(architectureLens, /ArchitectureBoundaryLens/);
  assert.match(architectureLens, /Boundary Map/);
  assert.match(architectureLens, /Allowed dependency direction/);
  assert.match(architectureLens, /architecture-boundary-risk/);
  assert.match(architectureLens, /direct-ai-import/);
  assert.match(app, /activeLens === "Architecture"/);
  assert.match(reviewModel, /topArchitectureFinding/);
});

test("security lens derives danger paths from typed security analysis", async () => {
  const securityAnalysis = await readFile(
    new URL("../src/analysis/securityRisk.ts", import.meta.url),
    "utf8"
  );
  const securityLens = await readFile(
    new URL("../src/components/SecurityLens.tsx", import.meta.url),
    "utf8"
  );
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const reviewModel = await readFile(new URL("../src/reviewModel.ts", import.meta.url), "utf8");

  assert.match(securityAnalysis, /export type SecurityDataFlow/);
  assert.match(securityAnalysis, /export type SecurityFinding/);
  assert.match(securityAnalysis, /export function analyzeSecurityRisk/);
  assert.match(securityAnalysis, /trust-boundary-crossing/);
  assert.match(securityAnalysis, /external-data-transfer/);
  assert.match(securityAnalysis, /secret-access/);
  assert.match(securityAnalysis, /unsafe-logging/);
  assert.match(securityLens, /Danger Path Map/);
  assert.match(securityLens, /What new danger paths/);
  assert.match(app, /activeLens === "Security"/);
  assert.match(reviewModel, /topSecurityFinding/);
});
