import { Compressor } from '@lotan/sdk';

export const unzipFile = async (zipFilePath: string, destination: string) => {
  const compressor = new Compressor();
  await compressor.decompress(zipFilePath, destination);
};
