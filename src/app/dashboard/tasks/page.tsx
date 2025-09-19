"use client"

import Button from "@/components/button";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Define types for task status
interface TaskStatus {
  x_claimed: boolean;
  discord_claimed: boolean;
  x_claimedAt: string | null;
  discord_claimedAt: string | null;
  hasClaimed: boolean;
  discordUsername: string | null;
}

export default function Tasks() {
  const { address, isConnected } = useAccount();
  const [claimable, setClaimable] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [connectingDiscord, setConnectingDiscord] = useState<boolean>(false);
  const [disconnectingDiscord, setDisconnectingDiscord] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    x_claimed: false,
    discord_claimed: false,
    x_claimedAt: null,
    discord_claimedAt: null,
    hasClaimed: false,
    discordUsername: null
  });
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected, router]);

  const handleCanClaim = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/tasks/can-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });
      
      const data = await res.json();
      
      if (data.status === true) {
        // User can claim
        setTaskStatus({
          x_claimed: data.data?.x_claimed || false,
          discord_claimed: data.data?.discord_claimed || false,
          x_claimedAt: data.data?.x_claimedAt || null,
          discord_claimedAt: data.data?.discord_claimedAt || null,
          hasClaimed: data.data?.hasClaimed || false,
          discordUsername: data.data?.discordUsername || null
        });
        
        setClaimable(!data.data?.hasClaimed);
      } else {
        // Handle error cases
        setError(data.message || "Failed to check claim status");
        
        if (data.data?.hasClaimed) {
          toast.info("You have already claimed your points");
          setTaskStatus(prevStatus => ({
            ...prevStatus,
            hasClaimed: true
          }));
        }
        
        setClaimable(false);
      }
    } catch (err) {
      console.error("Error checking claim status:", err);
      setError("Failed to connect to server. Please try again later.");
      setClaimable(false);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const handleConnectDiscord = useCallback(async () => {
    if (!address) return;
    
    setConnectingDiscord(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks/auth-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });

      const data = await res.json();
      
      if (data.status === true && data.data?.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        toast.error(data.message || "Failed to connect to Discord");
        setError(data.message || "Failed to connect to Discord");
      }
    } catch (err) {
      console.error("Error connecting to Discord:", err);
      toast.error("Failed to connect to server. Please try again later.");
      setError("Failed to connect to server. Please try again later.");
    } finally {
      setConnectingDiscord(false);
    }
  }, [address]);

  const handleDisconnectDiscord = useCallback(async () => {
    if (!address) return;
    
    setDisconnectingDiscord(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks/disconnect-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });

      const data = await res.json();
      
      if (data.status === true) {
        toast.success("Discord account disconnected successfully");
        setTaskStatus(prev => ({
          ...prev,
          discord_claimed: false,
          discordUsername: null
        }));
      } else {
        toast.error(data.message || "Failed to disconnect Discord account");
        setError(data.message || "Failed to disconnect Discord account");
      }
    } catch (err) {
      console.error("Error disconnecting Discord:", err);
      toast.error("Failed to connect to server. Please try again later.");
      setError("Failed to connect to server. Please try again later.");
    } finally {
      setDisconnectingDiscord(false);
    }
  }, [address]);

  useEffect(() => {
    handleCanClaim();
  }, [isConnected, address, handleCanClaim])

  const handleClaim = useCallback(async () => {
    if (!address) return;
    if (!taskStatus.discordUsername) {
      toast.error("Please connect your Discord account first");
      return;
    }
    
    setClaiming(true);
    setError(null);
    
    try {
      const res = await fetch('/api/tasks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });
      
      const data = await res.json();
      
      if (data.status === true) {
        toast.success("Successfully claimed 500 Points!");
        setTaskStatus(prevStatus => ({
          ...prevStatus,
          x_claimed: true,
          discord_claimed: true,
          x_claimedAt: data.data?.x_claimedAt || new Date().toISOString(),
          discord_claimedAt: data.data?.discord_claimedAt || new Date().toISOString(),
          hasClaimed: true
        }));
        setClaimable(false);
      } else {
        // Handle specific error cases
        if (data.message === "User already claimed") {
          toast.info("You have already claimed your points");
          setTaskStatus(prevStatus => ({
            ...prevStatus,
            hasClaimed: true
          }));
        } else if (data.message === "User is not a member of the Discord server") {
          toast.error("Please join our Discord server first");
        } else {
          toast.error(data.message || "Failed to claim points");
        }
        
        setError(data.message || "Failed to claim points");
      }
    } catch (err) {
      console.error("Error claiming points:", err);
      toast.error("Failed to connect to server. Please try again later.");
      setError("Failed to connect to server. Please try again later.");
    } finally {
      setClaiming(false);
    }
  }, [address, taskStatus.discordUsername]);

  return (
    <main className="w-full px-5 flex flex-col items-center gap-8 mb-24">
      <h1 className="font-rubik text-center text-3xl lg:text-5xl">
        SomniaNexus Tasks
      </h1>
      <h2 className="font-love lg:text-xl lg:max-w-3/5 lg:text-center">Get started by completing a few simple steps. Follow us on X and join our Discord community to earn 500 Points - it&apos;s fast, easy, and totally worth it.</h2>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-background"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-md p-4 w-full max-w-md">
              <p className="font-unkempt text-white text-center">{error}</p>
            </div>
          )}

          {taskStatus.hasClaimed ? (
            <div className="bg-green-500/20 border border-green-500 rounded-md p-4 w-full max-w-md">
              <p className="font-unkempt text-white text-center">You have already claimed your 500 Points!</p>
            </div>
          ) : (
            <>
              {/* Discord Connection Status */}
              <div className="flex flex-col gap-6 bg-foreground rounded-md py-8 px-12 w-full max-w-md">
                <h3 className="font-love text-white lg:text-xl">Discord Connection</h3>
                {taskStatus.discordUsername ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-[rgba(39,89,197,0.2)] p-4 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#70ffb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
                      <p className="font-unkempt text-white">Connected as <span className="text-[#70ffb5]">{taskStatus.discordUsername}</span></p>
                    </div>
                    <div 
                      className={
                        "relative w-full h-14 bg-[#1E1E1E] hover:bg-[#2D2D2D] rounded-lg border-2 border-[#FF4444] cursor-pointer flex items-center justify-center group transition-all duration-300" +
                        (disconnectingDiscord ? " animate-pulse pointer-events-none" : "")
                      }
                      onClick={handleDisconnectDiscord}
                    >
                      {!disconnectingDiscord && (
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
                          className="absolute left-4 text-[#FF4444]"
                        >
                          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                      )}
                      <span className="font-love text-white text-xl">
                        {!disconnectingDiscord ? "Disconnect Discord" : "Disconnecting..."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    content={!connectingDiscord ? "Connect Discord Account" : "Connecting..."}
                    className={
                      "bg-[rgba(88,101,242,0.6)] hover:bg-[rgba(88,101,242,0.8)] duration-300 w-full border-[#5865F2]" +
                      (connectingDiscord ? " animate-pulse pointer-events-none" : "")
                    }
                    onClick={handleConnectDiscord}
                  />
                )}
              </div>
              
              <div className="bg-[#FFFFFF33] rounded-lg w-full lg:w-fit p-4 sm:bg-[#12121233] lg:p-16 mb-8 flex flex-col lg:flex-row lg:justify-between items-center gap-6 lg:gap-8">
                <div className="flex flex-col gap-6 bg-foreground rounded-md p-4">
                  <h3 className="font-love text-white lg:text-xl">Task 1: Follow us on X</h3>
                  <p className="font-unkempt text-white lg:text-lg">Stay in the loop with the latest updates, events, and drops.</p>
                  <a 
                    href="https://twitter.com/SomniaNexus" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={
                      "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer flex justify-between items-center"
                    }
                  >
                    <p className="font-unkempt text-white lg:text-lg">Follow <span className="text-background italic">@SomniaNexus</span></p>
                    {taskStatus.x_claimed ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#70ffb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    )}
                  </a>
                </div>

                <div className="flex flex-col gap-6 bg-foreground rounded-md p-4">
                  <h3 className="font-love text-white lg:text-xl">Task 2: Join our Discord</h3>
                  <p className="font-unkempt text-white lg:text-lg">Connect with the community, access support, and be part of the action.</p>
                  <a 
                    href="https://discord.com/invite/KdZReabvcU" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={
                      "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer flex justify-between items-center"
                    }
                  >
                    <p className="font-unkempt text-white lg:text-lg">Join <span className="text-background italic">SomniaNexus Discord</span></p>
                    {taskStatus.discord_claimed ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#70ffb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    )}
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <p className="font-love text-center lg:text-xl">
                  {taskStatus.x_claimed && taskStatus.discord_claimed 
                    ? "Nice! You've completed all tasks\nYou've earned 500 Points" 
                    : "Complete both tasks to claim your points"}
                </p>
                
                {!taskStatus.x_claimed && (
                  <p className="font-unkempt text-yellow-300 text-center text-sm">
                    Please follow us on X to continue
                  </p>
                )}
                
                {!taskStatus.discord_claimed && (
                  <p className="font-unkempt text-yellow-300 text-center text-sm">
                    Please join our Discord server to continue
                  </p>
                )}
                
                {!taskStatus.discordUsername && (
                  <p className="font-unkempt text-yellow-300 text-center text-sm">
                    Please connect your Discord account above
                  </p>
                )}
                
                <Button
                  content={!claiming ? "Claim Your Points" : "Claiming..."}
                  className={
                    "bg-[rgba(39,89,197,0.6)] hover:bg-[rgba(39,89,197,0.8)] duration-300 w-full border-bluetheme" +
                    (claimable && taskStatus.discordUsername
                      ? " opacity-100 hover:cursor-pointer"
                      : " opacity-50 pointer-events-none hover:cursor-not-allowed") +
                    (claiming ? " animate-pulse pointer-events-none" : "")
                  }
                  onClick={handleClaim}
                />
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}