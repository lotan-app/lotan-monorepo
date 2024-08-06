import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "@View/layout/assets/aside.module.scss";
import {
  IC_BOOK,
  IC_CARRET_DOWN,
  IC_THEME_DARK,
  IC_THEME_LIGHT,
  IC_WALLET,
} from "@App/common/icons";
import { NAV_LIST } from "@App/config/constants";
import Text from "@View/layout/components/Text";
import { useSelector } from "react-redux";
import { selectorDarkMode } from "@App/services/setting/settingSelector";
import { useAppDispatch } from "@App/rootStores";
import { setDarkMode } from "@App/services/setting/settingService";
import { useRouter } from "next/router";
import { styleCombine, truncateMiddleText } from "@App/common/helper";
import { useAccount } from "@App/common/hooks/useAccount";
import ConnectButtonComp from "./ConnectButtonComp";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import { useOnClickOutside } from "@App/common/hooks/useOnClickOutside";

const Aside = () => {
  const [showOption, setShowOption] = useState<boolean>(false);
  const account = useAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const darkMode = useSelector(selectorDarkMode);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const moreRef = useRef(null);
  const optionRef = useRef(null);

  useOnClickOutside(
    moreRef,
    useCallback((event: any) => {
      if (optionRef.current.contains(event.target)) return;
      setShowOption(false);
    }, [])
  );

  useEffect(() => {
    if (!account) {
      setShowOption(false);
    }
  }, [account]);

  const defaultSelected = useMemo(() => {
    let path = router.pathname.split("/").slice(1);
    if (path.length === 1 && !path[0]) {
      path = ["/"];
    }
    return path;
  }, [router.pathname]);

  const getSelectedMenu = useCallback(
    (menu: string) => {
      return defaultSelected[0] === menu ? styles.active : "";
    },
    [defaultSelected]
  );

  return (
    <div className={styles.aside_style}>
      <div className={styles.aside_content}>
        <div className={styles.top}>
          <div className={styles.nav_brand}>
            <img
              src="/images/logo/logo.png"
              className={styles.logo}
              onClick={() => router.push("/")}
            />
            <div className={styles.setting}>
              <div>{IC_BOOK()}</div>
              <div onClick={() => dispatch(setDarkMode(!darkMode))}>
                {darkMode ? IC_THEME_LIGHT() : IC_THEME_DARK()}
              </div>
            </div>
          </div>
          <div className={styles.account}>
            {account ? (
              <div
                className={styles.current_acc}
                ref={optionRef}
                onClick={() => setShowOption(!showOption)}
              >
                <div className={styles.address}>
                  <div className={styles.icon}>
                    {IC_WALLET("var(--primary)")}
                  </div>
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
              <ConnectButtonComp />
            )}
          </div>
          <div className={styles.as_nav}>
            {NAV_LIST.map((item, index) => {
              return (
                <div key={index} className={styles.nav_item}>
                  {item.title && (
                    <Text color="neutral-n8" className={styles.nav_title}>
                      {item.title}
                    </Text>
                  )}
                  <div className={styles.nav_link}>
                    {item.nested.map((nestedItem, idx) => (
                      <div
                        key={idx}
                        className={styleCombine(
                          styles.nested_item,
                          getSelectedMenu(nestedItem.path)
                        )}
                      >
                        <div className={styles.nested_item_content}>
                          <div className={styles.icon}>{nestedItem.icon}</div>
                          <Text
                            color="neutral-n10"
                            className={styles.nested_title}
                          >
                            {nestedItem.title}
                          </Text>
                        </div>
                        {nestedItem.coming && (
                          <Text
                            color="primary"
                            size={12}
                            className={styles.coming}
                          >
                            Coming Soon
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* {accountLogin && (
          <div className={styles.bottom}>
            <div className={styles.storage}>
              <Text color="neutral-n8">Storage</Text>
              <div className={styles.content}>
                <Text color="neutral-n10">1.206GB used from 256GB</Text>
                <div className={styles.range}>
                  <div className={styles.percent} />
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
export default Aside;
