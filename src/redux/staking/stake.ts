import { createSlice } from "@reduxjs/toolkit";

export const stakingSlice = createSlice({
  name: "staking",
  initialState: {
    staking: 0,
  },
  reducers: {
    setStaking: (state, action) => {
      const stakeValue = Number(action.payload);
      if (!isNaN(stakeValue)) {
        state.staking = stakeValue;
      }
    },
  },
});

export const { setStaking } = stakingSlice.actions;

export default stakingSlice.reducer;
