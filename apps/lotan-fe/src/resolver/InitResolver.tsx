import { useAppDispatch } from "@App/rootStores";
import {
  changeAccountLogin,
  loginAccount,
} from "@App/services/auth/authService";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import React, { FC, Fragment, useEffect } from "react";

const InitResolver: FC<any> = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentAccount?.address) {
      dispatch(changeAccountLogin(""));
      return;
    }
    loginAccount(
      currentAccount,
      signMessage,
      () => {
        disconnect();
      },
      () => {
        dispatch(changeAccountLogin(currentAccount.address));
      }
    );
  }, [JSON.stringify(currentAccount)]);

  return <Fragment />;
};

export default InitResolver;
