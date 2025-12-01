import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json({ error: "OPENAI_API_KEY is not set" }, 400);
    }

    const { action, modelId, question, originalAnswer, reviewingModel } = await req.json();

    if (!action || !modelId) {
      return json({ error: "Missing required fields: action, modelId" }, 400);
    }

    if (modelId !== "gpt4") {
      return json({ error: "Only OpenAI (gpt4) is implemented on the server for now" }, 400);
    }

    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    if (action === "answer") {
      messages.push({
        role: "system",
        content:
          "You are the Oracle of OpenAI within a gothic castle library. Answer clearly and helpfully in that theme, but keep substance rigorous.",
      });
      messages.push({ role: "user", content: question || "" });
    } else if (action === "review") {
      messages.push({
        role: "system",
        content:
          "You are one oracle reviewing another oracle's answer. Provide a short, thoughtful review (5-10 sentences) in a scholarly tone, constructive and specific.",
      });
      messages.push({
        role: "user",
        content: `Review the following answer as ${reviewingModel || "the Oracle"}:\n\n${originalAnswer || ""}`,
      });
    } else {
      return json({ error: "Unsupported action" }, 400);
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content || "";
    return json({ content });
  } catch (err: any) {
    return json({ error: err?.message || "Unknown error" }, 500);
  }
}

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers({
      "content-type": "application/json",
      ...Object.fromEntries(corsHeaders().entries()),
    }),
  });
}
