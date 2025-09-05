import { createSlice } from "@reduxjs/toolkit";

export type StakeOptionType = {
  duration: number;
  minimum: number;
  apy: number;
  id: number;
};

export const stakeOptionSlice = createSlice({
  name: "stakeOption",
  initialState: {
    stakeOption: {
      duration: 0,
      minimum: 0,
      apy: 0,
      id: 0,
    } as StakeOptionType,
  },
  reducers: {
    selectStakeOption: (state, action) => {
      state.stakeOption = action.payload;
    },
  },
});

export const { selectStakeOption } = stakeOptionSlice.actions;

export default stakeOptionSlice.reducer;
