from fastapi import FastAPI
from app.schemas import FlowPredictRequest, FlowPredictResponse
from app.predictor import Predictor

app = FastAPI(title="FlowIDS Model Server")
predictor = Predictor()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=FlowPredictResponse)
def predict(req: FlowPredictRequest):
    result = predictor.predict(req.model_dump(by_alias=True))

    return FlowPredictResponse(
        documentId=req.documentId,
        isAnomaly=result["isAnomaly"],
        anomalyScore=result["anomalyScore"],
        modelVersion="svm+tcn-hybrid-v1",
        stage=result.get("stage"),
        svmRaw=result.get("svm_raw"),
        tcnProb=result.get("tcn_prob"),
        reason=result.get("reason"),
    )