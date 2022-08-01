import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as nftTokenAbi } from "../abi/NFTToken.json";
import { abi as stakingAbi } from "../abi/Staking.json";

import IDOAbi from '../abi/ido.json'
import { BigNumber } from 'bignumber.js';

import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { Bond, NetworkID } from "src/lib/Bond"; // TODO: this type definition needs to move out of BOND.
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, IBasePoolAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const ohmContract = new ethers.Contract(addresses[networkID].PID_ADDRESS as string, ierc20Abi, provider);
    const ohmBalance = await ohmContract.balanceOf(address);
    const sohmContract = new ethers.Contract(addresses[networkID].SPID_ADDRESS as string, ierc20Abi, provider);
    const sohmBalance = await sohmContract.balanceOf(address);
    let poolBalance = 0;
    const poolTokenContract = new ethers.Contract(addresses[networkID].PT_TOKEN_ADDRESS as string, ierc20Abi, provider);
    poolBalance = await poolTokenContract.balanceOf(address);

    return {
      balances: {
        ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
        sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
        pool: ethers.utils.formatUnits(poolBalance, "gwei"),
      },
    };
  },
);

interface IUserAccountDetails {
  balances: {
    dai: string;
    ohm: string;
    sohm: string;
  };
  staking: {
    ohmStake: number;
    ohmUnstake: number;
  };
  bonding: {
    daiAllowance: number;
  };
}

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {

    const signer = provider.getSigner();
    const nftTokenContract = new ethers.Contract(addresses[networkID].NFT_TOKEN_ADDRESS as string, nftTokenAbi, signer);
    const nftCounts = await nftTokenContract.balanceOf(address);

    let tokenIDList = [];
    for (let i = 0; i < nftCounts.toString(); i++) {
      let currentId = await nftTokenContract.tokenOfOwnerByIndex(address, i);
      tokenIDList.push(currentId.toString());
    }

    const nftStakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, signer);

    const pool_length = 5;
    let lockUpPeriods = [];
    let rewardMultipliers = [];
    let totalStakeds = [];
    for (let pid = 0; pid < pool_length; pid++) {
      const lockUpPeriod = await nftStakingContract.LOCKUP_PERIODS(pid);
      lockUpPeriods.push(lockUpPeriod.toString());
      const rewardMultiplier = await nftStakingContract.REWARD_MULTIPLIERS(pid);
      rewardMultipliers.push(rewardMultiplier.toString());
      const totalStaked = await nftStakingContract.TOTAL_STAKEDS(pid);  
      totalStakeds.push(totalStaked.toString());
    }

    let depositTimes = [];
    let stakeTypes = [];
    let Rewards = [];
    const stakedTokenIds = await nftStakingContract.getStakingInfo(address);
    const stakedTokenCount = stakedTokenIds.length;
    
    let stakeInfos = [];

    for (let i = 0; i < stakedTokenIds.length; i++) {
      
      const tokenInfo = await nftStakingContract.tokenInfo(stakedTokenIds[i]);
      console.log("depositTime: ", tokenInfo.depositTime.toString());
      console.log("lockUpPeriods: ", lockUpPeriods[tokenInfo.stakeType]);
      const lockupTime = Number.parseInt(tokenInfo.depositTime) + Number.parseInt(lockUpPeriods[tokenInfo.stakeType]);
      console.log("lockupTime: ", lockupTime);
      depositTimes.push(lockupTime);
      const reward = await nftStakingContract.calculateReward(address, stakedTokenIds[i]);
      
      // Rewards.push(ethers.utils.formatEther(reward));
      // Rewards.push(ethers.utils.formatUnits(reward, "gwei"));
      // stakeTypes.push(tokenInfo.stakeType);

      stakeInfos.push(
        {
          "id": stakedTokenIds[i],
          "reward": ethers.utils.formatEther(reward),
          "depositTime": lockupTime,
          "stakeType": tokenInfo.stakeType
        }
      );
    }

    return {
      nft: {
        tokenIDList: tokenIDList,
      },
      poolInfos: {
        lockUpPeriods: lockUpPeriods,
        rewardMultipliers: rewardMultipliers,
        totalStakeds: totalStakeds
      },
      stakeInfos: stakeInfos
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
      balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    const balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: balanceVal,
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    ohm: string;
    sohm: string;
    dai: string;
    oldsohm: string;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { ohm: "", sohm: "", dai: "", oldsohm: "" },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
