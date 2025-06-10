import {FolderDownloader} from '../folder-manager/folder-downloader/FolderDownloader';
import { FolderManager } from '../folder-manager/FolderManager';
import { FolderUploader } from '../folder-manager/folder-uploader/FolderUploader';
import { FileUploader } from './file-uploader';
import { FileDownloader } from './file-downloader';
import { FileManager } from './FileManager';
import path from 'path';

const isBrowser = typeof window !== 'undefined' && typeof process === 'undefined';

// describe('folder upload test', () => {
//   jest.setTimeout(6000000);

//   it('should upload and download a folder with password successfully', async () => {
//     const walrusPublisherUrl = 'http://localhost:5001/v1/blobs?epochs=1';
//     const walrusDownloadUrl = 'http://localhost:5001/v1/blobs';
//     const folderPath = path.resolve('/home/nguyen-viet-anh/Downloads/testfolder');
//     const destinationPath = path.resolve('/home/nguyen-viet-anh/Downloads/testfolder_download');
//     const password = 'Passwordfortest';
//     const folderUploader = FolderUploader.createUploader(walrusPublisherUrl, walrusDownloadUrl, password);
//     const folderDownloader = FolderDownloader.createDownloader();

//     const folderManager = new FolderManager(folderUploader,folderDownloader);

//     try {
//       console.log('Running in:', typeof window !== 'undefined' ? 'Browser' : 'Node.js');

//       // Upload
//       console.time('UploadFolderTime');
//       const uploadResult = await folderManager.uploadFolderWithPassword(folderPath, password);

//       expect(uploadResult).toBeDefined();
//       expect(uploadResult.folderUrl).toBeDefined();
//       expect(uploadResult.uploaded.length).toBeGreaterThan(0);

//       console.log('Folder upload result:', uploadResult);
//       console.timeEnd('UploadFolderTime');

//       // Download
//       console.time('DownloadFolderTime');
//       await folderManager.downloadFolderWithPassword(uploadResult.folderUrl, password, destinationPath);
//       console.log('Folder downloaded successfully');
//       console.timeEnd('DownloadFolderTime');

//     } catch (error) {
//       console.error('Error during folder upload/download:', error);
//       throw error;
//     }
//   });
// });
describe('test', () => {
  jest.setTimeout(6000000);
  it('should upload and download a large file with password successfully', async () => {
    // const walrusPublisherUrl = 'https://sm1-walrus-testnet-publisher.stakesquid.com/v1/blobs?epochs=1';
    // const walrusDownloadUrl = 'https://aggregator.walrus-testnet.walrus.space/v1/blobs';
    const walrusPublisherUrl = 'https://suiftly-testnet-pub.mhax.io/v1/blobs?epochs=1';
    const walrusDownloadUrl = 'https://aggregator.walrus-testnet.walrus.space/v1/blobs';
    const uploadPath = path.resolve('/home/nguyen-viet-anh/Downloads/100MB_downloaded.zip');
    const password = 'Passwordfortest';
    const destinationPath = path.resolve(
      '/home/nguyen-viet-anh/Downloads/100MB_downloadedwithPassword.zip',
    );
    const fileUploader = FileUploader.createUploader(walrusPublisherUrl, walrusDownloadUrl);

    const fileDownloader = FileDownloader.createDownloader();
    const fileManager = new FileManager(fileUploader, fileDownloader);
    try {
      console.log('Running in:', typeof window !== 'undefined' ? 'Browser' : 'Node.js');

      // Upload with password
      console.time('UploadTime');
      const uploadResult = await fileManager.uploadFileWithPassword(uploadPath, password);
      if (!uploadResult) {
        console.error('Upload failed!');
        return;
      }

      // Check upload result
      expect(uploadResult).toBeDefined();
      expect(uploadResult.chunks).toBeDefined();
      expect(uploadResult.chunks.length).toBeGreaterThan(0);
      console.timeEnd('UploadTime');
      console.log('Upload Result:', uploadResult);
      // Download with password
      console.time('DownloadTime');
      await fileManager.downloadFileWithPassword(uploadResult.jsonUrl, password, destinationPath);
      console.log('File downloaded successfully with password');
      console.timeEnd('DownloadTime');
    } catch (error) {
      console.log('Problem during upload with password:', error);
      throw error;
    }
  });
});

// describe('folder upload test', () => {
//   jest.setTimeout(6000000);

//   it('should upload and download a folder with password successfully', async () => {
//     const walrusPublisherUrl = 'http://localhost:5001/v1/blobs?epochs=1';
//     const walrusDownloadUrl = 'http://localhost:5001/v1/blobs';
//     const folderPath = path.resolve('/home/nguyen-viet-anh/Downloads/testfolder');
//     const destinationPath = path.resolve('/home/nguyen-viet-anh/Downloads/testfolder_download');
//     const password = 'Passwordfortest';
//     const folderUploader = FolderUploader.createUploader(walrusPublisherUrl, walrusDownloadUrl, password);
//     const folderDownloader = FolderDownloader.createDownloader();
//     const folderUrl = 'http://localhost:5001/v1/blobs/blob_1744364824153_387';
//     const folderManager = new FolderManager(folderUploader,folderDownloader);

//     try {
//       console.log('Running in:', typeof window !== 'undefined' ? 'Browser' : 'Node.js');
//       // Download
//       console.time('DownloadFolderTime');
//       await folderManager.downloadFolderWithPassword(folderUrl, password, destinationPath);
//       console.log('Folder downloaded successfully');
//       console.timeEnd('DownloadFolderTime');

//     } catch (error) {
//       console.error('Error during folder upload/download:', error);
//       throw error;
//     }
//   });
// });