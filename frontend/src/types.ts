export type PageKey = "page1" | "page2";

export type TaskType = "SOD" | "COD" | "ORSI-SOD" | "DBD";

export type SampleOption = {
  id: string;
  name: string;
  taskType: TaskType;
};

export type PreviewContent =
  | {
      kind: "image";
      src: string;
      title: string;
    }
  | {
      kind: "layered";
      baseSrc: string;
      maskSrc: string;
      title: string;
    };

export type Page1Sample = SampleOption & {
  inputImage: string;
  maskImage: string;
  overlayImage: string;
  resolution: string;
  inferenceTime: string;
  source: string;
};

export type Page2Sample = SampleOption & {
  inputImage: string;
  maskImage: string;
  overlayImage: string;
  iqaScore: number;
  taskRepresentativeness: number;
  trainSuitability: number;
  think: {
    overview: string;
    imageQualityObservation: string;
    taskObservation: string;
    supervisionObservation: string;
  };
  answer: {
    iqa_score: number;
    task_representativeness: number;
    train_suitability: number;
  };
  source: string;
};
