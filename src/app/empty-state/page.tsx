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
    <main className="w-screen h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-lg mx-auto w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-block text-orange-500/60 font-mono text-sm px-3 py-1 rounded-full border border-orange-500/20">
            Wallet Required
          </div>
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-white">
            Connect Your Wallet
            <span className="block mt-2 text-xl md:text-2xl text-gray-400">
              to start playing
            </span>
          </h1>
        </div>

        <div className="bg-black/50 backdrop-blur-sm border border-orange-500/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-500"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            <span className="font-mono text-sm">
              Secure Web3 Connection Required
            </span>
          </div>

          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>

        <p className="text-sm text-gray-500 font-mono max-w-sm mx-auto">
          By connecting your wallet, you agree to our Terms of Service and
          Privacy Policy
        </p>
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
