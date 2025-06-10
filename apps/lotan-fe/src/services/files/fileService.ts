import client from '@App/common/services/graphql';
import { graphUploadUrl } from './graphql/GetUploadUrl';
import { IFileItemData, IPaginationData, IParamGetUserFile, IUploadData, IUploadUrl, IDownloadData } from './entities';
import { graphGetUserFiles } from './graphql/GetUserFiles';
import { graphDeleteFile } from './graphql/DeleteFile';
import { graphCreateUploadFile } from './graphql/CreateUploadFile';
import { AppDispatch, RootState } from '@App/rootStores';
import fileDataSlice from './fileSlice';
import { aggregatorUrl, publisherUrl, STATUS_FILE_UPLOAD } from '@App/config/constants';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import moment from 'moment';
import { FileUploaderWeb, FileWebDownloader } from '@lotan/sdk';
import { setShowMinify } from '../setting/settingService';
import { addFile, deleteFile, getAllFiles } from '@App/common/services/indexedDB/uploadDB';
import { addDownloadFile, deleteDownloadFileId, getAllDownloadFiles } from '@App/common/services/indexedDB/downloadDB';

export const getUploadUrl = async (account: string): Promise<IUploadUrl> => {
  const res = await client.query({
    query: graphUploadUrl,
    context: {
      requiredAuth: true,
      account,
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getUploadUrl;
};

export const getUserFile =
  ({ size, page, txtSearch, startTime, endTime, account }: IParamGetUserFile) =>
  async (dispatch: AppDispatch) => {
    const res = await client.query({
      query: graphGetUserFiles,
      variables: {
        size,
        page,
        txtSearch,
        startTime,
        endTime,
      },
      fetchPolicy: 'no-cache',
      context: {
        requiredAuth: true,
        account,
      },
    });
    const userFiles = res.data.getUserFiles;
    dispatch(
      fileDataSlice.actions.setListFile({
        data: userFiles.items,
        pagination: {
          total: userFiles.total,
          page: userFiles.page,
          size: userFiles.size,
        },
      }),
    );
    return userFiles;
  };

export const setListFile =
  (data: IFileItemData[], pagination: IPaginationData) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setListFile({ data, pagination }));
  };

export const addLocalFile =
  (item: IFileItemData) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setLocalFile(item));
  };

export const deleteListFile = async (ids: string[], account: string) => {
  await client.mutate({
    mutation: graphDeleteFile,
    variables: {
      ids,
    },
    context: {
      requiredAuth: true,
      account,
    },
  });
};

export const createUserFile = async (fileName: string, blobID: string, account: string) => {
  const res = await client.mutate({
    mutation: graphCreateUploadFile,
    variables: {
      fileName,
      blobID,
    },
    context: {
      requiredAuth: true,
      account,
    },
  });
  return res.data.createUserFile;
};

export const uploadFile =
  (files: IUploadData[], account: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const uploadUrl = await getUploadUrl(account);
      const uploadPromises = files.map(item => {
        return axios
          .put(uploadUrl.url, item.file, {
            signal: item.controller.signal,
            onUploadProgress: event => {
              const percent = Math.round((event.loaded * 100) / event.total);
              dispatch(changeProcessData(percent, item.id));
            },
          })
          .then(async response => {
            const blobId = response.data?.newlyCreated?.blobObject?.blobId ?? response.data?.alreadyCertified?.blobId;
            if (!account) {
              const date = new Date();
              const _id = `${item.name}_${item.size}_${uuidv4()}`;
              dispatch(changeStatusData(STATUS_FILE_UPLOAD.FINISH, item.id));
              dispatch(
                addLocalFile({
                  _id,
                  blobID: blobId,
                  createdAt: date.toString(),
                  fileName: item.name,
                  size: item.size,
                  updateAt: '',
                }),
              );
              dispatch(setNewUpload(_id));
              return;
            }
            const uploadItem = await createUserFile(item.name, blobId, account);
            dispatch(setNewUpload(uploadItem._id));
            dispatch(changeStatusData(STATUS_FILE_UPLOAD.FINISH, item.id));
          })
          .catch(err => {
            dispatch(changeStatusData(STATUS_FILE_UPLOAD.FAIL, item.id));
          });
      });
      await Promise.all(uploadPromises);
      if (!account) return;
      dispatch(
        getUserFile({
          size: getState().fileData.pagination.size,
          page: 1,
          account,
        }),
      );
    } catch (err) {
      console.log(err);
    }
  };

export const changeUploadData =
  (data: IUploadData[]) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setUploadData(data));
  };

export const changeProcessData =
  (process: number, id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setProcess({
        process,
        id,
      }),
    );
  };

export const changeStatusData =
  (status: STATUS_FILE_UPLOAD, id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setStatus({
        status,
        id,
      }),
    );
  };

export const changeDownloadData =
  (data: IDownloadData[]) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setDownloadData(data));
  };

export const changeProcessDownload =
  (process: number, id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setProcessDownload({
        process,
        id,
      }),
    );
  };

export const changeStatusDownload =
  (status: STATUS_FILE_UPLOAD, id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setStatusDownload({
        status,
        id,
      }),
    );
  };

export const changeDownloadItem =
  (item: IDownloadData) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setDownloadItem({
        item,
      }),
    );
  };

export const changeSize =
  (size: number) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setSize(size));
  };

export const changePage =
  (page: number) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setPage(page));
  };

export const resetData =
  () =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.resetData());
  };

export const deleteUploadFile =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.deleteUpload({
        id,
      }),
    );
  };

