import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(__dirname, '..', 'content', 'store.js');
const storeCode = fs.readFileSync(storePath, 'utf-8');

// Remove ESLint directives that could interfere
const cleanCode = storeCode
  .replace(/\/\/ eslint-disable-next-line .*/g, '');

// Evaluate store.js in global scope and expose Store and ExtStore
const globalEval = (0, eval);
globalEval(cleanCode + '\n;globalThis.Store = Store; globalThis.ExtStore = ExtStore;');
