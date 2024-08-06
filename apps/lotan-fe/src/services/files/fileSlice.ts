import { IFileItemData, IPaginationData } from "./entities/index";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IFileDataState, IUploadData } from "./entities";
import { DEFAULT_PER_PAGE, STATUS_FILE_UPLOAD } from "@App/config/constants";
import { setLocalFile } from "./fileService";

const fileDataSlice = createSlice({
  name: "file",
  initialState: {
    uploadData: [],
    listFile: [],
    pagination: {
      page: 1,
      size: DEFAULT_PER_PAGE,
      total: 0,
    },
    newUpload: [],
  } as IFileDataState,
  reducers: {
    setUploadData: (state, action: PayloadAction<IUploadData[]>) => {
      state.uploadData = [...action.payload, ...state.uploadData];
    },
    setListFile: (
      state,
      action: PayloadAction<{
        data: IFileItemData[];
        pagination: IPaginationData;
      }>
    ) => {
      state.listFile = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    setSize: (state, action: PayloadAction<number>) => {
      state.pagination.size = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setProcess: (
      state,
      action: PayloadAction<{ process: number; id: string }>
    ) => {
      const listUpload = [...state.uploadData];
      const idx = listUpload.findIndex((item) => item.id === action.payload.id);
      if (idx > -1) {
        listUpload[idx].progress = action.payload.process;
        state.uploadData = listUpload;
      }
    },
    setStatus: (
      state,
      action: PayloadAction<{ status: STATUS_FILE_UPLOAD; id: string }>
    ) => {
      const listUpload = [...state.uploadData];
      const idx = listUpload.findIndex((item) => item.id === action.payload.id);
      if (idx === -1) return;
      listUpload[idx].status = action.payload.status;
      if (status === STATUS_FILE_UPLOAD.FAIL) {
        listUpload[idx].progress = 0;
        listUpload[idx].controller = new AbortController();
      }
      state.uploadData = listUpload;
    },
    deleteUpload: (state, action: PayloadAction<{ id: string }>) => {
      const listFile = [...state.uploadData];
      const idx = listFile.findIndex((item) => item.id === action.payload.id);
      if (idx === -1) return;
      listFile.splice(idx, 1);
      state.uploadData = listFile;
    },
    cancelUpload: (state, action: PayloadAction<{ id: string }>) => {
      const listFile = [...state.uploadData];
      const idx = listFile.findIndex((item) => item.id === action.payload.id);
      if (idx === -1) return;
      listFile[idx] = {
        ...listFile[idx],
        controller: new AbortController(),
        progress: 0,
        status: STATUS_FILE_UPLOAD.FAIL,
      };
      state.uploadData = listFile;
    },
    setUploadItem: (state, action: PayloadAction<{ item: IUploadData }>) => {
      const listFile = [...state.uploadData];
      const idx = listFile.findIndex(
        (file) => file.id === action.payload.item.id
      );
      if (idx === -1) return;
      listFile[idx] = { ...action.payload.item };
      state.uploadData = listFile;
    },
    resetData: (state, action: PayloadAction) => {
      state.listFile = [];
      state.pagination = {
        page: 1,
        size: DEFAULT_PER_PAGE,
        total: 0,
      };
    },
    setNewUpload: (state, action: PayloadAction<string>) => {
      const listUpload = [...state.newUpload];
      listUpload.push(action.payload);
      state.newUpload = [...listUpload];
    },
    deleteNewUpload: (state, action: PayloadAction) => {
      state.newUpload = [];
    },
    setLocalFile: (state, action: PayloadAction<IFileItemData>) => {
      const files = [...state.listFile];
      files.unshift(action.payload);
      state.listFile = files;
      state.pagination = {
        ...state.pagination,
        total: files.length,
      };
      setLocalFile(files);
    },
  },
});

export default fileDataSlice;
