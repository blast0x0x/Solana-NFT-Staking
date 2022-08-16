import * as anchor from '@project-serum/anchor';
import {
    PublicKey,
    Signer,
    Keypair,
    Connection,
    TransactionSignature,
    Transaction,
    SystemProgram,
    SYSVAR_CLOCK_PUBKEY,
    SYSVAR_RENT_PUBKEY,
    sendAndConfirmTransaction,
    clusterApiUrl,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import bs58 from 'bs58';
import { IDL as RACE_NFT_STAKING_IDL } from "../target/types/race_nft_staking_program";
import { IDL as RACE_STAKING_IDL } from "../target/types/race_staking_program";
import * as Constants from "./constants";
import * as Keys from "./keys";
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import { rarity as RARITY } from './rarity';
import {
    getMultipleTransactions,
    sendMultiTransactions,
} from './helpers/utils';

let networkUrl = clusterApiUrl(Constants.NETWORK);
console.log(networkUrl);
let connection = new Connection(networkUrl, "singleGossip");
// let connection = new Connection("https://api.devnet.solana.com", "singleGossip");

// 3TgkGur7VbkvF3j4n3teAQW9hSWrxpXQR9JqvtzBwHij
const admin = anchor.web3.Keypair.fromSecretKey(bs58.decode("Your private key"));

let provider = new anchor.AnchorProvider(connection, new NodeWallet(admin), anchor.AnchorProvider.defaultOptions())
const program = new anchor.Program(RACE_NFT_STAKING_IDL, Constants.PROGRAM_ID, provider);
const race_staking_program = new anchor.Program(RACE_STAKING_IDL, Constants.RACE_STAKING_PROGRAM_ID, provider);

const getTokenAccount = async (mintPk, userPk) => {
    let tokenAccount = await provider.connection.getProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: mintPk.toBase58()
                    }
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: userPk.toBase58()
                    }
                },
            ]
        }
    );
    return tokenAccount[0]?.pubkey;
}

const init = async () => {
    const txHash = await program.methods.initializeStakingPool(
        Constants.CLASS_TYPES,
        Constants.LOCK_DAY
    ).accounts(
        {
            admin: provider.wallet.publicKey,
            poolAccount: await Keys.getPoolKey(),
            rewardMint: Constants.RACE_TOKEN_MINT,
            rewardVault: await Keys.getRewardVaultKey(Constants.RACE_TOKEN_MINT),
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
        }
    ).signers([admin]).rpc();
    console.log('txHash =', txHash);

    let _pool_config = await program.account.poolConfig.fetch(await Keys.getPoolKey());
    console.log("Admin of contract = ", _pool_config.admin.toBase58());
    console.log("second class id: ", _pool_config.rewardPolicyByClass[1]);
}

const initNft = async () => {
    let instructions = [];
    Object.keys(RARITY).forEach(async key => {
        let rarity = key.charAt(0);
        for (let i = 0; i < RARITY[key].length; i++) {

            let mintPK = new PublicKey(RARITY[key][i]);
            const ix = await program.methods.initializeNft(
                Number(rarity)
            ).accounts(
                {
                    admin: provider.wallet.publicKey,
                    poolAccount: await Keys.getPoolKey(),
                    nftInfo: await Keys.getNFTInfoKey(mintPK),
                    nftMint: mintPK,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY
                }
            ).instruction();
            instructions.push(ix);
        }
    });

    let instructionSet = await getMultipleTransactions(provider.connection, provider.wallet, instructions);
    let res = await sendMultiTransactions(provider.connection, provider.wallet, instructionSet);

    if (res.result == "success") {
        console.log("txs: ", res.txs);
    } else {
        console.log('res: ', res.result);
    }
}

const updateSwardMint = async () => {
    let new_sward_mint = new PublicKey("");
    const txHash = await program.methods.changeRewardMint(
        new_sward_mint
    ).accounts(
        {
            admin: provider.wallet.publicKey,
            poolAccount: await Keys.getPoolKey(),
        }
    ).rpc();

    let _pool_config = await program.account.poolConfig.fetch(await Keys.getPoolKey());
    console.log("updated swrd mint pubkey: ", _pool_config.rewardMint.toBase58());
    console.log('txHash =', txHash);
}

const updateConfig = async () => {
    let class_type = Constants.CLASS_TYPES;
    let lock_day = Constants.LOCK_DAY;
    let paused = false;

    const txHash = await program.methods.changePoolSetting(
        class_type,
        lock_day,
        paused
    ).accounts(
        {
            admin: provider.wallet.publicKey,
            poolAccount: await Keys.getPoolKey(),
        }
    ).rpc();

    let _pool_config = await program.account.poolConfig.fetch(await Keys.getPoolKey());
    console.log("updated_lock_day = ", _pool_config.lockDay);
    console.log("paused = ", _pool_config.paused);
    console.log('txHash =', txHash);
}

