import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_LOG_PATH = BASE_DIR.parent / "model-service" / "logs" / "inference_merged.jsonl"
OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_jsonl(path: Path):
    rows = []
    if not path.exists():
        print(f"[build_dataset] file not found: {path}")
        return rows

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                print("[build_dataset] skip invalid json line")
    return rows


def flatten_record(row: dict) -> dict:
    input_data = row.get("input", {})
    result_data = row.get("result", {})

    return {
        "loggedAt": row.get("loggedAt"),
        "requestId": row.get("requestId"),

        "documentId": input_data.get("documentId"),
        "projectId": input_data.get("projectId"),
        "ingestedAt": input_data.get("ingestedAt"),

        "srcIp": input_data.get("srcIp"),
        "dstIp": input_data.get("dstIp"),
        "srcPort": input_data.get("srcPort"),
        "dstPort": input_data.get("dstPort"),
        "protocol": input_data.get("protocol"),

        "inBytes": input_data.get("inBytes"),
        "inPkts": input_data.get("inPkts"),
        "outBytes": input_data.get("outBytes"),
        "outPkts": input_data.get("outPkts"),
        "flowDuration": input_data.get("flowDuration"),

        "tcpFlags": input_data.get("tcpFlags"),
        "clientTcpFlags": input_data.get("clientTcpFlags"),
        "serverTcpFlags": input_data.get("serverTcpFlags"),

        "durationIn": input_data.get("durationIn"),
        "durationOut": input_data.get("durationOut"),
        "minTtl": input_data.get("minTtl"),
        "maxTtl": input_data.get("maxTtl"),

        "longestFlowPkt": input_data.get("longestFlowPkt"),
        "shortestFlowPkt": input_data.get("shortestFlowPkt"),
        "minIpPktLen": input_data.get("minIpPktLen"),
        "maxIpPktLen": input_data.get("maxIpPktLen"),

        "srcToDstSecondBytes": input_data.get("srcToDstSecondBytes"),
        "dstToSrcSecondBytes": input_data.get("dstToSrcSecondBytes"),
        "retransmittedInBytes": input_data.get("retransmittedInBytes"),
        "retransmittedInPkts": input_data.get("retransmittedInPkts"),
        "retransmittedOutBytes": input_data.get("retransmittedOutBytes"),
        "retransmittedOutPkts": input_data.get("retransmittedOutPkts"),
        "srcToDstAvgThroughput": input_data.get("srcToDstAvgThroughput"),
        "dstToSrcAvgThroughput": input_data.get("dstToSrcAvgThroughput"),

        "numPktsUpTo128Bytes": input_data.get("numPktsUpTo128Bytes"),
        "numPkts128To256Bytes": input_data.get("numPkts128To256Bytes"),
        "numPkts256To512Bytes": input_data.get("numPkts256To512Bytes"),
        "numPkts512To1024Bytes": input_data.get("numPkts512To1024Bytes"),
        "numPkts1024To1514Bytes": input_data.get("numPkts1024To1514Bytes"),

        "tcpWinMaxIn": input_data.get("tcpWinMaxIn"),
        "tcpWinMaxOut": input_data.get("tcpWinMaxOut"),
        "icmpType": input_data.get("icmpType"),
        "icmpIpv4Type": input_data.get("icmpIpv4Type"),
        "dnsQueryId": input_data.get("dnsQueryId"),
        "dnsQueryType": input_data.get("dnsQueryType"),
        "dnsTtlAnswer": input_data.get("dnsTtlAnswer"),
        "ftpCommandRetCode": input_data.get("ftpCommandRetCode"),

        "srcToDstIatMin": input_data.get("srcToDstIatMin"),
        "srcToDstIatMax": input_data.get("srcToDstIatMax"),
        "srcToDstIatAvg": input_data.get("srcToDstIatAvg"),
        "srcToDstIatStddev": input_data.get("srcToDstIatStddev"),
        "dstToSrcIatMin": input_data.get("dstToSrcIatMin"),
        "dstToSrcIatMax": input_data.get("dstToSrcIatMax"),
        "dstToSrcIatAvg": input_data.get("dstToSrcIatAvg"),
        "dstToSrcIatStddev": input_data.get("dstToSrcIatStddev"),

        "isAnomaly": result_data.get("isAnomaly"),
        "anomalyScore": result_data.get("anomalyScore"),
        "modelVersion": result_data.get("modelVersion"),
        "stage": result_data.get("stage"),
        "svmRaw": result_data.get("svmRaw"),
        "tcnProb": result_data.get("tcnProb"),
        "reason": result_data.get("reason"),
    }


def main():
    rows = load_jsonl(MODEL_LOG_PATH)
    if not rows:
        print("[build_dataset] no rows loaded.")
        return

    flattened = [flatten_record(row) for row in rows]

    output_path = OUTPUT_DIR / "merged_dataset.json"
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(flattened, f, ensure_ascii=False, indent=2)

    print(f"[build_dataset] input rows = {len(rows)}")
    print(f"[build_dataset] saved to {output_path}")


if __name__ == "__main__":
    main()