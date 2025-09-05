import { createSlice } from "@reduxjs/toolkit";

export const farmSlice = createSlice({
  name: "farmTime",
  initialState: {
    farmTime: 0,
  },
  reducers: {
    // set farm time
    setFarmTime: (state, action) => {
      state.farmTime = action.payload;
    },
  },
});

export const { setFarmTime } = farmSlice.actions;

export default farmSlice.reducer;
