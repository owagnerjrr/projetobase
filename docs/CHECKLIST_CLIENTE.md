# Checklist de novo cliente

Use este roteiro quando for criar uma copia da base para um novo cliente.

## Dados do cliente

- Nome da empresa/profissional.
- Subtitulo ou frase curta.
- WhatsApp com DDI e DDD.
- E-mail.
- Instagram.
- Endereco completo.
- Link do Google Maps.
- Formas de pagamento.

## Arquivos do cliente

- Logo.
- Foto profissional.
- Imagem padrao dos servicos ou uma imagem para cada servico.
- Artes de descricao dos servicos, se o cliente tiver.

## Configuracao no projeto

- Atualizar `src/config/siteConfig.js`.
- Atualizar `src/config/servicesConfig.js`.
- Substituir placeholders em `src/assets/` ou ajustar imports.
- Criar `.env.local` com as chaves do Firebase.
- Rodar `npm run lint`.
- Rodar `npm run build`.

## Antes de entregar

- Testar agendamento.
- Testar envio para WhatsApp.
- Testar painel admin.
- Confirmar que os precos aparecem corretamente.
- Confirmar que o Firebase usado e do cliente certo.
- Confirmar que `.env.local` nao foi incluido no zip/repo.
