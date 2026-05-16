# Base para venda

Template React + Vite para sites de servicos com vitrine, agendamento, WhatsApp, painel administrativo e Firebase/Firestore.

Esta base foi preparada para revenda: nao inclui fotos pessoais, logos de cliente anterior nem imagens reais dos servicos. O projeto usa placeholders neutros para que cada novo cliente envie seus proprios dados e arquivos.

## Recursos

- Pagina principal com hero, logo, foto profissional e lista de servicos.
- Agendamento com selecao de data, horarios e envio para WhatsApp.
- Painel administrativo para ver agendamentos, bloquear periodos e alterar precos.
- Firebase/Firestore configurado por variaveis de ambiente.
- Arquivos de configuracao separados para personalizar cliente e servicos.
- CSS consolidado com variaveis no topo para troca rapida de cores.

## Tecnologias

- React
- Vite
- Firebase/Firestore
- React Router
- ESLint

## Estrutura

```txt
.
├── docs/
│   ├── CHECKLIST_CLIENTE.md
│   ├── CONFIGURACAO.md
│   └── DEPLOY.md
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   │   ├── servicesConfig.js
│   │   └── siteConfig.js
│   ├── pages/
│   └── firebase.js
├── .env.example
├── MAPA_PERSONALIZACAO.md
├── package.json
└── README.md
```

## Comecar

```bash
npm install
npm run dev
```

Depois abra:

```txt
http://127.0.0.1:5173
```

## Personalizacao rapida

1. Edite `src/config/siteConfig.js` com nome, contatos, endereco, links, rotas e regras de agenda.
2. Edite `src/config/servicesConfig.js` com nomes e precos dos servicos.
3. Substitua os placeholders em `src/assets/` ou altere os imports nos arquivos de configuracao.
4. Copie `.env.example` para `.env.local` e preencha com o Firebase do cliente.
5. Ajuste cores em `src/pages/cliente.css`, se necessario.

Veja os guias em `docs/` para um passo a passo mais organizado.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Observacoes importantes

- Nao envie `.env.local` para o GitHub.
- Use um projeto Firebase separado para cada cliente.
- Revise as regras de seguranca do Firestore antes de publicar.
- O painel admin nao tem autenticacao nesta base; adicione login antes de entregar em producao.
