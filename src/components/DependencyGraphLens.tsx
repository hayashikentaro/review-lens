import { dependencyGraphAnalysis } from "../analysis/dependencyGraph";
import { DependencyNodeCard } from "./DependencyNodeCard";
import { DependencySummaryCards } from "./DependencySummaryCards";
import { severityClass } from "./severity";

type DependencyGraphLensProps = {
  summaryCopy: string;
  summaryTitle: string;
};

export function DependencyGraphLens({ summaryCopy, summaryTitle }: DependencyGraphLensProps) {
  const topFindings = dependencyGraphAnalysis.findings.slice(0, 5);

  return (
    <section className="pane graph-map dependency-graph-lens" aria-labelledby="graph-map-title">
      <div className="pane-heading">
        <p className="eyebrow" id="active-lens-label">
          Dependencies lens
        </p>
        <h2 id="graph-map-title">Dependency Graph</h2>
      </div>

      <DependencySummaryCards
        ariaLabel="Dependency graph risk summary"
        metrics={[
          { label: "New edges", value: dependencyGraphAnalysis.summary.newEdgeCount },
          { label: "Cycles", value: dependencyGraphAnalysis.summary.cycleCount },
          { label: "Boundary risks", value: dependencyGraphAnalysis.summary.boundaryRiskCount },
          { label: "AI direct imports", value: dependencyGraphAnalysis.summary.directAiImportCount }
        ]}
      />

      <div className="dependency-map" aria-label="Dependency graph map">
        {dependencyGraphAnalysis.edges.map((edge) => {
          const from = dependencyGraphAnalysis.nodes.find((node) => node.id === edge.from);
          const to = dependencyGraphAnalysis.nodes.find((node) => node.id === edge.to);

          if (!from || !to) {
            return null;
          }

          return (
            <div
              className={`dependency-edge ${edge.introducedByChange ? "is-new" : ""}`}
              key={edge.id}
            >
              <span>{from.label}</span>
              <strong>{edge.introducedByChange ? "new edge" : edge.kind}</strong>
              <span>{to.label}</span>
            </div>
          );
        })}

        <div className="dependency-node-grid">
          {dependencyGraphAnalysis.nodes.map((node) => (
            <DependencyNodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      <div className="dependency-findings">
        <h3>{summaryTitle}</h3>
        <p>{summaryCopy}</p>
        <div className="dependency-finding-list">
          {topFindings.map((finding) => (
            <article className="dependency-finding" key={finding.id}>
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
    </section>
  );
}
