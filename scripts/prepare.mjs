import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const huskyBin = join(process.cwd(), 'node_modules', 'husky', 'bin.js');

if (!existsSync(huskyBin)) {
  console.log('Husky is not installed; skipping Git hook setup.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [huskyBin], { stdio: 'inherit' });

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
