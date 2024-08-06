import { AppDispatch } from "@App/rootStores";
import serverDataSlice from "@Services/server-data/serverDataSlice";
import { ReduxActionEnum } from "@Services/server-data/entities/ReduxActionEnum";

export const setReduxActionType =
  (type: ReduxActionEnum) =>
  (dispatch: AppDispatch): void => {
    dispatch(serverDataSlice.actions.setActionType(type));
  };
