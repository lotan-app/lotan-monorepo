import { RootState } from "@App/rootStores";

export const selectorReduxActionType = (state: RootState) => {
  return state.serverData.reduxAction;
};
