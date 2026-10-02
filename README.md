# Atlas Line

Plataforma de fila e chamada de pacientes para todos os setores da clínica.
Registra a chegada, organiza a ordem (respeitando prioridades) e registra quando e por quem cada paciente foi chamado.

É um sistema separado do Atlas System da coleta do TCC. Usa um projeto Firebase próprio e não toca em nenhum dado da pesquisa.

## Estrutura

```
atlas-line/
├── index.html            Entrada do sistema
├── preview.html          Pré visualização com dados fictícios (pode apagar depois)
├── css/
│   ├── base.css          Cores, fontes, tema claro e escuro
│   └── components.css    Menu lateral, tabela, cartões, botões, login
├── js/
│   ├── firebase-config.js   Suas chaves do Firebase (único lugar)
│   ├── auth.js              Login, logout e troca de senha
│   ├── main.js              Estrutura da plataforma depois do login
│   ├── ui.js                Toast, tema, fonte, datas, escape de texto
│   └── icons.js             Ícones embutidos (sem CDN)
└── assets/
```

## Ver o visual agora, sem configurar nada

Abra o arquivo `preview.html` com duplo clique. Ele usa os mesmos CSS do sistema, com pacientes fictícios.
No menu do usuário (canto inferior esquerdo) dá pra alternar entre tema claro e escuro.

## Configurar o Firebase

1. Crie um projeto novo em console.firebase.google.com (não reutilize o do Atlas System).
2. Ative o **Realtime Database** e a **Authentication** com o método Email e senha.
3. Em Configurações do projeto, crie um app Web e copie o bloco `firebaseConfig`.
4. Cole os valores em `js/firebase-config.js`.
5. Crie o primeiro usuário em Authentication e, no Realtime Database, cadastre o perfil dele em `usuarios/{uid}`:

```json
{
  "nome": "Seu Nome",
  "role": "admin",
  "ativo": true,
  "setoresPermitidos": []
}
```

## Testar no seu computador

Os arquivos usam módulos JavaScript, que o navegador bloqueia quando a página é aberta com duplo clique.
É preciso abrir por um servidor local. Dentro da pasta do projeto:

```
python3 -m http.server 8000
```

E acesse `http://localhost:8000`. No VS Code, a extensão Live Server faz o mesmo com um clique.

## Publicar

Suba a pasta inteira para um repositório do GitHub e ative o GitHub Pages nas configurações do repositório.

## Estado atual

Pronto: estrutura de pastas, identidade visual (claro e escuro), login, menu lateral, tela da fila (estrutura), cartões de contagem, filtros e tabela responsiva.

Próximos passos: registro de chegada, fila em tempo real com chamada, histórico, painel de TV (`tv.html`), tela de Administração (setores, exames, convênios, usuários, aparência, dados da clínica, alertas, backup).
