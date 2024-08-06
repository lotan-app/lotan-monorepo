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
  controller: AbortController;
}

export interface IFileItemData {
  blobID: string;
  createdAt: string;
  fileName: string;
  size: number;
  updateAt: string;
  createAt?: string;
  _id: string;
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
}
