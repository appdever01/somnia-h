import { configureStore } from "@reduxjs/toolkit";
import menuStateReducer from "./menu/status";
import dicePredictionReducer from "./diceGame/dicePrediction";
import diceStakeReducer from "./diceGame/diceStake";
import userReducer from "./connection/userAccount";
import stakingReducer from "./staking/stake";
import stakeOptionReducer from "./staking/stakeOption";
import stakeIdReducer from "./staking/stakeId";
import flipPredictionReducer from "./coinFlip/coinPrediction";
import flipStakeReducer from "./coinFlip/coinStake";
import farmTimeReducer from "./farm/farm";
import mintReducer from "./mint/mint";
import pageLoadingReducer from "./loader/pageLoader";


export default configureStore({
    reducer: {
      menuOpen: menuStateReducer,
      dicePredictor: dicePredictionReducer,
      diceStake: diceStakeReducer,
      userAccount: userReducer,
      staking: stakingReducer,
      stakeOption: stakeOptionReducer,
      stake_id: stakeIdReducer,
      flipPrediction: flipPredictionReducer,
      flipStake: flipStakeReducer,
      farmingTime: farmTimeReducer,
      mintTime: mintReducer,
      pageLoading: pageLoadingReducer,
    },
  });