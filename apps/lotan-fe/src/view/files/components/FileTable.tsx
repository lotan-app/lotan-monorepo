import React, { FC, useMemo, useState } from 'react';
import styles from '@View/files/assets/file-table.module.scss';
import CheckBox from '@App/view/layout/components/Checkbox';
import FileItem from './FileItem';
import Pagination from '@App/view/layout/components/Pagination';
import Text from '@App/view/layout/components/Text';
import { styleCombine, truncateMiddleText } from '@App/common/helper';
import CustomButton from '@App/view/layout/components/CustomButton';
import { IC_DELETE, IC_DOWNLOAD } from '@App/common/icons';
import { ConfirmDelete } from './ConfirmDelete';
import {
  changePage,
  changeSize,
  deleteFile,
  deleteNewUpload,
  getUserFile,
  setDeleteLocalFile,
} from '@App/services/files/fileService';
import { useAppDispatch } from '@App/rootStores';
import { useSelector } from 'react-redux';
import {
  selectorListFile,
  selectorNewUpload,
  selectorPagination,
} from '@App/services/files/fileSelector';
import { ROW_PER_PAGE, WALRUS_URL } from '@App/config/constants';
import BarLoading from '@App/view/layout/components/Loading';
import { IFileItemData, ITimeRangeFile } from '@App/services/files/entities';
import axios from 'axios';
import { selectorAccountLogin } from '@App/services/auth/authSelector';
import useDelayFetch from '@App/common/hooks/useDelayFetch';
import { useWidthScreen } from '@App/common/hooks/useWidthScreen';
import FileMobileItem from './FileItemMobile';
import { toast } from '@App/common/services/toast';
import ToastTypeEnum from '@App/common/services/toast/ToastTypeEnum';

interface IFileTableProps {
  txtSearch: string;
  timeRange: ITimeRangeFile;
}

