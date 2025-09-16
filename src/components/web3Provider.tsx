"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { somniaTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { Toaster } from "sonner";
import { http } from "viem";

// const otherWallets = (ckConfig.connectors ?? []).filter((connector) => !["coin98", "coinbaseWallet", "metamask"].includes(connector.id?.toLowerCase?.()));

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [somniaTestnet],
    transports: {
      // RPC URL for each chain
      [somniaTestnet.id]: http("https://dream-rpc.somnia.network/"),
    },

    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    appName: "Nexus Gaming",

    appDescription:
      "The Ultimate Blockchain Gaming Platform for Play-to-Earn Casino Games",
    appUrl: process.env.NEXT_PUBLIC_APP_URL!, // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
