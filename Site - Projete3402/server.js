const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'deepguard-ai-troque-este-segredo',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));

// -----------------------------------------------------------------
// MIDDLEWARE DE AUTENTICAÇÃO
// -----------------------------------------------------------------
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  next();
}

// -----------------------------------------------------------------
// ROTAS DE AUTENTICAÇÃO
// -----------------------------------------------------------------

// Cadastro de novo usuário
app.post('/api/register', (req, res) => {
  const { email, username, password } = req.body || {};

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Preencha e-mail, usuário e senha.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const existing = db.getUserByEmailOrUsername(email, username);
  if (existing) {
    return res.status(409).json({ error: 'E-mail ou usuário já cadastrado.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newId = db.insertUser(email, username, passwordHash);

  req.session.userId = newId;
  res.status(201).json({ user: db.getUserById(newId) });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Informe usuário e senha.' });
  }

  const user = db.getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Usuário ou senha incorretos!' });
  }

  req.session.userId = user.id;
  res.json({ user: db.getUserById(user.id) });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// Retorna o usuário logado (usado para restaurar sessão ao recarregar a página)
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autenticado.' });
  const user = db.getUserById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ user });
});

// -----------------------------------------------------------------
// ROTAS DE HISTÓRICO E CONTADORES (por usuário)
// -----------------------------------------------------------------

// Lista o histórico e os contadores do usuário logado
app.get('/api/history', requireAuth, (req, res) => {
  res.json({
    history: db.listHistoryByUser(req.session.userId),
    counters: db.countersByUser(req.session.userId)
  });
});

// Registra uma nova análise no histórico do usuário logado
app.post('/api/history', requireAuth, (req, res) => {
  const { tipo, origem, resultado } = req.body || {};
  const resultadosValidos = ['DEEPFAKE', 'AUTÊNTICO', 'SUSPEITOS'];

  if (!tipo || !origem || !resultadosValidos.includes(resultado)) {
    return res.status(400).json({ error: 'Dados de análise inválidos.' });
  }

  db.insertHistory(req.session.userId, tipo, origem, resultado);

  res.status(201).json({
    history: db.listHistoryByUser(req.session.userId),
    counters: db.countersByUser(req.session.userId)
  });
});

app.listen(PORT, () => {
  console.log(`DeepGuard AI rodando em http://localhost:${PORT}`);
});
