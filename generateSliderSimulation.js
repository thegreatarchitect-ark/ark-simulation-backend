const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Set this on Render later
});
const openai = new OpenAIApi(configuration);

app.post("/generate-slider", async (req, res) => {
  const { title, mission, guiding_questions, tone, intent } = req.body;

  // 🧠 This is the GPT prompt text from your Canvas
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
   - title (string): Rephrase or emphasize the title.
   - mission (string): Why this simulation matters.
   - guiding_questions (array of 3 strings): What dilemmas or angles it explores.
4. quick_presets (array of 4 objects):
   - name (string): Preset title (e.g., “Community First”).
   - description (string): A one-line strategy overview.
   - preset_values (object): Map of slider keys to values (e.g., funding: 80).
5. sliders (array of 6 objects):
   - key (string): Unique ID.
   - label (string): Display name.
   - tooltip (string): Explains what adjusting this slider means.
   - min (number)
   - max (number)
   - default (number)
   - impact_targets (array of strings): Which dashboards this slider affects.
6. dashboards (array of 3 objects):
   - key (string): Unique ID.
   - label (string): Display name.
   - description (string): What this metric means.
   - unit (string): %, score, $, or index (optional).
7. risks (array of 4 objects):
   - label (string): Risk title.
   - severity (low / medium / high)
   - timeframe (short-term / medium-term / long-term)
   - description (string): Rich, context-aware risk description.
8. insights (array of 3–4 objects):
   - label (string): Short title.
   - text (string): Insightful paragraph (2–4 sentences).
9. synthesis (object):
   - viability_score (0–100)
   - equity_score (0–100)
   - implementation_level (Easy / Moderate / Challenging)
   - strategic_summary (2–4 sentences summarizing the entire simulation)

🧠 Notes:
- Be creative. Tailor the simulation deeply to the topic.
- Do not reuse templates or placeholders.
- All sections must be rich, specific, and interlinked.
- Return a valid JSON object only. No extra text or Markdown.
`;


  const filledPrompt = basePrompt
    .replace("{{title}}", title)
    .replace("{{mission}}", mission)
    .replace("{{guiding_questions}}", guiding_questions)
    .replace("{{tone}}", tone)
    .replace("{{intent}}", intent);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: filledPrompt }],
      temperature: 0.7,
    });

    const raw = response.data.choices[0].message.content;
    const simulation = JSON.parse(raw); // assumes GPT responds with valid JSON

    res.json(simulation);
  } catch (err) {
    console.error("Error generating simulation:", err);
    res.status(500).json({ error: "Simulation generation failed" });
  }
});

app.listen(3000, () => {
  console.log("Slider simulation backend is running on port 3000");
});
