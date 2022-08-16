use crate::constants::*;
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct PoolConfig {
    // 1
    pub is_initialized: bool,
    /// admin pubkey
    pub admin: Pubkey,
    /// Paused state of the program
    pub paused: bool,
    /// nft lock period
    pub lock_day: u32,
    /// Mint of the reward token.
    pub race_mint: Pubkey,
    /// Vault to store reward tokens.
    pub race_pool: Pubkey,
    /// The last time reward states were updated.
    pub last_update_time: i64,
    /// Staked Tokens
    pub staked_amount: u64,
    /// Staked Users
    pub staked_user: u32,
}
