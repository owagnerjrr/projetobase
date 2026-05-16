# Configuracao

## `src/config/siteConfig.js`

Arquivo principal para dados do cliente.

Campos mais comuns:

- `brandName`: nome da marca.
- `heroTitle`: texto grande da primeira dobra.
- `subtitle`: frase abaixo do titulo.
- `assets.logo`: logo usado no hero.
- `assets.professionalPhoto`: foto profissional usada no hero.
- `contact.whatsappNumber`: WhatsApp em formato internacional, somente numeros.
- `contact.email`: e-mail de contato.
- `contact.instagramUrl`: link do Instagram.
- `contact.mapsUrl`: link do Google Maps.
- `address`: linhas do endereco.
- `paymentMethods`: formas de pagamento.
- `routes.publicAlias`: rota publica alternativa.
- `routes.admin`: rota do painel admin.
- `schedule`: regras de horario e limite de agendamentos.

## `src/config/servicesConfig.js`

Arquivo de servicos e precos.

Cada item segue este formato:

```js
{
  nome: "NOME DO SERVICO",
  preco: "VALOR",
  img: serviceImage,
  desc: serviceDescription,
}
```

Se quiser uma imagem diferente por servico, importe o arquivo no topo e use no campo `img` ou `desc`.

## Firebase

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

No Windows, tambem pode copiar pelo Explorador de Arquivos.

Preencha:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Use sempre um Firebase separado por cliente.
