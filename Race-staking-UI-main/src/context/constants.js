import { PublicKey } from "@solana/web3.js";

/** GLOBAL CONSTANT */

export const Networks = {
    MAINNET: 101,
    DEVNET: 102
}
// export const DEFAULT_NETWORK = Networks.MAINNET;
export const DEFAULT_NETWORK = Networks.DEVNET;
export const IS_MAINNET = DEFAULT_NETWORK == Networks.MAINNET;
export const NETWORK = IS_MAINNET ? "mainnet-beta" : "devnet";

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const RS_PREFIX = "race-nft-staking";
export const RS_STAKEINFO_SEED = "race-nft-stake-info";
export const RS_STAKE_SEED = "race-nft-staking";
export const RS_VAULT_SEED = "race-reward-vault";

export const RACE_PREFIX = "race-staking";
export const RACE_STAKEINFO_SEED = "race-stake-info";
export const RACE_STAKE_SEED = "race-staking";
export const RACE_VAULT_SEED = "race-pool-vault";

export const CLASS_TYPES = [
    6000,
    8000,
    10000,
    12000,
    14000,
    20000,
    24000,
    30000,
    36000,
    40000
];
export const LOCK_DAY = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
export const TOKEN_DECIMALS = 9;

/** NFT Staking Constant */

export const RACE_TOKEN_MINT = new PublicKey(
    IS_MAINNET ?
        "ExLjCck16LmtH87hhCAmTk4RWv7getYQeGhLvoEfDLrH" :
        "4FkRq5ikN6ZyF2SSH2tgvuFP4kf2vxTuDQN4Kqnz2MQz"
)

export const NFT_CREATOR = new PublicKey(
    IS_MAINNET ?
        "6rQse6Jq81nBork8x9UwccJJh4qokVVSYujhQRuQgnna" :
        "7etbqNa25YWWQztHrwuyXtG39WnAqPszrGRZmEBPvFup"
);

export const PROGRAM_ID = new PublicKey(
    IS_MAINNET ?
        "6RhXNaW1oQYQmjTc1ypb4bEFe1QasPAgEfFNhQ3HnSqo" :
        "Qz6kV3hatXXx5EJuYhmukkiEUt282VeEMz6YwwBaaMn"
)

export const INITIALIZER = new PublicKey(
    IS_MAINNET ?
        "7etbqNa25YWWQztHrwuyXtG39WnAqPszrGRZmEBPvFup" :
        "GTVhUEjJ2wpVAQuctQHqnL1FF5cciYreQ1qrw6mw8QXh"
)

// console.log("*********", IS_MAINNET, NETWORK, SWRD_TOKEN_MINT.toBase58());

export const RACE_STAKING_PROGRAM_ID = new PublicKey(
    IS_MAINNET ?
        "6RhXNaW1oQYQmjTc1ypb4bEFe1QasPAgEfFNhQ3HnSqo" :
        "AzUUwhQYdscAAcuJ2182k99ZzUbpogr2QD5fusMbERhn"
)