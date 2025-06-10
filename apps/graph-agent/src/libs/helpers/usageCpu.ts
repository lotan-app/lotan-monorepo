import * as fs from 'fs';

const getCPUStats = () => {
  const stat = fs.readFileSync('/proc/stat', 'utf8');
  const cpuLine = stat.split('\n').find(line => line.startsWith('cpu '));
  const values = cpuLine.split(/\s+/).slice(1).map(Number);
  const [user, nice, system, idle, iowait, irq, softirq, steal] = values;

  // Total time = all fields added together
  const total = values.reduce((acc, val) => acc + val, 0);

  // Active time = total - idle - iowait
  const active = total - idle - iowait;

  return { total, active };
};

export const getCPUUsage = (): Promise<number> =>
  new Promise(resolve => {
    const start = getCPUStats();
    setTimeout(() => {
      const end = getCPUStats();

      const totalDiff = end.total - start.total;
      const activeDiff = end.active - start.active;

      const cpuUsage = (activeDiff / totalDiff) * 100;
      resolve(Number(cpuUsage.toFixed(2)));
    }, 1000);
  });
