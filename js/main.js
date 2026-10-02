/* ============================================================
   ATLAS LINE — main.js
   Monta a estrutura da plataforma depois do login: menu lateral,
   topo, cabeçalho de página e a página aberta no momento.
   A fila ainda aparece vazia, porque os dados reais entram no
   próximo passo (fila.js). A estrutura já está no lugar final.
   ============================================================ */

import { aoLogar, logout, abrirModalSenha } from "./auth.js";
import { icone } from "./icons.js";
import {
  alternarTema, temaAtual, iniciais, escapar, mostrarToast, hojeISO, dataPorExtenso
} from "./ui.js";

const root = document.getElementById("app");

const ROTULO_PAPEL = { admin: "Administrador", atendente: "Atendente" };

const NAV = [
  { grupo: "Operação" },
  { id: "fila",      rotulo: "Fila",          icone: "list-details" },
  { id: "historico", rotulo: "Histórico",     icone: "history" },
  { id: "tv",        rotulo: "Painel de TV",  icone: "device-tv", href: "tv.html" },
  { grupo: "Sistema", so: "admin" },
  { id: "admin",     rotulo: "Administração", icone: "settings", so: "admin" }
];

const PAGINAS = {
  fila:      { trilha: "Operação", titulo: "Fila de atendimento",   sub: "Veja quem chegou, em que ordem, e chame o próximo com um toque." },
  historico: { trilha: "Operação", titulo: "Histórico de chamadas", sub: "Registro interno de quem foi chamado, a que horas e por quem." },
  admin:     { trilha: "Sistema",  titulo: "Administração",         sub: "Setores, exames, convênios, usuários e aparência da plataforma." }
};

let usuario = null;
let paginaAtual = "fila";

/* ---------- Menu do usuário: fecha ao clicar fora ou com Esc ---------- */
function fecharMenuUsuario() {
  const menu = document.getElementById("menu-usuario");
  const botao = document.getElementById("btn-usuario");
  if (menu) menu.classList.remove("open");
  if (botao) botao.setAttribute("aria-expanded", "false");
}
document.addEventListener("click", e => {
  const menu = document.getElementById("menu-usuario");
  if (menu && menu.classList.contains("open") && !menu.contains(e.target)) fecharMenuUsuario();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenuUsuario(); });

