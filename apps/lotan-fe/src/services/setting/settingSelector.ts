import { RootState } from "@App/rootStores";

export const selectorDarkMode = (state: RootState) => {
  return state.settingData.darkMode;
};

export const selectorShowMinify = (state: RootState) => {
  return state.settingData.showUpdateMinify;
};
