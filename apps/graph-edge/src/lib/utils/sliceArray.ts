export const sliceArray = <T>(arrays: T[], sliceOfElement: number): T[][] => {
  const totalSlices: T[][] = [];

  for (let i = 0; i < arrays.length; i += sliceOfElement) {
    totalSlices.push(arrays.slice(i, i + sliceOfElement));
  }

  return totalSlices;
};
