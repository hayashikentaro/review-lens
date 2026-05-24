import { packageAdditionAnalysis } from "../analysis/packageAddition";
import { dependencyGraphAnalysis } from "../analysis/dependencyGraph";
import { DependencySummaryCards } from "./DependencySummaryCards";
import { severityClass } from "./severity";

type PackageAdditionLensProps = {
  summaryCopy: string;
  summaryTitle: string;
};

export function PackageAdditionLens({ summaryCopy, summaryTitle }: PackageAdditionLensProps) {
  const topFindings = packageAdditionAnalysis.findings.slice(0, 6);

  return (
    <section className="pane graph-map package-addition-lens" aria-labelledby="graph-map-title">
      <div className="pane-heading">
        <p className="eyebrow" id="active-lens-label">
          Packages lens
        </p>
        <h2 id="graph-map-title">Package Addition Review</h2>
      </div>

      <DependencySummaryCards
        ariaLabel="Package addition risk summary"
        metrics={[
          { label: "Added packages", value: packageAdditionAnalysis.summary.addedPackageCount },
          { label: "Runtime packages", value: packageAdditionAnalysis.summary.runtimePackageCount },
          { label: "Transitive deps", value: packageAdditionAnalysis.summary.transitiveDependencyCount },
          { label: "Unreviewed", value: packageAdditionAnalysis.summary.unreviewedPackageCount }
        ]}
      />

      <div className="package-addition-map" aria-label="Package addition trust boundary map">
        <div className="package-entry-list">
          <h3>External code entering trust boundary</h3>
          {packageAdditionAnalysis.additions.map((addition) => {
            const requester = dependencyGraphAnalysis.nodes.find(
              (node) => node.id === addition.requestedByNodeId
            );

            return (
              <article className="package-entry" key={addition.id}>
                <span>{addition.license}</span>
                <strong>
                  {addition.name}@{addition.version}
                </strong>
                <p>{addition.evidence}</p>
                <small>
                  Requested by {requester?.label ?? addition.requestedByNodeId} /{" "}
                  {addition.runtimeSurfaces.join(", ")}
                </small>
              </article>
            );
          })}
        </div>

        <div className="package-finding-stack">
          <h3>Package review findings</h3>
          {topFindings.map((finding) => (
            <article className="package-finding" key={finding.id}>
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

      <div className="dependency-findings package-summary">
        <h3>{summaryTitle}</h3>
        <p>{summaryCopy}</p>
        <p>
          Package Addition Lens treats each new package as external code crossing into the
          repository trust boundary, then asks what runtime surface, transitive code, and review
          evidence changed.
        </p>
      </div>
    </section>
  );
}

export const packageFindings = packageAdditionAnalysis.findings;
