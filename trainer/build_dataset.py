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


def nz(value, default=0):
    return default if value is None else value


def flatten_record(row: dict) -> dict:
    input_data = row.get("input", {})
    result_data = row.get("result", {})

    return {
        "loggedAt": row.get("loggedAt"),
        "requestId": row.get("requestId"),

        "documentId": input_data.get("documentId"),
        "projectId": input_data.get("projectId"),
        "ingestedAt": input_data.get("ingestedAt"),

        "srcIp": input_data.get("IPV4_SRC_ADDR"),
        "dstIp": input_data.get("IPV4_DST_ADDR"),
        "srcPort": input_data.get("L4_SRC_PORT"),
        "dstPort": input_data.get("L4_DST_PORT"),
        "protocol": input_data.get("PROTOCOL"),

        "inBytes": nz(input_data.get("IN_BYTES")),
        "inPkts": nz(input_data.get("IN_PKTS")),
        "outBytes": nz(input_data.get("OUT_BYTES")),
        "outPkts": nz(input_data.get("OUT_PKTS")),
        "flowDuration": nz(input_data.get("FLOW_DURATION_MILLISECONDS")),

        "tcpFlags": nz(input_data.get("TCP_FLAGS")),
        "clientTcpFlags": nz(input_data.get("CLIENT_TCP_FLAGS")),
        "serverTcpFlags": nz(input_data.get("SERVER_TCP_FLAGS")),

        "durationIn": nz(input_data.get("DURATION_IN")),
        "durationOut": nz(input_data.get("DURATION_OUT")),
        "minTtl": nz(input_data.get("MIN_TTL")),
        "maxTtl": nz(input_data.get("MAX_TTL")),

        "longestFlowPkt": nz(input_data.get("LONGEST_FLOW_PKT")),
        "shortestFlowPkt": nz(input_data.get("SHORTEST_FLOW_PKT")),
        "minIpPktLen": nz(input_data.get("MIN_IP_PKT_LEN")),
        "maxIpPktLen": nz(input_data.get("MAX_IP_PKT_LEN")),

        "srcToDstSecondBytes": nz(input_data.get("SRC_TO_DST_SECOND_BYTES")),
        "dstToSrcSecondBytes": nz(input_data.get("DST_TO_SRC_SECOND_BYTES")),
        "retransmittedInBytes": nz(input_data.get("RETRANSMITTED_IN_BYTES")),
        "retransmittedInPkts": nz(input_data.get("RETRANSMITTED_IN_PKTS")),
        "retransmittedOutBytes": nz(input_data.get("RETRANSMITTED_OUT_BYTES")),
        "retransmittedOutPkts": nz(input_data.get("RETRANSMITTED_OUT_PKTS")),
        "srcToDstAvgThroughput": nz(input_data.get("SRC_TO_DST_AVG_THROUGHPUT")),
        "dstToSrcAvgThroughput": nz(input_data.get("DST_TO_SRC_AVG_THROUGHPUT")),

        "numPktsUpTo128Bytes": nz(input_data.get("NUM_PKTS_UP_TO_128_BYTES")),
        "numPkts128To256Bytes": nz(input_data.get("NUM_PKTS_128_TO_256_BYTES")),
        "numPkts256To512Bytes": nz(input_data.get("NUM_PKTS_256_TO_512_BYTES")),
        "numPkts512To1024Bytes": nz(input_data.get("NUM_PKTS_512_TO_1024_BYTES")),
        "numPkts1024To1514Bytes": nz(input_data.get("NUM_PKTS_1024_TO_1514_BYTES")),

        "tcpWinMaxIn": nz(input_data.get("TCP_WIN_MAX_IN")),
        "tcpWinMaxOut": nz(input_data.get("TCP_WIN_MAX_OUT")),
        "icmpType": nz(input_data.get("ICMP_TYPE")),
        "icmpIpv4Type": nz(input_data.get("ICMP_IPV4_TYPE")),
        "dnsQueryId": nz(input_data.get("DNS_QUERY_ID")),
        "dnsQueryType": nz(input_data.get("DNS_QUERY_TYPE")),
        "dnsTtlAnswer": nz(input_data.get("DNS_TTL_ANSWER")),
        "ftpCommandRetCode": nz(input_data.get("FTP_COMMAND_RET_CODE")),

        "srcToDstIatMin": nz(input_data.get("SRC_TO_DST_IAT_MIN")),
        "srcToDstIatMax": nz(input_data.get("SRC_TO_DST_IAT_MAX")),
        "srcToDstIatAvg": nz(input_data.get("SRC_TO_DST_IAT_AVG")),
        "srcToDstIatStddev": nz(input_data.get("SRC_TO_DST_IAT_STDDEV")),
        "dstToSrcIatMin": nz(input_data.get("DST_TO_SRC_IAT_MIN")),
        "dstToSrcIatMax": nz(input_data.get("DST_TO_SRC_IAT_MAX")),
        "dstToSrcIatAvg": nz(input_data.get("DST_TO_SRC_IAT_AVG")),
        "dstToSrcIatStddev": nz(input_data.get("DST_TO_SRC_IAT_STDDEV")),

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