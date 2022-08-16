import BN from "bn.js";
import {
  PublicKey,
  Keypair,
  AccountInfo,
  Transaction,
} from "@solana/web3.js";
import fs from "fs";

const PACKET_DATA_SIZE = 1280 - 40 - 8;
const METADATA_REPLACE = new RegExp("\u0000", "g");

export function chunks(array: Uint8Array, size: number) {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}

export const loadWalletKey = (keypair: string): Keypair => {
  if (!keypair || keypair === "") {
    throw new Error("Keypair is required!");
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
  );
  return loaded;
};

export const writePublicKey = (publicKey: PublicKey, name: string) => {
  fs.writeFileSync(
    `./keys/${name}_pub.json`,
    JSON.stringify(publicKey.toString())
  );
};

export const getPublicKey = (name: string) =>
  new PublicKey(
    JSON.parse(fs.readFileSync(`./keys/${name}_pub.json`) as unknown as string)
  );

export const getFormattedPrice = (price: BN) => {
  if (price === undefined) return "---";
  let priceStr = price.toString();
  if (priceStr.length < 6) return "0";
  let floatStr = priceStr.substring(priceStr.length - 9, priceStr.length);
  if (floatStr.length === 6) floatStr = "0.000" + floatStr;
  else if (floatStr.length === 7) floatStr = "0.00" + floatStr;
  else if (floatStr.length === 8) floatStr = "0.0" + floatStr;
  else if (priceStr.length === 9) floatStr = "0." + floatStr;
  else floatStr = priceStr.substring(0, priceStr.length - 9) + "." + floatStr;

  let cutIdx = floatStr.length - 1;
  for (; cutIdx >= 0; cutIdx--) if (floatStr[cutIdx] !== "0") break;
  return floatStr.substring(0, cutIdx + 1);
};

export const decoratePubKey = (key: PublicKey) => {
  let str = key.toBase58();
  let len = str.length;
  return str.substring(0, 5) + "..." + str.substring(len - 5, len);
};

export type StringPublicKey = string;

export class LazyAccountInfoProxy<T> {
  executable: boolean = false;
  owner: StringPublicKey = "";
  lamports: number = 0;

  get data() {
    //
    return undefined as unknown as T;
  }
}

export interface LazyAccountInfo {
  executable: boolean;
  owner: StringPublicKey;
  lamports: number;
  data: [string, string];
}

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== "string") {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export const pubkeyToString = (key: PublicKey | null | string = "") => {
  return typeof key === "string" ? key : key?.toBase58() || "";
};

export interface PublicKeyStringAndAccount<T> {
  pubkey: string;
  account: AccountInfo<T>;
}

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const BPF_UPGRADE_LOADER_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111"
);

export const MEMO_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as StringPublicKey;

export const VAULT_ID =
  "vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn" as StringPublicKey;

export const AUCTION_ID =
  "auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8" as StringPublicKey;

export const METAPLEX_ID =
  "p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98" as StringPublicKey;

export const SYSTEM = new PublicKey("11111111111111111111111111111111");

export const setProgramIds = async (store?: string) => {
  STORE = store ? toPublicKey(store) : undefined;
};

let STORE: PublicKey | undefined;

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    associatedToken: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    bpf_upgrade_loader: BPF_UPGRADE_LOADER_ID,
    system: SYSTEM,
    metadata: METADATA_PROGRAM_ID,
    memo: MEMO_ID,
    vault: VAULT_ID,
    auction: AUCTION_ID,
    metaplex: METAPLEX_ID,
    store: STORE,
  };
};

// multi-transactions
export async function getMultipleTransactions(
  connection,
  wallet,
  instructions = [],
  signers = []
) {
  const recentBlockhash = (await connection.getRecentBlockhash("processed"))
    .blockhash;
  const instructionSet = splitTransaction(
    wallet,
    instructions,
    signers,
    recentBlockhash
  );
  return instructionSet;
}

