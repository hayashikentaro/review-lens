const lenses = {
  "Overview": {
    summaryTitle: "Generated patch risk overview",
    summaryCopy:
      "A cognitive review surface that ranks semantic findings before a human reviewer spends attention on raw lines.",
    itemTitle: "Generated code changed behavior across review lenses",
    severity: "Medium",
    evidence: "The mock review target touches contracts, security boundaries, and failure behavior in one patch.",
    question: "Which semantic finding deserves source-level verification first?",
    link: "#overview"
  },
  "Semantic Diff": {
    summaryTitle: "Meaning-level change map",
    summaryCopy:
      "Highlights behavior shifts, renamed concepts, invariant changes, and code paths whose meaning changed more than their line count.",
    itemTitle: "Generated validation path accepts a wider payload shape",
    severity: "High",
    evidence: "Input normalization moved before strict validation in the mocked controller flow.",
    question: "Does the product contract allow legacy clients to pass partial payloads?",
    link: "#semantic-diff"
  },
  "Security": {
    summaryTitle: "Security review surface",
    summaryCopy:
      "Groups authorization, trust boundaries, unsafe defaults, data exposure, and dependency risk into a single review lens.",
    itemTitle: "Privilege boundary should be named explicitly",
    severity: "Blocker",
    evidence: "Mocked admin action sits next to account-level read behavior.",
    question: "Which role or policy should gate this operation?",
    link: "#security"
  },
  "Architecture": {
    summaryTitle: "Architecture impact map",
    summaryCopy:
      "Shows coupling, ownership, module boundaries, and cross-cutting consequences before a reviewer drops into raw changes.",
    itemTitle: "Domain logic appears in the delivery layer",
    severity: "Medium",
    evidence: "The sample review item marks business branching near a route adapter.",
    question: "Should this decision live in a service boundary instead?",
    link: "#architecture"
  },
  "API Contract": {
    summaryTitle: "Contract compatibility lens",
    summaryCopy:
      "Tracks request shape, response shape, versioning, status codes, schemas, and caller expectations.",
    itemTitle: "Response semantics need compatibility notes",
    severity: "High",
    evidence: "A successful response can now represent a deferred processing state.",
    question: "Do current clients treat that state as terminal success?",
    link: "#api-contract"
  },
  "Dependencies": {
    summaryTitle: "Dependency relationship lens",
    summaryCopy:
      "Frames dependency updates by runtime exposure, transitive impact, package health, and migration work.",
    itemTitle: "Runtime dependency needs supply-chain review",
    severity: "Low",
    evidence: "The skeleton reserves dependency review without real package analysis yet.",
    question: "Which team owns dependency acceptance for this repo?",
    link: "#dependencies"
  },
  "Failures": {
    summaryTitle: "Failure mode lens",
    summaryCopy:
      "Collects tests, incidents, retries, fallbacks, thrown errors, and operational signals that should affect review confidence.",
    itemTitle: "Generated patch has no failure-path evidence",
    severity: "Medium",
    evidence: "The mocked change list includes risk but no linked failing test or incident.",
    question: "What observable failure would prove this change is unsafe?",
    link: "#failures"
  },
  "Packages": {
    summaryTitle: "Package and release lens",
    summaryCopy:
      "Surfaces workspace packages, release boundaries, ownership, generated artifacts, and package-level compatibility.",
    itemTitle: "Package impact needs release-boundary context",
    severity: "Low",
    evidence: "The package view is prepared as a placeholder for future workspace scanning.",
    question: "Which package would publish or deploy this behavior?",
    link: "#packages"
  },
  "Classic Diff": {
    summaryTitle: "Classic diff fallback",
    summaryCopy:
      "Keeps a familiar line-oriented review mode available while preserving links back to semantic evidence.",
    itemTitle: "Raw line diff remains available",
    severity: "Note",
    evidence: "The detail card keeps a raw diff link for source-level inspection.",
    question: "Which semantic finding should the raw diff anchor first?",
    link: "#classic-diff"
  },
  "AI Review Prompt": {
    summaryTitle: "AI reviewer prompt workspace",
    summaryCopy:
      "Provides a structured prompt surface for asking an assistant to evaluate meaning, risk, contracts, and missing evidence.",
    itemTitle: "Prompt should preserve reviewer skepticism",
    severity: "Medium",
    evidence: "Decision notes and unresolved questions are visible in the review frame.",
    question: "What should the assistant treat as non-negotiable review policy?",
    link: "#ai-review-prompt"
  }
};

const rankedItems = [
  {
    title: "Privilege boundary should be named explicitly",
    lens: "Security",
    severity: "Blocker",
    meta: "Auth, data access"
  },
  {
    title: "Generated validation path accepts a wider payload shape",
    lens: "Semantic Diff",
    severity: "High",
    meta: "Behavior, contracts"
  },
  {
    title: "Response semantics need compatibility notes",
    lens: "API Contract",
    severity: "High",
    meta: "Clients, versions"
  },
  {
    title: "Generated patch has no failure-path evidence",
    lens: "Failures",
    severity: "Medium",
    meta: "Tests, rollback"
  },
  {
    title: "Raw line diff remains available",
    lens: "Classic Diff",
    severity: "Note",
    meta: "Source view"
  }
];

const tabButtons = document.querySelectorAll("[data-lens-tab]");
const changeItems = document.querySelector("#change-items");
const activeLensLabel = document.querySelector("#active-lens-label");
const summaryTitle = document.querySelector("#lens-summary-title");
const summaryCopy = document.querySelector("#lens-summary-copy");
const detailSeverity = document.querySelector("#detail-severity");
const detailTitle = document.querySelector("#detail-title");
const detailEvidence = document.querySelector("#detail-evidence");
const detailQuestion = document.querySelector("#detail-question");
const detailLink = document.querySelector("#detail-link");

function severityClass(severity) {
  return `severity-${severity.toLowerCase().replace(/\s+/g, "-")}`;
}

function renderChangeList(activeLens) {
  changeItems.innerHTML = "";

  rankedItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `change-item ${item.lens === activeLens ? "is-selected" : ""}`;
    button.dataset.itemLens = item.lens;

    button.innerHTML = `
      <span class="severity ${severityClass(item.severity)}">${item.severity}</span>
      <strong>${item.title}</strong>
      <span>${item.lens} / ${item.meta}</span>
    `;

    button.addEventListener("click", () => activateLens(item.lens));
    changeItems.append(button);
  });
}

function activateLens(lensName) {
  const lens = lenses[lensName];

  tabButtons.forEach((button) => {
    const isActive = button.dataset.lensTab === lensName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  activeLensLabel.textContent = `${lensName} lens`;
  summaryTitle.textContent = lens.summaryTitle;
  summaryCopy.textContent = lens.summaryCopy;
  detailSeverity.textContent = lens.severity;
  detailSeverity.className = `severity ${severityClass(lens.severity)}`;
  detailTitle.textContent = lens.itemTitle;
  detailEvidence.textContent = lens.evidence;
  detailQuestion.textContent = lens.question;
  detailLink.href = lens.link;

  renderChangeList(lensName);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateLens(button.dataset.lensTab));
});

activateLens("Overview");
