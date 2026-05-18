import type { Page2Sample } from "../types";

import camouflageInput from "../assets/camouflage-input.svg";
import camouflageMask from "../assets/camouflage-mask.svg";
import camouflageOverlay from "../assets/camouflage-overlay.svg";
import codInput2 from "../assets/example/cod_2.jpg";
import codMask2 from "../assets/example/cod_mask_2.png";
import codOverlay2 from "../assets/example/cod_2_overlay.png";
import remoteInput from "../assets/remote-input.svg";
import weakMask from "../assets/weak-annotation-mask.svg";
import weakOverlay from "../assets/weak-annotation-overlay.svg";

export const page2DemoData: Page2Sample[] = [
  {
    id: "low-beauty-high-value",
    name: "示例 1：低美观但高训练价值样本",
    taskType: "COD",
    inputImage: camouflageInput,
    maskImage: camouflageMask,
    overlayImage: camouflageOverlay,
    iqaScore: 0.58,
    taskRepresentativeness: 4,
    trainSuitability: 5,
    think: {
      overview:
        "该样本整体视觉质量一般，主体与背景之间存在一定干扰，但前景目标的任务相关性较强，具有较高训练价值。",
      imageQualityObservation:
        "图像存在轻微噪声和局部对比度不足，边缘细节不够锐利，因此感知质量得分偏中等。",
      taskObservation:
        "前景目标具备较强伪装特征，能够反映复杂场景下目标与背景相似的任务属性，符合 COD 任务特征。",
      supervisionObservation:
        "掩码与目标区域对应关系较清晰，关键前景范围得到有效覆盖，能够为模型训练提供有效监督。"
    },
    answer: {
      iqa_score: 0.58,
      task_representativeness: 4,
      train_suitability: 5
    },
    source: "系统样例"
  },
  {
    id: "high-quality-low-match",
    name: "示例 2：高画质但任务不匹配样本",
    taskType: "COD",
    inputImage: codInput2,
    maskImage: codMask2,
    overlayImage: codOverlay2,
    iqaScore: 0.82,
    taskRepresentativeness: 2,
    trainSuitability: 3,
    think: {
      overview:
        "前景对象为位于叶片上的小型伪装目标，场景相对简单，主体与叶片纹理清楚，整体视觉状态较好。",
      imageQualityObservation:
        "图像清晰、曝光正常、色彩自然、细节保留较充分，因此图像质量得分较高。",
      taskObservation:
        "该样本中目标较易被发现，未充分体现任务中强融合、低显著性的典型特征，任务代表性偏弱。",
      supervisionObservation:
        "掩码对齐较好、监督信号清楚，但任务代表性偏弱，其监督价值受到限制。"
    },
    answer: {
      iqa_score: 0.82,
      task_representativeness: 2,
      train_suitability: 3
    },
    source: "系统样例"
  },
  {
    id: "weak-supervision",
    name: "示例 3：标注关系较弱样本",
    taskType: "ORSI-SOD",
    inputImage: remoteInput,
    maskImage: weakMask,
    overlayImage: weakOverlay,
    iqaScore: 0.71,
    taskRepresentativeness: 3,
    trainSuitability: 2,
    think: {
      overview:
        "该样本在视觉质量和任务特征上处于中等水平，但图像与标注之间的对应关系不够稳定，影响训练适用性。",
      imageQualityObservation:
        "图像整体可辨识度尚可，但局部区域存在模糊和纹理混杂现象，质量表现中等。",
      taskObservation:
        "样本具备一定任务相关性，但前景目标表达不够典型，代表性有限。",
      supervisionObservation:
        "掩码在边界或局部区域存在偏差，未能完全准确覆盖目标区域，可能对训练过程产生噪声。"
    },
    answer: {
      iqa_score: 0.71,
      task_representativeness: 3,
      train_suitability: 2
    },
    source: "系统样例"
  }
];
