const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Modelo do Livro
const Livro = sequelize.define('Livro', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  autor: { type: DataTypes.STRING, allowNull: false },
  anoPublicacao: { type: DataTypes.INTEGER },
  genero: { type: DataTypes.STRING },
  descricao: { type: DataTypes.TEXT },
  disponivel: { type: DataTypes.BOOLEAN, defaultValue: true },
  imagem: { type: DataTypes.STRING, defaultValue: 'default-book.jpg' }
});

// Sincronizar banco de dados
sequelize.sync()
  .then(() => console.log('Banco de dados conectado'))
  .catch(err => console.error('Erro no banco de dados:', err));

// Rotas CRUD
// Listar todos os livros
app.get('/api/livros', async (req, res) => {
  try {
    const livros = await Livro.findAll();
    res.json(livros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter um livro
app.get('/api/livros/:id', async (req, res) => {
  try {
    const livro = await Livro.findByPk(req.params.id);
    livro ? res.json(livro) : res.status(404).json({ message: 'Livro não encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar livro
app.post('/api/livros', async (req, res) => {
  try {
    const livro = await Livro.create(req.body);
    res.status(201).json(livro);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Atualizar livro
app.put('/api/livros/:id', async (req, res) => {
  try {
    const [updated] = await Livro.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const livroAtualizado = await Livro.findByPk(req.params.id);
      res.json(livroAtualizado);
    } else {
      res.status(404).json({ message: 'Livro não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deletar livro
app.delete('/api/livros/:id', async (req, res) => {
  try {
    const deleted = await Livro.destroy({ where: { id: req.params.id } });
    deleted ? res.json({ message: 'Livro deletado' }) : res.status(404).json({ message: 'Livro não encontrado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});