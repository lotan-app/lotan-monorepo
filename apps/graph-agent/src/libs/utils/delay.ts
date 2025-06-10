export const delay = (timeMs: number) =>
  new Promise(resolve => {
    setTimeout(resolve, timeMs);
  });