export async function sendMultiTransactions(
  connection,
  wallet,
  instructionSet,
  signers = []
) {
  let { txs, result } = await sendTransactions(
    connection,
    wallet,
    instructionSet,
    signers,
    SequenceType.Sequential,
    "single"
  );
  return { txs: txs, result: result };
}

function splitTransaction(
  wallet,
  instructions,
  signers = [],
  recentBlockhash
) {
  let arrIxSet = [];
  let setId = 0;
  for (let i = 0; i < instructions.length;) {
    if (arrIxSet[setId] === undefined) arrIxSet[setId] = [];
    arrIxSet[setId].push(instructions[i]);
    let tx = new Transaction().add(...arrIxSet[setId]);
    tx.recentBlockhash = recentBlockhash;
    tx.feePayer = wallet.publicKey;
    if (getTransactionSize(tx, signers) > PACKET_DATA_SIZE) {
      arrIxSet[setId].pop();
      setId++;
      continue;
    }
    i++;
  }
  return arrIxSet;
}

export function getTransactionSize(
  transaction,
  signers = [],
  hasWallet = true
) {
  const signData = transaction.serializeMessage();
  const signatureCount = [];
  encodeLength(signatureCount, signers.length);
  const transactionLength =
    signatureCount.length +
    (signers.length + (hasWallet ? 1 : 0)) * 64 +
    signData.length;
  return transactionLength;
}

function encodeLength(bytes, len) {
  let rem_len = len;
  for (; ;) {
    let elem = rem_len & 0x7f;
    rem_len >>= 7;
    if (rem_len === 0) {
      bytes.push(elem);
      break;
    } else {
      elem |= 0x80;
      bytes.push(elem);
    }
  }
}

export const sendTransactions = async (
  connection,
  wallet,
  instructionSet,
  signers,
  sequenceType = SequenceType.Parallel,
  commitment = "singleGossip",
  block = null,
) => {
  if (!wallet.publicKey) return;

  // console.log("sendTransactions");

  let resStr = "success";
  const unsignedTxns = [];

  if (!block) {
    block = await connection.getRecentBlockhash(commitment);
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];

    if (instructions.length === 0) {
      continue;
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;
    transaction.setSigners(
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);
  let txIds = [];
  if (signedTxns.length > 0) {
    if (signedTxns.length === 1) {
      let txId = await sendSignedTransaction(connection, signedTxns[0]);
      txIds.push(txId);
      console.log('txId', txId);

      try {
        let res = await connection.confirmTransaction(txId, "confirmed");
        if (res.value.err) resStr = "failed";
      } catch (error) {
        console.log('single transaction error message: ', error);
        resStr = "failed";
      }
    } else {
      for (let i = 0; i < signedTxns.length; i++) {
        let txId = await sendSignedTransaction(connection, signedTxns[i]);
        txIds.push(txId);
        console.log('txId', txId);

        try {
          let res = await connection.confirmTransaction(txId, "confirmed");
          if (res.value.err) {
            resStr = "failed";
            break;
          }
        } catch (error) {
          console.log('multi transaction error message: ', error);
          resStr = "failed";
          break;
        }
      }
    }
  }
  return { result: resStr, number: signedTxns.length, txs: txIds };
};

export const SequenceType = {
  Sequential: 0,
  Parallel: 1,
  StopOnFailure: 2,
}

export async function sendSignedTransaction(
  connection,
  signedTransaction
) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const rawTransaction = signedTransaction.serialize();

  let maxTry = 50;
  let real_txid = "";

  while (maxTry > 0 && real_txid == "") {
    maxTry--;
    const txid = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight: true,
        preflightCommitment: "confirmed",
      }
    );
    let softTry = 3;
    while (softTry > 0) {
      softTry--;
      await delay(1000);

      // @ts-ignore
      const resp = await connection._rpcRequest("getSignatureStatuses", [
        [txid],
      ]);

      if (resp && resp.result && resp.result.value && resp.result.value[0]) {
        return txid;
      }
    }
  }

  return "";
}