export const deleteDownloadFile =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.deleteDownload({
        id,
      }),
    );
  };

export const cancelUploadFile =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.cancelUpload({
        id,
      }),
    );
  };

export const changeUploadItem =
  (item: IUploadData) =>
  (dispatch: AppDispatch): void => {
    dispatch(
      fileDataSlice.actions.setUploadItem({
        item,
      }),
    );
  };

export const setNewUpload =
  (id: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.setNewUpload(id));
  };

export const deleteNewUpload =
  () =>
  (dispatch: AppDispatch): void => {
    dispatch(fileDataSlice.actions.deleteNewUpload());
  };

export const setLocalFile = (listFile: IFileItemData[]) => {
  localStorage.setItem('listFiles', JSON.stringify(listFile));
};

export const getLocalFile = () => {
  const localFile = localStorage.getItem('listFiles');
  const listFile: IFileItemData[] = localFile ? JSON.parse(localFile) : [];
  return listFile;
};

export const setLocalDownloadFile = (listFile: IDownloadData[]) => {
  localStorage.setItem('listDownloadFile', JSON.stringify(listFile));
};

export const getLocalDownloadFile = () => {
  const localFile = localStorage.getItem('listDownloadFile');
  const listFile: IDownloadData[] = localFile ? JSON.parse(localFile) : [];
  return listFile;
};

export const setFilterLocalFile =
  (txtSearch: string, startTime: number, endTime: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    let listFile = getLocalFile();
    if (txtSearch) {
      listFile = listFile.filter(
        item =>
          item.fileName.toLowerCase().includes(txtSearch.toLowerCase()) ||
          item.blobID.toLowerCase().includes(txtSearch.toLowerCase()),
      );
    }
    if (startTime) {
      listFile = listFile.filter(item => moment(item.createdAt).isSameOrAfter(startTime, 'day'));
    }
    if (endTime) {
      listFile = listFile.filter(item => moment(item.createdAt).isSameOrBefore(endTime, 'day'));
    }
    dispatch(
      setListFile(listFile, {
        size: getState().fileData.pagination.size,
        page: 1,
        total: listFile.length,
      }),
    );
  };

export const setDeleteLocalFile = (ids: string[]) => (dispatch: AppDispatch, getState: () => RootState) => {
  let listFile = getState().fileData.listFile;
  const newList = listFile.filter(item => !ids.some(id => item._id === id));
  setLocalFile(newList);
  dispatch(
    setListFile(newList, {
      size: getState().fileData.pagination.size,
      page: getState().fileData.pagination.page,
      total: newList.length,
    }),
  );
};

export const uploadNewFile = (files: IUploadData[]) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const uploadPromises = files.map(async item => {
      try {
        const uploader = new FileUploaderWeb(publisherUrl, aggregatorUrl);
        const localBeforeUpload = await getAllFiles();
        if (!localBeforeUpload.some(upload => upload.id === item.id)) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const fileBase = {
              name: item.file.name,
              type: item.file.type,
              base64,
            };
            await addFile({ ...item, fileBase });
          };
          reader.readAsDataURL(item.file);
        }
        await uploader.prepareFileHandle(item.file as File, 'read');
        const result = await uploader.uploadFileWithoutPassword(item.file, (uploaded, total) => {
          const percent = Math.round((uploaded * 100) / total);
          dispatch(changeProcessData(percent, item.id));
        });
        const blobId = result.jsonBlobId;
        const date = new Date();
        const _id = `${item.size}_${uuidv4()}`;
        dispatch(changeStatusData(STATUS_FILE_UPLOAD.FINISH, item.id));
        dispatch(
          addLocalFile({
            _id,
            blobID: blobId,
            createdAt: date.toString(),
            fileName: item.name,
            size: item.size,
            updateAt: '',
            jsonUrl: result.jsonUrl,
          }),
        );
        dispatch(setNewUpload(_id));
      } catch (err) {
        console.log(err);
        dispatch(changeStatusData(STATUS_FILE_UPLOAD.FAIL, item.id));
      }
      await deleteFile(item.id);
    });
    await Promise.all(uploadPromises);
  } catch (err) {
    console.log(err);
  }
};

export const downloadFile = (filesInput: IFileItemData[], isShowMinify?: boolean) => async (dispatch: AppDispatch) => {
  const downloader = new FileWebDownloader();
  for (const file of filesInput) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: file.fileName,
      });
      isShowMinify && dispatch(setShowMinify(true));
      const localBeforeUpload = await getAllDownloadFiles();
      if (!localBeforeUpload.some(download => download._id === file._id)) {
        await addDownloadFile({
          ...file,
          process: 0,
          status: STATUS_FILE_UPLOAD.PROCESS,
        });
      }
      await downloader['WebFileHandler'].openFile(handle, 'write');
      await downloader.downloadFileWithPassword(file.jsonUrl, '', undefined, (downloaded: number, total: number) => {
        dispatch(changeProcessDownload(Math.round((downloaded * 100) / total), file._id));
      });
      dispatch(changeStatusDownload(STATUS_FILE_UPLOAD.FINISH, file._id));
    } catch (err) {
      console.log(err);
      dispatch(changeStatusDownload(STATUS_FILE_UPLOAD.FAIL, file._id));
    }
    deleteDownloadFileId(file._id);
  }
};

export const loadFileFromLocal = (fileBase: any): File | null => {
  if (!fileBase) return null;
  const { name, type, base64 } = fileBase;
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], name, { type });
};
