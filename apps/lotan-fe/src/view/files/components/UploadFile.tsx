import React, { FC, useEffect } from "react";
import styles from "@View/files/assets/upload-file.module.scss";
import Text from "@App/view/layout/components/Text";
import UploadFileItem from "./UploadFileItem";
import { useSelector } from "react-redux";
import { selectorUploadData } from "@App/services/files/fileSelector";
import { STATUS_FILE_UPLOAD, VIEW_FILE } from "@App/config/constants";
import { useAppDispatch } from "@App/rootStores";
import { setShowMinify } from "@App/services/setting/settingService";
import { styleCombine } from "@App/common/helper";

interface IUploadFileProps {
  account: string;
  changeView: (view: VIEW_FILE) => void;
}

const UploadFile: FC<IUploadFileProps> = ({ account, changeView }) => {
  const uploadData = useSelector(selectorUploadData);
  const dispatch = useAppDispatch();
  const uploadFilter = uploadData.filter(
    (item) => item.status !== STATUS_FILE_UPLOAD.FINISH
  );

  useEffect(() => {
    dispatch(setShowMinify(false));
    return () => {
      dispatch(setShowMinify(true));
    };
  }, []);

  useEffect(() => {
    if (uploadFilter.length === 0) {
      changeView(VIEW_FILE.MANAGE);
    }
  }, [uploadFilter]);

  return (
    <div className={styleCombine(styles.upload_file)}>
      <Text color="neutral-n7" className={styles.title}>
        Please DO NOT close your browser or close this modal
      </Text>
      <div className={styles.list_upload}>
        {uploadFilter.length === 0 ? (
          <Text color="neutral-n10" className={styles.empty}>
            No Upload File
          </Text>
        ) : (
          <>
            {uploadFilter.map((item, index) => {
              return <UploadFileItem key={index} {...item} />;
            })}
          </>
        )}
      </div>
    </div>
  );
};
export default UploadFile;
