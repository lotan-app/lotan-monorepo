import React, { FC } from "react";
import styles from "@View/layout/assets/date-picker.module.scss";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { IC_CARRET_RIGHT } from "@App/common/icons";
import { range } from "lodash";

interface IDatePickerProps {
  pickedTime: number;
  minDate?: number | Date;
  maxDate?: number | Date;
  placeholderText?: string;
  onChange: (date: Date) => void;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DatePickerComponent: FC<IDatePickerProps> = ({
  pickedTime,
  minDate,
  maxDate,
  placeholderText,
  onChange,
}) => {
  const currentTime = new Date();
  const selectedTime = pickedTime ? new Date(pickedTime) : null;
  const years = range(currentTime.getFullYear(), 2100, 1);
  return (
    <div className={styles.date_picker}>
      <DatePicker
        selected={selectedTime}
        renderCustomHeader={({
          date,
          monthDate,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="custom_monthyear">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="prev-tab"
            >
              {IC_CARRET_RIGHT()}
            </button>
            <div className="select_monthyear">
              <select
                className="select_month"
                value={months[monthDate.getMonth()]}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="select_year"
                value={monthDate.getFullYear()}
                onChange={({ target: { value } }) => changeYear(+value)}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="next-tab"
            >
              {IC_CARRET_RIGHT()}
            </button>
          </div>
        )}
        onChange={(date: Date) => {
          onChange(date);
        }}
        minDate={
          minDate
            ? typeof minDate === "number"
              ? new Date(minDate)
              : minDate
            : undefined
        }
        maxDate={
          maxDate
            ? typeof minDate === "number"
              ? new Date(minDate)
              : minDate
            : undefined
        }
        placeholderText={placeholderText}
        dateFormat="MM/d/yyyy"
      />
    </div>
  );
};
export default DatePickerComponent;
