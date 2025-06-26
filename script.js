import { db, collection, addDoc, getDocs } from "./firebase.js";

let produtos = [];

const destaquesDiv = document.getElementById('destaques');
const resultadosDiv = document.getElementById('resultados');
const voltarBtn = document.getElementById('voltarBtn');
const ajudaTela = document.getElementById('ajudaTela');

const searchInput = document.getElementById("searchInput");
const searchButton = document.querySelector('button[onclick="buscarProduto()"]');

// Desabilita busca enquanto carrega produtos
searchInput.disabled = true;
searchButton.disabled = true;

async function carregarProdutos() {
  produtos = [];
  const querySnapshot = await getDocs(collection(db, "produtos"));
  querySnapshot.forEach((doc) => {
    produtos.push(doc.data());
  });
  mostrarDestaques();

  // Habilita busca após carregar produtos
  searchInput.disabled = false;
  searchButton.disabled = false;
}

function mostrarDestaques() {
  destaquesDiv.innerHTML = '';
  produtos.filter(p => p.destaque).forEach(p => {
    const div = criarCardProduto(p);
    destaquesDiv.appendChild(div);
  });
}

function criarCardProduto(produto) {
  const div = document.createElement("div");
  div.className = "product-card";

  const srcImg = produto.foto.startsWith('http://') || produto.foto.startsWith('https://') 
    ? produto.foto 
    : `img/products/${produto.foto}`;

  div.innerHTML = `
    <img src="${srcImg}" alt="${produto.nome}">
    <h3>${produto.nome}</h3>
    <p>R$ ${produto.preco.toFixed(2)}</p>
    <span>${produto.localizacao}</span>
  `;
  return div;
}

function salvarBuscaLocal(termo) {
  const buscas = JSON.parse(localStorage.getItem("buscas")) || [];
  buscas.push(termo);
  localStorage.setItem("buscas", JSON.stringify(buscas));
}

function buscarProduto() {
  let termo = searchInput.value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!termo) return;

  salvarBuscaLocal(termo);
  salvarBuscaFirestore(termo);  // CHAMADA NOVA

  const encontrados = produtos.filter(p => {
    const nome = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const marca = p.marca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nome.includes(termo) || marca.includes(termo);
  });
  
  resultadosDiv.innerHTML = '';
  resultadosDiv.style.display = 'flex';
  voltarBtn.style.display = 'inline-block';

  if (encontrados.length === 0) {
    resultadosDiv.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  encontrados.forEach(p => {
    const card = criarCardProduto(p);
    resultadosDiv.appendChild(card);
  });
}

async function salvarBuscaFirestore(termo) {
  try {
    await addDoc(collection(db, "buscas"), { termo, timestamp: new Date() });
  } catch (err) {
    console.error("Erro ao salvar busca no Firestore:", err);
  }
}

function resetarBusca() {
  resultadosDiv.style.display = 'none';
  voltarBtn.style.display = 'none';
  searchInput.value = '';
  mostrarDestaques();
}

function iniciarInatividade() {
  let tempo = 0;
  document.body.addEventListener('mousemove', resetarTimer);
  document.body.addEventListener('touchstart', resetarTimer);
  document.body.addEventListener('keydown', resetarTimer);

  function resetarTimer() {
    clearTimeout(tempo);
    tempo = setTimeout(() => {
      ajudaTela.style.display = 'flex';
      resetarBusca();
    }, 45000);
  }
  resetarTimer();
}

function fecharAjuda() {
  ajudaTela.style.display = 'none';
}

carregarProdutos();
iniciarInatividade();

window.buscarProduto = buscarProduto;
window.resetarBusca = resetarBusca;
window.fecharAjuda = fecharAjuda;
