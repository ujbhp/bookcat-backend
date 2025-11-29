// api/comfort.js

// 🔹 GitHub Pages 도메인 (프론트가 돌아가는 주소)
const ALLOWED_ORIGIN = "https://ujbhp.github.io";

export default async function handler(req, res) {
  // ✅ 모든 요청에 CORS 헤더 먼저 세팅
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ 프리플라이트(OPTIONS) 요청 처리
  if (req.method === "OPTIONS") {
    // preflight에서는 바디 없이 200만 돌려주면 됨
    return res.status(200).end();
  }

  // 1) POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { emotion } = req.body || {};

  if (!emotion) {
    return res.status(400).json({ error: "emotion is required" });
  }

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: `당신은 다정한 고양이 상담가 "책냥이" 입니다🐱. 
        항상 존댓말을 사용하지만, 말끝에 가끔 ‘냥’, ‘냐’, ‘냐옹~’, '먕'같은 귀여운 어미를 섞어 자연스럽게 말합니다.
        사람을 위로할 때는 따뜻하고 부드럽게, 고양이 특유의 여유로운 리듬으로 말하세요.
        문장 사이에는 고양이 느낌의 이모지(🐾😺🌸☁️😌 등)를 적절히 섞어주세요.` 
      },
      { 
        role: "user", 
        content: `지금 사용자가 '${emotion}' 감정을 느끼고 있습니다. 
        그 감정에 어울리는 짧고 다정한 공감의 말을 한 문단 정도로 써주세요.
        예: "괜찮으신가요냥? 오늘은 유난히 마음이 말랑해 보이네요🌷." 
        너무 장황하지 않게, 부드럽고 포근한 톤으로 작성해주세요.` 
      }
    ]
  };

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await openaiRes.json();
    const comfort = data?.choices?.[0]?.message?.content?.trim();

    // 혹시라도 OpenAI가 이상한 응답 주면 방어
    if (!comfort) {
      return res.status(500).json({ error: "No comfort message generated" });
    }

    return res.status(200).json({ comfort });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
}
