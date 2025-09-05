import { createSlice } from "@reduxjs/toolkit";

export const diceStakeSlice = createSlice({
  name: "diceStake",
  initialState: {
    stake: 0,
  },
  reducers: {
    one: (state) => {
      if (state.stake !== 0.01) {
        state.stake = 0.01;
      } else {
        state.stake = 0;
      }
    },
    five: (state) => {
      if (state.stake !== 0.02) {
        state.stake = 0.02;
      } else {
        state.stake = 0;
      }
    },
    ten: (state) => {
      if (state.stake !== 0.05) {
        state.stake = 0.05;
      } else {
        state.stake = 0;
      }
    },
    fifteen: (state) => {
      if (state.stake !== 0.1) {
        state.stake = 0.1;
      } else {
        state.stake = 0;
      }
    },
    twenty: (state) => {
      if (state.stake !== 0.2) {
        state.stake = 0.2;
      } else {
        state.stake = 0;
      }
    },
    fifty: (state) => {
      if (state.stake !== 0.5) {
        state.stake = 0.5;
      } else {
        state.stake = 0;
      }
    },
    stakeInput: (state, action) => {
      const stakeValue = Number(action.payload);
      if (!isNaN(stakeValue)) {
        state.stake = stakeValue;
      }
    },
  },
});

export const {
  one,
  five,
  ten,
  fifteen,
  twenty,
  fifty,
  stakeInput,
} = diceStakeSlice.actions;

export default diceStakeSlice.reducer;
