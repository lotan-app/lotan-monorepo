import React, { FC } from "react";
import {
  CustomModal,
  CustomModalProps,
} from "@App/view/layout/components/CustomModal";
import styles from "@App/view/files/assets/confirm-delete.module.scss";
import Text from "@App/view/layout/components/Text";
import CustomButton from "@App/view/layout/components/CustomButton";
import { styleCombine } from "@App/common/helper";

interface IConfirmDelete extends CustomModalProps {
  fileNumber: number;
  handleDelete: () => void;
}

export const ConfirmDelete: FC<IConfirmDelete> = ({
  fileNumber,
  onHide,
  handleDelete,
  ...props
}) => {
  return (
    <CustomModal
      className={styleCombine(styles.main, styles.darkmode)}
      onHide={onHide}
      {...props}
    >
      <div className={styles.content}>
        <Text size={16} color="neutral-n9">
          Are you sure you want to remove {fileNumber} file? This action cannot
          be undone.
        </Text>
        <div className={styles.btn_group}>
          <CustomButton className={styles.confirm} onClick={handleDelete}>
            Confirm
          </CustomButton>
          <CustomButton className={styles.cancel} onClick={onHide}>
            Cancel
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
