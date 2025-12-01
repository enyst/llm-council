import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 12000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory model registry with defaults
let models = [
  {
    id: 'scholar',
    name: 'The Scholar',
    provider: 'openai',
    model: 'gpt-4o-mini',
    color: '#4a6fa5',
    persona: 'You are a patient medieval scholar who explains with clarity.'
  },
  {
    id: 'sage',
    name: 'The Sage',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-latest',
    color: '#3f8f6b',
    persona: 'You are a wise, concise advisor with a calm tone.'
  },
  {
    id: 'mechanist',
    name: 'The Mechanist',
    provider: 'openai',
    model: 'gpt-4o-mini',
    color: '#a3553f',
    persona: 'You are a precise technical explainer who loves details.'
  }
];

// LLM call stubs: wire real providers later. Uses OPENAI_API_KEY if present
async function callLLM(model, prompt) {
  // For demo: if keys present and provider is openai, use fetch to OpenAI
  const apiKey = process.env.OPENAI_API_KEY || process.env.LITELLM_API_KEY || process.env.OPENHANDS_LLM_KEY || '';
  const useMock = !apiKey;

  if (useMock) {
    return {
      role: 'assistant',
      content: `[${model.name}] ${prompt.slice(0, 200)}\n\n— In this demo, provide your own API keys to get real answers.`
    };
  }

  try {
    // Attempt OpenAI responses via Responses API if OPENAI_API_KEY present
    if (model.provider === 'openai' && process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: model.persona || '' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 500);
      return { role: 'assistant', content: text };
    }
  } catch (e) {
    console.error('LLM call error', e);
  }

  // Fallback mock
  return { role: 'assistant', content: `[${model.name}] ${prompt.slice(0, 200)}\n\n— (mocked)` };
}

function buildReviewPrompt(question, answers) {
  const maxAnswerLength = 500; // basic guard to avoid huge prompts
  const block = answers
    .map(a => `- ${a.model.name}:\n${(a.text || '').slice(0, maxAnswerLength)}${(a.text || '').length > maxAnswerLength ? '...' : ''}`)
    .join('\n\n');
  return `You are part of a council reviewing answers.\nQuestion: ${question}\n\nHere are the other answers to review:\n${block}\n\nCritique each answer for correctness, missing points, contradictions, and improvements. Then give a short overall consensus.`;
}

app.get('/api/models', (req, res) => {
  res.json(models);
});

app.post('/api/models', (req, res) => {
  const { id, name, provider, model: modelId, color, persona } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const exists = models.find(m => m.id === id);
  if (exists) {
    Object.assign(exists, { name, provider, model: modelId, color, persona });
  } else {
    models.push({ id, name, provider, model: modelId, color, persona });
  }
  res.json({ ok: true, models });
});

app.post('/api/ask', async (req, res) => {
  const { question, modelIds } = req.body || {};
  if (!question || !Array.isArray(modelIds) || modelIds.length === 0) {
    return res.status(400).json({ error: 'question and modelIds[] required' });
  }
  const active = models.filter(m => modelIds.includes(m.id));

  // Phase 1: answers
  const answers = await Promise.all(active.map(async (m) => {
    const resp = await callLLM(m, question);
    return { model: { id: m.id, name: m.name, color: m.color }, text: resp.content };
  }));

  // Phase 2: cross-reviews
  const reviews = {};
  for (const m of active) {
    const otherAnswers = answers.filter(a => a.model.id !== m.id);
    const reviewPrompt = buildReviewPrompt(question, otherAnswers);
    const resp = await callLLM(m, reviewPrompt);
    reviews[m.id] = resp.content;
  }

  res.json({ question, answers, reviews });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LLM Council Codex listening on http://0.0.0.0:${PORT}`);
});
