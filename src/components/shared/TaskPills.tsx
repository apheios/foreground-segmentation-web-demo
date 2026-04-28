import type { TaskType } from "../../types";

type Props = {
  options: TaskType[];
  selectedTask: TaskType;
  onChange: (task: TaskType) => void;
};

export function TaskPills({ options, selectedTask, onChange }: Props) {
  return (
    <div className="task-switcher">
      {options.map((task) => (
        <button
          key={task}
          className={`task-pill ${task === selectedTask ? "is-active" : ""}`}
          type="button"
          onClick={() => onChange(task)}
        >
          {task}
        </button>
      ))}
    </div>
  );
}
