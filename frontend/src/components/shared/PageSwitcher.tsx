import type { PageKey } from "../../types";

type Props = {
  currentPage: PageKey;
  onChange: (page: PageKey) => void;
};

export function PageSwitcher({ currentPage, onChange }: Props) {
  return (
    <section className="showcase-switcher panel">
      <button
        className={`showcase-tab ${currentPage === "page1" ? "is-active" : ""}`}
        type="button"
        onClick={() => onChange("page1")}
      >
        前景分割模型展示
      </button>
      <button
        className={`showcase-tab ${currentPage === "page2" ? "is-active" : ""}`}
        type="button"
        onClick={() => onChange("page2")}
      >
        训练数据评估展示
      </button>
    </section>
  );
}
