export const uniqueElementArray = <T>(arrays: T[], id: string): T[] => {
  const uniqueArray: T[] = [];

  for (const item of arrays) {
    if (!uniqueArray.find(uniqueElement => uniqueElement[id] === item[id])) {
      uniqueArray.push(item);
    }
  }

  return uniqueArray;
};
