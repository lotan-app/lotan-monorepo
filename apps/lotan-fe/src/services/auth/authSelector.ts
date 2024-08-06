import { RootState } from "@App/rootStores";

export const selectorAccountLogin = (state: RootState) => {
  return state.authData.accountLogin;
};
