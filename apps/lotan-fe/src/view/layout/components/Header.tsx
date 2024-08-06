import React, { useRef, useState } from "react";
import styles from "@View/layout/assets/header.module.scss";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "@App/common/hooks/useAccount";
import {
  IC_CARRET_DOWN,
  IC_THEME_DARK,
  IC_THEME_LIGHT,
  IC_WALLET,
} from "@App/common/icons";
import Text from "./Text";
import { truncateMiddleText } from "@App/common/helper";
import ConnectButtonComp from "./ConnectButtonComp";
import { selectorDarkMode } from "@App/services/setting/settingSelector";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@App/rootStores";
import { setDarkMode } from "@App/services/setting/settingService";
import { useDisconnectWallet } from "@mysten/dapp-kit";

const Header = () => {
  const account = useAccount();
  const darkMode = useSelector(selectorDarkMode);
  const dispatch = useAppDispatch();
  const moreRef = useRef(null);
  const optionRef = useRef(null);
  const { mutate: disconnect } = useDisconnectWallet();
  const [showOption, setShowOption] = useState<boolean>(false);
  return (
    <header className={styles.header}>
      <Link href={"/"} className={styles.logo}>
        <Image
          src={"/images/logo/logo.png"}
          alt="Logo"
          width={108}
          height={24}
        />
      </Link>
      <div className={styles.right}>
        <div
          className={styles.theme}
          onClick={() => dispatch(setDarkMode(!darkMode))}
        >
          {darkMode ? IC_THEME_LIGHT() : IC_THEME_DARK()}
        </div>
        {account ? (
          <div
            className={styles.current_acc}
            ref={optionRef}
            onClick={() => setShowOption(!showOption)}
          >
            <div className={styles.address}>
              <div className={styles.icon}>{IC_WALLET("var(--primary)")}</div>
              <Text color="neutral-n10">
                {truncateMiddleText(account, "...", 6, 4)}
              </Text>
            </div>
            <div className={styles.icon}>{IC_CARRET_DOWN()}</div>
            {showOption && (
              <div className={styles.option_acc} ref={moreRef}>
                <div className={styles.item}>
                  <Text color="neutral-n7" onClick={disconnect}>
                    Disconnect
                  </Text>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ConnectButtonComp text="Connect" />
        )}
      </div>
    </header>
  );
};
export default Header;
