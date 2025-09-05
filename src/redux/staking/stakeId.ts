import { createSlice } from "@reduxjs/toolkit";

export const stakeIdSlice = createSlice({
  name: "stake_id",
  initialState: {
    stake_id: 0,
  },
  reducers: {
    setStakeId: (state, action) => {
      state.stake_id = action.payload;
    },
  },
});

export const { setStakeId } = stakeIdSlice.actions;

export default stakeIdSlice.reducer;