const transferOwnership = async () => {
    let new_admin = new PublicKey("3TgkGur7VbkvF3j4n3teAQW9hSWrxpXQR9JqvtzBwHij"); //cgh
    const txHash = await program.methods.transferOwnership(
        new_admin
    ).accounts(
        {
            admin: provider.wallet.publicKey,
            poolAccount: await Keys.getPoolKey(),
        }
    ).rpc();

    let _pool_config = await program.account.poolConfig.fetch(await Keys.getPoolKey());
    console.log("updated_admin = ", _pool_config.admin.toBase58());
    console.log('txHash =', txHash);
}

const depositRACE = async () => {
    const txHash = await program.methods.depositSwrd(
        new anchor.BN(10_000_000_000)
    ).accounts(
        {
            funder: admin.publicKey,
            rewardVault: await Keys.getRewardVaultKey(Constants.RACE_TOKEN_MINT),
            funderAccount: await getSWRDAccount(),
            poolAccount: await Keys.getPoolKey(),
            rewardMint: Constants.RACE_TOKEN_MINT,
            tokenProgram: TOKEN_PROGRAM_ID,
        }
    ).rpc();

    console.log('txHash =', txHash);
}

const withdrawSWRD = async () => {
    const txHash = await program.methods.withdrawSwrd()
        .accounts(
            {
                admin: admin.publicKey,
                poolAccount: await Keys.getPoolKey(),
                rewardVault: await Keys.getRewardVaultKey(Constants.RACE_TOKEN_MINT),
                rewardToAccount: await getAssociatedTokenAccount(admin.publicKey, Constants.RACE_TOKEN_MINT),
                rewardMint: Constants.RACE_TOKEN_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
            }
        ).rpc();

    console.log('txHash =', txHash);
}

const getSWRDAccount = async () => {
    const funder_reward_account = await getTokenAccount(Constants.RACE_TOKEN_MINT, admin.publicKey);
    // const _funder_reward_account = await provider.connection.getAccountInfo(funder_reward_account);
    console.log(`SWRD token account: ${funder_reward_account?.toBase58()}`);
    return funder_reward_account;
}

// race staking contract

const initRaceStaking = async () => {

    const res = await race_staking_program.methods.initializeStakingPool().accounts({
        admin: admin.publicKey,
        poolState: await Keys.getPoolStateKey(),
        raceMint: Constants.RACE_TOKEN_MINT,
        racePool: await Keys.getRacePoolKey(Constants.RACE_TOKEN_MINT),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
    }).rpc();
    console.log("Your transaction signature : ", res);

    let _pool_config = await race_staking_program.account.poolConfig.fetch(await Keys.getPoolStateKey());
    console.log("Admin of contract = ", _pool_config.admin.toBase58());
}

const withdrawRace = async () => {
    // console.log("On Unstake NFT");
    const tx = await race_staking_program.methods.withdraw().accounts({
        admin: admin.publicKey,
        poolState: await Keys.getPoolStateKey(),
        racePool: await Keys.getRacePoolKey(Constants.RACE_TOKEN_MINT),
        userRaceAta: await getAssociatedTokenAccount(provider.wallet.publicKey, Constants.RACE_TOKEN_MINT),
        raceMint: Constants.RACE_TOKEN_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
    }).rpc();
    console.log("Your transaction signature", tx);
}

const transferOwnership_race = async () => {
    let new_admin = new PublicKey("3TgkGur7VbkvF3j4n3teAQW9hSWrxpXQR9JqvtzBwHij"); //cgh
    const txHash = await race_staking_program.methods.transferOwnership(
        new_admin
    ).accounts(
        {
            admin: provider.wallet.publicKey,
            poolState: await Keys.getPoolStateKey(),
        }
    ).rpc();

    let _pool_config = await race_staking_program.account.poolConfig.fetch(await Keys.getPoolStateKey());
    console.log("updated_admin = ", _pool_config.admin.toBase58());
    console.log('txHash =', txHash);
}

// utils

const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}
// utils end


const main = () => {
    const command = process.argv[2];
    if (command == "Init") {
        init();
    } else if (command == "InitNft") {
        initNft();
    } else if (command == "DepositReward") {
        depositRACE();
    } else if (command == "WithdrawReward") {
        withdrawSWRD();
    } else if (command == "UpdateRewardMint") {
        updateSwardMint();
    } else if (command == "UpdateConfig") {
        updateConfig();
    } else if (command == "TransferOwnerShip") {
        transferOwnership();
    } else if (command == "TransferOwnerShip_Race") {
        transferOwnership_race();
    } else if (command == "InitRaceStaking") {
        initRaceStaking();
    } else if (command == "WithdrawRace") {
        withdrawRace();
    }
    else {
        console.log("Please enter command name...");
        getSWRDAccount();
    }
}

main();


