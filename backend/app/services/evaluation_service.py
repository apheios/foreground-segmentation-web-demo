from dataclasses import dataclass

from app.adapters.evaluation_adapter import EvaluationAdapterError, QwenEvaluationAdapter
from app.core.config import get_settings
from app.models.schemas import EvaluationExplanation, EvaluationImageInput, EvaluationResult


@dataclass(frozen=True)
class EvaluationOutcome:
    result: EvaluationResult
    provider: str
    model: str | None = None


class EvaluationService:
    """Training data evaluation workflow."""

    def evaluate(
        self,
        *,
        task_type: str,
        image: EvaluationImageInput | None = None,
        mask: EvaluationImageInput | None = None,
    ) -> EvaluationOutcome:
        settings = get_settings()
        if settings.qwen_api_key and image:
            adapter = QwenEvaluationAdapter(
                api_key=settings.qwen_api_key,
                base_url=settings.qwen_base_url,
                model=settings.qwen_evaluation_model,
                timeout_seconds=settings.qwen_request_timeout_seconds,
            )
            return EvaluationOutcome(
                result=adapter.evaluate(task_type=task_type, image=image, mask=mask),
                provider="qwen",
                model=settings.qwen_evaluation_model,
            )

        return EvaluationOutcome(
            result=self._mock_evaluate(task_type=task_type, has_mask=mask is not None),
            provider="mock",
            model=None,
        )

    def _mock_evaluate(self, task_type: str, has_mask: bool) -> EvaluationResult:
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


EvaluationServiceError = EvaluationAdapterError
