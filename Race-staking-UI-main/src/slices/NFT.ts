import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as nftTokenAbi } from "../abi/NFTToken.json";
import { abi as stakingAbi } from "../abi/Staking.json";
import { abi as FairLaunch } from "../abi/FairLaunch.json";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { error, info } from "../slices/MessagesSlice";
import { IStakeAsyncThunk, INFTMintAsyncThunk, IJsonRPCError } from "./interfaces";
import { loadAccountDetails } from "./AccountSlice";
import axios from "axios";

interface IRarityTable {
  Balance: string,
  Speed: string,
  Power: string,
  Flash: string,
  Destroyer: string,
  Annihilator: string,
};

const RarityTable = {
  "Balance": "100",
  "Speed": "125",
  "Power": "150",
  "Flash": "175",
  "Destroyer": "200",
  "Annihilator": "300",
} as IRarityTable;

export const stake = createAsyncThunk(
  "nft/stake",
  async ({ tokenList, poolList, provider, address, networkID }: IStakeAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }
    if (tokenList.length < 1) {
      dispatch(error("Please select NFTs to stake!"));
      return;
    }


    const signer = provider.getSigner();
    const nftTokenContract = new ethers.Contract(addresses[networkID].NFT_TOKEN_ADDRESS as string, nftTokenAbi, signer);
    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, signer);
    let approveTx;

    try {
      const text = "nft stake";
      const pendingTxnType = "nft_stake";
      approveTx = await nftTokenContract.approves(addresses[networkID].STAKING_ADDRESS, tokenList);
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));
      await approveTx.wait();
      approveTx = await stakingContract.deposit(tokenList, poolList);
      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      console.log(errMsg);
      dispatch(error("errMsg"));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);

export const unstake = createAsyncThunk(
  "nft/unstake",
  async ({ tokenList, provider, address, networkID }: IStakeAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    if (tokenList.length < 1) {
      dispatch(error("Please select NFTs to unstake!"));
      return;
    }

    const signer = provider.getSigner();
    // const nftTokenContract = new ethers.Contract(addresses[networkID].NFT_TOKEN_ADDRESS as string, nftTokenAbi, signer);
    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, signer);
    let approveTx;

    try {
      const text = "nft unstake";
      const pendingTxnType = "nft_unstake";
      // approveTx = await nftTokenContract.approves(addresses[networkID].STAKING_ADDRESS, tokenList);
      // dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));
      // await approveTx.wait();
      approveTx = await stakingContract.withdraw(tokenList);
      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      console.log(errMsg);
      dispatch(error("errMsg"));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);

export const emergencyWithdrawal = createAsyncThunk(
  "nft/emergencyWithdrawal",
  async ({ tokenList, provider, address, networkID }: IStakeAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    if (tokenList.length < 1) {
      dispatch(error("Please select NFTs to emergency withdrawal!"));
      return;
    }

    const signer = provider.getSigner();
    // const nftTokenContract = new ethers.Contract(addresses[networkID].NFT_TOKEN_ADDRESS as string, nftTokenAbi, signer);
    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, signer);
    let approveTx;

    try {
      const text = "nft emergencyWithdrawal";
      const pendingTxnType = "nft_emergencyWithdrawal";
      // approveTx = await nftTokenContract.approves(addresses[networkID].STAKING_ADDRESS, tokenList);
      // dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));
      // await approveTx.wait();
      approveTx = await stakingContract.emergencyWithdraw(tokenList);
      await approveTx.wait();
      dispatch(loadAccountDetails({ networkID, address, provider }));
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      console.log(errMsg);
      dispatch(error("errMsg"));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);
