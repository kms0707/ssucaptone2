import os
from dotenv import load_dotenv

load_dotenv()

API_KEY: str = os.environ["API_KEY"]
BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:8080")
AGENT_VERSION: str = os.environ.get("AGENT_VERSION", "1.0.0")
INTERFACE: str = os.environ.get("INTERFACE", "eth0")
SEND_INTERVAL: int = int(os.environ.get("SEND_INTERVAL", "10"))
