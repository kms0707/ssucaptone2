# model-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# (선택) 기본 빌드 도구 - numpy/pandas 설치에 필요할 수 있음
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 소스/아티팩트
COPY src /app/src
COPY artifacts /app/artifacts
COPY main.py /app/main.py

ENV PYTHONUNBUFFERED=1

CMD ["python", "-u", "main.py"]
