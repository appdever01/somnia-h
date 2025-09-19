type LeaderBoardCardPropTypes = {
  profilePic: string;
  name: string;
  points: number;
  rank: number;
};

export default function LeaderBoardCard(props: LeaderBoardCardPropTypes) {
  const truncatedAddress = `${props.name.slice(0, 4)}...${props.name.slice(
    -4
  )}`;

  return (
    <div className="flex items-center justify-between bg-black/50 border border-orange-500/10 rounded-lg p-4 hover:border-orange-500/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
          <span className="text-orange-500 text-sm font-mono">
            {props.rank <= 3
              ? props.rank === 1
                ? "🥇"
                : props.rank === 2
                ? "🥈"
                : "🥉"
              : `#${props.rank}`}
          </span>
        </div>
        <div>
          <p className="font-mono text-white text-sm" title={props.name}>
            {truncatedAddress}
          </p>
          <p className="text-gray-400 text-xs">{props.points} Points</p>
        </div>
      </div>
      <div className="font-mono text-sm">
        {props.rank === 1 ? (
          <span className="text-orange-500">1st</span>
        ) : props.rank === 2 ? (
          <span className="text-gray-300">2nd</span>
        ) : props.rank === 3 ? (
          <span className="text-orange-300">3rd</span>
        ) : (
          <span className="text-gray-400">#{props.rank}</span>
        )}
      </div>
    </div>
  );
}
