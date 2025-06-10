export const delay = (timeSeconds: number) =>
  new Promise(resolve => {
    setTimeout(resolve, timeSeconds);
  });
