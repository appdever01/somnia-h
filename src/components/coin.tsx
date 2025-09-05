import Image from "next/image"

export default function Coin(props: { className?: string }) {
  const slices = 60;
  const radius = 80;
  const thickness = 10;

  const rimSlices = Array.from({ length: slices }, (_, i) => {
    const angle = (i / slices) * 360;
    return (
      <div key={i} style={{
        position: 'absolute',
        width: `${(2 * Math.PI * radius) / slices}px`,
        height: `${thickness}px`,
        backgroundColor: '#09378c',
        transformOrigin: 'center center',
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`
      }}></div>
    )
  })

  return (
    <div className={"coin w-40 h-40 " + `${props.className}`}>
      <div className="tails w-full h-full bg-[#275bcb] border-4 border-bluetheme rounded-full font-rubik text-3xl text-center flex items-center justify-center scale-x-[-1]">Somnia<br />Pumpaz</div>
      <div className="absolute top-1/2 left-1/2 w-full h-full -rotate-90 [transform:rotateX(90deg)_translateX(-3px)]" style={{ transformStyle: 'preserve-3d', transformOrigin: 'top' }}>
        {rimSlices}
      </div>
      <div className="heads w-full h-full bg-[#275bcb] border-4 border-bluetheme rounded-full flex items-center justify-center">
        <Image src="/images/pumpaz.webp" alt="" width={400} height={400} className="w-32" />
      </div>
    </div>
  )
}