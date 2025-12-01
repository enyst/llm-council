# llm-council codex

A castle-library themed LLM council SPA with a Python/Flask backend.

Run
- Python 3.11+
- Install deps: pip install -r requirements.txt
- Start: PORT=12000 python3 server.py
- Visit: http://localhost:12000

CORS
- By default, CORS is allowed for these origins:
  - http://localhost:12000
  - http://127.0.0.1:12000
  - https://work-1-kbdzgmricarifzhe.prod-runtime.all-hands.dev
  - https://work-2-kbdzgmricarifzhe.prod-runtime.all-hands.dev
- To customize, set ALLOWED_ORIGINS to a comma-separated list or to * for permissive dev.

Environment
- OPENAI_API_KEY optional (for real OpenAI answers); otherwise responses are mocked
- PORT (default 12000)
- ALLOWED_ORIGINS (see CORS section)
