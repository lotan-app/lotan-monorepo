import React, { FC, useEffect, useState } from "react";
import InitResolver from "@App/resolver/InitResolver";
import { useDispatch, useSelector } from "react-redux";
import { selectorReduxActionType } from "@Services/server-data/serverDataSelector";
import { ReduxActionEnum } from "@Services/server-data/entities/ReduxActionEnum";
import { setReduxActionType } from "@Services/server-data/serverDataService";

const RootLayout: FC<any> = ({ children }) => {
  const [initResolverKey, setInitResolverKey] = useState(0);
  const dispatch = useDispatch();

  /**
   * InitResolver need to listen actionType
   * It should be remount everytime navigation
   * */
  const actionType = useSelector(selectorReduxActionType);

  useEffect(() => {
    if (actionType !== ReduxActionEnum.NONE_HYDRATE) {
      dispatch(setReduxActionType(ReduxActionEnum.NONE_HYDRATE));
      setInitResolverKey((key) => key + 1);
    }
  }, [actionType]);

  return (
    <>
      <>{children}</>
      <InitResolver key={initResolverKey} />
    </>
  );
};

export default RootLayout;
