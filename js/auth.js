/* ============================================================
   ATLAS LINE — auth.js
   Inicializa o Firebase, cuida da tela de login, e resolve
   quem é o usuário logado (nome, papel, setores permitidos)
   antes de entregar o controle pra fila.js.
   ============================================================ */

import { firebaseConfig } from "./firebase-config.js";
import { mostrarToast } from "./ui.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  updatePassword, EmailAuthProvider, reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export let currentUser = null; // { id, nome, role, setoresPermitidos, ativo }

const root = document.getElementById("app");

/* ---------- Tela de login ---------- */
function renderLogin(erro = "") {
  root.innerHTML = `
    <div class="auth-split">
      <aside class="auth-aside">
        <div class="auth-aside-brand"><div class="auth-mark">AL</div>Atlas Line</div>
        <div>
          <h1 class="auth-aside-title">A fila certa, na hora certa.</h1>
          <p class="auth-aside-text">Registre a chegada, priorize quem precisa e chame o próximo com um toque. Tudo em tempo real, em todos os setores.</p>
        </div>
        <div class="auth-vignette" aria-hidden="true">
          <div class="auth-vignette-label"><span class="live-dot"></span>Chamando agora</div>
          <div class="auth-vignette-name">Maria da Silva</div>
          <div class="auth-vignette-sub">Ultrassom</div>
        </div>
      </aside>
      <main class="auth-main">
        <form class="auth-form" id="login-form">
          <div class="auth-mobile-brand"><div class="auth-mark">AL</div>Atlas Line</div>
          <h2>Entrar</h2>
          <p class="auth-sub">Use seu email e sua senha para acessar a fila.</p>
          <label class="field">
            <span class="field-label">Email</span>
            <input class="field-input" type="email" id="login-email" autocomplete="username" autofocus required>
          </label>
          <label class="field">
            <span class="field-label">Senha</span>
            <input class="field-input" type="password" id="login-senha" autocomplete="current-password" required>
          </label>
          ${erro ? `<div class="auth-error" role="alert">${erro}</div>` : ""}
          <button class="btn btn-primary btn-full" type="submit">Entrar</button>
        </form>
      </main>
    </div>`;
  document.getElementById("login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-senha").value;
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Entrando...";
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      /* onAuthStateChanged assume daqui pra frente */
    } catch (err) {
      renderLogin("Email ou senha incorretos. Confira e tente de novo.");
    }
  });
}

/* ---------- Trocar a própria senha (self service) ---------- */
export async function abrirModalSenha() {
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal">
      <h3 style="margin-bottom:18px">Alterar minha senha</h3>
      <form id="senha-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="field">
          <label class="field-label">Senha atual</label>
          <input class="field-input" type="password" id="senha-atual" required>
        </div>
        <div class="field">
          <label class="field-label">Nova senha</label>
          <input class="field-input" type="password" id="senha-nova" minlength="6" required>
        </div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <button type="button" class="btn" id="senha-cancelar" style="flex:1">Cancelar</button>
          <button type="submit" class="btn btn-primary" style="flex:1">Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector("#senha-cancelar").onclick = () => ov.remove();
  ov.addEventListener("click", e => { if (e.target === ov) ov.remove(); });
  ov.querySelector("#senha-form").addEventListener("submit", async e => {
    e.preventDefault();
    const atual = document.getElementById("senha-atual").value;
    const nova = document.getElementById("senha-nova").value;
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, atual);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, nova);
      ov.remove();
      mostrarToast("✓ Senha alterada com sucesso");
    } catch (err) {
      mostrarToast("Não foi possível alterar. Confira a senha atual.", { tipo: "erro" });
    }
  });
}

export async function logout() {
  currentUser = null;
  await signOut(auth);
}

/* ---------- Ponto de entrada: quem está logado? ---------- */
let onLoginCallback = null;
export function aoLogar(fn) { onLoginCallback = fn; }

onAuthStateChanged(auth, async user => {
  if (!user) { currentUser = null; renderLogin(); return; }
  try {
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    const perfil = snap.val();
    if (!perfil || perfil.ativo === false) {
      await signOut(auth);
      renderLogin("Conta não encontrada ou desativada. Fale com o administrador.");
      return;
    }
    currentUser = { id: user.uid, ...perfil };
    if (onLoginCallback) onLoginCallback(currentUser);
  } catch (err) {
    renderLogin("Erro ao carregar seu perfil. Tente novamente.");
  }
});
