"use client";

import store from "./store";
import { Provider } from "react-redux";
import UserRegistration from "@/components/userRegistration";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <UserRegistration />
    </Provider>
  );
}
