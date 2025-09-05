import { createSlice } from "@reduxjs/toolkit";

const pageLoaderSlice = createSlice({
  name: "pageLoading",
  initialState: {
    pageLoading: false,
  },
  reducers: {
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
  },
});

export const { setPageLoading } = pageLoaderSlice.actions;

export default pageLoaderSlice.reducer;