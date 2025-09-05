"use client";

import { useSelector } from "react-redux";
import { LoadingSpinner } from "./loader";

export default function PageLoadingSpinner() {
  const { pageLoading } = useSelector(
    (state: { pageLoading: { pageLoading: boolean } }) => state.pageLoading,
  );

  if (!pageLoading) return;
  return (
    <div className="w-screen h-screen fixed top-0 left-0 py-36 flex justify-center bg-[#121212ab] z-[999]">
      <LoadingSpinner className="w-12 h-12 sm:w-12 sm:h-12 text-white" />
    </div>
  );
}