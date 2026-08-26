import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.resolve(__dirname, '..', 'core.js');
const coreCode = fs.readFileSync(corePath, 'utf-8');

// Remove ESLint directives that could interfere
const cleanCode = coreCode
  .replace(/\/\/ eslint-disable-next-line .*/g, '');

// Evaluate core.js in global scope and expose the module on globalThis
const globalEval = (0, eval);
globalEval(cleanCode + '\n;globalThis.CorePuzzleEnglishDictionaryModule = CorePuzzleEnglishDictionaryModule;');
