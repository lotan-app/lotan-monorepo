import * as fs from 'fs';

export const getMemInfo = (): { total: number; free: number } => {
  const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
  const lines = memInfo.split('\n');

  const totalMem = parseInt(lines.find(line => line.startsWith('MemTotal')).match(/\d+/)[0], 10);
  const freeMem = parseInt(lines.find(line => line.startsWith('MemAvailable')).match(/\d+/)[0], 10);

  return {
    total: totalMem,
    free: freeMem,
  };
};
