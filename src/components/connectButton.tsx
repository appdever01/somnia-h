"use client"

import { ConnectKitButton } from "connectkit";
import Button from "./button"
import { useDisconnect } from "wagmi";

export default function ConnectButton(props: { className?: string }) {
    const { disconnect } = useDisconnect();

    return (
        <ConnectKitButton.Custom>
            {({ isConnecting, show }) => {
                return (
                    <Button
                    content={!isConnecting ? "Connect Wallet" : "Connecting..."}
                    className={props.className + (isConnecting ? " animate-pulse pointer-events-none" : "")}
                    onClick={async () => {
                        disconnect();
                        await new Promise((res) => setTimeout(res, 100));
                        if (show) show();
                    }} />
                )
            }}
        </ConnectKitButton.Custom>
    )
}