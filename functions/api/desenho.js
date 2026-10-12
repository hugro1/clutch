import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequest(context) {
  const { request, env } = context;

  // 1. O metodo e verificado antes do corpo e do token.
  if (request.method !== "POST") {
    return new Response("Método não permitido.", {
      status: 405,
      headers: { "Allow": "POST", "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // 2. Corpo ausente, JSON inválido ou número inválido: 400.
  let dados;
  const texto = await request.text();
  if (!texto.trim()) {
    return new Response("Corpo da requisição ausente ou inválido.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  try {
    dados = JSON.parse(texto);
  } catch {
    return new Response("JSON inválido.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  if (!dados || !Object.prototype.hasOwnProperty.call(dados, "numero") || !numeroValido(dados.numero)) {
    return new Response("O número deve ser um inteiro entre 1 e 100.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // 3. O token só é verificado depois que o corpo passou na validação.
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || !env.GOOGLE_CLIENT_ID) {
    return new Response("Autenticação Google ausente ou inválida.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let verificacao;
  try {
    const url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(match[1]);
    verificacao = await fetch(url);
  } catch {
    return new Response("Não foi possível verificar a autenticação Google.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  if (!verificacao || verificacao.status !== 200) {
    return new Response("Token Google inválido ou expirado.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  let tokenInfo;
  try {
    tokenInfo = await verificacao.json();
  } catch {
    tokenInfo = null;
  }
  if (!tokenInfo || tokenInfo.aud !== env.GOOGLE_CLIENT_ID || tokenInfo.email_verified !== "true" || !tokenInfo.email) {
    return new Response("Token Google inválido ou e-mail não verificado.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const svg = gerarDesenho(dados.numero, tokenInfo.email);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}
