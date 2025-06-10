import { FileDownloader, FileManager, WalrusFileUploader } from '@lotan/sdk';
export const walrusPublisherUrl = 'https://wal-publisher-testnet.staketab.org/v1/blobs?epochs=5';
export const walrusDownloadUrl = 'https://aggregator.walrus-testnet.walrus.space/v1/blobs';

const fileDownloader = new FileDownloader();
const fileUploader = new WalrusFileUploader(walrusPublisherUrl, walrusDownloadUrl);
export const fileManager = new FileManager(fileUploader, fileDownloader);
