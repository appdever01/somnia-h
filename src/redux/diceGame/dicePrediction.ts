import { createSlice } from "@reduxjs/toolkit";

export const dicePredictionSlice = createSlice({
  name: "dicePrediction",
  initialState: {
    prediction: "",
  },
  reducers: {
    lower: (state) => {
      if (state.prediction !== "lower") {
        state.prediction = "lower";
      } else {
        state.prediction = "";
      }
    },
    equal: (state) => {
      if (state.prediction !== "equal") {
        state.prediction = "equal";
      } else {
        state.prediction = "";
      }
    },
    higher: (state) => {
      if (state.prediction !== "higher") {
        state.prediction = "higher";
      } else {
        state.prediction = "";
      }
    },
  },
});

export const { lower, equal, higher } = dicePredictionSlice.actions;

export default dicePredictionSlice.reducer;
