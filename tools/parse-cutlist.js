const path = require('path');
const lines = require('fs').readFileSync(path.join(__dirname, '..', 'model', 'openscad-output.txt'), 'utf8').split('\n');

// Pre-compute fraction lookup for 1/16th inch increments
const fractions = new Map();
for (let i = 1; i < 16; i++) {
  const decimal = i / 16;
  // Reduce fraction: find GCD of i and 16
  let a = i, b = 16;
  while (b) { [a, b] = [b, a % b]; }
  const num = i / a, den = 16 / a;
  fractions.set(+decimal.toFixed(4), `${num}/${den}`);
}

function formatSize(size) {
  // Match a number (with optional decimal) followed by "
  return size.replace(/(\d+\.?\d*)"/g, (_, num) => {
    const val = parseFloat(num);
    // Round to nearest 1/16th
    const sixteenths = Math.round(val * 16);
    const whole = Math.floor(sixteenths / 16);
    const rem = sixteenths % 16;
    const wholeStr = String(whole).padStart(3, '0');
    if (rem === 0) return `${wholeStr}"`;
    const fracStr = fractions.get(+(rem / 16).toFixed(4));
    if (fracStr) return whole > 0 ? `${wholeStr}-${fracStr}"` : `${fracStr}"`;
    return `${wholeStr}.${num.split('.')[1]}"`;
  });
}

const counts = new Map();
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('ECHO: "CUTLIST,') && trimmed.endsWith('"')) {
    const raw = trimmed.slice('ECHO: "CUTLIST,'.length, -1);
    const parts = raw.split(',');
    const material = parts[1];
    const qty = parseInt(parts[2], 10);
    const size = parts[3];
    if (!material || !size || isNaN(qty)) {
      continue;
    }
    const formatted = formatSize(size);
    const key = `${material},${formatted}`;
    counts.set(key, (counts.get(key) || 0) + qty);
  }
}
const out = [];
for (const [key, qty] of counts) {
  out.push(`${key},${qty}`);
}
require('fs').writeFileSync(path.join(__dirname, '..', 'model', 'cutlist.csv'), out.join('\n') + '\n', 'utf8');
