import React, { FC } from "react";
import styles from "@View/layout/assets/custom-modal.module.scss";
import { Modal, ModalProps } from "react-bootstrap";
import { styleCombine } from "@Common/helper";
import Text from "@View/layout/components/Text";
import { IC_CLOSE } from "@App/common/icons";

export interface CustomModalProps extends ModalProps {
  header?: string | React.ReactNode;
  showCloseIcon?: boolean;
  showHeader?: boolean;
  type: "small" | "normal" | "big";
}

export const CustomModal: FC<CustomModalProps> = ({
  header,
  dialogClassName,
  onHide,
  children,
  showCloseIcon = true,
  showHeader = true,
  type,
  ...props
}) => {
  const _onHide = () => {
    if (onHide) {
      onHide();
    }
  };
  return (
    <Modal
      dialogClassName={styleCombine(
        dialogClassName,
        styles.custom_modal,
        type === "big" ? styles.big_modal : ""
      )}
      onHide={_onHide}
      centered
      {...props}
    >
      {showHeader && (
        <Modal.Header>
          {header && (
            <Text size={18} fontWeight={500} color="neutral-n9">
              {header}
            </Text>
          )}
          {showCloseIcon && (
            <div className="close_btn" onClick={_onHide}>
              {IC_CLOSE()}
            </div>
          )}
        </Modal.Header>
      )}
      {children}
    </Modal>
  );
};
