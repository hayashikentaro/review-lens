import { useMemo, useState } from "react";
import {
  findings,
  getFinding,
  lensDefinitions,
  lensNames,
  rankedFindingIds,
  reviewTarget
} from "./reviewModel";
import type { LensFinding, LensName } from "./types";
import { dependencyGraphAnalysis } from "./analysis/dependencyGraph";
import type { DependencyFinding } from "./analysis/dependencyGraph";
import { securityAnalysis } from "./analysis/securityRisk";
import type { SecurityFinding } from "./analysis/securityRisk";
import { ArchitectureBoundaryLens } from "./components/ArchitectureBoundaryLens";
import { DependencyGraphLens } from "./components/DependencyGraphLens";
import { SecurityLens } from "./components/SecurityLens";
import { severityClass } from "./components/severity";

function Header() {
  return (
    <header className="app-header" aria-label="Review workspace header">
      <div className="brand-block">
        <p className="eyebrow">AI-era semantic code review</p>
        <h1>Review Lens</h1>
      </div>

      <label className="repo-selector">
        <span>Repository</span>
        <select aria-label="Repository selector mock" defaultValue={reviewTarget.repository}>
          <option>{reviewTarget.repository}</option>
          {reviewTarget.alternatives.map((repository) => (
            <option key={repository}>{repository}</option>
          ))}
        </select>
      </label>

      <section className="risk-score" aria-label="Risk score">
        <span className="risk-label">Review Risk</span>
        <strong>{reviewTarget.riskScore}</strong>
        <span className="risk-state">{reviewTarget.riskLabel}</span>
      </section>
    </header>
  );
}

type LensTabsProps = {
  activeLens: LensName;
  onSelectLens: (lens: LensName) => void;
};

function LensTabs({ activeLens, onSelectLens }: LensTabsProps) {
  return (
    <nav className="lens-tabs" aria-label="Review lenses">
      {lensNames.map((lens) => (
        <button
          className={`tab ${lens === activeLens ? "is-active" : ""}`}
          data-lens-tab={lens}
          key={lens}
          type="button"
          aria-current={lens === activeLens ? "page" : undefined}
          onClick={() => onSelectLens(lens)}
        >
          {lens}
        </button>
      ))}
    </nav>
  );
}

type ChangeListProps = {
  activeFindingId: string;
  activeLens: LensName;
  rankedFindings: LensFinding[];
  onSelectFinding: (finding: LensFinding) => void;
};

