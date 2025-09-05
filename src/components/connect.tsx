import Button from "./button"

export default function Connect() {
    return (
        <div id="modalAnchor" className={"w-screen h-screen bg-background items-center justify-center fixed top-0 left-0 -z-20 modal origin-center scale-0 sm:p-24 flex"}>
        <div className="bg-[#12121233] rounded-lg w-[20.8125rem] sm:w-full sm:max-w-[46rem] py-7 px-10">
            <div className="grid grid-cols-1 bg-foreground rounded-md relative">
                <p className="w-full font-halo pt-5 px-4 pb-3 sm:pb-6 sm:pt-16 text-white sm:text-3xl lg:text-4xl">Connect wallet</p>
                <div className="w-full h-[1px] bg-[#FFFFFFB2]"></div>
                {/* <div className="flex gap-2 py-3 px-4 sm:py-4 sm:px-6 hover:cursor-pointer" onClick={() => connectNightly()}>
                    <Image src={wallet.image} alt="wallet icon" width={18} height={18} className="sm:w-10" />
                    <p className="text-white text-xs font-pulang sm:text-2xl">{wallet.name}</p>
                </div> */}
                <div className="flex flex-col items-center gap-4 lg:gap-6 w-fit mx-auto my-6">
                  <Button content="Nightly Wallet" className="bg-foreground border-white text-white w-full" />
                </div>
                <div className="w-6 h-6 absolute flex items-center justify-center top-0 right-2 pt-2 hover:cursor-pointer" onClick={close}>
                    <div className="w-full h-[1px] bg-white absolute -rotate-45"></div>
                    <div className="w-full h-[1px] bg-white absolute rotate-45"></div>
                </div>
            </div>
        </div>
    </div>
    )
}