import { createSlice } from "@reduxjs/toolkit";

export const menuStateSlice = createSlice({
  name: "menuOpen",
  initialState: {
    menuOpen: false,
  },
  reducers: {
    setMenuOpen: (state, action) => {
      state.menuOpen = action.payload;
    },
  },
});

export const { setMenuOpen } = menuStateSlice.actions;

export default menuStateSlice.reducer;
