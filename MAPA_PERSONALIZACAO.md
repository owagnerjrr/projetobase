# Mapa de personalizacao do site

Este projeto e um site React + Vite com agenda em Firebase.

## Arquivos principais

- `src/config/siteConfig.js`: dados do cliente, nome, logo, foto, contatos, endereco, links, rotas, pagamentos e regras de agenda.
- `src/config/servicesConfig.js`: lista de servicos, precos padrao e imagens.
- `src/pages/Cliente.jsx`: pagina principal do cliente. Agora ela le os dados dos arquivos de configuracao.
- `src/pages/cliente.css`: visual da pagina principal, cores, tamanhos, responsividade e estilos. O arquivo foi consolidado para remover duplicidades e usa variaveis CSS no topo para facilitar troca de cores.
- `src/firebase.js`: inicializacao do Firebase por variaveis de ambiente.
- `src/pages/Admin.jsx`: tela de administracao da agenda, bloqueios e precos.
- `src/assets/`: placeholders de logo, foto profissional, servico e descricao.
- `.env.example`: modelo das variaveis que precisam ser criadas para cada Firebase.

## Dados que precisam trocar para outro cliente

- Nome da marca, titulo, subtitulo, WhatsApp, e-mail, Instagram, endereco, mapa, rotas e pagamentos: `src/config/siteConfig.js`.
- Logo e foto principal: a base usa `logo-placeholder.svg` e `profissional-placeholder.svg`, importados em `src/config/siteConfig.js`.
- Servicos e precos: `src/config/servicesConfig.js`. A base usa placeholders neutros para as imagens dos servicos e descricoes.
- Cores e layout: `src/pages/cliente.css`.

## Banco de dados e agenda

O site usa Firebase/Firestore nas colecoes:

- `appointments`: agendamentos.
- `bloqueios`: periodos bloqueados.
- `servicos`: precos editaveis.

Para vender para outro cliente, crie um Firebase separado para cada cliente e coloque as chaves em um arquivo `.env.local`, seguindo o modelo de `.env.example`.

O painel admin mostra os servicos de `src/config/servicesConfig.js` mesmo quando a colecao `servicos` ainda esta vazia. Quando um preco e alterado pela primeira vez, o registro e criado no Firebase automaticamente.

## Atencao antes de revender

- Trocar as credenciais/configuracao do Firebase no `.env.local`.
- Revisar regras de seguranca do Firestore.
- Remover ou substituir fotos e imagens que nao possam ser reutilizadas.
- Confirmar se o codigo/layout pode ser reaproveitado comercialmente.
- Personalizar rotas, nome do pacote e textos do README.

## Melhor proximo passo tecnico

Para cada novo cliente, copie o projeto, troque `src/config/siteConfig.js`, `src/config/servicesConfig.js`, substitua os placeholders em `src/assets/` e crie um `.env.local` com o Firebase desse cliente.
