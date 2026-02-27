import { cpSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '../node_modules/@timephy/rnnoise-wasm/dist');
const dest = join(__dirname, '../public/rnnoise');

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('Copied RNNoise worklet to public/rnnoise');
