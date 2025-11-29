// api/comfort.js

export default async function handler(req, res) {
  // 단순 확인용: GET/POST 둘 다 허용
  const method = req.method || "UNKNOWN";

  return res.status(200).json({
    ok: true,
    method,
    message: "책냥이 API 라우트는 살아있어요!"
  });
}
