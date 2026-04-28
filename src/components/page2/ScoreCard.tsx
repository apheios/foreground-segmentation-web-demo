import { ReactNode } from "react";

type Props = {
  description: string;
  valueNode: ReactNode;
  emphasis?: boolean;
};

export function ScoreCard({ description, valueNode, emphasis = false }: Props) {
  return (
    <article className={`score-card ${emphasis ? "is-emphasis" : ""}`}>
      <div className="score-row">
        <div className="score-description">{description}</div>
        <div className="score-value-block">{valueNode}</div>
      </div>
    </article>
  );
}
