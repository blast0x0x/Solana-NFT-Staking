use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod states;

use constants::*;
use instructions::*;

declare_id!("AzUUwhQYdscAAcuJ2182k99ZzUbpogr2QD5fusMbERhn");

#[program]
pub mod race_staking_program {
    use super::*;

    pub fn initialize_staking_pool(ctx: Context<InitializeStakingPool>) -> Result<()> {
        initialize::initialize_staking_pool(ctx)
    }

    pub fn stake(ctx: Context<StakeRace>, stake_amount: u64) -> Result<()> {
        stake::stake(ctx, stake_amount)
    }

    pub fn unstake(ctx: Context<UnstakeRace>) -> Result<()> {
        unstake::unstake(ctx)
    }

    pub fn change_pool_setting(ctx: Context<ChangePoolSetting>, paused: bool) -> Result<()> {
        update_config::handle(ctx, paused)
    }

    pub fn change_race_mint(ctx: Context<ChangeRaceMint>, race_mint: Pubkey) -> Result<()> {
        update_token_mint::handle(ctx, race_mint)
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_admin: Pubkey) -> Result<()> {
        transfer_ownership::handle(ctx, new_admin)
    }

    pub fn withdraw(ctx: Context<WithdrawRace>) -> Result<()> {
        withdraw_race::handle(ctx)
    }
}