/* ---------- Estrutura geral ---------- */
function renderEstrutura() {
  const itens = NAV.filter(i => !i.so || i.so === usuario.role);
  const nav = itens.map(i => i.grupo
    ? `<div class="sb-label">${i.grupo}</div>`
    : `<button class="nav-item${i.id === paginaAtual ? " active" : ""}" data-pagina="${i.id}"${i.href ? ` data-href="${i.href}"` : ""}>
         ${icone(i.icone)}<span>${i.rotulo}</span>${i.id === "fila" ? `<span class="nav-badge" id="nav-fila-total" hidden>0</span>` : ""}
       </button>`
  ).join("");

  root.innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="sb-brand"><div class="sb-mark">AL</div><div class="sb-name">Atlas Line</div></div>
        <nav class="sb-nav" aria-label="Principal">${nav}</nav>
        <div class="sb-user">
          <div class="menu" id="menu-usuario" role="menu">
            <button class="menu-item" id="mi-senha" role="menuitem">${icone("key", 18)}Alterar senha</button>
            <button class="menu-item" id="mi-tema" role="menuitem"></button>
            <div class="menu-sep"></div>
            <button class="menu-item danger" id="mi-sair" role="menuitem">${icone("logout", 18)}Sair</button>
          </div>
          <button class="sb-user-btn" id="btn-usuario" aria-haspopup="menu" aria-expanded="false">
            <span class="avatar">${escapar(iniciais(usuario.nome))}</span>
            <span class="sb-user-info">
              <span class="sb-user-name">${escapar(usuario.nome)}</span>
              <span class="sb-user-role">${ROTULO_PAPEL[usuario.role] || "Atendente"}</span>
            </span>
            <span class="sb-user-chev">${icone("chevron-up", 18)}</span>
          </button>
        </div>
      </aside>
      <div class="scrim" id="scrim"></div>
      <div class="main">
        <header class="topbar">
          <button class="btn btn-ghost btn-icon topbar-toggle" id="btn-menu" aria-label="Abrir menu">${icone("menu-2", 22)}</button>
          <span class="topbar-brand">Atlas Line</span>
          <label class="search">${icone("search", 18)}<input type="search" id="busca-global" placeholder="Buscar paciente" autocomplete="off" aria-label="Buscar paciente"></label>
          <div class="topbar-right">
            <span class="topbar-date">${icone("calendar", 18)}${escapar(dataPorExtenso())}</span>
            <span class="live"><span class="live-dot"></span>ao vivo</span>
          </div>
        </header>
        <main class="content" id="pagina"></main>
      </div>
    </div>`;

  /* menu lateral no celular */
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  const fecharLateral = () => { sidebar.classList.remove("open"); scrim.classList.remove("open"); };
  document.getElementById("btn-menu").onclick = () => { sidebar.classList.add("open"); scrim.classList.add("open"); };
  scrim.onclick = fecharLateral;

  /* navegação */
  root.querySelectorAll(".nav-item").forEach(botao => {
    botao.onclick = () => {
      if (botao.dataset.href) { window.open(botao.dataset.href, "_blank", "noopener"); return; }
      paginaAtual = botao.dataset.pagina;
      root.querySelectorAll(".nav-item").forEach(x => x.classList.toggle("active", x === botao));
      fecharLateral();
      abrirPagina();
    };
  });

  /* menu do usuário */
  const menu = document.getElementById("menu-usuario");
  const botaoUsuario = document.getElementById("btn-usuario");
  const rotularTema = () => {
    document.getElementById("mi-tema").innerHTML = temaAtual() === "claro"
      ? `${icone("moon", 18)}Usar tema escuro`
      : `${icone("sun", 18)}Usar tema claro`;
  };
  rotularTema();
  botaoUsuario.onclick = e => {
    e.stopPropagation();
    const aberto = menu.classList.toggle("open");
    botaoUsuario.setAttribute("aria-expanded", String(aberto));
  };
  document.getElementById("mi-senha").onclick = () => { fecharMenuUsuario(); abrirModalSenha(); };
  document.getElementById("mi-tema").onclick = () => { alternarTema(); rotularTema(); };
  document.getElementById("mi-sair").onclick = logout;
}

/* ---------- Cabeçalho de página ---------- */
function cabecalho(pagina, acoes = "") {
  return `
    <div class="page-head">
      <div>
        <div class="crumbs">${escapar(pagina.trilha)}<span aria-hidden="true">›</span>${escapar(pagina.titulo)}</div>
        <h1 class="page-title">${escapar(pagina.titulo)}</h1>
        <p class="page-sub">${escapar(pagina.sub)}</p>
      </div>
      ${acoes ? `<div class="page-actions">${acoes}</div>` : ""}
    </div>`;
}

/* ---------- Páginas ---------- */
function abrirPagina() {
  const alvo = document.getElementById("pagina");
  const pagina = PAGINAS[paginaAtual];
  if (paginaAtual === "fila") { renderFila(alvo, pagina); return; }
  alvo.innerHTML = cabecalho(pagina) + `
    <div class="panel">
      <div class="empty">
        <div class="empty-icon">${icone("adjustments", 36)}</div>
        <div class="empty-title">Esta área ainda será construída</div>
        <div class="empty-sub">A estrutura de navegação já está pronta. O conteúdo desta página entra nos próximos passos.</div>
      </div>
    </div>`;
}

function renderFila(alvo, pagina) {
  alvo.innerHTML = cabecalho(pagina, `
      <button class="btn" id="btn-atualizar">${icone("refresh", 18)}Atualizar</button>
      <button class="btn btn-primary" id="btn-chegada">${icone("user-plus", 18)}Registrar chegada</button>`) + `

    <section class="stats" aria-label="Resumo da fila">
      <button class="stat is-active" data-filtro="aguardando">
        <span class="stat-label"><span class="stat-dot call"></span>Aguardando</span>
        <span class="stat-value" id="st-aguardando">0</span>
      </button>
      <button class="stat" data-filtro="prioridade">
        <span class="stat-label"><span class="stat-dot priority"></span>Prioridades</span>
        <span class="stat-value" id="st-prioridade">0</span>
      </button>
      <button class="stat" data-filtro="chamados">
        <span class="stat-label"><span class="stat-dot ok"></span>Chamados hoje</span>
        <span class="stat-value" id="st-chamados">0</span>
      </button>
      <div class="stat">
        <span class="stat-label"><span class="stat-dot"></span>Espera média</span>
        <span class="stat-value" id="st-espera">—</span>
      </div>
    </section>

    <section class="filters" aria-label="Filtros">
      <label class="field">
        <span class="field-label">Data</span>
        <input class="field-input" type="date" id="f-data" value="${hojeISO()}" max="${hojeISO()}">
      </label>
      <label class="field grow">
        <span class="field-label">Paciente</span>
        <input class="field-input" type="search" id="f-busca" placeholder="Nome do paciente" autocomplete="off">
      </label>
      <label class="field">
        <span class="field-label">Setor</span>
        <select class="field-select" id="f-setor"><option value="">Todos</option></select>
      </label>
      <label class="field">
        <span class="field-label">Prioridade</span>
        <select class="field-select" id="f-prio">
          <option value="">Todas</option>
          <option value="so">Somente prioridades</option>
        </select>
      </label>
    </section>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="col-pos">Posição</th>
            <th>Paciente</th>
            <th>Setor e exame</th>
            <th>Convênio</th>
            <th>Prioridade</th>
            <th>Chegada</th>
            <th>Espera</th>
            <th class="col-act"><span class="sr-only">Ação</span></th>
          </tr>
        </thead>
        <tbody id="fila-corpo"></tbody>
      </table>
      <div class="empty" id="fila-vazia">
        <div class="empty-icon">${icone("users", 36)}</div>
        <div class="empty-title">Nenhum paciente na fila agora</div>
        <div class="empty-sub">Assim que alguém chegar, aparece aqui na hora.</div>
      </div>
    </div>`;

  document.getElementById("btn-atualizar").onclick = () => renderFila(alvo, pagina);
  document.getElementById("btn-chegada").onclick = () =>
    mostrarToast("O registro de chegada entra no próximo passo da construção.", { tipo: "aviso" });

  /* os cartões de contagem funcionam como filtro: só o visual por enquanto */
  alvo.querySelectorAll("button.stat").forEach(cartao => {
    cartao.onclick = () => {
      alvo.querySelectorAll("button.stat").forEach(c => c.classList.toggle("is-active", c === cartao));
    };
  });
}

/* ---------- Entrada ---------- */
aoLogar(user => {
  usuario = user;
  paginaAtual = "fila";
  renderEstrutura();
  abrirPagina();
});
