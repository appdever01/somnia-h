import Image from "next/image";

type LeaderBoardCardPropTypes = {
  profilePic: string;
  name: string;
  points: number;
  rank: number;
};

export default function LeaderBoardCard(props: LeaderBoardCardPropTypes) {
  const truncatedAddress = `${props.name.slice(0, 4)}...${props.name.slice(-4)}`;

  return (
    <div className="flex items-center justify-between w-full lg:max-w-[40rem] bg-[#FFFFFF33] rounded-lg p-4">
      <div className="flex items-center gap-1">
        <Image
          src={props.profilePic}
          alt="profile picture"
          width={36}
          height={36}
          className="sm:w-12 lg:w-20"
        />
        <div className="flex flex-col gap-1">
          <p
            className="font-love text-sm sm:text-2xl lg:text-4xl w-24 lg:w-48 truncate"
            title={props.name}
          >
            {truncatedAddress}
          </p>
          <p className="font-unkempt text-xs sm:text-base lg:text-2xl">
            {props.points} Points
          </p>
        </div>
      </div>
      {props.rank === 1 ? (
        <Image
          src="/images/gold.webp"
          alt="first rank"
          width={39}
          height={53.5}
          className="sm:w-[48px] lg:w-[66px]"
        />
      ) : props.rank === 2 ? (
        <Image
          src="/images/silver.webp"
          alt="second rank"
          width={39}
          height={53.5}
          className="sm:w-[48px] lg:w-[66px]"
        />
      ) : props.rank === 3 ? (
        <Image
          src="/images/bronze.webp"
          alt="third rank"
          width={39}
          height={53.5}
          className="sm:w-[48px] lg:w-[66px]"
        />
      ) : (
        <p className="font-unkempt text-xs sm:text-base lg:text-2xl">
          #{props.rank}
        </p>
      )}
    </div>
  );
}
