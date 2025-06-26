import { db, collection, getDocs, doc, deleteDoc, setDoc } from "./firebase.js";

const form = document.getElementById('produtoForm');
const lista = document.getElementById('listaProdutos');

const buscaInput = document.getElementById('buscaInput');
const filtroMarca = document.getElementById('filtroMarca');
const filtroDestaque = document.getElementById('filtroDestaque');

const navButtons = document.querySelectorAll('.nav-btn');
const produtosSection = document.getElementById('produtosSection');
const buscaSection = document.getElementById('buscaSection');

let produtos = [];

// 🔁 Carrega produtos do Firestore
async function carregarProdutos() {
  produtos = [];
  const querySnapshot = await getDocs(collection(db, "produtos"));
  querySnapshot.forEach((doc) => {
    produtos.push(doc.data());
  });
  atualizarFiltroMarcas();
  renderizarProdutos();
}
carregarProdutos();

// 💾 Salva produto no Firestore
async function salvarProdutoNoFirestore(produto) {
  const id = produto.nome.toLowerCase().replace(/\s+/g, '-');
  await setDoc(doc(db, "produtos", id), produto);
}

// 🗑️ Remove produto do Firestore e da lista
async function removerProduto(index) {
  if (confirm('Tem certeza que deseja remover este produto?')) {
    const produto = produtos[index];
    const id = produto.nome.toLowerCase().replace(/\s+/g, '-');

    try {
      await deleteDoc(doc(db, "produtos", id));
      produtos.splice(index, 1);
      atualizarFiltroMarcas();
      renderizarProdutos();
      alert("✅ Produto removido com sucesso!");
    } catch (erro) {
      console.error("Erro ao remover do Firestore:", erro);
      alert("❌ Erro ao remover o produto do Firebase.");
    }
  }
}

// 🖼️ Renderiza produtos com filtros
function renderizarProdutos() {
  const buscaValor = buscaInput.value.trim().toLowerCase();
  const marcaFiltro = filtroMarca.value;
  const destaqueFiltro = filtroDestaque.value;

  const filtrados = produtos.filter(p => {
    const nomeMatch = p.nome.toLowerCase().includes(buscaValor);
    const marcaMatch = marcaFiltro ? p.marca === marcaFiltro : true;
    const destaqueMatch =
      destaqueFiltro === ''
        ? true
        : destaqueFiltro === 'true'
        ? p.destaque === true
        : p.destaque === false;

    return nomeMatch && marcaMatch && destaqueMatch;
  });

  lista.innerHTML = '';

  if (filtrados.length === 0) {
    lista.innerHTML = '<p style="text-align:center; width:100%;">Nenhum produto encontrado.</p>';
    return;
  }

  filtrados.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.foto}" alt="${p.nome}" />
      <h3>${p.nome}</h3>
      <p><strong>Marca:</strong> ${p.marca}</p>
      <p><strong>Preço:</strong> R$ ${p.preco.toFixed(2)}</p>
      <p><strong>Localização:</strong> ${p.localizacao}</p>
      <p class="destaque">${p.destaque ? '🌟 Produto em destaque' : ''}</p>
      <div class="acoes">
        <button class="editar" onclick="editarProduto(${produtos.indexOf(p)})">✏️ Editar</button>
        <button class="remover" onclick="removerProduto(${produtos.indexOf(p)})">🗑️ Remover</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

// 🔁 Atualiza filtros com base nas marcas dos produtos
function atualizarFiltroMarcas() {
  const marcas = [...new Set(produtos.map(p => p.marca))].sort();
  filtroMarca.innerHTML = '<option value="">Todas as marcas</option>';
  marcas.forEach(marca => {
    const option = document.createElement('option');
    option.value = marca;
    option.textContent = marca;
    filtroMarca.appendChild(option);
  });
}

// 📥 Submissão do formulário de produto
form.addEventListener('submit', async e => {
  e.preventDefault();

  const produto = {
    nome: form.nome.value.trim(),
    marca: form.marca.value.trim(),
    preco: parseFloat(form.preco.value),
    localizacao: form.localizacao.value.trim(),
    foto: form.foto.value.trim(),
    destaque: form.destaque.checked
  };

  const editIndex = form.editIndex.value;

  await salvarProdutoNoFirestore(produto);

  if (editIndex === '') {
    produtos.push(produto);
  } else {
    produtos[editIndex] = produto;
  }

  form.reset();
  form.editIndex.value = '';
  atualizarFiltroMarcas();
  renderizarProdutos();
  alert('✅ Produto salvo no Firebase!');
});

// ✏️ Edita produto
function editarProduto(index) {
  const p = produtos[index];
  form.nome.value = p.nome;
  form.marca.value = p.marca;
  form.preco.value = p.preco;
  form.localizacao.value = p.localizacao;
  form.foto.value = p.foto;
  form.destaque.checked = p.destaque;
  form.editIndex.value = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 📊 Gera relatório de buscas
async function gerarRelatorioBuscas() {
  const querySnapshot = await getDocs(collection(db, "buscas"));
  const contagem = {};

  querySnapshot.forEach((doc) => {
    const dados = doc.data();
    const termo = dados.termo;
    contagem[termo] = (contagem[termo] || 0) + 1;
  });

  const todasBuscas = Object.entries(contagem).sort((a, b) => b[1] - a[1]);

  const tbody = document.getElementById('tbodyBuscas');
  tbody.innerHTML = '';

  if (todasBuscas.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="2" style="text-align:center; padding: 15px; color: #999;">
        Nenhuma busca registrada ainda.
      </td></tr>`;
    return;
  }

  todasBuscas.forEach(([termo, qtd]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${termo}</td><td>${qtd}</td>`;
    tbody.appendChild(tr);
  });
}

// 🔁 Navegação entre abas
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.target === 'produtosSection') {
      produtosSection.classList.add('section-active');
      produtosSection.classList.remove('section-inactive');
      buscaSection.classList.add('section-inactive');
      buscaSection.classList.remove('section-active');
    } else {
      buscaSection.classList.add('section-active');
      buscaSection.classList.remove('section-inactive');
      produtosSection.classList.add('section-inactive');
      produtosSection.classList.remove('section-active');
      gerarRelatorioBuscas();
    }
  });
});

// 🎯 Eventos de filtros ao digitar/mudar
buscaInput.addEventListener('input', renderizarProdutos);
filtroMarca.addEventListener('change', renderizarProdutos);
filtroDestaque.addEventListener('change', renderizarProdutos);

// 🌐 Deixar funções globais (para os botões inline)
window.editarProduto = editarProduto;
window.removerProduto = removerProduto;
