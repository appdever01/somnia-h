// import Image from "next/image" // Commented out as not currently used

export default function Coin(props: { className?: string }) {
  const slices = 60;
  const radius = 80;
  const thickness = 12;

  const rimSlices = Array.from({ length: slices }, (_, i) => {
    const angle = (i / slices) * 360;
    return (
      <div key={i} style={{
        position: 'absolute',
        width: `${(2 * Math.PI * radius) / slices}px`,
        height: `${thickness}px`,
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
        transformOrigin: 'center center',
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
      }}></div>
    )
  })

  return (
    <div className={"coin w-40 h-40 transform-gpu " + `${props.className}`} style={{ transformStyle: 'preserve-3d' }}>
      {/* Tails Side */}
      <div className="tails w-full h-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 border-4 border-purple-400 rounded-full font-rubik text-white text-center flex items-center justify-center scale-x-[-1] shadow-2xl">
        <div className="text-2xl sm:text-3xl font-bold leading-tight">
          <div className="text-yellow-300 text-4xl mb-1">🪙</div>
          <div>Somnia</div>
          <div>Pumpaz</div>
        </div>
        <div className="absolute inset-2 border border-purple-300 rounded-full opacity-50"></div>
      </div>

      {/* Coin Edge/Rim */}
      <div className="absolute top-1/2 left-1/2 w-full h-full -rotate-90 [transform:rotateX(90deg)_translateX(-3px)]" style={{ transformStyle: 'preserve-3d', transformOrigin: 'top' }}>
        {rimSlices}
      </div>

      {/* Heads Side */}
      <div className="heads w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-4 border-blue-400 rounded-full flex items-center justify-center shadow-2xl">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full border-2 border-blue-300 flex items-center justify-center">
            <span className="text-4xl">🪙</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-full"></div>
        </div>
        <div className="absolute inset-2 border border-blue-300 rounded-full opacity-50"></div>
      </div>
    </div>
  )
}