import { dependencyGraphAnalysis } from "../analysis/dependencyGraph";
import { DependencySummaryCards } from "./DependencySummaryCards";
import { severityClass } from "./severity";

type ArchitectureBoundaryLensProps = {
  summaryCopy: string;
  summaryTitle: string;
};

const boundaryFindings = dependencyGraphAnalysis.findings.filter(
  (finding) =>
    finding.kind === "architecture-boundary-risk" ||
    finding.kind === "direct-ai-import" ||
    finding.kind === "god-module"
);

export function ArchitectureBoundaryLens({
  summaryCopy,
  summaryTitle
}: ArchitectureBoundaryLensProps) {
  return (
    <section className="pane graph-map architecture-boundary-lens" aria-labelledby="graph-map-title">
      <div className="pane-heading">
        <p className="eyebrow" id="active-lens-label">
          Architecture lens
        </p>
        <h2 id="graph-map-title">Boundary Map</h2>
      </div>

      <DependencySummaryCards
        ariaLabel="Architecture boundary risk summary"
        metrics={[
          { label: "Boundary risks", value: dependencyGraphAnalysis.summary.boundaryRiskCount },
          { label: "God modules", value: dependencyGraphAnalysis.summary.godModuleCount },
          { label: "AI direct imports", value: dependencyGraphAnalysis.summary.directAiImportCount },
          { label: "Cycles", value: dependencyGraphAnalysis.summary.cycleCount }
        ]}
      />

      <div className="architecture-boundary-map" aria-label="Architecture boundary map">
        <div className="boundary-policy">
          <h3>Allowed dependency direction</h3>
          <div className="boundary-rule-list">
            {dependencyGraphAnalysis.boundaries.map((boundary) => (
              <article className="boundary-rule" key={boundary.from}>
                <strong>{boundary.from}</strong>
                <span>
                  {boundary.allowedTo.length > 0
                    ? boundary.allowedTo.join(", ")
                    : "no outbound dependencies"}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="boundary-crossings">
          <h3>Boundary crossings to review</h3>
          <div className="boundary-crossing-list">
            {boundaryFindings.map((finding) => (
              <article className="boundary-crossing" key={finding.id}>
                <span className={`severity ${severityClass(finding.severity)}`}>
                  {finding.severity}
                </span>
                <div>
                  <strong>{finding.title}</strong>
                  <p>{finding.evidence}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="dependency-findings architecture-summary">
        <h3>{summaryTitle}</h3>
        <p>{summaryCopy}</p>
        <p>
          Architecture Boundary Lens uses dependency graph findings as cognitive compression:
          boundary rules first, violations second, raw import evidence on demand.
        </p>
      </div>
    </section>
  );
}

export const architectureBoundaryFindings = boundaryFindings;
