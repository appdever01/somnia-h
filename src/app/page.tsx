"use client";

import Image from "next/image";
import Button from "@/components/button";
// import Mint from "@/components/mint";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageLoading } from "@/redux/loader/pageLoader";

export type userAccountType = {
  address: string;
  balance: string | number;
  stt_balance: string | number;
  walletName?: string;
  points?: number;
};

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageLoading(false));
  }, [dispatch]);

  return (
    <main className="w-screen min-h-screen pt-40 px-[22px] pb-16 flex flex-col items-center">
    <div className="flex gap-2 items-center">
      <div className="flex flex-col items-center gap-2 lg:gap-6 lg:w-1/2">
        <h1 className="font-rubik font-black text-center text-5xl text-foreground sm:text-7xl lg:text-8xl">
          SOMNIA PUMPAZ
        </h1>
        <div className="relative flex items-center justify-center lg:hidden">
          <div className="absolute w-[332px] h-[332px] rounded-full glowing-box"></div>
          <div className="absolute w-[332px] h-[332px] rounded-full glowing-box"></div>
          <Image
            src="/images/pumpazLogo.webp"
            alt="hero"
            width={332}
            height={332}
            className="my-8 z-10"
          />
        </div>
        <p className="font-unkempt font-black text-center text-xl lg:text-2xl">
          The First MemeCoin-Powered Play2Earn Casino Gaming on the Somnia Network
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-[35.375rem] mt-2">
          {/* <Mint bg="" text="foreground" border="" className="bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 border-bluetheme translate-x-1/2 col-span-2 w-1/2 text-nowrap" /> */}
          <a href="http://discord.gg/8Fh8jDRGd2">
            <Button
              content="Discord"
              variant="ghost"
              image="/icons/discord.svg"
              className="border-foreground"
            />
          </a>
          <a href="http://x.com/SomniaPumpaz">
            <Button
              content="Twitter"
              variant="ghost"
              image="/icons/twitter.svg"
              className="bg-foreground text-white border-foreground"
            />
          </a>
        </div>
      </div>
      <div className="relative flex items-center justify-center max-lg:hidden w-1/2">
        <div className="absolute w-[332px] h-[332px] rounded-full glowing-box"></div>
        <div className="absolute w-[332px] h-[332px] rounded-full glowing-box"></div>
        <Image
          src="/images/pumpazLogo.webp"
          alt="hero"
          width={332}
          height={332}
          className="my-8 z-10"
        />
      </div>
    </div>
  </main>
  );
}
