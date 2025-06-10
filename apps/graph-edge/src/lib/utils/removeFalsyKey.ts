export const removeFalsyKey = <T>(object: T): Partial<T> => {
  const result: Partial<T> = {};

  for (const key in object) {
    if (object[key] !== undefined && object[key] !== null) {
      result[key] = object[key];
    }
  }

  return result;
};
