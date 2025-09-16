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
        "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105 origin-center stakecard min-w-24 lg:min-w-60" +
        (stake_id === Number(props.id)
          ? " bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-2xl scale-105"
          : " bg-white/90 backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white shadow-lg hover:shadow-xl")
      }
      ref={elementRef}
      onClick={toggleSelect}
    >
      <div className="relative z-10">
        <div className="text-4xl mb-4">
          {props.duration <= 7 ? '⏰' : props.duration <= 30 ? '📅' : '🗺️'}
        </div>
        <div className="space-y-2">
          <p className="font-bold text-2xl sm:text-3xl lg:text-4xl">
            {props.duration} days
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>
          <p className={
            "font-bold text-lg sm:text-xl lg:text-2xl" +
            (stake_id === Number(props.id) ? " text-green-200" : " text-emerald-600")
          }>
            {props.apy}% APY
          </p>
        </div>
        <div className="mt-4 text-sm opacity-75">
          {stake_id === Number(props.id) ? '✅ Selected' : 'Click to select'}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      {stake_id === Number(props.id) && (
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