const FileTable: FC<IFileTableProps> = ({ txtSearch, timeRange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteOption, setDeleteOption] = useState<IFileItemData>(null);
  const [fetchData, setFetchData] = useState<boolean>(false);
  const [checkedAll, setCheckedAll] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<IFileItemData[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const listFile = useSelector(selectorListFile);
  const pagination = useSelector(selectorPagination);
  const account = useSelector(selectorAccountLogin);
  const newUpload = useSelector(selectorNewUpload);
  const { width } = useWidthScreen();
  const dispatch = useAppDispatch();
  const { total, size, page } = pagination;
  const maxPage = Math.ceil(total / size);

  const getData = async (newSize: number, newPage: number) => {
    if (!account) return;
    try {
      await dispatch(
        getUserFile({
          size: newSize,
          page: newPage,
          account,
          txtSearch,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getDataDelay = useDelayFetch(getData, 200);

  const resetChecked = () => {
    setCheckedAll(false);
    setCheckedItems([]);
    dispatch(deleteNewUpload());
  };

  const handleChangePagination = (event: any) => {
    let value = 1;
    if (event.currentTarget.hasOwnProperty('value')) {
      value = parseInt(event.currentTarget.value) || 1;
    } else {
      value = page + parseInt(event.currentTarget.getAttribute('data-value'));
    }
    if (value > maxPage) {
      value = maxPage;
    } else if (value <= 0) {
      value = 1;
    }
    resetChecked();
    if (!account) {
      dispatch(changePage(value));
      return;
    }
    getDataDelay(size, value);
  };

  const handleCheckedAll = () => {
    setCheckedItems(checkedAll ? [] : [...listFile]);
    setCheckedAll(!checkedAll);
  };

  const onHide = () => {
    setShowConfirm(false);
    if (deleteOption) {
      setDeleteOption(null);
    }
  };

  const downloadFile = async (blobID: string, fileName: string) => {
    const response = await axios({
      url: `${WALRUS_URL}/v1/${blobID}`,
      method: 'GET',
      responseType: 'blob',
    });
    const urlBlob = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(urlBlob);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const ids = deleteOption
        ? [deleteOption._id]
        : checkedItems.map((item) => item._id);
      if (!account) {
        dispatch(setDeleteLocalFile(ids));
      } else {
        await deleteFile(ids, account);
        getDataDelay(size, page);
      }
      setCheckedAll(false);
      setCheckedItems([]);
      toast(ToastTypeEnum.success, 'Delete success');
      onHide();
    } catch (err) {
      toast(ToastTypeEnum.error, 'Delete fail');
    }
    setIsLoading(false);
  };

  const handleDownload = async (fileInput?: IFileItemData) => {
    setIsLoading(true);
    try {
      const downloadPromises = (fileInput ? [fileInput] : checkedItems).map(
        (file) => {
          return downloadFile(file.blobID, file.fileName);
        }
      );
      await Promise.all(downloadPromises);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  const headerModal = useMemo(() => {
    if (deleteOption) {
      return `Delete ${truncateMiddleText(
        deleteOption.fileName,
        '...',
        width <= 767 ? 6 : 8,
        width <= 767 ? 6 : 8
      )} File`;
    }
    if (checkedItems.length === 0) return;
    if (checkedItems.length === 1) {
      return `Delete ${truncateMiddleText(
        checkedItems[0].fileName,
        '...',
        width <= 767 ? 6 : 8,
        width <= 767 ? 6 : 8
      )} File`;
    }
    return `Delete ${checkedItems.length} Files`;
  }, [deleteOption, checkedItems]);

  return (
    <div className={styles.file_table}>
      <div className={styleCombine(styles.row, styles.head)}>
        <div className={styles.item}>
          <CheckBox checked={checkedAll} onChange={handleCheckedAll} />
        </div>
        {checkedItems.length > 0 ? (
          <>
            <div className={styles.selected_file}>
              <Text color="neutral-n7">
                {checkedItems.length}{' '}
                {`File${checkedItems.length > 1 ? 's' : ''}`} Selected
              </Text>
              <div className={styles.options}>
                <CustomButton
                  onClick={() => {
                    if (isLoading || checkedItems.length === 0) return;
                    handleDownload();
                  }}
                >
                  <div className={styles.icon}>{IC_DOWNLOAD()}</div>
                  <Text color="btn-color" className={styles.title}>
                    Download
                  </Text>
                </CustomButton>
                <CustomButton
                  onClick={() => {
                    if (isLoading || checkedItems.length === 0) return;
                    setShowConfirm(true);
                  }}
                >
                  <div className={styles.icon}>
                    {IC_DELETE('var(--btn-color)')}
                  </div>
                  <Text color="btn-color" className={styles.title}>
                    Delete
                  </Text>
                </CustomButton>
              </div>
            </div>
          </>
        ) : (
          <>
            {width > 991 && (
              <>
                <div className={styles.item}>
                  <Text color="neutral-n6" fontWeight={500}>
                    Name
                  </Text>
                </div>
                <div className={styles.item}>
                  <Text color="neutral-n6" fontWeight={500}>
                    BlobID
                  </Text>
                </div>
                <div className={styles.item}>
                  <Text color="neutral-n6" fontWeight={500}>
                    Creation Date
                  </Text>
                </div>
                <div className={styles.item} />
              </>
            )}
          </>
        )}
      </div>
      {fetchData ? (
        <div className={styles.loading}>
          <BarLoading size={20} />
        </div>
      ) : (
        <>
          {listFile.length === 0 ? (
            <Text className={styles.empty} color="neutral-n6">
              Empty File
            </Text>
          ) : (
            <>
              {(!account
                ? listFile.slice((page - 1) * size, (page - 1) * size + size)
                : listFile
              ).map((file, index) => {
                const isNewUpdate = newUpload.includes(file._id);
                if (width <= 991)
                  return (
                    <FileMobileItem
                      key={index}
                      {...file}
                      isChecked={
                        !!checkedItems.find((item) => item._id === file._id)
                      }
                      onChecked={(isChecked) => {
                        const list = [...checkedItems];
                        if (isChecked) {
                          list.push(file);
                        } else {
                          const idx = list.findIndex(
                            (item) => item._id === file._id
                          );
                          idx > -1 && list.splice(idx, 1);
                        }
                        setCheckedItems(list);
                      }}
                      isLoading={isLoading}
                      isNewUpdate={isNewUpdate}
                      handleDelete={() => {
                        setDeleteOption(file);
                        setShowConfirm(true);
                      }}
                      handleDownload={() => {
                        handleDownload(file);
                      }}
                    />
                  );
                return (
                  <FileItem
                    key={index}
                    {...file}
                    isChecked={
                      !!checkedItems.find((item) => item._id === file._id)
                    }
                    onChecked={(isChecked) => {
                      const list = [...checkedItems];
                      if (isChecked) {
                        list.push(file);
                      } else {
                        const idx = list.findIndex(
                          (item) => item._id === file._id
                        );
                        idx > -1 && list.splice(idx, 1);
                      }
                      setCheckedItems(list);
                    }}
                    isLoading={isLoading}
                    isNewUpdate={isNewUpdate}
                    handleDelete={() => {
                      setDeleteOption(file);
                      setShowConfirm(true);
                    }}
                    handleDownload={() => {
                      handleDownload(file);
                    }}
                  />
                );
              })}
            </>
          )}
        </>
      )}
      <div className={styles.setting}>
        <div className={styles.row_per_page}>
          <Text color="neutral-n6">Row per page:</Text>
          <select
            value={size}
            onChange={(event) => {
              const newSize = Number(event.target.value);
              if (newSize === size) return;
              resetChecked();
              if (!account) {
                dispatch(changeSize(newSize));
                return;
              }
              getDataDelay(newSize, page);
            }}
          >
            {ROW_PER_PAGE.map((row, index) => (
              <option key={index} value={row}>
                {row}
              </option>
            ))}
          </select>
        </div>
        {total > 0 && (
          <Pagination
            currentPage={page}
            maxPage={maxPage}
            handleChangePagination={handleChangePagination}
          />
        )}
      </div>
      <ConfirmDelete
        type="big"
        show={showConfirm}
        header={headerModal}
        fileNumber={deleteOption ? 1 : checkedItems.length}
        onHide={onHide}
        handleDelete={handleDelete}
      />
    </div>
  );
};
export default FileTable;
