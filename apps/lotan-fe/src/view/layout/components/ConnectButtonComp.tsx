import React, { FC } from "react";
import styles from "@View/layout/assets/connect-button.module.scss";
import { ConnectButton } from "@mysten/dapp-kit";
import { IC_WALLET } from "@App/common/icons";
import Text from "./Text";

interface IConnectButtonProps {
  text?: string;
}

const ConnectButtonComp: FC<IConnectButtonProps> = ({
  text = "Connect Wallet",
}) => {
  return (
    <ConnectButton
      className={styles.connect_btn}
      connectText={
        <div className={styles.content}>
          <div className={styles.icon}>{IC_WALLET()}</div>
          <Text color="white" fontWeight={500} className={styles.title}>
            {text}
          </Text>
        </div>
      }
    />
  );
};
export default ConnectButtonComp;
