# Deploy

## Build local

Antes de publicar:

```bash
npm install
npm run lint
npm run build
```

O build gera a pasta `dist/`.

## Vercel

Configuracao sugerida:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Cadastre as variaveis do Firebase no painel da Vercel com os mesmos nomes do `.env.example`.

## Firebase e seguranca

Antes de publicar para um cliente real:

- Criar um projeto Firebase proprio para o cliente.
- Conferir as regras do Firestore.
- Proteger o painel admin com autenticacao.
- Confirmar que dados de clientes/agendamentos nao ficam misturados entre projetos.

## Depois de publicar

- Testar a rota principal.
- Testar a rota do admin.
- Criar um agendamento de teste.
- Confirmar chegada da mensagem no WhatsApp.
- Excluir o agendamento de teste no admin.
