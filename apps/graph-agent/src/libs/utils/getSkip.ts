export const getSkip = (page: number, size: number): number => {
  return (page - 1) * size;
};
