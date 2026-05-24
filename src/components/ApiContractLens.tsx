import { apiContractAnalysis } from "../analysis/apiContract";
import { DependencySummaryCards } from "./DependencySummaryCards";
import { severityClass } from "./severity";

type ApiContractLensProps = {
  summaryCopy: string;
  summaryTitle: string;
};

export function ApiContractLens({ summaryCopy, summaryTitle }: ApiContractLensProps) {
  const topFindings = apiContractAnalysis.findings.slice(0, 6);

  return (
    <section className="pane graph-map api-contract-lens" aria-labelledby="graph-map-title">
      <div className="pane-heading">
        <p className="eyebrow" id="active-lens-label">
          API Contract lens
        </p>
        <h2 id="graph-map-title">Contract Delta Map</h2>
      </div>

      <DependencySummaryCards
        ariaLabel="API contract risk summary"
        metrics={[
          { label: "Contract changes", value: apiContractAnalysis.summary.changeCount },
          { label: "Breaking", value: apiContractAnalysis.summary.breakingChangeCount },
          { label: "No contract note", value: apiContractAnalysis.summary.generatedWithoutNoteCount },
          { label: "Affected callers", value: apiContractAnalysis.summary.affectedCallerCount }
        ]}
      />

      <div className="api-contract-map" aria-label="API contract delta map">
        <div className="contract-change-list">
          <h3>Contract changes</h3>
          {apiContractAnalysis.changes.map((change) => (
            <article className={`contract-change contract-${change.compatibility}`} key={change.id}>
              <span>{change.surface}</span>
              <strong>{change.endpointOrType}</strong>
              <p>{change.evidence}</p>
              <small>
                {change.before} {"->"} {change.after}
              </small>
            </article>
          ))}
        </div>

        <div className="contract-finding-stack">
          <h3>Compatibility findings</h3>
          {topFindings.map((finding) => (
            <article className="contract-finding" key={finding.id}>
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

      <div className="dependency-findings api-contract-summary">
        <h3>{summaryTitle}</h3>
        <p>{summaryCopy}</p>
        <p>
          API Contract Lens asks: Did this PR change public or internal contracts in a dangerous
          way? It highlights caller impact before raw syntax.
        </p>
      </div>
    </section>
  );
}

export const apiContractFindings = apiContractAnalysis.findings;
