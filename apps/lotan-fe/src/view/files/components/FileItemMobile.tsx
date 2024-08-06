import React, { FC, useCallback, useRef, useState } from 'react';
import styles from '@View/files/assets/file-item-mobile.module.scss';
import CheckBox from '@App/view/layout/components/Checkbox';
import Text from '@App/view/layout/components/Text';
import {
  formatBytes,
  styleCombine,
  truncateMiddleText,
} from '@App/common/helper';
import CopyButton from '@App/view/layout/components/CoppyButton';
import { IC_DELETE, IC_DOWNLOAD, IC_MORE } from '@App/common/icons';
import { useOnClickOutside } from '@App/common/hooks/useOnClickOutside';
import { IFileItemData } from '@App/services/files/entities';
import moment from 'moment';
import { WALRUS_URL } from '@App/config/constants';

interface IFileItemProps extends IFileItemData {
  isChecked: boolean;
  isLoading: boolean;
  isNewUpdate: boolean;
  handleDelete: () => void;
  handleDownload: () => void;
  onChecked: (isChecked: boolean) => void;
}

const FileMobileItem: FC<IFileItemProps> = ({
  fileName,
  blobID,
  createAt,
  _id,
  size,
  isChecked,
  isLoading,
  isNewUpdate,
  onChecked,
  handleDelete,
  handleDownload,
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const moreRef = useRef(null);
  const optionRef = useRef(null);

  useOnClickOutside(
    moreRef,
    useCallback((event: any) => {
      if (optionRef.current.contains(event.target)) return;
      setShowMore(false);
    }, [])
  );

  return (
    <div
      className={styleCombine(
        styles.file_mobile_item,
        isNewUpdate ? styles.new_update : ''
      )}
    >
      <div className={styles.left}>
        <CheckBox checked={isChecked} onChange={() => onChecked(!isChecked)} />
      </div>
      <div className={styles.right}>
        <div className={styles.item}>
          <div className={styles.info}>
            <Text
              size={16}
              fontWeight={500}
              color="neutral-n9"
              className={styles.title}
            >
              {truncateMiddleText(fileName, '...', 8, 8)}
            </Text>
            {size && (
              <Text size={12} color="neutral-n7">
                {formatBytes(size)}
              </Text>
            )}
          </div>
          <div className={styles.option}>
            <div
              ref={optionRef}
              className={styles.icon}
              onClick={() => setShowMore(!showMore)}
            >
              {IC_MORE()}
            </div>
            {showMore && (
              <div className={styles.more} ref={moreRef}>
                <div
                  className={styles.nav_item}
                  onClick={() => {
                    if (isLoading) return;
                    setShowMore(false);
                    handleDownload();
                  }}
                >
                  <div className={styles.icon}>
                    {IC_DOWNLOAD('var(--neutral-n7)')}
                  </div>
                  <Text size={14} color="neutral-n7">
                    Download
                  </Text>
                </div>
                <div
                  className={styles.nav_item}
                  onClick={() => {
                    if (isLoading) return;
                    setShowMore(false);
                    handleDelete();
                  }}
                >
                  <div className={styles.icon}>{IC_DELETE()}</div>
                  <Text size={14} color="neutral-n7">
                    Delete File
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>
            <Text size={14} color="neutral-n6">
              BlobID
            </Text>
          </div>
          <div className={styles.value}>
            <Text size={14} color="neutral-n9">
              {truncateMiddleText(blobID, '...', 5, 5)}
            </Text>
            <CopyButton
              content={`${WALRUS_URL}/v1/${blobID}`}
              placement="top"
            />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>
            <Text size={14} color="neutral-n6">
              Creation Date
            </Text>
          </div>
          <div className={styles.value}>
            <Text size={14} color="neutral-n9">
              {moment(createAt).format('DD MMMM YYYY')}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FileMobileItem;
