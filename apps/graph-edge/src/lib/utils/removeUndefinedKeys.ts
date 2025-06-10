export const removeUndefinedKeys = <T>(object: Partial<T>): Partial<T> => {
  const newObject: Partial<T> = {};

  Object.keys(object).forEach(key => {
    if (object[key] === undefined) {
      return;
    }

    newObject[key] = object[key];
  });

  return newObject;
};
