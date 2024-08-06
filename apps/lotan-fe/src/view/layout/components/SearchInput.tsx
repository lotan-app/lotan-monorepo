import React, { FC } from "react";
import styles from "@View/layout/assets/search-input.module.scss";
import { IC_SEARCH } from "@App/common/icons";

interface ISearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: FC<ISearchInputProps> = ({
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className={styles.search_input}>
      <div className={styles.icon}>{IC_SEARCH()}</div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
export default SearchInput;
