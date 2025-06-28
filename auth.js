// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD99qCTblkAC9z0fL6hJRtjl1uwjSkx_v8",
  authDomain: "helper-totem.firebaseapp.com",
  projectId: "helper-totem",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

window.entrar = async function () {
  const email = emailInput.value;
  const senha = senhaInput.value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const userDoc = await getDoc(doc(db, "usuarios", cred.user.uid));

    if (!userDoc.exists() || !userDoc.data().ativo) {
      mensagem.textContent = "❌ Conta não ativada pelo administrador.";
      return;
    }

    // Salva sessão e redireciona
    localStorage.setItem("uid", cred.user.uid);
    window.location.href = "admin.html";

  } catch (err) {
    if (err.message === "Firebase: Error (auth/invalid-login-credentials).") {
        mensagem.textContent = "Usuario e/ou senha incorretos";
    } else {
        mensagem.textContent = "Erro ao entrar: " + err.message;
  }}
};

window.cadastrar = async function () {
  const email = emailInput.value;
  const senha = senhaInput.value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    // Cria usuário no Firestore com ativo: false
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email,
      ativo: false,
    });

    mensagem.textContent = "✅ Conta criada! Aguarde aprovação do administrador.";

  } catch (err) {
    mensagem.textContent = "Erro ao cadastrar: " + err.message;
  }
};
