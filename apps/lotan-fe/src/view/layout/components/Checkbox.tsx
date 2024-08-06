import React, { FC } from "react";
import styles from "@View/layout/assets/checkbox.module.scss";
import { styleCombine } from "@App/common/helper";

interface ICheckBox {
  icon?: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  size?: "normal" | "medium" | "big";
  useBorder?: boolean;
  onChange?: () => void;
}
const styleSize = {
  normal: styles.normal,
  medium: styles.medium,
  big: styles.big,
};
const CheckBox: FC<ICheckBox> = ({
  icon,
  checked,
  disabled = false,
  size = "normal",
  useBorder = false,
  onChange,
}) => {
  return (
    <div
      className={styleCombine(
        styles.main,
        checked ? styles.checked : "",
        styleSize[size],
        useBorder ? styles.useBorder : "",
        disabled && checked ? styles.disabled : ""
      )}
      onClick={onChange}
    >
      {checked && (
        <>{icon ? icon : <img src="/images/icon/ic_tick.png" alt="" />}</>
      )}
    </div>
  );
};
export default CheckBox;
