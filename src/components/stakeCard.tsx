"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStakeId } from "@/redux/staking/stakeId";
import { FiClock, FiCalendar, FiGlobe } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";

type StakeCardPropTypes = {
  duration: number;
  apy: number;
  id: number;
};

export default function StakeCard(props: StakeCardPropTypes) {
  const { stake_id } = useSelector(
    (state: { stake_id: { stake_id: number } }) => state.stake_id
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
    } else if (stake_id == Number(props.id) && selectTl.current != null) {
      selectTl.current.reverse();
      removeOption();
    }
  };
  return (
    <div
      className={
        "group relative overflow-hidden rounded-lg p-6 text-center cursor-pointer transition-all duration-300 " +
        (stake_id === Number(props.id)
          ? "bg-black border border-orange-500 text-white"
          : "bg-black border border-orange-500/20 hover:border-orange-500")
      }
      ref={elementRef}
      onClick={toggleSelect}
    >
      <div className="relative z-10">
        <div className="mb-6">
          {props.duration <= 7 ? (
            <FiClock className="w-8 h-8 text-orange-300 mx-auto" />
          ) : props.duration <= 30 ? (
            <FiCalendar className="w-8 h-8 text-orange-300 mx-auto" />
          ) : (
            <FiGlobe className="w-8 h-8 text-orange-300 mx-auto" />
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className={
              "font-mono text-2xl font-bold" +
              (stake_id === Number(props.id)
                ? " text-white"
                : " text-gray-300")
            }>
              {props.duration} days
            </p>
            <p className={
              stake_id === Number(props.id)
                ? "text-gray-300 text-sm mt-1"
                : "text-gray-500 text-sm mt-1"
            }>
              Lock Period
            </p>
          </div>
          <div className="h-px bg-orange-500/20"></div>
          <div>
            <p className="font-mono text-2xl font-bold text-orange-500">
              {props.apy}% APY
            </p>
            <p className={
              stake_id === Number(props.id)
                ? "text-gray-300 text-sm mt-1"
                : "text-gray-500 text-sm mt-1"
            }>
              Annual Return
            </p>
          </div>
        </div>
        <div className="mt-6 text-sm">
          {stake_id === Number(props.id) ? (
            <span className="text-white flex items-center justify-center gap-2">
              <FiCheck className="w-4 h-4" /> Selected
            </span>
          ) : (
            <span className="text-gray-400">Click to select</span>
          )}
        </div>
      </div>
      {stake_id === Number(props.id) && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <FiCheck className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
