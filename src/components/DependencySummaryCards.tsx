export type DependencySummaryMetric = {
  label: string;
  value: number;
};

type DependencySummaryCardsProps = {
  ariaLabel: string;
  metrics: DependencySummaryMetric[];
};

export function DependencySummaryCards({ ariaLabel, metrics }: DependencySummaryCardsProps) {
  return (
    <div className="dependency-summary-strip" aria-label={ariaLabel}>
      {metrics.map((metric) => (
        <MetricTile key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
}

function MetricTile({ label, value }: DependencySummaryMetric) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
