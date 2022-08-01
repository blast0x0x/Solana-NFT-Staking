import { PublicKey } from "@solana/web3.js";
import {
    RS_PREFIX,
    RS_STAKEINFO_SEED,
    RS_STAKE_SEED,
    RS_VAULT_SEED,
    RACE_PREFIX,
    RACE_STAKEINFO_SEED,
    RACE_STAKE_SEED,
    RACE_VAULT_SEED,
    PROGRAM_ID,
    RACE_TOKEN_MINT,
    RACE_STAKING_PROGRAM_ID
} from "./constants"

/** Get NFT Staking Account Keys  */

export const getPoolKey = async () => {
    const [poolKey] = await asyncGetPda(
        [Buffer.from(RS_PREFIX)],
        PROGRAM_ID
    );
    return poolKey;
};

export const getRewardVaultKey = async () => {
    const [rewardVaultKey] = await asyncGetPda(
        [
            Buffer.from(RS_VAULT_SEED),
            RACE_TOKEN_MINT.toBuffer()
        ],
        PROGRAM_ID
    );
    return rewardVaultKey;
};

export const getStakedNFTKey = async (
    nftMintPk
) => {
    const [stakedNftKey] = await asyncGetPda(
        [
            Buffer.from(RS_STAKE_SEED),
            nftMintPk.toBuffer()
        ],
        PROGRAM_ID
    );
    return stakedNftKey;
};

export const getStakeInfoKey = async (
    nftMintPk
) => {
    const [stakedNftKey] = await asyncGetPda(
        [
            Buffer.from(RS_STAKEINFO_SEED),
            nftMintPk.toBuffer()
        ],
        PROGRAM_ID
    );
    return stakedNftKey;
};


/** Get Token Staking Account Keys  */
export const getPoolStateKey = async () => {
    const [poolKey] = await asyncGetPda(
        [Buffer.from(RACE_PREFIX)],
        RACE_STAKING_PROGRAM_ID
    );
    return poolKey;
};

export const getRacePoolKey = async () => {
    const [rewardVaultKey] = await asyncGetPda(
        [
            Buffer.from(RACE_VAULT_SEED),
            RACE_TOKEN_MINT.toBuffer()
        ],
        RACE_STAKING_PROGRAM_ID
    );
    return rewardVaultKey;
};

export const getRaceStakeInfoKey = async (
    userKey
) => {
    const [stakedNftKey] = await asyncGetPda(
        [
            Buffer.from(RACE_STAKEINFO_SEED),
            userKey.toBuffer()
        ],
        RACE_STAKING_PROGRAM_ID
    );
    return stakedNftKey;
};

const asyncGetPda = async (
    seeds,
    programId
) => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};