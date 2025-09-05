import Image from "next/image";

type buttonPropTypes = {
  image?: string;
  content: string;
  variant?: "default" | "ghost";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export default function Button(props: buttonPropTypes) {
  return (
    <div
      className={
        "border-2 rounded-2xl p-4 flex items-center justify-center gap-1 hover:cursor-pointer " +
        `${props.className}`
      }
      onClick={props.onClick}
    >
      {props.image && (
        <Image
          src={props.image}
          alt={props.content + "icon"}
          width={24}
          height={24}
        />
      )}
      <p className="text-xs font-love sm:text-xl">{props.content}</p>
    </div>
  );
}
