import { fileManager } from './fileManager';

export const downloadFile = async (url: string, destinationPath: string) => {
  await fileManager.downloadFile(url, destinationPath);
};
