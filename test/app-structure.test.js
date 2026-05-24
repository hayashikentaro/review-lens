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
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  for (const tab of requiredTabs) {
    assert.match(html, new RegExp(`data-lens-tab="${tab}"`));
  }
});

test("index includes the three-pane review layout", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="change-list-title">Change List/);
  assert.match(html, /id="graph-map-title">Graph \/ Map/);
  assert.match(html, /id="detail-card-title">Detail Card/);
  assert.match(html, /Repository selector mock/);
  assert.match(html, /Risk score/);
});

test("app data covers each required lens", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  for (const tab of requiredTabs) {
    assert.match(app, new RegExp(`"${tab}"\\s*:`));
  }

  assert.match(app, /rankedItems/);
  assert.match(app, /activateLens/);
});

test("product guide defines Review Lens as semantic code review, not generic review management", async () => {
  const guide = await readFile(new URL("../PRODUCT_GUIDE.md", import.meta.url), "utf8");

  assert.match(guide, /cognitive semantic code review GUI/);
  assert.match(guide, /not a generic review management tool/i);
  assert.match(guide, /AI-generated code/);
});
