import base64
import json
from typing import Any

from app.models.schemas import EvaluationExplanation, EvaluationImageInput, EvaluationResult


class EvaluationAdapterError(RuntimeError):
    pass


class QwenEvaluationAdapter:
    """Qwen Vision adapter for training data evaluation."""

    _response_schema: dict[str, Any] = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "iqa_score": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Image quality score in [0, 1].",
            },
            "task_representativeness": {
                "type": "integer",
                "minimum": 1,
                "maximum": 5,
                "description": "How representative the sample is for the selected task.",
            },
            "train_suitability": {
                "type": "integer",
                "minimum": 1,
                "maximum": 5,
                "description": "How suitable the image-mask pair is for training.",
            },
            "explanation": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "overview": {"type": "string"},
                    "image_quality_observation": {"type": "string"},
                    "task_observation": {"type": "string"},
                    "supervision_observation": {"type": "string"},
                },
                "required": [
                    "overview",
                    "image_quality_observation",
                    "task_observation",
                    "supervision_observation",
                ],
            },
            "answer": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "iqa_score": {"type": "number"},
                    "task_representativeness": {"type": "integer"},
                    "train_suitability": {"type": "integer"},
                },
                "required": ["iqa_score", "task_representativeness", "train_suitability"],
            },
        },
        "required": [
            "iqa_score",
            "task_representativeness",
            "train_suitability",
            "explanation",
            "answer",
        ],
    }

    def __init__(self, api_key: str, base_url: str, model: str, timeout_seconds: float) -> None:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise EvaluationAdapterError("openai package is not installed") from exc

        self._client = OpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout_seconds,
        )
        self._model = model

    def evaluate(
        self,
        *,
        task_type: str,
        image: EvaluationImageInput,
        mask: EvaluationImageInput | None,
    ) -> EvaluationResult:
        content: list[dict[str, Any]] = [
            {
                "type": "text",
                "text": self._build_prompt(task_type=task_type, has_mask=mask is not None),
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": self._to_data_url(image),
                },
            },
        ]

        if mask:
            content.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": self._to_data_url(mask),
                    },
                }
            )

        try:
            completion = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {
                        "role": "user",
                        "content": content,
                    }
                ],
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            raise EvaluationAdapterError(f"Qwen evaluation request failed: {exc}") from exc

        try:
            content_text = completion.choices[0].message.content
            if not isinstance(content_text, str):
                raise TypeError("Qwen completion content is not text")
            payload = json.loads(content_text)
        except Exception as exc:
            raise EvaluationAdapterError("Qwen evaluation response was not valid JSON") from exc

        return self._normalize_result(payload)

    def _build_prompt(self, *, task_type: str, has_mask: bool) -> str:
        mask_instruction = (
            "The second image is the binary or soft foreground mask for the first image."
            if has_mask
            else "No mask image is provided; evaluate supervision suitability accordingly."
        )
        return (
            "You are evaluating one training sample for a foreground segmentation research demo.\n"
            f"Task type: {task_type}.\n"
            f"{mask_instruction}\n\n"
            "Score the sample with these definitions:\n"
            "- iqa_score: visual image quality, from 0.0 to 1.0.\n"
            "- task_representativeness: integer 1-5, whether the image matches the task's visual characteristics.\n"
            "- train_suitability: integer 1-5, whether this image-mask pair is useful for model training.\n\n"
            "For task interpretation:\n"
            "- SOD: salient object detection, clear salient foreground target.\n"
            "- COD: camouflaged object detection, foreground blends with background.\n"
            "- ORSI-SOD: optical remote sensing salient object detection.\n"
            "- DBD: defocus blur detection, foreground/blur relationship matters.\n\n"
            "Return only one JSON object that follows this schema:\n"
            f"{json.dumps(self._response_schema, ensure_ascii=True)}\n"
            "Use concise Chinese explanations suitable for a research demo UI."
        )

    def _to_data_url(self, image: EvaluationImageInput) -> str:
        encoded = base64.b64encode(image.data).decode("utf-8")
        return f"data:{image.mime_type};base64,{encoded}"

    def _normalize_result(self, payload: dict[str, Any]) -> EvaluationResult:
        iqa_score = self._clamp_float(payload.get("iqa_score"), minimum=0.0, maximum=1.0)
        representativeness = self._clamp_int(payload.get("task_representativeness"), minimum=1, maximum=5)
        suitability = self._clamp_int(payload.get("train_suitability"), minimum=1, maximum=5)
        explanation = payload.get("explanation") or {}
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
                overview=str(explanation.get("overview") or ""),
                image_quality_observation=str(explanation.get("image_quality_observation") or ""),
                task_observation=str(explanation.get("task_observation") or ""),
                supervision_observation=str(explanation.get("supervision_observation") or ""),
            ),
            answer=answer,
        )

    def _clamp_float(self, value: Any, *, minimum: float, maximum: float) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            number = minimum
        return max(minimum, min(maximum, number))

    def _clamp_int(self, value: Any, *, minimum: int, maximum: int) -> int:
        try:
            number = int(round(float(value)))
        except (TypeError, ValueError):
            number = minimum
        return max(minimum, min(maximum, number))
