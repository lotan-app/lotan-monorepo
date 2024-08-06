import React, { FC } from "react";
import styles from "@View/layout/assets/custom-button.module.scss";
import { styleCombine } from "@Common/helper";

interface CustomButtonProps {
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  customWidth?: boolean;
  customHeight?: boolean;
  onClick: () => void;
}

const CustomButton: FC<CustomButtonProps> = ({
  children,
  disabled = false,
  className,
  customHeight = false,
  customWidth = false,
  onClick,
}) => {
  return (
    <button
      className={styleCombine(
        styles.custom_button,
        customWidth ? styles.custom_width : "",
        customHeight ? styles.custom_height : "",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
