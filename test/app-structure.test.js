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
