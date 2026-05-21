import { useMemo, useState } from "react";

import { page2DemoData } from "../../data/page2DemoData";
import { taskOptions } from "../../data/page1DemoData";
import { useObjectUrl } from "../../hooks/useObjectUrl";
import { evaluateSample, type EvaluationResponse } from "../../services/api";
import { assetToFile } from "../../services/assets";
import type { PreviewContent, TaskType } from "../../types";
import { ScoreCard } from "./ScoreCard";
import { ThinkPanels } from "./ThinkPanels";
import { GalleryCard } from "../shared/GalleryCard";
import { SampleSelector } from "../shared/SampleSelector";
import { TaskPills } from "../shared/TaskPills";

type Props = {
  onOpenPreview: (preview: PreviewContent) => void;
};

function renderLevelDots(level: number) {
  return (
    <div className="level-dots">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={`level-dot ${index < level ? "is-active" : ""}`} />
      ))}
    </div>
  );
}

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="gallery-card gallery-card-static">
      <div className="gallery-image-frame gallery-image-frame-placeholder">
        <div className="gallery-placeholder-text">{description}</div>
      </div>
      <div className="gallery-caption">{title}</div>
    </div>
  );
}

export function Page2Demo({ onOpenPreview }: Props) {
  const defaultSample = page2DemoData[0];
  const visibleSamples = useMemo(
    () => page2DemoData.filter((item) => item.id !== "weak-supervision"),
    []
  );
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType>(defaultSample.taskType);
  const [inputMode, setInputMode] = useState<"sample" | "upload">("sample");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedMaskFile, setUploadedMaskFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState("等待输入");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null);

  const uploadedImageUrl = useObjectUrl(uploadedImageFile);
  const uploadedMaskUrl = useObjectUrl(uploadedMaskFile);

  const selectedSample = useMemo(
    () => page2DemoData.find((item) => item.id === selectedSampleId) ?? null,
    [selectedSampleId]
  );

  const previewMap = useMemo(() => {
    const imageSrc =
      inputMode === "upload" && uploadedImageUrl ? uploadedImageUrl : selectedSample?.inputImage || "";
    const maskSrc =
      inputMode === "upload" && uploadedMaskUrl ? uploadedMaskUrl : selectedSample?.maskImage || "";
    const useLayeredOverlay = Boolean(imageSrc) && inputMode === "upload" && Boolean(uploadedMaskUrl);

    return {
      input: imageSrc
        ? {
        kind: "image" as const,
        src: imageSrc,
        title: "原图"
          }
        : null,
      mask: maskSrc
        ? {
        kind: "image" as const,
        src: maskSrc,
        title: "掩码"
          }
        : null,
      overlay: useLayeredOverlay
        ? {
            kind: "layered" as const,
            baseSrc: imageSrc,
            maskSrc,
            title: "叠加可视化"
          }
        : selectedSample
          ? {
            kind: "image" as const,
            src: selectedSample.overlayImage,
            title: "叠加可视化"
            }
          : null
    };
  }, [inputMode, selectedSample, uploadedImageUrl, uploadedMaskUrl]);

  const handleEvaluate = async () => {
    if (isEvaluating || (!selectedSample && !uploadedImageUrl)) {
      return;
    }

    setIsEvaluating(true);
    setStatusText(inputMode === "sample" ? "准备样例图像" : "请求后端中");

    try {
      const sampleImageFile =
        inputMode === "sample" && selectedSample
          ? await assetToFile(selectedSample.inputImage, `${selectedSample.id}-image`)
          : null;
      const sampleMaskFile =
        inputMode === "sample" && selectedSample
          ? await assetToFile(selectedSample.maskImage, `${selectedSample.id}-mask`)
          : null;

      setStatusText("请求后端中");
      const result = await evaluateSample({
        taskType: selectedTask,
        sampleId: inputMode === "sample" ? selectedSample?.id : null,
        image: inputMode === "upload" ? uploadedImageFile : sampleImageFile,
        mask: inputMode === "upload" ? uploadedMaskFile : sampleMaskFile
      });
      setEvaluationResult(result);
      setIsEvaluating(false);
      setStatusText("评估成功");
    } catch (error) {
      setIsEvaluating(false);
      setStatusText("评估失败");
      console.error(error);
    }
  };

  const handleReset = () => {
    setSelectedSampleId(null);
    setSelectedTask(defaultSample.taskType);
    setInputMode("sample");
    setUploadedImageFile(null);
    setUploadedMaskFile(null);
    setIsEvaluating(false);
    setStatusText("等待输入");
    setEvaluationResult(null);
  };

  const handleSampleChange = (sampleId: string | null) => {
    if (!sampleId) {
      setSelectedSampleId(null);
      setStatusText(uploadedImageUrl ? "本地样本模式" : "等待输入");
      setEvaluationResult(null);
      return;
    }

    const nextSample = visibleSamples.find((item) => item.id === sampleId);
    if (!nextSample) {
      return;
    }

    setSelectedSampleId(nextSample.id);
    setSelectedTask(nextSample.taskType);
    setStatusText("样例已选择");
    setEvaluationResult(null);
  };

  const handleTaskChange = (taskType: TaskType) => {
    setSelectedTask(taskType);
    setEvaluationResult(null);
    setStatusText(selectedSample || uploadedImageUrl ? "任务已更新" : "等待输入");
  };

  const hasUploadedImage = Boolean(uploadedImageUrl);
  const hasUploadedAssets = Boolean(uploadedImageUrl || uploadedMaskUrl);
  const sourceText =
    inputMode === "upload" && hasUploadedAssets
      ? "本地上传预览"
      : selectedSample?.source ?? (hasUploadedImage ? "本地上传图像" : "--");
  const sampleName = selectedSample?.name ?? (hasUploadedImage ? "本地上传图像" : "--");
  const isEmptyState = inputMode === "upload" ? !hasUploadedImage : !selectedSample && !hasUploadedImage;
  const inputPreview = previewMap.input;
  const maskPreview = previewMap.mask;
  const overlayPreview = previewMap.overlay;
  const displayScores = evaluationResult
    ? {
        iqaScore: evaluationResult.iqa_score,
        taskRepresentativeness: evaluationResult.task_representativeness,
        trainSuitability: evaluationResult.train_suitability
      }
    : selectedSample
      ? {
          iqaScore: selectedSample.iqaScore,
          taskRepresentativeness: selectedSample.taskRepresentativeness,
          trainSuitability: selectedSample.trainSuitability
        }
      : null;
  const displayThink = evaluationResult
    ? {
        overview: evaluationResult.explanation.overview,
        imageQualityObservation: evaluationResult.explanation.image_quality_observation,
        taskObservation: evaluationResult.explanation.task_observation,
        supervisionObservation: evaluationResult.explanation.supervision_observation
      }
    : selectedSample?.think ?? null;
  const displayAnswer = evaluationResult?.answer ?? selectedSample?.answer;

  return (
    <section className="evaluation-layout">
      <aside className="panel control-panel">
        <div className="panel-section">
          <div className="section-heading">
            <h2>样例选择</h2>
            <span>系统样例</span>
          </div>
          <SampleSelector
            samples={visibleSamples}
            selectedId={selectedSampleId}
            onSelect={handleSampleChange}
          />
        </div>

        <div className="panel-section">
          <div className="section-heading">
            <h2>输入方式</h2>
            <span>输入模式</span>
          </div>
          <div className="mode-switcher">
            <button
              className={`mode-tab ${inputMode === "sample" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                setInputMode("sample");
                setStatusText(selectedSample ? "样例已选择" : "等待输入");
                setEvaluationResult(null);
              }}
            >
              系统样例
            </button>
            <button
              className={`mode-tab ${inputMode === "upload" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                setInputMode("upload");
                setStatusText("等待输入");
                setEvaluationResult(null);
              }}
            >
              上传原图 + 掩码
            </button>
          </div>
        </div>

        {inputMode === "upload" ? (
          <div className="panel-section">
            <div className="section-heading">
              <h2>图片上传</h2>
              <span>本地预览</span>
            </div>
            <div className="upload-pair-grid">
              <label className="upload-box upload-box-compact">
                <input
                  className="upload-input"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setUploadedImageFile(file);
                    setEvaluationResult(null);
                    setStatusText(file ? "本地样本已更新" : "本地样本模式");
                  }}
                />
                <span className="upload-title">点击或拖拽上传原图</span>
                <span className="upload-subtitle">支持 JPG / PNG</span>
                <span className="upload-file">{uploadedImageFile?.name || "未上传原图"}</span>
              </label>
              <label className="upload-box upload-box-compact">
                <input
                  className="upload-input"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setUploadedMaskFile(file);
                    setEvaluationResult(null);
                    setStatusText(file || uploadedImageUrl ? "本地样本已更新" : "等待输入");
                  }}
                />
                <span className="upload-title">点击或拖拽上传掩码</span>
                <span className="upload-subtitle">支持 JPG / PNG</span>
                <span className="upload-file">{uploadedMaskFile?.name || "未上传掩码"}</span>
              </label>
            </div>
            <div className="upload-hint">若未上传本地图像，将继续使用当前系统样例作为展示基准。</div>
          </div>
        ) : null}

        <div className="panel-section">
          <div className="section-heading">
            <h2>任务类型</h2>
            <span>任务属性</span>
          </div>
          <TaskPills options={taskOptions} selectedTask={selectedTask} onChange={handleTaskChange} />
        </div>

        <div className="panel-section action-section">
          <button className="primary-button" type="button" onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? "评估中..." : "开始评估"}
          </button>
          <button className="secondary-button" type="button" onClick={handleReset}>
            重置
          </button>
        </div>
      </aside>

      <section className="panel evaluation-main-panel">
        {isEmptyState ? (
          <div className="empty-state-shell empty-state-shell-large">
            <h2>当前未载入评估样本</h2>
            <p>请选择左侧系统样例，或切换到上传模式并提供原图后，右侧将展示样本可视化、评分结果与结构化解释。</p>
          </div>
        ) : (
          <>
            <section className={`evaluation-preview-block ${isEvaluating ? "is-loading" : ""}`}>
              <div className="result-header">
                <div>
                  <h2>样本可视化</h2>
                  <p>展示当前样例的原图、掩码与叠加可视化结果。</p>
                </div>
                <span className={`status-tag ${isEvaluating ? "is-pending" : "is-success"}`}>
                  {isEvaluating ? "样本评估中" : statusText}
                </span>
              </div>

              <div className="preview-meta-bar">
                <div className="preview-meta-item">
                  <span className="preview-meta-label">当前样例</span>
                  <strong>{sampleName}</strong>
                </div>
                <div className="preview-meta-item">
                  <span className="preview-meta-label">任务类型</span>
                  <strong>{selectedTask}</strong>
                </div>
                <div className="preview-meta-item">
                  <span className="preview-meta-label">样例来源</span>
                  <strong>{sourceText}</strong>
                </div>
              </div>

              <div className="gallery-grid">
                {inputPreview ? (
                  <GalleryCard title="原图" preview={inputPreview} onOpen={() => onOpenPreview(inputPreview)} />
                ) : (
                  <PlaceholderCard title="原图" description="请先选择系统样例或上传原图" />
                )}
                {maskPreview ? (
                  <GalleryCard title="掩码" preview={maskPreview} onOpen={() => onOpenPreview(maskPreview)} />
                ) : (
                  <PlaceholderCard title="掩码" description="上传掩码或选择系统样例后显示" />
                )}
                {overlayPreview ? (
                  <GalleryCard
                    title="叠加可视化"
                    preview={overlayPreview}
                    onOpen={() => onOpenPreview(overlayPreview)}
                  />
                ) : (
                  <PlaceholderCard title="叠加可视化" description="叠加结果将在图像与掩码齐备后显示" />
                )}
              </div>

              <div className="result-note">点击图像可查看放大预览。</div>
            </section>

            <section className="evaluation-detail-grid">
              {displayScores && displayThink ? (
                <>
                  <section className={`score-panel ${isEvaluating ? "is-loading" : ""}`}>
                    <div className="section-heading score-heading">
                      <div>
                        <h2>评分结果</h2>
                      </div>
                    </div>
                    <div className="score-grid">
                      <ScoreCard
                        description="图像质量"
                        valueNode={
                          <>
                            <div className="score-number">{displayScores.iqaScore.toFixed(2)}</div>
                            <div className="score-progress">
                              <span
                                className="score-progress-bar"
                                style={{ width: `${Math.round(displayScores.iqaScore * 100)}%` }}
                              />
                            </div>
                          </>
                        }
                      />
                      <ScoreCard
                        description="任务代表性"
                        valueNode={
                          <>
                            <div className="score-level">{displayScores.taskRepresentativeness} / 5</div>
                            {renderLevelDots(displayScores.taskRepresentativeness)}
                          </>
                        }
                      />
                      <ScoreCard
                        description="训练适用性"
                        emphasis
                        valueNode={
                          <>
                            <div className="score-level">{displayScores.trainSuitability} / 5</div>
                            {renderLevelDots(displayScores.trainSuitability)}
                          </>
                        }
                      />
                    </div>
                  </section>

                  <ThinkPanels think={displayThink} answer={displayAnswer} isEvaluating={isEvaluating} />
                </>
              ) : (
                <>
                  <section className="score-panel empty-panel">
                    <div className="section-heading score-heading">
                      <div>
                        <h2>评分结果</h2>
                      </div>
                    </div>
                    <div className="inner-empty-state">
                      <p>当前仅展示上传图像预览。选择系统样例后，可在此处查看三个评分结果。</p>
                    </div>
                  </section>
                  <section className="think-panel empty-panel">
                    <div className="result-header think-header">
                      <div>
                        <h2>结构化解释</h2>
                        <p>当前未选择系统样例，解释结果区域保持为空置状态。</p>
                      </div>
                    </div>
                    <div className="inner-empty-state">
                      <p>在后续真实联调中，上传完整样本并完成评估后，可在此处展示结构化分析结论。</p>
                    </div>
                  </section>
                </>
              )}
            </section>
          </>
        )}
      </section>
    </section>
  );
}
