import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'employees.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getNextId(employees) {
  return employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
}

app.get('/api/employees', (_req, res) => {
  const employees = readData();
  res.json(employees);
});

app.get('/api/employees/:id', (req, res) => {
  const employees = readData();
  const emp = employees.find(e => e.id === Number(req.params.id));
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  res.json(emp);
});

app.post('/api/employees', (req, res) => {
  const employees = readData();
  const emp = {
    id: getNextId(employees),
    ...req.body,
    joined: new Date().toISOString().split('T')[0],
  };
  employees.push(emp);
  writeData(employees);
  res.status(201).json(emp);
});

app.put('/api/employees/:id', (req, res) => {
  const employees = readData();
  const idx = employees.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  employees[idx] = { ...employees[idx], ...req.body, id: employees[idx].id };
  writeData(employees);
  res.json(employees[idx]);
});

app.delete('/api/employees/:id', (req, res) => {
  let employees = readData();
  const idx = employees.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  employees = employees.filter(e => e.id !== Number(req.params.id));
  writeData(employees);
  res.json({ message: 'Employee deleted' });
});

app.listen(PORT, () => {
  console.log(`EMS Backend running at http://localhost:${PORT}`);
});
