/* ============================================================
   ATLAS LINE — ui.js
   Pedaços de interface usados por mais de uma tela:
   toast, tema claro e escuro, fonte, escape de texto e datas.
   ============================================================ */

/* ---------- Segurança: nome de paciente nunca entra cru no HTML ---------- */
export function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* ---------- Toast de confirmação (a mensagem deve vir já escapada) ---------- */
let _toastTimer = null;

export function mostrarToast(msg, { tipo = "ok", onUndo = null, duracaoMs = 5000 } = {}) {
  const cor = tipo === "erro" ? "var(--danger)" : tipo === "aviso" ? "var(--call)" : "var(--ok)";
  let el = document.getElementById("toast-line");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-line";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  clearTimeout(_toastTimer);
  el.innerHTML = `<span style="color:${cor};font-size:16px;line-height:1">●</span>
    <span style="flex:1">${msg}</span>
    ${onUndo ? `<button class="btn btn-sm" id="toast-undo-btn">Desfazer</button>` : ""}`;
  if (onUndo) {
    document.getElementById("toast-undo-btn").onclick = () => { onUndo(); esconderToast(); };
  }
  requestAnimationFrame(() => el.classList.add("show"));
  _toastTimer = setTimeout(esconderToast, duracaoMs);
}

export function esconderToast() {
  const el = document.getElementById("toast-line");
  if (el) el.classList.remove("show");
  clearTimeout(_toastTimer);
}

/* ---------- Tema e fonte (guardados neste aparelho; o Admin define o padrão) ---------- */
const CHAVE_TEMA = "atlasline.tema";
const CHAVE_FONTE = "atlasline.fonte";

export const FONTES = [
  { id: "outfit",  nome: "Outfit" },
  { id: "inter",   nome: "Inter" },
  { id: "poppins", nome: "Poppins" },
  { id: "manrope", nome: "Manrope" }
];

export function temaAtual() {
  return document.documentElement.getAttribute("data-tema") === "escuro" ? "escuro" : "claro";
}

export function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema === "escuro" ? "escuro" : "claro");
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch (e) { /* modo privado: segue sem guardar */ }
}

export function alternarTema() {
  const novo = temaAtual() === "claro" ? "escuro" : "claro";
  aplicarTema(novo);
  return novo;
}

export function aplicarFonte(fonte) {
  if (fonte && fonte !== "outfit") document.documentElement.setAttribute("data-fonte", fonte);
  else document.documentElement.removeAttribute("data-fonte");
  try { localStorage.setItem(CHAVE_FONTE, fonte || "outfit"); } catch (e) { /* idem */ }
}

/* ---------- Texto e datas ---------- */
export const iniciais = nome =>
  (nome || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();

export const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";
export const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
export const nowISO = () => new Date().toISOString();

/* Data de hoje no horário LOCAL, no formato do campo de data (AAAA-MM-DD).
   Não usar toISOString aqui: à noite ele já devolve o dia seguinte no Brasil. */
export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dataPorExtenso() {
  const txt = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
