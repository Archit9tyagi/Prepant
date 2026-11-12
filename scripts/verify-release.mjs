import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  ['run', 'typecheck'],
  ['run', 'lint'],
  ['test', '--', '--run'],
  ['run', 'build'],
  ['audit', '--omit=dev', '--audit-level=moderate'],
];

for (const args of commands) {
  const result = spawnSync(npm, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
