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
    RACE_STAKING_PROGRAM_ID,
    RS_NFT_SEED
} from "./constants"

export const getPoolKey = async () => {
    const [poolKey] = await asyncGetPda(
        [Buffer.from(RS_PREFIX)],
        PROGRAM_ID
    );
    return poolKey;
};

export const getRewardVaultKey = async (
    rewardMint: PublicKey
) => {
    const [rewardVaultKey] = await asyncGetPda(
        [
            Buffer.from(RS_VAULT_SEED),
            rewardMint.toBuffer()
        ],
        PROGRAM_ID
    );
    return rewardVaultKey;
};

export const getNFTInfoKey = async (
    nft_mint: PublicKey
) => {
    const [NftInfoKey] = await asyncGetPda(
        [
            Buffer.from(RS_NFT_SEED),
            nft_mint.toBuffer()
        ],
        PROGRAM_ID
    );
    return NftInfoKey;
};

export const getStakedNFTKey = async (
    nft_mint: PublicKey
) => {
    const [stakedNftKey] = await asyncGetPda(
        [
            Buffer.from(RS_STAKE_SEED),
            nft_mint.toBuffer()
        ],
        PROGRAM_ID
    );
    return stakedNftKey;
};

export const getStakeInfoKey = async (
    nft_mint: PublicKey
) => {
    const [stakedNftKey] = await asyncGetPda(
        [
            Buffer.from(RS_STAKEINFO_SEED),
            nft_mint.toBuffer()
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

export const getRacePoolKey = async (
    rewardMint: PublicKey
) => {
    const [rewardVaultKey] = await asyncGetPda(
        [
            Buffer.from(RACE_VAULT_SEED),
            rewardMint.toBuffer()
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
    seeds: Buffer[],
    programId: PublicKey
): Promise<[PublicKey, number]> => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};
