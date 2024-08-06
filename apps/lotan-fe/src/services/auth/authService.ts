import client from "@App/common/services/graphql";
import { graphLoginMessage } from "./graphql/GetLoginMessage";
import type { WalletAccount } from "@mysten/wallet-standard";
import { ILoginData } from "./entities";
import { graphLogin } from "./graphql/Login";
import { graphRefreshToken } from "./graphql/RefreshToken";
import { AppDispatch } from "@App/rootStores";
import authDataSlice from "./authSlice";

export const getLoginMessage = async (address: string): Promise<string> => {
  const res = await client.query({
    query: graphLoginMessage,
    variables: {
      address,
    },
  });
  return res.data.getLoginMessage;
};

export const login = async (
  address: string,
  signature: string
): Promise<ILoginData> => {
  const res = await client.mutate({
    mutation: graphLogin,
    variables: {
      address,
      signature,
    },
  });
  return res.data.login;
};

export const getRefreshToken = async (refreshToken: string) => {
  return client.mutate({
    mutation: graphRefreshToken,
    variables: {
      refreshToken,
    },
  });
};

export const loginAccount = async (
  currentAccount: WalletAccount,
  signPersonalMessage: any,
  onRejectSign: () => void,
  onLoginSuccess: () => void
) => {
  const auth = localStorage.getItem(`auth-${currentAccount.address}`);
  try {
    if (!auth) {
      const message = await getLoginMessage(currentAccount.address);
      const signMsg = await signPersonalMessage({
        message: new TextEncoder().encode(message),
        account: currentAccount,
      });
      if (signMsg) {
        const dataLogin = await login(
          currentAccount.address,
          signMsg.signature
        );
        const { accessToken, refreshToken } = dataLogin;
        localStorage.setItem(
          `auth-${currentAccount.address}`,
          JSON.stringify({
            accessToken,
            refreshToken,
          })
        );
        onLoginSuccess();
      } else {
        onRejectSign();
      }
    } else {
      onLoginSuccess();
    }
  } catch (error) {
    console.log("login error", error);
    onRejectSign();
  }
};

export const changeAccountLogin =
  (value: string) =>
  (dispatch: AppDispatch): void => {
    dispatch(authDataSlice.actions.setAccountLogin(value));
  };
