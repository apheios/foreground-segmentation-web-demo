import type { Page2Sample } from "../../types";

type Props = {
  sample: Page2Sample;
  isEvaluating: boolean;
};

export function ThinkPanels({ sample, isEvaluating }: Props) {
  return (
    <section className={`think-panel ${isEvaluating ? "is-loading" : ""}`}>
      <div className="result-header think-header">
        <div>
          <h2>结构化解释</h2>
          <p>将模型分析结果拆分为四个固定部分，便于论文展示与结果解读。</p>
        </div>
      </div>

      <div className="think-grid">
        <article className="think-card">
          <div className="think-title">全局概述</div>
          <p>{sample.think.overview}</p>
        </article>
        <article className="think-card">
          <div className="think-title">图像质量观察</div>
          <p>{sample.think.imageQualityObservation}</p>
        </article>
        <article className="think-card">
          <div className="think-title">任务特征观察</div>
          <p>{sample.think.taskObservation}</p>
        </article>
        <article className="think-card">
          <div className="think-title">监督关系观察</div>
          <p>{sample.think.supervisionObservation}</p>
        </article>
      </div>
    </section>
  );
}
