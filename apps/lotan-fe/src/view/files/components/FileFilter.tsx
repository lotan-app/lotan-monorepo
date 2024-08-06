import React, { FC } from "react";
import styles from "@View/files/assets/file-filter.module.scss";
import Text from "@App/view/layout/components/Text";
import SearchInput from "@App/view/layout/components/SearchInput";
import DatePickerComponents from "@App/view/layout/components/DatePicker";
import { IC_CALENDAR, IC_CLOSE, IC_RANGE_DATE } from "@App/common/icons";
import CustomButton from "@App/view/layout/components/CustomButton";
import { ITimeRangeFile } from "@App/services/files/entities";
import { useAppDispatch } from "@App/rootStores";
import { useSelector } from "react-redux";
import { selectorPagination } from "@App/services/files/fileSelector";
import { selectorAccountLogin } from "@App/services/auth/authSelector";
import useDelayFetch from "@App/common/hooks/useDelayFetch";
import {
  getUserFile,
  setFilterLocalFile,
  setLocalFile,
} from "@App/services/files/fileService";

interface IFileFilterProps {
  txtSearch: string;
  timeRange: ITimeRangeFile;
  onChangeSearch: (value: string) => void;
  onChangeStartTime: (value: number) => void;
  onChangeEndTime: (value: number) => void;
  resetInput: () => void;
}

const FileFilter: FC<IFileFilterProps> = ({
  txtSearch,
  timeRange,
  onChangeSearch,
  onChangeStartTime,
  onChangeEndTime,
  resetInput,
}) => {
  const currentDate = new Date();
  const dispatch = useAppDispatch();
  const pagination = useSelector(selectorPagination);
  const { size } = pagination;
  const account = useSelector(selectorAccountLogin);

  const getFilterFile = async (txt: string, start: number, end: number) => {
    if (!account) {
      dispatch(setFilterLocalFile(txt, start, end));
      return;
    }
    await dispatch(
      getUserFile({
        size,
        page: 1,
        txtSearch: txt,
        startTime: start,
        endTime: end,
        account,
      })
    );
  };

  const getDataDelay = useDelayFetch(getFilterFile, 400);

  return (
    <div className={styles.file_filter}>
      <SearchInput
        value={txtSearch}
        onChange={(value) => {
          onChangeSearch(value);
          getDataDelay(value, timeRange.startTime, timeRange.endTime);
        }}
        placeholder="Search by name or BlobID"
      />
      <div className={styles.filter_date}>
        <DatePickerComponents
          pickedTime={timeRange.startTime}
          placeholderText="Start Date"
          maxDate={timeRange.endTime}
          onChange={(date: Date) => {
            onChangeStartTime(date?.valueOf());
            getDataDelay(txtSearch, date?.valueOf(), timeRange.endTime);
          }}
        />
        <div className={styles.icon_range}>{IC_RANGE_DATE()}</div>
        <DatePickerComponents
          pickedTime={timeRange.endTime}
          placeholderText="End Date"
          minDate={timeRange.startTime}
          onChange={(date: Date) => {
            onChangeEndTime(date?.valueOf());
            getDataDelay(txtSearch, timeRange.startTime, date?.valueOf());
          }}
        />
        <div className={styles.calendar}>{IC_CALENDAR()}</div>
      </div>
      <CustomButton className={styles.search_btn} onClick={() => null}>
        {txtSearch || timeRange.startTime || timeRange.endTime ? (
          <div
            className={styles.clear}
            onClick={() => {
              resetInput();
              getDataDelay("", null, null);
            }}
          >
            <div className={styles.icon}>{IC_CLOSE("var(--primary)")}</div>
            <Text color="primary">Clear</Text>
          </div>
        ) : (
          <Text color="primary">Search</Text>
        )}
      </CustomButton>
    </div>
  );
};
export default FileFilter;
