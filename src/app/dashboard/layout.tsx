import Wallet from "@/components/wallet";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-12 lg:mt-36">
      <div className="lg:hidden">
        <Wallet />
      </div>
      {children}
    </div>
  );
}