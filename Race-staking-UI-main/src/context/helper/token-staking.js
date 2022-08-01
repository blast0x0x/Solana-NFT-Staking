import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import {
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { isValidSolanaAddress } from "@nfteyez/sol-rayz";

import { IDL } from '../anchor_idl/idl/race_staking_program';

import {
    RACE_TOKEN_MINT,
    CLASS_TYPES,
    RACE_STAKING_PROGRAM_ID,
    SECONDS_PER_DAY,
    LOCK_DAY,
} from '../constants';
import {
    getPoolStateKey,
    getRacePoolKey,
    getRaceStakeInfoKey,
} from '../keys';
import {
    getProvider,
    getMultipleTransactions,
    sendMultiTransactions,
    getTokenAccount,
    getNFTTokenAccount,
    getAssociatedTokenAccount,
} from '../utils';
import { forEach } from 'lodash';

export const getWalletBalance = async () => {
    try {
        const provider = await getProvider();

        // let userRaceAta = await getAssociatedTokenAccount(provider.wallet.publicKey, RACE_TOKEN_MINT);
        let tokenAccount = await getTokenAccount(RACE_TOKEN_MINT, provider.wallet.publicKey);
        let _tokenAccount = await provider.connection.getTokenAccountBalance(tokenAccount);
        // let _tokenAccount = await provider.connection.getAccountInfo(tokenAccount);

        console.log('[kg] => token account, race amount : ', tokenAccount.toBase58(), _tokenAccount.value.uiAmount);
        return _tokenAccount.value.uiAmount;
    } catch (err) {
        console.log(err.message);
    }
    return 0;
}

export const getStakedList = async () => {

    let provider = await getProvider();
    const program = new anchor.Program(IDL, RACE_STAKING_PROGRAM_ID, provider);

    const res = await program.account.stakeInfo.all();
    console.log("[kg] => Staked list : ", res);
    return res;
}

export const initProject = async () => {
    // console.log("On init click");
    const provider = await getProvider();
    const program = new anchor.Program(IDL, RACE_STAKING_PROGRAM_ID, provider);

    const res = await program.methods.initializeStakingPool().accounts({
        admin: provider.wallet.publicKey,
        poolState: await getPoolStateKey(),
        raceMint: RACE_TOKEN_MINT,
        racePool: await getRacePoolKey(),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
    }).rpc();
    // console.log("Your transaction signature : ", res);
}

export const stakeRace = async () => {
    // console.log("On stake NFT");
    const provider = await getProvider();
    const program = new anchor.Program(IDL, RACE_STAKING_PROGRAM_ID, provider);

    // let userRaceAta = await getAssociatedTokenAccount(provider.wallet.publicKey, RACE_TOKEN_MINT);
    let tokenAccount = await getTokenAccount(RACE_TOKEN_MINT, provider.wallet.publicKey);
    let _tokenAccount = await provider.connection.getTokenAccountBalance(tokenAccount);

    let amount = _tokenAccount.value.amount;
    console.log('[kg] => token account, race amount : ', tokenAccount.toBase58(), _tokenAccount.value.amount);
    let res = "success";
    try {
        const tx = await program.methods.stake(new anchor.BN(amount)).accounts({
            owner: provider.wallet.publicKey,
            poolState: await getPoolStateKey(),
            raceMint: RACE_TOKEN_MINT,
            userRaceAta: tokenAccount, //await getAssociatedTokenAccount(provider.wallet.publicKey, RACE_TOKEN_MINT),
            racePool: await getRacePoolKey(),
            stakeInfoAccount: await getRaceStakeInfoKey(provider.wallet.publicKey),
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
            .rpc();

        console.log("Your transaction signature : ", tx);
    } catch (err) {
        res = "failed"
        console.log(err.message);
    }

    return { result: res };
}

export const unstakeRace = async () => {
    // console.log("On Unstake NFT");
    const provider = await getProvider();
    const program = new anchor.Program(IDL, RACE_STAKING_PROGRAM_ID, provider);

    let res = "success";
    try {
        const tx = await program.methods.unstake().accounts({
            owner: provider.wallet.publicKey,
            poolState: await getPoolStateKey(),
            raceMint: RACE_TOKEN_MINT,
            userRaceAta: await getAssociatedTokenAccount(provider.wallet.publicKey, RACE_TOKEN_MINT),
            racePool: await getRacePoolKey(),
            stakeInfoAccount: await getRaceStakeInfoKey(provider.wallet.publicKey),
            rent: SYSVAR_RENT_PUBKEY,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc();
        console.log("Your transaction signature", tx);
    } catch (err) {
        res = "failed"
        console.log(err.message);
    }

    return { result: res };
}

export const getStakedInfo = async (pubKey) => {
    // console.log("Publick key =====================> ", pubKey)
    if (!isValidSolanaAddress(pubKey)) return [];
    let provider = await getProvider();
    const program = new anchor.Program(IDL, RACE_STAKING_PROGRAM_ID, provider);

    const res = await program.account.stakeInfo.all(
        [
            {
                memcmp: {
                    offset: 8,
                    bytes: pubKey
                }
            }
        ]
    );
    console.log("[kg] => Staked info : ", res);
    return res;
}