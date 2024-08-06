import { RootState } from "@App/rootStores";

export const selectorUploadData = (state: RootState) => {
  return state.fileData.uploadData;
};

export const selectorListFile = (state: RootState) => {
  return state.fileData.listFile;
};

export const selectorPagination = (state: RootState) => {
  return state.fileData.pagination;
};

export const selectorNewUpload = (state: RootState) => {
  return state.fileData.newUpload;
};
