export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type SegmentationResponse = {
  sample_id: string | null;
  task_type: string;
  original_url: string | null;
  mask_url: string;
  overlay_url: string;
  metrics: {
    inference_time_ms: number;
    foreground_ratio: number;
    confidence: number;
    task_bias: number;
  };
};

export type EvaluationResponse = {
  sample_id: string | null;
  task_type: string;
  image_url: string | null;
  mask_url: string | null;
  iqa_score: number;
  task_representativeness: number;
  train_suitability: number;
  explanation: {
    overview: string;
    image_quality_observation: string;
    task_observation: string;
    supervision_observation: string;
  };
  answer: {
    iqa_score: number;
    task_representativeness: number;
    train_suitability: number;
  };
};

async function postForm<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!payload.success) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data;
}

export function inferSegmentation(params: {
  taskType: string;
  sampleId?: string | null;
  image?: File | null;
}) {
  const formData = new FormData();
  formData.append("task_type", params.taskType);
  if (params.sampleId) {
    formData.append("sample_id", params.sampleId);
  }
  if (params.image) {
    formData.append("image", params.image);
  }

  return postForm<SegmentationResponse>("/api/segmentation/infer", formData);
}

export function evaluateSample(params: {
  taskType: string;
  sampleId?: string | null;
  image?: File | null;
  mask?: File | null;
}) {
  const formData = new FormData();
  formData.append("task_type", params.taskType);
  if (params.sampleId) {
    formData.append("sample_id", params.sampleId);
  }
  if (params.image) {
    formData.append("image", params.image);
  }
  if (params.mask) {
    formData.append("mask", params.mask);
  }

  return postForm<EvaluationResponse>("/api/evaluation/evaluate", formData);
}
