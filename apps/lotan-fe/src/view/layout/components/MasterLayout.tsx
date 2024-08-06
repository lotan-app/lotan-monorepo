import React, { FC, useEffect } from "react";
import styles from "@View/layout/assets/master-layout.module.scss";
import Aside from "@View/layout/components/Aside";
import {
  selectorDarkMode,
  selectorShowMinify,
} from "@App/services/setting/settingSelector";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@App/rootStores";
import { setDarkMode } from "@App/services/setting/settingService";
import UploadMinify from "./UploadMinify";
import { useWidthScreen } from "@App/common/hooks/useWidthScreen";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import { styleCombine } from "@App/common/helper";

interface IMasterDataProps {
  children: React.ReactNode;
}

const MasterLayout: FC<IMasterDataProps> = ({ children }) => {
  const darkMode = useSelector(selectorDarkMode);
  const dispatch = useAppDispatch();
  const { width } = useWidthScreen();
  const router = useRouter();
  const isLanding =
    router.pathname.split("/").slice(1).length === 1 &&
    !router.pathname.split("/").slice(1)[0];

  useEffect(() => {
    const localMode = localStorage.getItem("darkMode");
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (localMode) {
      dispatch(setDarkMode(JSON.parse(localMode)));
    } else {
      dispatch(setDarkMode(matchMedia.matches ? true : false));
    }
    const handleChange = (e: any) => {
      dispatch(setDarkMode(e.matches ? true : false));
    };
    matchMedia.addEventListener("change", handleChange);
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode && !isLanding ? "dark" : "light"
    );
  }, [darkMode, isLanding]);
  if (!width) return null;
  return (
    <div
      className={styleCombine(
        styles.master_style,
        isLanding ? styles.landing : ""
      )}
    >
      {!isLanding && (width > 991 ? <Aside /> : <Header />)}
      <main className={styles.ms_container}>{children}</main>
      <ToastContainer />
      <UploadMinify />
      {!isLanding && width <= 991 && <MobileBottomNav />}
    </div>
  );
};

export const getLayout = (page: any) => <MasterLayout>{page}</MasterLayout>;

export default MasterLayout;
