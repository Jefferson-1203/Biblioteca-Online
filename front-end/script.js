document.addEventListener('DOMContentLoaded', function() {
  // Elementos da UI
  const livrosSection = document.getElementById('livros-section');
  const adicionarSection = document.getElementById('adicionar-section');
  const navLivros = document.getElementById('nav-livros');
  const navAdicionar = document.getElementById('nav-adicionar');
  const livroForm = document.getElementById('livro-form');
  const cancelarBtn = document.getElementById('cancelar');
  const livrosContainer = document.getElementById('livros-container');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  // Variáveis de estado
  let livros = [];
  let modoEdicao = false;

  // Event Listeners
  navLivros.addEventListener('click', mostrarLivros);
  navAdicionar.addEventListener('click', mostrarFormulario);
  cancelarBtn.addEventListener('click', cancelarEdicao);
  livroForm.addEventListener('submit', salvarLivro);
  searchButton.addEventListener('click', buscarLivros);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscarLivros();
  });

  // Inicialização
  carregarLivros();
  mostrarLivros();

  // Funções
  async function carregarLivros() {
    try {
      const response = await fetch('http://localhost:3000/api/livros');
      if (!response.ok) throw new Error('Erro ao carregar livros');
      livros = await response.json();
      renderizarLivros(livros);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar livros');
    }
  }

  function renderizarLivros(livrosParaRenderizar) {
    livrosContainer.innerHTML = '';
    
    if (livrosParaRenderizar.length === 0) {
      livrosContainer.innerHTML = '<p class="no-books">Nenhum livro encontrado.</p>';
      return;
    }

    livrosParaRenderizar.forEach(livro => {
      const livroCard = document.createElement('div');
      livroCard.className = 'livro-card';
      
      livroCard.innerHTML = `
        <img src="${livro.imagem || 'default-book.jpg'}" alt="${livro.titulo}" class="livro-imagem">
        <div class="livro-info">
          <h3 class="livro-titulo">${livro.titulo}</h3>
          <p class="livro-autor">${livro.autor}</p>
          <p class="livro-descricao">${livro.descricao || 'Sem descrição disponível.'}</p>
          <div>
            <span class="livro-ano">${livro.anoPublicacao || 'N/A'}</span>
            <span class="livro-genero">${livro.genero || 'Sem gênero'}</span>
          </div>
          <span class="livro-disponivel ${livro.disponivel ? '' : 'livro-indisponivel'}">
            ${livro.disponivel ? 'Disponível' : 'Indisponível'}
          </span>
          <div class="livro-actions">
            <button class="btn btn-primary editar" data-id="${livro.id}">Editar</button>
            <button class="btn btn-danger deletar" data-id="${livro.id}">Deletar</button>
          </div>
        </div>
      `;
      
      livrosContainer.appendChild(livroCard);
    });

    // Adicionar event listeners aos botões
    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', editarLivro);
    });

    document.querySelectorAll('.deletar').forEach(btn => {
      btn.addEventListener('click', deletarLivro);
    });
  }

  function mostrarLivros(e) {
    if (e) e.preventDefault();
    livrosSection.classList.remove('hidden');
    adicionarSection.classList.add('hidden');
    navLivros.classList.add('active');
    navAdicionar.classList.remove('active');
    modoEdicao = false;
    livroForm.reset();
    document.getElementById('livro-id').value = '';
  }

  function mostrarFormulario(e) {
    e.preventDefault();
    livrosSection.classList.add('hidden');
    adicionarSection.classList.remove('hidden');
    navLivros.classList.remove('active');
    navAdicionar.classList.add('active');
  }

  function cancelarEdicao() {
    mostrarLivros();
  }

  async function salvarLivro(e) {
    e.preventDefault();
    
    const livroId = document.getElementById('livro-id').value;
    const livroData = {
      titulo: document.getElementById('titulo').value,
      autor: document.getElementById('autor').value,
      anoPublicacao: document.getElementById('ano').value || null,
      genero: document.getElementById('genero').value || null,
      descricao: document.getElementById('descricao').value || null,
      imagem: document.getElementById('imagem').value || null,
      disponivel: true
    };

    try {
      let response;
      if (modoEdicao && livroId) {
        // Atualizar livro existente
        response = await fetch(`http://localhost:3000/api/livros/${livroId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(livroData)
        });
      } else {
        // Criar novo livro
        response = await fetch('http://localhost:3000/api/livros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(livroData)
        });
      }

      if (!response.ok) throw new Error('Erro ao salvar livro');
      
      const livroSalvo = await response.json();
      console.log('Livro salvo:', livroSalvo);
      
      mostrarLivros();
      carregarLivros();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar livro');
    }
  }

  async function editarLivro(e) {
    const livroId = e.target.getAttribute('data-id');
    try {
      const response = await fetch(`http://localhost:3000/api/livros/${livroId}`);
      if (!response.ok) throw new Error('Erro ao carregar livro para edição');
      
      const livro = await response.json();
      
      // Preencher formulário
      document.getElementById('livro-id').value = livro.id;
      document.getElementById('titulo').value = livro.titulo;
      document.getElementById('autor').value = livro.autor;
      document.getElementById('ano').value = livro.anoPublicacao || '';
      document.getElementById('genero').value = livro.genero || '';
      document.getElementById('descricao').value = livro.descricao || '';
      document.getElementById('imagem').value = livro.imagem || '';
      
      modoEdicao = true;
      mostrarFormulario(e);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar livro para edição');
    }
  }

  async function deletarLivro(e) {
    if (!confirm('Tem certeza que deseja deletar este livro?')) return;
    
    const livroId = e.target.getAttribute('data-id');
    try {
      const response = await fetch(`http://localhost:3000/api/livros/${livroId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao deletar livro');
      
      carregarLivros();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar livro');
    }
  }

  function buscarLivros() {
    const termo = searchInput.value.toLowerCase();
    if (!termo) {
      renderizarLivros(livros);
      return;
    }
    
    const livrosFiltrados = livros.filter(livro => 
      livro.titulo.toLowerCase().includes(termo) || 
      livro.autor.toLowerCase().includes(termo) ||
      (livro.genero && livro.genero.toLowerCase().includes(termo))
    );
    
    renderizarLivros(livrosFiltrados);
  }
});