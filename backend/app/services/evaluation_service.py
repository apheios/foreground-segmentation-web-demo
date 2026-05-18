from app.models.schemas import EvaluationExplanation, EvaluationResult


class EvaluationService:
    """Mock evaluation workflow; replace the adapter call when the real model is ready."""

    def evaluate(self, task_type: str, has_mask: bool) -> EvaluationResult:
        representativeness = {
            "SOD": 4,
            "COD": 5,
            "ORSI-SOD": 4,
            "DBD": 3,
        }.get(task_type, 3)
        suitability = 4 if has_mask else 3
        iqa_score = 0.76 if has_mask else 0.68

        answer = {
            "iqa_score": iqa_score,
            "task_representativeness": representativeness,
            "train_suitability": suitability,
        }

        return EvaluationResult(
            iqa_score=iqa_score,
            task_representativeness=representativeness,
            train_suitability=suitability,
            explanation=EvaluationExplanation(
                overview="Mock 评估认为该样本具备可展示的任务相关性，适合作为联调阶段的占位结果。",
                image_quality_observation="图像清晰度、曝光和主体可辨识度处于可接受范围，未接入真实 IQA 模型。",
                task_observation=f"当前任务类型为 {task_type}，mock 结果按任务类型返回稳定的代表性分数。",
                supervision_observation=(
                    "已检测到掩码输入，监督关系按可用样本处理。"
                    if has_mask
                    else "当前未提供掩码，训练适用性按弱监督或待补充标注处理。"
                ),
            ),
            answer=answer,
        )
