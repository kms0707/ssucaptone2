from pathlib import Path

from fastapi import FastAPI
from app.schemas import FlowPredictRequest, FlowPredictResponse
from app.predictor import Predictor
from app.inference_logger import InferenceLogger

app = FastAPI(title="FlowIDS Model Server")
predictor = Predictor()
logger = InferenceLogger(base_dir=Path(__file__).resolve().parent.parent / "logs")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=FlowPredictResponse)
def predict(req: FlowPredictRequest):
    input_payload = req.model_dump(by_alias=True)
    request_id = req.documentId

    # 1) 입력 저장
    logger.log_input(request_id, input_payload)

    # 2) 추론
    result = predictor.predict(input_payload)

    response_payload = {
        "documentId": req.documentId,
        "isAnomaly": result["isAnomaly"],
        "anomalyScore": result["anomalyScore"],
        "modelVersion": "svm+tcn-hybrid-v1",
        "stage": result.get("stage"),
        "svmRaw": result.get("svm_raw"),
        "tcnProb": result.get("tcn_prob"),
        "reason": result.get("reason"),
    }

    # 3) 결과 저장
    logger.log_result(request_id, response_payload)

    # 4) 입력 + 결과 통합 저장
    logger.log_merged(request_id, input_payload, response_payload)

    return FlowPredictResponse(**response_payload)