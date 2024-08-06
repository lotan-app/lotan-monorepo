import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingDataState {
  darkMode: boolean;
  showUpdateMinify: boolean;
}

const settingDataSlice = createSlice({
  name: "setting",
  initialState: {
    darkMode: false,
    showUpdateMinify: false,
  } as SettingDataState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      localStorage.setItem("darkMode", JSON.stringify(action.payload));
      state.darkMode = action.payload;
    },
    setShowMinify: (state, action: PayloadAction<boolean>) => {
      state.showUpdateMinify = action.payload;
    },
  },
});

export default settingDataSlice;
