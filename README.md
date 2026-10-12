# Desenho Assinado

Projeto adaptado para a atividade **Desenho Assinado**, conforme o PDF do professor.

Nome: PREENCHA_SEU_NOME
RA: PREENCHA_SEU_RA
URL: https://PREENCHA-A-URL.pages.dev

## Publicação no Cloudflare Pages
- Framework preset: `None`
- Build command: deixe vazio
- Build output directory: `public`
- Configure a variável de ambiente `GOOGLE_CLIENT_ID` no painel do Cloudflare Pages com o Client ID do Google.
- Em `public/app.js`, substitua `COLOQUE_SEU_CLIENT_ID_GOOGLE_AQUI` pelo mesmo Client ID (ele é público).
- No Google Cloud Console, cadastre a URL do site em **Authorized JavaScript origins**.

## Estrutura importante
- `public/index.html`: formulário de número e botão de login Google.
- `public/app.js`: recebe o `id_token`, envia o número e token para `/api/desenho` e exibe/baixa o SVG.
- `lib/desenho.js`: gera o SVG; não fica na pasta pública.
- `functions/api/desenho.js`: valida método, corpo, token, audiência e e-mail verificado.
- `evidencias/exemplo.svg`: deve ser gerado pelo site publicado usando os dois últimos dígitos do RA (se forem 00, usar 100) e salvo neste caminho.

## Antes de entregar
1. Preencha Nome, RA e URL neste README.
2. Configure o Client ID no código e no painel do Cloudflare Pages.
3. Faça login no site publicado e gere o desenho com o número exigido pelo RA.
4. Baixe o SVG e coloque-o em `evidencias/exemplo.svg`.
5. Faça commit e push na branch `main`.

Não coloque tokens, senhas nem arquivos `.env` no repositório.
