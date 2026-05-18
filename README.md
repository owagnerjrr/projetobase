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
- O agendamento, minhas marcacoes e o painel admin usam PIN por SMS via Firebase Authentication.

## Protecao por PIN

1. No Firebase Console, ative Authentication > Sign-in method > Phone.
2. Em Authentication > Settings > Authorized domains, confirme os dominios locais e o dominio da Vercel.
3. Na Vercel, adicione `VITE_ADMIN_PHONE_NUMBERS` com os telefones autorizados para o admin, separados por virgula e em formato internacional. Exemplo: `+5511999999999,+5521999999999`.
4. Copie as regras de `firestore.rules.example` para as regras do Firestore no Firebase Console e troque o telefone de exemplo pelo telefone real do admin.
5. Publique novamente na Vercel.

O Firebase Authentication envia PIN por SMS. Para enviar por WhatsApp, sera necessario adicionar um backend, como Firebase Functions, e integrar um provedor externo de WhatsApp.
