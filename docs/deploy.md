# Deploy — Vercel com preview por branch

Decidido em 29/10/2026. Produção = `main`; cada branch e cada pull request ganham uma URL de preview própria.

## Conectar (uma vez, feito pelo Gui)
1. Entre em vercel.com com a conta da Selva e clique em **Add New… → Project**.
2. Em **Import Git Repository**, conecte o GitHub (instale o app "Vercel" na organização/conta dona de `selva-site`) e escolha este repositório.
3. Configure o projeto:
   - **Framework Preset:** Next.js (detectado automaticamente).
   - **Root Directory:** `/` (raiz).
   - **Build Command / Output:** deixar o padrão (`next build`).
   - **Node.js Version** (em Settings → General, depois do primeiro deploy): 22.x ou superior.
   - **Environment Variables:** nenhuma obrigatória. `NEXT_PUBLIC_SITE_URL` é opcional; sem ela o site usa o domínio que a própria Vercel informa.
4. Clique em **Deploy**. O primeiro deploy é o de produção (`main`).
5. Em **Settings → Deployment Protection**, mude **Vercel Authentication** para *Disabled* nas previews, ou as URLs de preview vão pedir login da Vercel no iPhone. Alternativa: manter ligado e usar **Share** no deploy para gerar um link público temporário.
6. Opcional: em **Settings → Git**, confirme que **Production Branch** é `main` e que previews estão habilitadas para todas as branches.

## Uso no dia a dia
- Todo `git push` de uma branch `fase-*/…` gera uma preview em segundos. A URL aparece no painel da Vercel e, se houver PR, como comentário no GitHub.
- Formato da URL: `selva-site-git-<branch>-<conta>.vercel.app` (hífens no lugar de `/`).
- Para testar no iPhone: abra a URL da preview no Safari. Para a Fase 3, abra `/lab/cena0` na preview da branch em teste.
- O domínio final (`selva.agency` ou subdomínio) entra em **Settings → Domains** quando for a hora; o Railway atual continua servindo o site antigo até lá.

## Enquanto a Vercel não está conectada
O Codespace pode expor a porta do servidor de testes como pública: `gh codespace ports visibility 3100:public -c <nome-do-codespace>`. A URL fica `https://<nome>-3100.app.github.dev` e vale só enquanto o Codespace estiver ligado.
