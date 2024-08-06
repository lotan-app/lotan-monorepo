import { AppDispatch } from "@App/rootStores";
import settingDataSlice from "./settingSlice";

export const setDarkMode =
  (value: boolean) =>
  (dispatch: AppDispatch): void => {
    dispatch(settingDataSlice.actions.setDarkMode(value));
  };

export const setShowMinify =
  (value: boolean) =>
  (dispatch: AppDispatch): void => {
    dispatch(settingDataSlice.actions.setShowMinify(value));
  };
