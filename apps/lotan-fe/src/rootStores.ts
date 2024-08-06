import {
  combineReducers,
  configureStore,
  PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { ReduxActionEnum } from "@App/services/server-data/entities/ReduxActionEnum";
import serverDataSlice from "@Services/server-data/serverDataSlice";
import settingDataSlice from "@Services/setting/settingSlice";
import fileDataSlice from "./services/files/fileSlice";
import authDataSlice from "./services/auth/authSlice";

const combinedReducer = combineReducers({
  serverData: serverDataSlice.reducer,
  settingData: settingDataSlice.reducer,
  fileData: fileDataSlice.reducer,
  authData: authDataSlice.reducer,
});

const reducer = (
  state: any,
  action: PayloadAction<any>
): ReturnType<typeof combinedReducer> => {
  if (action.type === HYDRATE) {
    const nextState: RootState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };

    if (nextState.serverData) {
      nextState.serverData = {
        ...nextState.serverData,
        reduxAction: ReduxActionEnum.HYDRATE,
      };
    }

    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

const makeStore = () =>
  configureStore({
    reducer: reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["file/setUploadData"],
          ignoredPaths: ["fileData.uploadData"],
        },
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const wrapper = createWrapper<AppStore>(makeStore);
