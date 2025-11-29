// api/comfort.js

export const config = {
  runtime: "edge", // ✅ Edge 함수로 동작
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const emotion = body?.emotion;
  if (!emotion) {
    return new Response(
      JSON.stringify({ error: "emotion is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
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
그 감정에 어울리는 짧고 다정한 공감의 말을 한 문단 정도로 써주세요.`
      }
    ]
  };

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await openaiRes.json();
    const comfort = data?.choices?.[0]?.message?.content?.trim();

    if (!comfort) {
      return new Response(
        JSON.stringify({ error: "No comfort message from OpenAI", raw: data }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ comfort }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "OpenAI request failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
