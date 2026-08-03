const fs = require('fs');
const path = require('path');

// Arquivo físico do "banco de dados" (persistente em disco, 100% JavaScript,
// sem nenhuma dependência nativa/compilada — funciona em qualquer sistema).
const DB_FILE = path.join(__dirname, 'deepguard.db.json');

function loadRaw() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { nextUserId: 1, nextHistoryId: 1, users: [], history: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(content);
}

function saveRaw(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------
// USUÁRIOS
// ---------------------------------------------------------------
function getUserById(id) {
  const data = loadRaw();
  const u = data.users.find(u => u.id === id);
  if (!u) return null;
  const { password_hash, ...safe } = u;
  return safe;
}

function getUserByUsername(username) {
  const data = loadRaw();
  return data.users.find(u => u.username === username) || null;
}

function getUserByEmailOrUsername(email, username) {
  const data = loadRaw();
  return data.users.find(u => u.email === email || u.username === username) || null;
}

function insertUser(email, username, passwordHash) {
  const data = loadRaw();
  const id = data.nextUserId++;
  const user = {
    id,
    email,
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  data.users.push(user);
  saveRaw(data);
  return id;
}

// ---------------------------------------------------------------
// HISTÓRICO
// ---------------------------------------------------------------
function insertHistory(userId, tipo, origem, resultado) {
  const data = loadRaw();
  const id = data.nextHistoryId++;
  data.history.push({
    id,
    user_id: userId,
    tipo,
    origem,
    resultado,
    created_at: new Date().toISOString()
  });
  saveRaw(data);
}

function listHistoryByUser(userId) {
  const data = loadRaw();
  return data.history
    .filter(h => h.user_id === userId)
    .sort((a, b) => b.id - a.id)
    .map(({ user_id, ...rest }) => rest);
}

function countersByUser(userId) {
  const data = loadRaw();
  const rows = data.history.filter(h => h.user_id === userId);
  return {
    total: rows.length,
    deepfakes: rows.filter(r => r.resultado === 'DEEPFAKE').length,
    autenticos: rows.filter(r => r.resultado === 'AUTÊNTICO').length,
    suspeitos: rows.filter(r => r.resultado === 'SUSPEITOS').length
  };
}

module.exports = {
  getUserById,
  getUserByUsername,
  getUserByEmailOrUsername,
  insertUser,
  insertHistory,
  listHistoryByUser,
  countersByUser
};
