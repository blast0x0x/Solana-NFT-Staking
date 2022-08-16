import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { PublicKey } from "@solana/web3.js";

export const RS_PREFIX = "race-nft-staking";
export const RS_STAKEINFO_SEED = "race-nft-stake-info";
export const RS_STAKE_SEED = "race-nft-staking";
export const RS_VAULT_SEED = "race-reward-vault";
export const RS_NFT_SEED = "race-nft-info";

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

export const NETWORK = "devnet";
// devnet
export const RACE_TOKEN_MINT = new PublicKey(
    "4FkRq5ikN6ZyF2SSH2tgvuFP4kf2vxTuDQN4Kqnz2MQz"
)

export const NFT_CREATOR = new PublicKey(
    "7etbqNa25YWWQztHrwuyXtG39WnAqPszrGRZmEBPvFup"
);

export const PROGRAM_ID = new PublicKey(
    "13M2mV5VmUx9KtaapArUmiBbSDF1PZKdqW3fneoFBZqV"
)

export const RACE_STAKING_PROGRAM_ID = new PublicKey(
    "AzUUwhQYdscAAcuJ2182k99ZzUbpogr2QD5fusMbERhn"
);

// mainnet
// export const RACE_TOKEN_MINT = new PublicKey(
//     "ExLjCck16LmtH87hhCAmTk4RWv7getYQeGhLvoEfDLrH"
// )

// export const NFT_CREATOR = new PublicKey(
//     "6rQse6Jq81nBork8x9UwccJJh4qokVVSYujhQRuQgnna"
// );

// export const PROGRAM_ID = new PublicKey(
//     "Qz6kV3hatXXx5EJuYhmukkiEUt282VeEMz6YwwBaaMn"
// )

// export const RACE_STAKING_PROGRAM_ID = new PublicKey(
//     "FTiY8nuRJqxcMTVuPYzSFXMrn9wCKPu1dnqyDbUzNUpH"
// );