"""Recommender backend for self-hosting: a narrow proxy in front of a local Ollama.

Stands in for the claude.ai `sample` capability when the Hub is served outside
claude.ai. Ollama itself stays on localhost; this exposes exactly one operation
(chat with a fixed model, JSON reply) with size and rate limits, so the public
endpoint can't be used to pull/delete models or pick a different one.

Stdlib only. Config via env:
  OLLAMA_URL      default http://127.0.0.1:11434
  OLLAMA_MODEL    default qwen3:30b-a3b-instruct-2507-q4_K_M
  RECOMMENDER_PORT default 8787 (binds 127.0.0.1 only; Caddy fronts it)
"""
import json
import os
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:30b-a3b-instruct-2507-q4_K_M")
PORT = int(os.environ.get("RECOMMENDER_PORT", "8787"))

MAX_BODY = 256 * 1024          # the page sends the whole corpus each call (ADR-0006)
MAX_MESSAGES = 41              # rules turn + 20 exchanges
MAX_USER_CHARS = 600           # matches the textarea maxlength
RATE_PER_MIN = 6               # per client IP
MAX_CONCURRENT = 2             # GPU requests in flight; extra callers get 429
OLLAMA_TIMEOUT = 180

REPLY_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string"},
        "citations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "n": {"type": "integer"},
                    "kind": {"type": "string", "enum": ["model", "failureMode", "knownVariant"]},
                    "modelId": {"type": "string"},
                    "failureModeId": {"type": "string"},
                    "variantId": {"type": "string"},
                    "label": {"type": "string"},
                    "illustrative": {"type": "boolean"},
                },
                "required": ["n", "kind", "modelId", "label"],
            },
        },
    },
    "required": ["reply", "citations"],
}

_hits = {}
_hits_lock = threading.Lock()
_slots = threading.BoundedSemaphore(MAX_CONCURRENT)


def rate_limited(ip):
    now = time.monotonic()
    with _hits_lock:
        recent = [t for t in _hits.get(ip, []) if now - t < 60]
        if len(recent) >= RATE_PER_MIN:
            _hits[ip] = recent
            return True
        recent.append(now)
        _hits[ip] = recent
        if len(_hits) > 10000:  # drop idle IPs so the table can't grow unbounded
            for k in [k for k, v in _hits.items() if now - v[-1] >= 60]:
                del _hits[k]
        return False


def validate(payload):
    msgs = payload.get("messages") if isinstance(payload, dict) else None
    if not isinstance(msgs, list) or not 1 <= len(msgs) <= MAX_MESSAGES:
        return None
    out = []
    for i, m in enumerate(msgs):
        if not isinstance(m, dict) or m.get("role") not in ("user", "assistant"):
            return None
        content = m.get("content")
        if not isinstance(content, str):
            return None
        # The first turn carries rules + corpus; later user turns are typed questions.
        if i > 0 and m["role"] == "user" and len(content) > MAX_USER_CHARS:
            return None
        out.append({"role": m["role"], "content": content})
    return out


def ask_ollama(messages):
    body = json.dumps({
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "format": REPLY_SCHEMA,
        "options": {"temperature": 0.2, "num_ctx": 32768, "num_predict": 1500},
    }).encode()
    req = urllib.request.Request(OLLAMA_URL + "/api/chat", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as r:
        return json.loads(r.read())["message"]["content"]


class Handler(BaseHTTPRequestHandler):
    server_version = "recommender"
    sys_version = ""

    def client_ip(self):
        # Bound to localhost behind Caddy, which overwrites X-Forwarded-For with the real peer.
        fwd = self.headers.get("X-Forwarded-For", "")
        return fwd.split(",")[-1].strip() or self.client_address[0]

    def send_json(self, status, obj):
        data = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path != "/api/recommend":
            return self.send_json(404, {"error": "not_found"})
        self.send_json(200, {"ok": True, "model": OLLAMA_MODEL})

    def do_POST(self):
        if self.path != "/api/recommend":
            return self.send_json(404, {"error": "not_found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = -1
        if not 0 < length <= MAX_BODY:
            return self.send_json(413, {"error": "too_large"})
        try:
            messages = validate(json.loads(self.rfile.read(length)))
        except ValueError:
            messages = None
        if messages is None:
            return self.send_json(400, {"error": "bad_request"})
        if rate_limited(self.client_ip()):
            return self.send_json(429, {"error": "rate_limited"})
        if not _slots.acquire(blocking=False):
            return self.send_json(429, {"error": "rate_limited"})
        try:
            content = ask_ollama(messages)
        except (urllib.error.URLError, TimeoutError, KeyError, ValueError) as e:
            self.log_error("ollama: %r", e)
            return self.send_json(502, {"error": "upstream"})
        finally:
            _slots.release()
        try:
            result = json.loads(content)
        except ValueError:
            return self.send_json(502, {"error": "invalid_json"})
        if not isinstance(result, dict) or not isinstance(result.get("reply"), str):
            return self.send_json(502, {"error": "invalid_json"})
        if not result["reply"].strip():
            return self.send_json(502, {"error": "empty_completion"})
        self.send_json(200, {"reply": result["reply"], "citations": result.get("citations") or []})

    def log_message(self, fmt, *args):
        # Log the forwarded client, not 127.0.0.1; never log request bodies.
        print("%s %s" % (self.client_ip(), fmt % args), flush=True)


if __name__ == "__main__":
    print("recommender on 127.0.0.1:%d -> %s (%s)" % (PORT, OLLAMA_URL, OLLAMA_MODEL), flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
