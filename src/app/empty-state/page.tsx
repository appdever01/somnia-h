"use client";

import Image from "next/image";
import { Suspense, useEffect, useTransition } from "react"; //useRef
import { useRouter } from "next/navigation"; //useSearchParams
// import { userAccountType } from "../page";
import { useDispatch } from "react-redux"; //useSelector
// import { setUserAccount } from "@/redux/connection/userAccount";
import { setPageLoading } from "@/redux/loader/pageLoader";
// import { toast } from "sonner";
import ConnectButton from "@/components/connectButton";
import { useAccount } from "wagmi";

function Empty() {
  const { isConnected } = useAccount();
  const [isPending, startTransition] = useTransition();
  // const { userAccount } = useSelector(
  //   (state: { userAccount: { userAccount: userAccountType } }) =>
  //     state.userAccount,
  // );
  const router = useRouter();
  // const searchParams = useSearchParams();
  const dispatch = useDispatch();
  // const ref = searchParams.get("ref");

  useEffect(() => {
    dispatch(setPageLoading(false));
    if (isPending) {
      dispatch(setPageLoading(true));
    } else {
      dispatch(setPageLoading(false));
    }
  }, [isPending, dispatch]);

  useEffect(() => {
    if (isConnected) {
      startTransition(() => {
        router.replace("/");
      });
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center gap-8 pt-12 lg:pt-32 overflow-hidden">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[192px] h-[192px] sm:w-[233px] sm:h-[233px] rounded-full glowing-box"></div>
        <div className="absolute w-[192px] h-[192px] sm:w-[233px] sm:h-[233px] rounded-full glowing-box"></div>
        <Image
          src="/images/pumpazLogo.webp"
          alt="pumpaz logo"
          width={192}
          height={192}
          className="sm:w-[233px] z-10"
        />
      </div>
      <div className="flex flex-col items-center gap-4 w-[269px] sm:w-full sm:max-w-[42.375rem]">
        <p className="font-love text-4xl text-center sm:text-5xl">
          You have not connected your wallet
        </p>
        <ConnectButton className="border-blueground" />
      </div>
    </main>
  );
}

export default function EmptyState() {
  return (
    <Suspense>
      <Empty />
    </Suspense>
  );
}