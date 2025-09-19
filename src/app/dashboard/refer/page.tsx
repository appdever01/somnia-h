"use client";

// import Button from "@/components/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import PageLoadingSpinner from "@/components/pageLoader";
// import { toast } from "sonner";
// import { useAccount } from "wagmi";
// import { getReferralDetails } from "@/app/api/contractApi";

// type refDetailsType = {
//   referralCode: string, 
//   referredUsers: number, 
//   earning: number,
// }

// export default function Refer() {
//   const { isConnected } = useAccount();
//   const [refDetails, setRefDetails] = useState<refDetailsType>();
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     if (!isConnected) {
//       router.replace("/empty-state");
//     }
//   }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     if (isConnected) {
//       handleGetRefDetails();
//     }
//   }, [isConnected])

//   const handleGetRefDetails = async () => {
//     try {
//       const result = await getReferralDetails();
//       setRefDetails(result);
//       toast.success("Successfully got referral details")
//     } catch (error) {
//       console.error("An error occured: ", error);
//       toast.error("Failed to get referral details");
//     }
//   }

//   const copyRefLink = async () => {
//     if (!refDetails) return;
//     await navigator.clipboard.writeText(
//       `${process.env.NEXT_PUBLIC_BASE_URL_VERCEL}/?ref=${refDetails.referralCode}`,
//     );
//     setCopied(true);

//     setTimeout(() => {
//       setCopied(false);
//     }, 2000);
//   };

//   const shareRefLink = () => {
//     if (!navigator.share) {
//       toast.error("Sharing is not supported on your browser. Copy link instead");
//       return;
//     }
//     if (!refDetails) return;

//     navigator
//       .share({
//         title: "Join me on Somnia Nexus!",
//         text: "Earn rewards by joining SomniaNexus on our journey to Pump Somnia to the Moon!",
//         url: `${process.env.NEXT_PUBLIC_BASE_URL_VERCEL}/?ref=${refDetails.referralCode}`,
//       })
//       .catch((error) => console.error("Sharing failed: ", error));
//   };

//   return (
//     <Suspense fallback={<PageLoadingSpinner />}>
//       <main className="w-full px-5 flex flex-col items-center gap-8 mb-24 sm:w-3/5 lg:max-w-[51.1875rem] lg:mt-36">
//         <h1 className="font-rubik text-5xl text-center w-[20.9375rem] sm:text-3xl lg:text-5xl">
//           Friends
//         </h1>
//         <p className="font-unkempt capitalize text-center text-xl lg:text-3xl">
//           Refer your friends to earn rewards
//         </p>
//         <h2 className="font-love text-xl lg:text-2xl w-full -mb-6">Refer</h2>
//         <p className="font-unkempt">
//           Invite your friends to join the SomniaNexus community and earn 1000
//           points for every referral! Share your unique link and start earning
//           rewards today
//           NOTE: To eliminate bot referrals, rewards will only be received once your referral interacts with the SomniaNexus platform
//         </p>

//         <div className="flex justify-between items-center w-full">
//           <div className="flex flex-col gap-1">
//             <p className="font-love">Total Referrals</p>
//             <p className="font-unkempt text-sm">
//               {refDetails && refDetails.referredUsers} friends
//             </p>
//           </div>
//           <div className="flex flex-col gap-1 items-end">
//             <p className="font-love">Points Earned</p>
//             <p className="font-unkempt text-sm">
//               {refDetails && refDetails.earning} Points
//             </p>
//           </div>
//         </div>

//         <p className="font-unkempt text-sm capitalize w-full">
//           Share your referral link and earn rewards
//         </p>
//         <div className="flex gap-4 items-center">
//           <div
//             className="bg-foreground text-white rounded-xl h-full p-4 hover:cursor-pointer flex items-center justify-center aspect-square"
//             onClick={copyRefLink}
//           >
//             {!copied ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-copy"
//               >
//                 <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
//                 <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-clipboard-check"
//               >
//                 <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
//                 <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
//                 <path d="m9 14 2 2 4-4" />
//               </svg>
//             )}
//           </div>
//           <Button
//             content="Invite A Friend"
//             className="bg-foreground border-background text-white font-unkempt w-full !text-2xl"
//             onClick={shareRefLink}
//           />
//         </div>
//       </main>
//     </Suspense>
//   );
// }

export default function Refer() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/empty-state");
  }, []);
}