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
        "border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 px-6 py-2.5 rounded font-mono text-sm transition-colors duration-200 flex items-center justify-center gap-2 hover:cursor-pointer " +
        `${props.className}`
      }
      onClick={props.onClick}
    >
      {props.image && (
        <Image
          src={props.image}
          alt={props.content + "icon"}
          width={20}
          height={20}
          className="opacity-80"
        />
      )}
      <span>{props.content}</span>
    </div>
  );
}
