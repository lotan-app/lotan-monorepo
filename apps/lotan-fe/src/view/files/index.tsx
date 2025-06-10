import React, { useEffect, useState } from 'react';
import { getLayout } from '@View/layout/components/MasterLayout';
import styles from '@View/files/assets/index.module.scss';
import HeaderFile from '@View/files/components/HeaderFile';
import AddFile from './components/AddFiles';
import UploadFile from './components/UploadFile';
import ManageFile from './components/ManageFile';
import { VIEW_FILE } from '@App/config/constants';
import { useSelector } from 'react-redux';
import { selectorAccountLogin } from '@App/services/auth/authSelector';
import { useAppDispatch } from '@App/rootStores';
import {
  changeDownloadData,
  changeUploadData,
  getLocalFile,
  getUserFile,
  loadFileFromLocal,
  setListFile,
} from '@App/services/files/fileService';
import eventEmitter from '@App/common/eventEmitter';
import { useRouter } from 'next/router';
import { selectorPagination } from '@App/services/files/fileSelector';
import { setShowMinify } from '@App/services/setting/settingService';
import { getAllFiles } from '@App/common/services/indexedDB/uploadDB';
import { getAllDownloadFiles } from '@App/common/services/indexedDB/downloadDB';

const Files = () => {
  const [view, setView] = useState<VIEW_FILE>(VIEW_FILE.ADD);
  const account = useSelector(selectorAccountLogin);
  const pagination = useSelector(selectorPagination);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getData = async () => {
    try {
      const res = await dispatch(
        getUserFile({
          page: 1,
          size: pagination.size,
          account,
        }),
      );
      setView(res.total === 0 ? VIEW_FILE.ADD : VIEW_FILE.MANAGE);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEvent = (view: VIEW_FILE) => {
    setView(view);
  };

  const getDataProcess = async () => {
    try {
      const uploadData = await getAllFiles();
      const downloadData = await getAllDownloadFiles();
      if (uploadData.length > 0) {
        const formatUploadData = uploadData.map(item => {
          return {
            ...item,
            file: loadFileFromLocal(item.fileBase),
            isResume: true,
          };
        });
        dispatch(changeUploadData(formatUploadData));
      }
      if (downloadData.length > 0) {
        const formatDownloadData = downloadData.map(item => {
          return {
            ...item,
            isResume: true,
          };
        });
        dispatch(changeDownloadData(formatDownloadData));
      }
      if (uploadData.length > 0 || downloadData.length > 0) {
        dispatch(setShowMinify(true));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const { viewFile } = router.query;
    if (Object.values(VIEW_FILE).includes(viewFile as any)) {
      setView(viewFile as any);
    }
    getDataProcess();
    eventEmitter.on('eventChangeView', handleEvent);
    return () => {
      eventEmitter.off('eventChangeView', handleEvent);
    };
  }, []);

  useEffect(() => {
    if (!account) {
      const listLocal = getLocalFile();
      setView(listLocal.length > 0 ? VIEW_FILE.MANAGE : VIEW_FILE.ADD);
      dispatch(
        setListFile(getLocalFile(), {
          size: pagination.size,
          page: 1,
          total: listLocal.length,
        }),
      );
      return;
    }
    getData();
  }, [account]);

  return (
    <div className={styles.file_style}>
      <HeaderFile view={view} account={account} changeView={handleEvent} />
      <div className={styles.body}>
        {view === VIEW_FILE.ADD && <AddFile changeView={handleEvent} />}
        {view === VIEW_FILE.UPLOAD && <UploadFile account={account} changeView={handleEvent} />}
        {view === VIEW_FILE.MANAGE && <ManageFile />}
      </div>
    </div>
  );
};
Files.getLayout = getLayout;
export default Files;
