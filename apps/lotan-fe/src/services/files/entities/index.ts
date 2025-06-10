import { STATUS_FILE_UPLOAD } from '@App/config/constants';

export interface ITimeRangeFile {
  startTime: number;
  endTime: number;
}

export interface IUploadUrl {
  url: string;
  fileLimit: number;
}

export interface IParamGetUserFile {
  size: number;
  page: number;
  txtSearch?: string;
  startTime?: number;
  endTime?: number;
  account: string;
  isCache?: boolean;
}

export interface IUploadData {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: STATUS_FILE_UPLOAD;
  file: File;
  fileBase?: any;
  controller?: AbortController;
  isResume?: boolean;
}

export interface IFileItemData {
  blobID: string;
  createdAt: string;
  fileName: string;
  size: number;
  updateAt: string;
  createAt?: string;
  jsonUrl?: string;
  fileSystem?: any;
  _id: string;
}

export interface IDownloadData extends IFileItemData {
  progress: number;
  status: STATUS_FILE_UPLOAD;
  isResume?: boolean;
}

export interface IPaginationData {
  total: number;
  page: number;
  size: number;
}

export interface IFileDataState {
  uploadData: IUploadData[];
  listFile: IFileItemData[];
  pagination: IPaginationData;
  newUpload: string[];
  downloadData: IDownloadData[];
}
