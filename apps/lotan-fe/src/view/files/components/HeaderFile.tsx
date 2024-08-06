import React, { FC } from 'react';
import styles from '@View/files/assets/header-file.module.scss';
import Text from '@App/view/layout/components/Text';
import CustomButton from '@App/view/layout/components/CustomButton';
import { IC_BACK, IC_PLUS } from '@App/common/icons';
import { VIEW_FILE } from '@App/config/constants';
import { useSelector } from 'react-redux';
import { selectorListFile } from '@App/services/files/fileSelector';

interface IHeaderFileProps {
  view: VIEW_FILE;
  account: string;
  changeView: (view: VIEW_FILE) => void;
}

const HeaderFile: FC<IHeaderFileProps> = ({ view, account, changeView }) => {
  const listFile = useSelector(selectorListFile);
  return (
    <div className={styles.header_file}>
      <div className={styles.left}>
        {(view === VIEW_FILE.UPLOAD ||
          (view === VIEW_FILE.ADD && listFile.length > 0)) && (
          <div
            className={styles.icon}
            onClick={() => {
              changeView(VIEW_FILE.MANAGE);
            }}
          >
            {IC_BACK()}
          </div>
        )}
        {view === VIEW_FILE.UPLOAD ? (
          <>
            <Text color="neutral-n9" size={18} fontWeight={500}>
              Upload
            </Text>
          </>
        ) : (
          <div>
            <Text color="neutral-n9" size={18} fontWeight={500}>
              Files
            </Text>
            <Text color="neutral-n7" size={12}>
              Upload, pin by BlobID, and manage your files
            </Text>
          </div>
        )}
      </div>
      <div className={styles.right}>
        {[VIEW_FILE.MANAGE].includes(view) && (
          <CustomButton onClick={() => changeView(VIEW_FILE.ADD)}>
            <div className={styles.icon}>{IC_PLUS()}</div>
            <Text color="white">Add Files</Text>
          </CustomButton>
        )}
      </div>
    </div>
  );
};
export default HeaderFile;
