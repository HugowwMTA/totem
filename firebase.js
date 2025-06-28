// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// 🔐 Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD99qCTblkAC9z0fL6hJRtjl1uwjSkx_v8",
  authDomain: "helper-totem.firebaseapp.com",
  projectId: "helper-totem",
  storageBucket: "helper-totem.firebasestorage.app",
  messagingSenderId: "926802689497",
  appId: "1:926802689497:web:1eddd7fee0371f7215edc8",
  measurementId: "G-8WZ9EV6Y7R"
};

// 🔧 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 📦 Exporta o que for necessário
export {
  db,
  auth,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc
};
