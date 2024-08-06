import { toast as toastify, ToastContent } from "react-toastify";
import ToastTypeEnum from "@Common/services/toast/ToastTypeEnum";
import { ToastOptions } from "react-toastify/dist/types";
import { IC_CLOSE } from "@App/common/icons";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

const CloseButton = ({ closeToast }: any) => (
  <div className="custom_close">
    <div onClick={closeToast}>{IC_CLOSE()}</div>
  </div>
);
export const toast = (
  type: ToastTypeEnum,
  toastContent: ToastContent,
  options?: ToastOptions
) => {
  return toastify[type](toastContent, {
    autoClose: 5000,
    position: "top-right",
    hideProgressBar: true,
    closeButton: ({ closeToast }: any) => (
      <CloseButton closeToast={closeToast} />
    ),
    ...options,
  });
};
