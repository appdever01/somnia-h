"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStakeId } from "@/redux/staking/stakeId";

type StakeCardPropTypes = {
  duration: number;
  apy: number;
  id: number;
};

export default function StakeCard(props: StakeCardPropTypes) {
  const { stake_id } = useSelector(
    (state: { stake_id: { stake_id: number } }) => state.stake_id,
  );
  const selectTl = useRef<gsap.core.Timeline | null>(null);
  const elementRef = useRef(null);
  const dispatch = useDispatch();

  useGSAP(() => {
    selectTl.current = gsap.timeline({ paused: true });

    if (selectTl.current != null && elementRef.current != null) {
      selectTl.current
        .to(elementRef.current, {
          scale: 0.9,
          duration: 0.1,
          ease: "power1.out",
        })
        .to(elementRef.current, {
          scale: 1,
          duration: 0.1,
          ease: "power1.in",
        });
    }
  }, []);

  const selectOption = () => {
    dispatch(setStakeId(Number(props.id)));
  };

  const removeOption = () => {
    dispatch(setStakeId(0));
  };

  const toggleSelect = () => {
    if (stake_id != Number(props.id) && selectTl.current != null) {
      selectTl.current.restart();
      selectOption();
    } else if (
      stake_id == Number(props.id) &&
      selectTl.current != null
    ) {
      selectTl.current.reverse();
      removeOption();
    }
  };
  return (
    <div
      className={
        "py-4 px-2 rounded-[0.25rem] flex flex-col gap-4 bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 hover:cursor-pointer border-[#09378c] border origin-center stakecard min-w-20 lg:min-w-52" +
        (stake_id === Number(props.id) ? " !bg-[rgba(39,89,197,1)]" : "")
      }
      ref={elementRef}
      onClick={toggleSelect}
    >
      <p className="font-love text-white sm:text-2xl lg:text-4xl">
        {props.duration} days
      </p>
      <p className="font-love text-[#71E092] text-sm sm:text-xl lg:text-[2rem]">
        {props.apy}% APY
      </p>
    </div>
  );
}
