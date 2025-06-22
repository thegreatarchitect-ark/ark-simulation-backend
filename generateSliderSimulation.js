// index.js

import express from "express";
import cors from "cors";
import OpenAI from "openai";

// ✅ Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Initialize OpenAI client using your environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Simulation route
app.post("/generate-slider", async (req, res) => {
  const { title, mission, guiding_questions, tone, intent } = req.body;

  const basePrompt = `
You are an expert simulation architect creating interactive policy simulators for The Ark platform. Based on the following topic and user inputs, generate a complete 7-layer slider simulation configuration. The goal is to help users explore complex policy trade-offs visually and dynamically through presets, adjustable sliders, impact dashboards, risks, and strategic analysis.

Topic: {{title}}
Mission: {{mission}}
Guiding Questions: {{guiding_questions}}
Tone: {{tone}}
Intent: {{intent}}

Please output the result as a JSON object with the following exact fields:

1. title (string): The full name of the simulation.
2. description (string): A short, compelling explanation of what the simulation is about.
3. framing (object):
   - title (string)
   - mission (string)
   - guiding_questions (array of 3 strings)
4. quick_presets (array of 4 objects):
   - name (string)
   - description (string)
   - preset_values (object with slider keys to values)
5. sliders (array of 6 objects):
   - key (string)
   - label (string)
   - tooltip (string)
   - min (number)
   - max (number)
   - default (number)
   - impact_targets (array of strings)
6. dashboards (array of 3 objects):
   - key (string)
   - label (string)
   - description (string)
   - unit (string: %, $, score, or index)
7. risks (array of 4 objects):
   - label (string)
   - severity (low / medium / high)
   - timeframe (short-term / medium-term / long-term)
   - description (string)
8. insights (array of 3–4 objects):
   - label (string)
   - text (string: 2–4 sentence insight)
9. synthesis (object):
   - viability_score (0–100)
   - equity_score (0–100)
   - implementation_level (Easy / Moderate / Challenging)
   - strategic_summary (2–4 sentence synthesis)

Return a valid JSON object only. Do not include explanations or Markdown formatting.
`;

  const filledPrompt = basePrompt
    .replace("{{title}}", title)
    .replace("{{mission}}", mission)
    .replace("{{guiding_questions}}", guiding_questions)
    .replace("{{tone}}", tone)
    .replace("{{intent}}", intent);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: filledPrompt }],
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;
    const simulation = JSON.parse(raw); // Ensure the response is valid JSON

    res.json(simulation);
  } catch (error) {
    console.error("❌ Error generating simulation:", error.message);
    res.status(500).json({ error: "Simulation generation failed." });
  }
});

// ✅ IMPORTANT: Bind to PORT and 0.0.0.0 for Render
const PORT = process.env.PORT || 3000;
console.log("✅ Server is starting...");

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Slider simulation backend running on port ${PORT}`);
});
