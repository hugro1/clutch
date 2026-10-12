// Configure com o Client ID do tipo Web application criado para este site.
// O Client ID é público; não coloque aqui segredos nem tokens.
const GOOGLE_CLIENT_ID = "COLOQUE_SEU_CLIENT_ID_GOOGLE_AQUI";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const statusLogin = document.getElementById("login-status");
const botaoGerar = document.getElementById("gerar");
const botaoBaixar = document.getElementById("baixar");
let idToken = "";
let svgAtual = "";

function receberCredencial(resposta) {
  idToken = resposta.credential || "";
  botaoGerar.disabled = !idToken;
  statusLogin.textContent = idToken
    ? "Login Google realizado. Você já pode gerar o desenho."
    : "Não foi possível concluir o login Google.";
}

window.addEventListener("load", () => {
  if (GOOGLE_CLIENT_ID === "COLOQUE_SEU_CLIENT_ID_GOOGLE_AQUI") {
    statusLogin.textContent = "Configure o Client ID do Google em public/app.js antes de usar o login.";
    return;
  }
  const aguardarGoogle = () => {
    if (!window.google?.accounts?.id) {
      window.setTimeout(aguardarGoogle, 100);
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: receberCredencial,
    });
    window.google.accounts.id.renderButton(document.getElementById("google-button"), {
      theme: "outline", size: "large", text: "signin_with", shape: "rectangular",
    });
  };
  aguardarGoogle();
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  area.replaceChildren();
  botaoBaixar.hidden = true;
  svgAtual = "";

  const numero = Number(campoNumero.value);
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }
  if (!idToken) {
    mensagem.textContent = "Entre com sua conta Google antes de gerar o desenho.";
    return;
  }

  botaoGerar.disabled = true;
  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({ numero }),
    });
    if (resposta.status === 400) {
      mensagem.textContent = "Erro 400: número ou corpo da requisição inválido.";
      return;
    }
    if (resposta.status === 401) {
      mensagem.textContent = "Erro 401: autenticação Google inválida, expirada ou não verificada. Entre novamente.";
      idToken = "";
      botaoGerar.disabled = true;
      statusLogin.textContent = "É necessário fazer login novamente.";
      return;
    }
    if (!resposta.ok) {
      mensagem.textContent = `Erro ${resposta.status}: não foi possível gerar o desenho.`;
      return;
    }
    svgAtual = await resposta.text();
    const imagem = new Image();
    imagem.alt = `Desenho assinado, número ${numero}`;
    imagem.src = URL.createObjectURL(new Blob([svgAtual], { type: "image/svg+xml" }));
    imagem.onload = () => URL.revokeObjectURL(imagem.src);
    area.appendChild(imagem);
    botaoBaixar.hidden = false;
  } catch {
    mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  } finally {
    botaoGerar.disabled = !idToken;
  }
});

botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const url = URL.createObjectURL(new Blob([svgAtual], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
