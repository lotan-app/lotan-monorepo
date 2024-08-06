import React, { useEffect, useState } from 'react';
import styles from '@View/files/assets/manage-file.module.scss';
import FileFilter from './FileFilter';
import FileTable from './FileTable';
import { ITimeRangeFile } from '@App/services/files/entities';
import { useAppDispatch } from '@App/rootStores';
import { changePage, deleteNewUpload } from '@App/services/files/fileService';
import { selectorAccountLogin } from '@App/services/auth/authSelector';
import { useSelector } from 'react-redux';

const ManageFile = () => {
  const [txtSearch, setTxtSearch] = useState<string>('');
  const [timeRange, setTimeRange] = useState<ITimeRangeFile>({
    startTime: null,
    endTime: null,
  });
  const account = useSelector(selectorAccountLogin);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!account) {
      dispatch(deleteNewUpload());
    }
    setTxtSearch('');
    setTimeRange({
      startTime: null,
      endTime: null,
    });
  }, [account]);

  useEffect(() => {
    return () => {
      dispatch(changePage(1));
      dispatch(deleteNewUpload());
    };
  }, []);

  return (
    <div className={styles.manage_file}>
      <FileFilter
        txtSearch={txtSearch}
        timeRange={timeRange}
        onChangeSearch={(value) => setTxtSearch(value)}
        onChangeStartTime={(value) =>
          setTimeRange({
            ...timeRange,
            startTime: value,
          })
        }
        onChangeEndTime={(value) => {
          setTimeRange({
            ...timeRange,
            endTime: value,
          });
        }}
        resetInput={() => {
          setTxtSearch('');
          setTimeRange({
            startTime: null,
            endTime: null,
          });
        }}
      />
      <FileTable txtSearch={txtSearch} timeRange={timeRange} />
    </div>
  );
};
export default ManageFile;
