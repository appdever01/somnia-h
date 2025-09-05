import { createSlice } from "@reduxjs/toolkit";

export const mintSlice = createSlice({
  name: "mintTime",
  initialState: {
    mintTime: 0,
  },
  reducers: {
    // set mint time
    setMintTime: (state, action) => {
      state.mintTime = action.payload;
    },
  },
});

export const { setMintTime } = mintSlice.actions;

export default mintSlice.reducer;
