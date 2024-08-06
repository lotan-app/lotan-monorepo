import React, { FC } from 'react';
import styles from '@View/files/assets/add-file.module.scss';
import Text from '@App/view/layout/components/Text';
import uploadFileAnim from '@Common/animations/uploadFileAnim.json';
import Lottie from 'lottie-react';
import { useAppDispatch } from '@App/rootStores';
import { changeUploadData, uploadFile } from '@App/services/files/fileService';
import { STATUS_FILE_UPLOAD, VIEW_FILE } from '@App/config/constants';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { selectorAccountLogin } from '@App/services/auth/authSelector';
import { useDropzone } from 'react-dropzone';
import useGoogleTag from '@App/common/services/gtag-manager/useGoogleTag';

interface IAddFileProps {
  changeView: (view: VIEW_FILE) => void;
}

const AddFile: FC<IAddFileProps> = ({ changeView }) => {
  const account = useSelector(selectorAccountLogin);
  const dispatch = useAppDispatch();
  const { callEvent } = useGoogleTag();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => {
      const fileArr = Array.from(files);
      const uploadData = fileArr.map((item) => {
        return {
          id: `${item.name}_${item.size}_${uuidv4()}`,
          name: item.name,
          size: item.size,
          progress: 0,
          status: STATUS_FILE_UPLOAD.PROCESS,
          file: item,
          controller: new AbortController(),
        };
      });
      dispatch(changeUploadData(uploadData));
      changeView(VIEW_FILE.UPLOAD);
      dispatch(uploadFile(uploadData, account));
      callEvent('event', 'file_uploaded');
    },
  });

  return (
    <div className={styles.add_file}>
      <div {...getRootProps({ className: styles.dropzone })}>
        <div className={styles.file_upload}>
          <Lottie animationData={uploadFileAnim} loop={true} />
          <Text
            size={18}
            color="neutral-n10"
            fontWeight={500}
            className={styles.title}
          >
            Drop files here
          </Text>
          <Text color="neutral-n8" size={16} className={styles.description}>
            Or <span>Choose a file</span> Max file size:{' '}
            {account ? '50MB' : '10MB'}
          </Text>
        </div>
        <input {...getInputProps()} />
      </div>
    </div>
  );
};
export default AddFile;