function ChangeList({
  activeFindingId,
  activeLens,
  rankedFindings,
  onSelectFinding
}: ChangeListProps) {
  return (
    <aside className="pane change-list" aria-labelledby="change-list-title">
      <div className="pane-heading">
        <p className="eyebrow">Risk-ranked semantic findings</p>
        <h2 id="change-list-title">Change List</h2>
      </div>

      <div className="change-items">
        {rankedFindings.map((finding) => (
          <button
            className={`change-item ${
              finding.id === activeFindingId || finding.lens === activeLens ? "is-selected" : ""
            }`}
            data-item-lens={finding.lens}
            key={finding.id}
            type="button"
            onClick={() => onSelectFinding(finding)}
          >
            <span className={`severity ${severityClass(finding.severity)}`}>
              {finding.severity}
            </span>
            <strong>{finding.title}</strong>
            <span>
              {finding.lens} / {finding.meta}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

type GraphMapProps = {
  activeLens: LensName;
  summaryCopy: string;
  summaryTitle: string;
};

function GraphMap({ activeLens, summaryCopy, summaryTitle }: GraphMapProps) {
  if (activeLens === "Security") {
    return <SecurityLens summaryCopy={summaryCopy} summaryTitle={summaryTitle} />;
  }

  if (activeLens === "Architecture") {
    return <ArchitectureBoundaryLens summaryCopy={summaryCopy} summaryTitle={summaryTitle} />;
  }

  if (activeLens === "Dependencies") {
    return <DependencyGraphLens summaryCopy={summaryCopy} summaryTitle={summaryTitle} />;
  }

  return (
    <section className="pane graph-map" aria-labelledby="graph-map-title">
      <div className="pane-heading">
        <p className="eyebrow" id="active-lens-label">
          {activeLens} lens
        </p>
        <h2 id="graph-map-title">Graph / Map</h2>
      </div>

      <div className="semantic-map" role="img" aria-label="Lens-specific visualization placeholder">
        <div className="map-node node-entry">Entry points</div>
        <div className="map-line line-a" />
        <div className="map-node node-core">Changed logic</div>
        <div className="map-line line-b" />
        <div className="map-node node-impact">Downstream impact</div>
        <div className="map-node node-risk">Review risk</div>
      </div>

      <div className="lens-summary">
        <h3>{summaryTitle}</h3>
        <p>{summaryCopy}</p>
      </div>
    </section>
  );
}

type DetailCardProps = {
  finding: LensFinding;
};

function DetailCard({ finding }: DetailCardProps) {
  const dependencyFinding =
    finding.lens === "Architecture"
      ? dependencyGraphAnalysis.findings.find(
          (item) =>
            item.kind === "architecture-boundary-risk" ||
            item.kind === "direct-ai-import" ||
            item.kind === "god-module"
        )
      : dependencyGraphAnalysis.findings[0];
  const securityFinding = securityAnalysis.findings[0];

  return (
    <aside className="pane detail-card" aria-labelledby="detail-card-title">
      <div className="pane-heading">
        <p className="eyebrow">Evidence, questions, raw diff</p>
        <h2 id="detail-card-title">Detail Card</h2>
      </div>

      <article className="detail-panel">
        <div className="detail-header">
          <span className={`severity ${severityClass(finding.severity)}`}>{finding.severity}</span>
          <h3>{finding.title}</h3>
        </div>

        <dl className="evidence-list">
          <div>
            <dt>Evidence</dt>
            <dd>{finding.evidence}</dd>
          </div>
          <div>
            <dt>Reviewer question</dt>
            <dd>{finding.question}</dd>
          </div>
          <div>
            <dt>Raw diff</dt>
            <dd>
              <a href={finding.sourceAnchor}>Open raw diff placeholder</a>
            </dd>
          </div>
        </dl>

        {(finding.lens === "Dependencies" || finding.lens === "Architecture") && dependencyFinding ? (
          <DependencyEvidence finding={dependencyFinding} lens={finding.lens} />
        ) : null}
        {finding.lens === "Security" && securityFinding ? (
          <SecurityEvidence finding={securityFinding} />
        ) : null}
      </article>
    </aside>
  );
}

function DependencyEvidence({ finding, lens }: { finding: DependencyFinding; lens: LensName }) {
  return (
    <section className="dependency-evidence" aria-label="Dependency graph evidence">
      <h4>{lens === "Architecture" ? "Architecture boundary evidence" : "Dependency graph evidence"}</h4>
      <p>{finding.kind}</p>
      <ul>
        <li>{finding.nodeIds.length} modules involved</li>
        <li>{finding.edgeIds.length} dependency edges involved</li>
        <li>Evidence comes from the typed mock repository analyzer.</li>
      </ul>
    </section>
  );
}

function SecurityEvidence({ finding }: { finding: SecurityFinding }) {
  return (
    <section className="dependency-evidence security-evidence" aria-label="Security evidence">
      <h4>Security danger path evidence</h4>
      <p>{finding.kind}</p>
      <ul>
        <li>{finding.nodeIds.length} modules involved</li>
        <li>{finding.edgeIds.length} dependency edges involved</li>
        <li>{finding.dataClassifications.join(", ")} data classification</li>
      </ul>
    </section>
  );
}

export function App() {
  const [activeLens, setActiveLens] = useState<LensName>("Overview");
  const [activeFindingId, setActiveFindingId] = useState("overview-generated-risk");

  const activeLensDefinition = useMemo(
    () => lensDefinitions.find((lens) => lens.name === activeLens) ?? lensDefinitions[0],
    [activeLens]
  );

  const rankedFindings = useMemo(
    () => rankedFindingIds.map((findingId) => getFinding(findingId)),
    []
  );

  const activeFinding = useMemo(
    () => findings.find((finding) => finding.id === activeFindingId) ?? getFinding(activeLensDefinition.primaryFindingId),
    [activeFindingId, activeLensDefinition.primaryFindingId]
  );

  function selectLens(lens: LensName) {
    const lensDefinition = lensDefinitions.find((item) => item.name === lens) ?? lensDefinitions[0];
    setActiveLens(lens);
    setActiveFindingId(lensDefinition.primaryFindingId);
  }

  function selectFinding(finding: LensFinding) {
    setActiveLens(finding.lens);
    setActiveFindingId(finding.id);
  }

  return (
    <div className="app-shell">
      <Header />
      <LensTabs activeLens={activeLens} onSelectLens={selectLens} />

      <main className="review-grid" aria-live="polite">
        <ChangeList
          activeFindingId={activeFinding.id}
          activeLens={activeLens}
          rankedFindings={rankedFindings}
          onSelectFinding={selectFinding}
        />
        <GraphMap
          activeLens={activeLens}
          summaryCopy={activeLensDefinition.summaryCopy}
          summaryTitle={activeLensDefinition.summaryTitle}
        />
        <DetailCard finding={activeFinding} />
      </main>
    </div>
  );
}
