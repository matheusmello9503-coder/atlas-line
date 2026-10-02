# Atlas Line: contexto do projeto

Leia este arquivo inteiro antes de mexer em qualquer coisa.

## O que é

Atlas Line é uma plataforma de fila e chamada de pacientes para todos os setores de uma clínica de radiologia e diagnóstico por imagem (CERDIL, Campo Grande, MS). A recepção registra a chegada, a fila se organiza sozinha respeitando prioridades, e a atendente chama o próximo com um toque. O sistema guarda quando cada paciente foi chamado e por quem, para registro interno.

É um sistema NOVO e SEPARADO do Atlas System (ferramenta de coleta de dados do TCC do Matheus). Nunca reutilize o banco, o projeto Firebase ou o código daquele sistema, e nunca toque nos dados dele.

## Sobre o usuário

Matheus é iniciante em programação. Comunique em português, em prosa natural, explique termos técnicos, entregue em etapas pequenas e peça confirmação antes de decisões grandes. Ele usa Windows. Ele não escreve código, então rode e teste você mesmo sempre que possível e mostre o resultado.

## Stack

HTML, CSS e JavaScript puro com módulos ES. Sem build, sem npm no navegador. Hospedagem: GitHub Pages (repositório próprio do Atlas Line). Firebase v10.12.2 carregado direto da CDN do Google (gstatic), com Authentication (email e senha) e Realtime Database. Ícones são SVG embutidos em js/icons.js (sem CDN, sem fonte de ícones). Fontes: Google Fonts (Outfit padrão, mais Inter, Poppins e Manrope, e IBM Plex Mono só para o painel de TV e números).

Módulos ES não funcionam abrindo o index.html com duplo clique. Para testar use um servidor local, por exemplo `python -m http.server 8000` dentro da pasta, e abra http://localhost:8000. O arquivo preview.html abre sem servidor, com dados fictícios, só para ver o visual.

## Firebase (já criado)

Projeto: atlas-line-e9b09. A configuração já está preenchida em js/firebase-config.js. Banco: https://atlas-line-e9b09-default-rtdb.firebaseio.com (Estados Unidos). Método de login: email e senha.

O perfil de cada usuário fica em `usuarios/{uid}`, com os campos `nome` (texto), `role` ("admin" ou "atendente"), `ativo` (booleano) e `setoresPermitidos` (lista de ids de setores que ele pode CHAMAR). O primeiro admin (Matheus) já foi criado à mão no console.

