import os
import json
import requests
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={r"*": {"origins": "*"}})

PORT = int(os.environ.get('PORT', '12000'))

# In-memory models registry with defaults
MODELS = [
    {
        "id": "scholar",
        "name": "The Scholar",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "color": "#4a6fa5",
        "persona": "You are a patient medieval scholar who explains with clarity.",
    },
    {
        "id": "sage",
        "name": "The Sage",
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-latest",
        "color": "#3f8f6b",
        "persona": "You are a wise, concise advisor with a calm tone.",
    },
    {
        "id": "mechanist",
        "name": "The Mechanist",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "color": "#a3553f",
        "persona": "You are a precise technical explainer who loves details.",
    },
]


def call_llm(model: dict, prompt: str) -> dict:
    api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('LITELLM_API_KEY') or os.environ.get('OPENHANDS_LLM_KEY') or ''
    if not api_key:
        return {
            'role': 'assistant',
            'content': f"[{model['name']}] {prompt[:200]}\n\n— In this demo, set OPENAI_API_KEY (or LITELLM_API_KEY) for real answers.",
        }
    try:
        if model.get('provider') == 'openai' and os.environ.get('OPENAI_API_KEY'):
            resp = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f"Bearer {os.environ['OPENAI_API_KEY']}",
                    'Content-Type': 'application/json',
                },
                json={
                    'model': model.get('model') or 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': model.get('persona', '')},
                        {'role': 'user', 'content': prompt},
                    ],
                    'temperature': 0.7,
                },
                timeout=60,
            )
            data = resp.json()
            text = data.get('choices', [{}])[0].get('message', {}).get('content')
            if not text:
                text = json.dumps(data)[:500]
            return {'role': 'assistant', 'content': text}
    except Exception as e:
        print('LLM call error:', e)
    return {'role': 'assistant', 'content': f"[{model['name']}] {prompt[:200]}\n\n— (mocked)"}


def build_review_prompt(question: str, answers: list) -> str:
    block = '\n\n'.join([f"- {a['model']['name']}:\n{a['text']}" for a in answers])
    return (
        "You are part of a council reviewing answers.\n"
        f"Question: {question}\n\n"
        f"Here are the other answers to review:\n{block}\n\n"
        "Critique each answer for correctness, missing points, contradictions, and improvements. "
        "Then give a short overall consensus."
    )


@app.get('/api/models')
def get_models():
    return jsonify(MODELS)


@app.post('/api/models')
def upsert_model():
    data = request.json or {}
    mid = data.get('id')
    name = data.get('name')
    if not mid or not name:
        return jsonify({'error': 'id and name required'}), 400
    existing = next((m for m in MODELS if m['id'] == mid), None)
    record = {
        'id': mid,
        'name': name,
        'provider': data.get('provider') or 'openai',
        'model': data.get('model') or '',
        'color': data.get('color') or '#bfa36f',
        'persona': data.get('persona') or '',
    }
    if existing:
        existing.update(record)
    else:
        MODELS.append(record)
    return jsonify({'ok': True, 'models': MODELS})


@app.post('/api/ask')
def ask():
    data = request.get_json(force=True, silent=True) or {}
    question = data.get('question')
    model_ids = data.get('modelIds') or []
    if not question or not isinstance(model_ids, list) or not model_ids:
        return jsonify({'error': 'question and modelIds[] required'}), 400

    active = [m for m in MODELS if m['id'] in model_ids]

    # Phase 1: answers
    answers = []
    for m in active:
        resp = call_llm(m, question)
        answers.append({'model': {'id': m['id'], 'name': m['name'], 'color': m['color']}, 'text': resp['content']})

    # Phase 2: cross reviews
    reviews = {}
    for m in active:
        others = [a for a in answers if a['model']['id'] != m['id']]
        review_prompt = build_review_prompt(question, others)
        resp = call_llm(m, review_prompt)
        reviews[m['id']] = resp['content']

    return jsonify({'question': question, 'answers': answers, 'reviews': reviews})


# Static SPA
@app.get('/')
@app.get('/index.html')
@app.get('/<path:path>')
def static_proxy(path: str = 'index.html'):
    full = os.path.join(app.static_folder, path)
    if os.path.isdir(full) or not os.path.exists(full):
        return send_from_directory(app.static_folder, 'index.html')
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
