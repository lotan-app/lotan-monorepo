import React, { useEffect } from 'react';
import styles from '@View/layout/assets/upload-minify.module.scss';
import Text from '@App/view/layout/components/Text';
import UploadFileItem from '@View/files/components/UploadFileItem';
import { useSelector } from 'react-redux';
import { selectorUploadData } from '@App/services/files/fileSelector';
import { STATUS_FILE_UPLOAD, VIEW_FILE } from '@App/config/constants';
import { IC_RESIZE } from '@App/common/icons';
import { useAppDispatch } from '@App/rootStores';
import { setShowMinify } from '@App/services/setting/settingService';
import { useRouter } from 'next/router';
import eventEmitter from '@App/common/eventEmitter';
import { motion } from 'framer-motion';
import { selectorShowMinify } from '@App/services/setting/settingSelector';
import { useWidthScreen } from '@App/common/hooks/useWidthScreen';

const UploadMinify = () => {
  const uploadData = useSelector(selectorUploadData);
  const showModify = useSelector(selectorShowMinify);
  const { width } = useWidthScreen();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const uploadFilter = uploadData.filter(
    (item) => item.status !== STATUS_FILE_UPLOAD.FINISH
  );

  useEffect(() => {
    if (uploadFilter.length === 0) {
      dispatch(setShowMinify(false));
    }
  }, [uploadFilter]);

  const variants = {
    visible: { translateY: 0, opacity: 1 },
    hidden: { translateY: 100, opacity: 0 },
  };

  return (
    <motion.div
      animate={showModify ? 'visible' : 'hidden'}
      variants={variants}
      className={styles.upload_minify}
    >
      <div className={styles.header}>
        <Text size={16} fontWeight={500} color="neutral-n9">
          {width > 991
            ? 'Upload File'
            : `Upload ${uploadFilter.length} File${
                uploadFilter.length > 1 ? 's' : ' '
              }`}
        </Text>
        <div
          className={styles.icon}
          onClick={() => {
            if (router.pathname === '/app') {
              eventEmitter.emit('eventChangeView', VIEW_FILE.UPLOAD);
              return;
            }
            router.push({
              pathname: '/',
              query: {
                viewFile: VIEW_FILE.UPLOAD,
              },
            });
          }}
        >
          {IC_RESIZE()}
        </div>
      </div>
      {width > 991 && (
        <div className={styles.list_upload}>
          {uploadFilter.length === 0 ? (
            <Text size={16} color="neutral-n10" className={styles.empty}>
              No File
            </Text>
          ) : (
            <>
              {uploadFilter.map((item, index) => {
                return <UploadFileItem key={index} {...item} isMinify={true} />;
              })}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};
export default UploadMinify;
