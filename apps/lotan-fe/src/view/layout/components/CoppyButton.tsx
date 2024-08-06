import React, { FC, HTMLAttributes, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import styles from "@View/layout/assets/copy-button.module.scss";
import { IC_COPY } from "@App/common/icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Text from "./Text";
interface ICopyButton extends HTMLAttributes<any> {
  content: string;
  color?: string;
  placement?: "top" | "right" | "bottom" | "left";
}
const CopyButton: FC<ICopyButton> = ({ content, style, color, placement }) => {
  const [success, setSuccess] = useState(false);
  const showSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 1000);
  };

  const _onMouseEnter = () => {
    setSuccess(false);
  };

  return (
    <CopyToClipboard text={content}>
      <div
        className={styles.main}
        onClick={() => !success && showSuccess()}
        style={style}
        onMouseOver={_onMouseEnter}
      >
        <OverlayTrigger
          show={success}
          overlay={
            <Tooltip>
              <Text size={14}>{"Copied"}</Text>
            </Tooltip>
          }
          placement={placement || "auto"}
          trigger={"click"}
        >
          {IC_COPY(color || undefined)}
        </OverlayTrigger>
      </div>
    </CopyToClipboard>
  );
};
export default CopyButton;
