import { createSlice } from "@reduxjs/toolkit";

export const flipPredictionSlice = createSlice({
  name: "flipPrediction",
  initialState: {
    prediction: "",
  },
  reducers: {
    heads: (state) => {
      if (state.prediction !== "heads") {
        state.prediction = "heads";
      } else {
        state.prediction = "";
      }
    },
    tails: (state) => {
      if (state.prediction !== "tails") {
        state.prediction = "tails";
      } else {
        state.prediction = "";
      }
    },
  },
});

export const { heads, tails } = flipPredictionSlice.actions;

export default flipPredictionSlice.reducer;
