import React, { FC } from 'react';
import styles from '@View/files/assets/upload-file-item.module.scss';
import Text from '@App/view/layout/components/Text';
import { useSelector } from 'react-redux';
import { selectorDarkMode } from '@App/services/setting/settingSelector';
import { IC_CLOSE, IC_DELETE, IC_RELOAD } from '@App/common/icons';
import { IDownloadData } from '@App/services/files/entities';
import { formatBytes, styleCombine, truncateMiddleText } from '@App/common/helper';
import { STATUS_FILE_UPLOAD } from '@App/config/constants';
import { useAppDispatch } from '@App/rootStores';
import { deleteDownloadFile, downloadFile } from '@App/services/files/fileService';
import { useWidthScreen } from '@App/common/hooks/useWidthScreen';

interface IUploadItemProps {
  isMinify?: boolean;
  item: IDownloadData;
}

const DownloadFileItem: FC<IUploadItemProps> = ({ item, isMinify = false }) => {
  const darkMode = useSelector(selectorDarkMode);
  const { progress, status, _id, fileName, size, isResume } = item;
  const dispatch = useAppDispatch();
  const { width } = useWidthScreen();

  const reloadFile = () => {
    dispatch(downloadFile([item], false));
  };

  const cancelProcess = () => {};

  return (
    <div className={styleCombine(styles.upload_file_item, isMinify ? styles.minify : '')}>
      <div className={styles.left}>
        {!isMinify && (
          <div className={styles.icon}>
            <img
              src={`/images/icon/file-${darkMode ? 'dark' : 'light'}${
                status === STATUS_FILE_UPLOAD.FAIL ? '-error' : ''
              }.svg`}
              width={32}
              height={32}
            />
          </div>
        )}
        <div className={styles.info}>
          <Text size={16} color="neutral-n10" manyLines={false}>
            {truncateMiddleText(fileName, '...', width < 767 || isMinify ? 6 : 8, width < 767 || isMinify ? 6 : 8)}
          </Text>
          {status === STATUS_FILE_UPLOAD.FAIL ? (
            <Text size={14} color="dust-red">
              Oops! Upload Failed
            </Text>
          ) : (
            <>
              {!isResume && (
                <>
                  <div className={styles.progress_bar}>
                    <div className={styles.percent} style={{ width: `${progress}%` }} />
                  </div>
                  <div className={styles.progress_text}>
                    <Text color="neutral-n7">
                      {formatBytes(size)} <span /> {progress}%
                    </Text>
                    <Text color="neutral-n7">
                      {status === STATUS_FILE_UPLOAD.FINISH ? 'Downloaded' : 'Downloading...'}
                    </Text>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.right}>
        {(status === STATUS_FILE_UPLOAD.FAIL || isResume) && (
          <>
            <div className={styles.icon} onClick={reloadFile}>
              {IC_RELOAD()}
            </div>
            <div className={styles.icon} onClick={() => dispatch(deleteDownloadFile(_id))}>
              {IC_DELETE('var(--dust-red)')}
            </div>
          </>
        )}
        {status === STATUS_FILE_UPLOAD.PROCESS && (
          <div className={styleCombine(styles.close, styles.icon)} onClick={cancelProcess}>
            {IC_CLOSE()}
          </div>
        )}
      </div>
    </div>
  );
};
export default DownloadFileItem;
