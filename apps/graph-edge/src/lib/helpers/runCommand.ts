import { exec } from 'child_process';

export const runCommand = (command: string, stepName: string) => {
  console.log(`\n--- ${stepName} ---`);
  console.log(`\n--- ${command} ---`);
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Error at step "${stepName}":`, err.message);
        return reject(err);
      }

      if (stderr) {
        console.error(`⚠️ Warnning at step "${stepName}":`, stderr);
      }

      resolve(stdout);
    });
  });
};
