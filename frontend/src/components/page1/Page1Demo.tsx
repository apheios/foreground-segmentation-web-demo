import { useMemo, useState } from "react";

import { page1DemoData, taskOptions } from "../../data/page1DemoData";
import { useObjectUrl } from "../../hooks/useObjectUrl";
import { inferSegmentation, type SegmentationResponse } from "../../services/api";
import type { PreviewContent, TaskType } from "../../types";
import { GalleryCard } from "../shared/GalleryCard";
import { SampleSelector } from "../shared/SampleSelector";
import { TaskPills } from "../shared/TaskPills";

type Props = {
  onOpenPreview: (preview: PreviewContent) => void;
};

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-item">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
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

export function Page1Demo({ onOpenPreview }: Props) {
  const defaultSample = page1DemoData[0];
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType>(defaultSample.taskType);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [statusText, setStatusText] = useState("等待输入");
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceReady, setInferenceReady] = useState(false);
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResponse | null>(null);

  const uploadedPreviewUrl = useObjectUrl(uploadedFile);

  const selectedSample = useMemo(
    () => page1DemoData.find((item) => item.id === selectedSampleId) ?? null,
    [selectedSampleId]
  );

  const previewMap = useMemo(() => {
    const inputSrc = segmentationResult?.original_url || uploadedPreviewUrl || selectedSample?.inputImage || "";

    return {
      input: {
        kind: "image" as const,
        src: inputSrc,
        title: "原图"
      },
      mask: segmentationResult
        ? {
            kind: "image" as const,
            src: segmentationResult.mask_url,
            title: "预测掩码"
          }
        : selectedSample
        ? {
        kind: "image" as const,
        src: selectedSample.maskImage,
        title: "预测掩码"
          }
        : null,
      overlay: segmentationResult
        ? {
            kind: "image" as const,
            src: segmentationResult.overlay_url,
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
  }, [segmentationResult, selectedSample, uploadedPreviewUrl]);

  const handleStart = async () => {
    if (isInferring || (!selectedSample && !uploadedPreviewUrl)) {
      return;
    }

    setIsInferring(true);
    setInferenceReady(false);
    setStatusText("请求后端中");

    try {
      const result = await inferSegmentation({
        taskType: selectedTask,
        sampleId: selectedSample?.id,
        image: uploadedFile
      });
      setSegmentationResult(result);
      setIsInferring(false);
      setInferenceReady(true);
      setStatusText("推理成功");
    } catch (error) {
      setIsInferring(false);
      setInferenceReady(false);
      setStatusText("推理失败");
      console.error(error);
    }
  };

  const handleReset = () => {
    setSelectedSampleId(null);
    setSelectedTask(defaultSample.taskType);
    setUploadedFile(null);
    setUploadedFileName("");
    setStatusText("等待输入");
    setIsInferring(false);
    setInferenceReady(false);
    setSegmentationResult(null);
  };

  const handleSampleChange = (sampleId: string | null) => {
    if (!sampleId) {
      setSelectedSampleId(null);
      setStatusText(uploadedPreviewUrl ? "本地预览已更新" : "等待输入");
      setInferenceReady(false);
      setSegmentationResult(null);
      return;
    }

    const nextSample = page1DemoData.find((item) => item.id === sampleId);
    if (!nextSample) {
      return;
    }

    setSelectedSampleId(nextSample.id);
    setSelectedTask(nextSample.taskType);
    setStatusText("样例已选择");
    setInferenceReady(false);
    setSegmentationResult(null);
  };

  const handleTaskChange = (taskType: TaskType) => {
    setSelectedTask(taskType);
    setInferenceReady(false);
    setSegmentationResult(null);
    setStatusText(selectedSample || uploadedPreviewUrl ? "任务已更新" : "等待输入");
  };

  const resultVisible = inferenceReady && !isInferring;
  const isEmptyState = !selectedSample && !uploadedPreviewUrl;
  const isUploadOnlyState = !selectedSample && Boolean(uploadedPreviewUrl);
  const inputPreview = previewMap.input;
  const maskPreview = previewMap.mask;
  const overlayPreview = previewMap.overlay;

  return (
    <section className="content-grid">
      <aside className="panel control-panel">
        <div className="panel-section">
          <div className="section-heading">
            <h2>样例选择</h2>
            <span>系统样例</span>
          </div>
          <SampleSelector
            samples={page1DemoData}
            selectedId={selectedSampleId}
            onSelect={handleSampleChange}
          />
        </div>

        <div className="panel-section">
          <div className="section-heading">
            <h2>图片上传</h2>
            <span>本地预览</span>
          </div>
          <label className="upload-box">
            <input
              className="upload-input"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setUploadedFile(file);
                setUploadedFileName(file?.name ?? "");
                setInferenceReady(false);
                setSegmentationResult(null);
                setStatusText(file ? "本地预览已更新" : selectedSample ? "样例已选择" : "等待输入");
              }}
            />
            <span className="upload-title">点击或拖拽上传图像</span>
            <span className="upload-subtitle">支持 JPG / PNG，单张图片</span>
            <span className="upload-file">
              {uploadedFileName || "当前未上传，默认使用系统样例图像"}
            </span>
          </label>
        </div>

        <div className="panel-section">
          <div className="section-heading">
            <h2>任务选择</h2>
            <span>任务类型</span>
          </div>
          <TaskPills options={taskOptions} selectedTask={selectedTask} onChange={handleTaskChange} />
        </div>

        <div className="panel-section action-section">
          <button className="primary-button" type="button" onClick={handleStart} disabled={isInferring}>
            {isInferring ? "推理中..." : "开始推理"}
          </button>
          <button className="secondary-button" type="button" onClick={handleReset}>
            重置
          </button>
        </div>
      </aside>

      <section className="panel result-panel">
        {isEmptyState ? (
          <div className="empty-state-shell">
            <h2>当前未载入展示样例</h2>
            <p>请选择左侧系统样例，或上传一张图像后开始推理。右侧将展示原图、预测掩码与叠加可视化结果。</p>
          </div>
        ) : (
          <>
            <div className="result-header">
              <div>
                <h2>推理结果展示</h2>
                <p>展示当前样例的输入图、预测掩码和叠加结果。</p>
              </div>
              <span className={`status-tag ${isInferring ? "is-pending" : "is-success"}`}>
                {isInferring ? "模型推理中" : statusText}
              </span>
            </div>

            <div className="metric-bar">
              <MetricRow label="任务类型" value={selectedTask} />
              <MetricRow label="输入分辨率" value={selectedSample?.resolution ?? "--"} />
              <MetricRow
                label="推理耗时"
                value={
                  segmentationResult && !isInferring
                    ? `${segmentationResult.metrics.inference_time_ms} ms`
                    : selectedSample && !isInferring
                      ? selectedSample.inferenceTime
                      : "--"
                }
              />
              <MetricRow label="样例来源" value={selectedSample?.source ?? "本地上传图像"} />
            </div>

            <div className={`gallery-grid ${isInferring ? "is-loading" : ""}`}>
              <GalleryCard title="原图" preview={inputPreview} onOpen={() => onOpenPreview(inputPreview)} />
              {maskPreview ? (
                <GalleryCard title="预测掩码" preview={maskPreview} onOpen={() => onOpenPreview(maskPreview)} />
              ) : (
                <PlaceholderCard title="预测掩码" description="上传图像后，可在推理完成后显示掩码结果" />
              )}
              {overlayPreview ? (
                <GalleryCard
                  title="叠加可视化"
                  preview={overlayPreview}
                  onOpen={() => onOpenPreview(overlayPreview)}
                />
              ) : (
                <PlaceholderCard title="叠加可视化" description="当前仅展示输入图像，叠加结果将在生成后显示" />
              )}
            </div>

            <div className="result-note">
              {isUploadOnlyState
                ? "当前已上传图像，但未选择系统样例。点击开始推理后可在此处展示结果。"
                : resultVisible
                  ? `当前展示样例：${selectedSample?.name}。点击图像可查看放大预览。`
                  : "点击开始推理后，将调用后端 mock 接口生成结果。"}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
