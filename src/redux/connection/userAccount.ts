import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "userAccount",
  initialState: {
    userAccount: {
      address: "",
      balance: "",
      stt_balance: "",
      walletName: "",
    },
  },
  reducers: {
    setUserAccount: (state, action) => {
      state.userAccount = action.payload;
    },
  },
});

export const { setUserAccount } = userSlice.actions;

export default userSlice.reducer;
