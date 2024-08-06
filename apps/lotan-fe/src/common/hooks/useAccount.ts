import { useEffect, useState } from "react";
import {
  useAccounts,
  useCurrentAccount,
  useCurrentWallet,
  useSwitchAccount,
} from "@mysten/dapp-kit";

export const useAccount = () => {
  const { mutateAsync: selectAccount } = useSwitchAccount();
  const { isConnected } = useCurrentWallet();

  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const [account, setAccount] = useState<string>();

  useEffect(() => {
    if (!isConnected) {
      setAccount(undefined);
      return;
    }
    const initAccount = async () => {
      const address = localStorage.getItem("addressConnected");
      if (address) {
        const accountConnected = accounts.find(
          (item) => item.address === JSON.parse(address)
        );
        if (accountConnected) {
          selectAccount({ account: accountConnected });
          setAccount(accountConnected.address);
          return;
        }
      }
      setAccount(currentAccount?.address);
    };

    initAccount();
  }, [isConnected, currentAccount]);

  return account;
};
