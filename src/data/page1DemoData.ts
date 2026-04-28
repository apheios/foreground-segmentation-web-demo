import type { Page1Sample, TaskType } from "../types";

import codInput1 from "../assets/example/cod_1.jpg";
import codMask1 from "../assets/example/cod_mask_1.jpg";
import codOverlay1 from "../assets/example/cod_1_overlay.png";
import remoteInput from "../assets/remote-input.svg";
import remoteMask from "../assets/remote-mask.svg";
import remoteOverlay from "../assets/remote-overlay.svg";
import defocusInput from "../assets/defocus-input.svg";
import defocusMask from "../assets/defocus-mask.svg";
import defocusOverlay from "../assets/defocus-overlay.svg";

export const taskOptions: TaskType[] = ["SOD", "COD", "ORSI-SOD", "DBD"];

export const page1DemoData: Page1Sample[] = [
  {
    id: "salient-scene",
    name: "示例 1：显著场景",
    taskType: "SOD",
    inputImage: defocusInput,
    maskImage: defocusMask,
    overlayImage: defocusOverlay,
    resolution: "384 × 384",
    inferenceTime: "83 ms",
    source: "系统内置样例"
  },
  {
    id: "camouflaged-scene",
    name: "示例 2：伪装场景",
    taskType: "COD",
    inputImage: codInput1,
    maskImage: codMask1,
    overlayImage: codOverlay1,
    resolution: "352 × 352",
    inferenceTime: "78 ms",
    source: "系统内置样例"
  },
  {
    id: "remote-sensing-scene",
    name: "示例 3：遥感场景",
    taskType: "ORSI-SOD",
    inputImage: remoteInput,
    maskImage: remoteMask,
    overlayImage: remoteOverlay,
    resolution: "512 × 512",
    inferenceTime: "91 ms",
    source: "系统内置样例"
  },
  {
    id: "defocus-scene",
    name: "示例 4：散焦场景",
    taskType: "DBD",
    inputImage: defocusInput,
    maskImage: defocusMask,
    overlayImage: defocusOverlay,
    resolution: "384 × 384",
    inferenceTime: "83 ms",
    source: "系统内置样例"
  }
];
