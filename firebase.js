// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD99qCTblkAC9z0fL6hJRtjl1uwjSkx_v8",
  authDomain: "helper-totem.firebaseapp.com",
  projectId: "helper-totem",
  storageBucket: "helper-totem.firebasestorage.app",
  messagingSenderId: "926802689497",
  appId: "1:926802689497:web:1eddd7fee0371f7215edc8",
  measurementId: "G-8WZ9EV6Y7R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, doc, deleteDoc, setDoc };
