import type { SampleOption } from "../../types";

type Props = {
  samples: SampleOption[];
  selectedId: string | null;
  onSelect: (sampleId: string | null) => void;
};

export function SampleSelector({ samples, selectedId, onSelect }: Props) {
  return (
    <div className="sample-list">
      {samples.map((item) => (
        <button
          key={item.id}
          className={`sample-option ${item.id === selectedId ? "is-active" : ""}`}
          type="button"
          onClick={() => onSelect(item.id === selectedId ? null : item.id)}
        >
          <span className="sample-name">{item.name}</span>
          <span className="sample-task">{item.taskType}</span>
        </button>
      ))}
    </div>
  );
}
