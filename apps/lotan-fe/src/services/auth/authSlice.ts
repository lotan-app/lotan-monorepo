import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthDataState {
  accountLogin: string;
}

const authDataSlice = createSlice({
  name: "auth",
  initialState: {
    accountLogin: "",
  } as AuthDataState,
  reducers: {
    setAccountLogin: (state, action: PayloadAction<string>) => {
      state.accountLogin = action.payload;
    },
  },
});

export default authDataSlice;
