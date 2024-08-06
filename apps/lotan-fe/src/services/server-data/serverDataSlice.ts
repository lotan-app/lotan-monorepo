import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxActionEnum } from "@Services/server-data/entities/ReduxActionEnum";

interface ServerDataState {
  reduxAction: ReduxActionEnum;
}

const serverDataSlice = createSlice({
  name: "serverData",
  initialState: {
    reduxAction: ReduxActionEnum.NONE_HYDRATE,
  } as ServerDataState,
  reducers: {
    setActionType: (state, action: PayloadAction<ReduxActionEnum>) => {
      state.reduxAction = action.payload;
    },
  },
});

export default serverDataSlice;