Regras de segurança publicadas hoje (cobrem só usuarios; vão precisar crescer com a fila):

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "usuarios": {
      ".read": "root.child('usuarios').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "root.child('usuarios').child(auth.uid).child('role').val() === 'admin'"
      }
    }
  }
}
```

Ao criar a fila, escreva regras novas completas, explique ao Matheus o que mudou e peça para ele publicá-las na aba Regras do console (você não tem acesso ao console dele).

## Estado atual

Pronto e testado em navegador com o Firebase simulado: estrutura de pastas, identidade visual (tema claro por padrão, escuro opcional), login com painel de marca, menu lateral, tela da fila só com a estrutura (cartões de contagem, filtros, tabela vazia), troca de senha, tema persistido neste aparelho, navegação por papel (atendente não vê Administração), layout responsivo (a tabela vira cartões abaixo de 1150px).

Ainda NÃO pronto: tudo que usa dados reais (registro de chegada, fila em tempo real, chamar, histórico), painel de TV, tela de Administração. As páginas Histórico e Administração mostram um aviso de "será construída".

## PROBLEMA ABERTO (primeira tarefa)

O Matheus publicou o projeto no GitHub Pages e o site "não carregou". A causa é desconhecida e nunca foi testado contra o Firebase de verdade. Comece diagnosticando: suba um servidor local, abra no navegador, olhe o console e a aba de rede, e confirme que o login real funciona. Hipóteses comuns: index.html dentro de uma subpasta do repositório em vez da raiz; GitHub Pages não ativado ou apontando para a branch errada; abrir por duplo clique (módulos bloqueados); regras do banco não publicadas (o login falharia com "Erro ao carregar seu perfil"); domínio github.io fora de Authentication, Configurações, Domínios autorizados. Pergunte ao Matheus o que exatamente ele viu na tela. Corrija a causa e confirme com ele que o login funciona antes de seguir.

## Regras de negócio da fila

1. Cada paciente tem: nome, setor, exame(s), convênio, prioridade, horário de chegada, e depois horário em que foi chamado e quem chamou. Não existem etapas intermediárias (nada de início e fim de recepção ou de exame).
2. Fila única com filtro por setor. Todos os usuários logados VEEM todas as filas. O botão Chamar só fica ativo nos setores que o usuário tem em `setoresPermitidos` (admin pode tudo); nos demais aparece desabilitado com um cadeado.
3. Prioridade (gestante, idoso 60+, criança, PcD) passa na frente da ordem de chegada. A posição e o "próximo" são calculados por setor.
4. Chamar é um toque. Ao chamar, grava o horário e o nome de quem chamou, o paciente sai da fila ativa e entra no histórico do dia (consultável por data). Avalie oferecer "Desfazer" por alguns segundos e confirme com o Matheus.
5. Cartões de contagem da tela da fila: Aguardando, Prioridades, Chamados hoje, Espera média (derivada de chegada e chamado).
6. Alerta de possível esquecimento: paciente aguardando há mais que um tempo limite configurável (no sistema antigo era 2 horas) ganha destaque.

## Administração (só admin, em abas)

Setores, Exames (ligados a setores), Convênios, Usuários (criar, desativar, definir papel e setores permitidos), Aparência (tema claro ou escuro, e 4 fontes: Outfit, Inter, Poppins, Manrope), Dados da clínica (nome, logo, endereço), Alertas e notificações (som ao entrar paciente novo na fila, tempo limite de esquecimento), Backup (exportar dados).

Setores e exames: o Matheus vai passar a lista exata depois. Construa a estrutura genérica e editável e cadastre um conjunto inicial razoável (Ultrassom, Raio X, Tomografia, Ressonância, Mamografia) que ele possa ajustar. Convênios iniciais: Base Aérea, Bradesco, Cassi, Cassems, Fusex, Hapvida, Impcg, Marinha, Oeste Saúde, Particular, PAX, Postal Saúde, Prover Saúde, Saúde Caixa, Secretaria de Saúde, Sepaco, Sul América, Tabela Social, UFMS, Vale Saúde.

Atenção: criar usuário pelo app com createUserWithEmailAndPassword desloga o admin que está logado. Resolva com uma segunda instância do app Firebase só para criar contas, ou outra estratégia, e explique a escolha.

## Painel de TV (tv.html)

Tela separada, só leitura, para ficar numa TV da sala de espera, fácil de abrir e configurar. Fundo escuro mesmo com o sistema no tema claro (leitura a distância). Mostra em destaque "Chamando agora" com o nome em fonte monoespaçada grande (IBM Plex Mono), e abaixo uma lista menor "A seguir". Uma única animação orquestrada quando um novo nome é chamado. Pense em privacidade (LGPD): decida com o Matheus se mostra nome completo ou só primeiro nome e inicial.

## Design

Os tokens estão em css/base.css e os componentes em css/components.css. Nunca coloque cor solta no CSS ou no JS, use as variáveis. Princípios: aparência de plataforma corporativa (inspirada numa tela do G2i Clinics que o Matheus aprovou), claro por padrão, menu lateral azul marinho nos dois temas, UM acento forte, o âmbar (`--call`), reservado ao momento de chamar (botão Chamar e o próximo de cada setor). Prioridade sempre em rosa (`--priority`), nunca nas cores de etapa. Textos de interface em português, sentence case, sem emoji, sem pontos de exclamação, ações com verbo ("Registrar chegada"), vazios como convite ("Assim que alguém chegar, aparece aqui na hora").

A tabela da fila tem 8 colunas em ordem fixa (posição, paciente, setor e exame, convênio, prioridade, chegada, espera, ação). Abaixo de 1150px o CSS a transforma em cartões e depende dessa ordem e dos atributos `data-label` nas células Chegada e Espera. O preview.html mostra o markup de referência.

## Convenções de código

1. Comentários em português. Módulos pequenos, um assunto por arquivo (auth, fila, admin, tv, ui, icons).
2. Todo texto vindo do banco (nome de paciente, etc.) que entra em innerHTML passa por `escapar()` de js/ui.js.
3. Datas no horário local do Brasil. Use `hojeISO()` de js/ui.js. Nunca use toISOString() para decidir "hoje" (à noite devolve o dia seguinte).
4. localStorage só para tema e fonte deste aparelho. Dados do negócio vivem no Firebase.
5. Ícones novos: acrescente em js/icons.js (desenhos da Tabler Icons, licença MIT). Não adicione CDN de ícones.
6. Depois de cada mudança relevante: valide a sintaxe, teste no navegador (inclusive em tela de celular) e só então diga que está pronto.
7. LGPD: são dados de pacientes. Regras do banco sempre por papel, nada de leitura pública, nada de dados reais em exemplos.

## Ordem sugerida de trabalho

1. Diagnosticar e corrigir o problema aberto, confirmar login real.
2. Estrutura de dados e regras de segurança da fila.
3. Registrar chegada, fila em tempo real, chamar, histórico.
4. Administração (começando por setores, exames, convênios e usuários).
5. Painel de TV.
6. Aparência, dados da clínica, alertas, som e backup.
