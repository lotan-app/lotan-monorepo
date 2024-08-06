import React, { FC } from "react";
import styles from "@View/layout/assets/pagination.module.scss";
import { styleCombine } from "@App/common/helper";
import Text from "./Text";
import { IC_CARRET_RIGHT } from "@App/common/icons";

interface PaginationProps {
  handleChangePagination: (event: React.MouseEvent<HTMLButtonElement>) => void;
  currentPage: number;
  maxPage: number;
  className?: string;
  loading?: boolean;
}

const Pagination: FC<PaginationProps> = ({
  handleChangePagination,
  currentPage,
  maxPage,
  className = "",
  loading,
}) => {
  const disabledPrev = currentPage === 1 || loading;
  const disabledNext = currentPage >= maxPage || loading;
  return (
    <div className={styleCombine(styles.main, className)}>
      <nav className={styles.list_pagination}>
        <div className={styles.group_input}>
          <Text fontWeight={400} size={14} color={"neutral-n6"}>
            Page {currentPage} of {maxPage}
          </Text>
        </div>
        <div className={styles.btn_group}>
          <button
            className={styleCombine(styles.btn_secondary_custom, styles.prev)}
            data-value="-1"
            onClick={handleChangePagination}
            disabled={disabledPrev}
          >
            {IC_CARRET_RIGHT(
              disabledPrev ? "var(--neutral-n3)" : "var(--neutral-n7)"
            )}
          </button>
          <button
            className={styleCombine(styles.btn_secondary_custom, styles.next)}
            data-value="1"
            onClick={handleChangePagination}
            disabled={disabledNext}
          >
            {IC_CARRET_RIGHT(
              disabledNext ? "var(--neutral-n3)" : "var(--neutral-n7)"
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Pagination;
