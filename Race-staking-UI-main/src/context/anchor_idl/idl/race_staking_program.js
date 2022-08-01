export const IDL = {
  "version": "0.1.0",
  "name": "race_staking_program",
  "instructions": [
    {
      "name": "initializeStakingPool",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raceMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "racePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "racePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRaceAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raceMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stakeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "racePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raceMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRaceAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "changePoolSetting",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "changeRaceMint",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "raceMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "transferOwnership",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "racePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRaceAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raceMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "PoolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "lockDay",
            "type": "u32"
          },
          {
            "name": "raceMint",
            "type": "publicKey"
          },
          {
            "name": "racePool",
            "type": "publicKey"
          },
          {
            "name": "lastUpdateTime",
            "type": "i64"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "stakedUser",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "StakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "stakeTime",
            "type": "i64"
          },
          {
            "name": "lastUpdateTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotAllowedAuthority",
      "msg": "Not Allowed Authority"
    },
    {
      "code": 6001,
      "name": "InvalidUserAddress",
      "msg": "Invalid User Address"
    },
    {
      "code": 6002,
      "name": "InvalidPoolError",
      "msg": "Invalid pool number"
    },
    {
      "code": 6003,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6004,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6005,
      "name": "InvalidWithdrawTime",
      "msg": "Staking Locked Now"
    },
    {
      "code": 6006,
      "name": "IndexOverflow",
      "msg": "Withdraw NFT Index OverFlow"
    },
    {
      "code": 6007,
      "name": "LackLamports",
      "msg": "Insufficient Lamports"
    }
  ]
}