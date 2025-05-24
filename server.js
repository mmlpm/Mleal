const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const createRoutes = (entity) => {
  app.get(`/api/${entity}`, (req, res) => {
    const db = readDB();
    res.json(db[entity] || []);
  });

  app.post(`/api/${entity}`, (req, res) => {
    const db = readDB();
    const newItem = { id: Date.now(), ...req.body };
    db[entity] = db[entity] || [];
    db[entity].push(newItem);
    writeDB(db);
    res.status(201).json(newItem);
  });

  app.put(`/api/${entity}/:id`, (req, res) => {
    const db = readDB();
    const items = db[entity] || [];
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Not Found');
    items[index] = { ...items[index], ...req.body };
    db[entity] = items;
    writeDB(db);
    res.json(items[index]);
  });

  app.delete(`/api/${entity}/:id`, (req, res) => {
    const db = readDB();
    db[entity] = (db[entity] || []).filter(i => i.id !== parseInt(req.params.id));
    writeDB(db);
    res.status(204).send();
  });
};

['pacientes', 'planos', 'concierge', 'agenda'].forEach(createRoutes);

app.get('/api/financeiro', (req, res) => {
  res.json({
    receitaMes: 65450,
    receitaRecorrente: 180900,
    inadimplencia: 4200,
    ticketMedio: 540
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});