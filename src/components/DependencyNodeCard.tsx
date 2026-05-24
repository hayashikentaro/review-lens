import type { DependencyNode } from "../analysis/dependencyGraph";

type DependencyNodeCardProps = {
  node: DependencyNode;
};

export function DependencyNodeCard({ node }: DependencyNodeCardProps) {
  return (
    <article className={`dependency-node dependency-layer-${node.layer}`}>
      <span>{node.layer}</span>
      <strong>{node.label}</strong>
      <small>
        {node.owner}
        {node.aiGenerated ? " / AI generated" : ""}
      </small>
    </article>
  );
}
