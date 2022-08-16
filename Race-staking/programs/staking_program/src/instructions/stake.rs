use crate::{constants::*, error::*, states::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use std::mem::size_of;

#[derive(Accounts)]
// #[instruction(global_bump: u8, staked_nft_bump: u8)]
pub struct StakeRace<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [RS_PREFIX.as_bytes()],
        bump,
        constraint = pool_state.is_initialized == true,
        constraint = pool_state.paused == false,
    )]
    pub pool_state: Account<'info, PoolConfig>,

    #[account(
        mut,
        token::mint = race_mint,
        token::authority = pool_state,
    )]
    pub race_pool: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = race_mint,
        associated_token::authority = owner,
    )]
    pub user_race_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [RS_STAKEINFO_SEED.as_ref(), owner.key.as_ref()],
        bump,
        space = 8 + size_of::<StakeInfo>(),
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    #[account(address = pool_state.race_mint)]
    pub race_mint: Box<Account<'info, Mint>>,

    pub token_program: Program<'info, Token>,
    // The Token Program
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn stake(ctx: Context<StakeRace>, stake_amount: u64) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    // set stake info
    let staking_info = &mut ctx.accounts.stake_info_account;

    if staking_info.is_initialized == 1 {
        require!(
            staking_info.owner.eq(&ctx.accounts.owner.key()),
            StakingError::InvalidUserAddress
        )
    }

    staking_info.owner = ctx.accounts.owner.key();
    staking_info.stake_amount = staking_info.stake_amount.checked_add(stake_amount).unwrap();
    staking_info.stake_time = timestamp;
    staking_info.last_update_time = timestamp;

    // set global info
    ctx.accounts.pool_state.staked_user += 1;
    ctx.accounts.pool_state.staked_amount = ctx
        .accounts
        .pool_state
        .staked_amount
        .checked_add(stake_amount)
        .unwrap();

    let cpi_accounts = Transfer {
        from: ctx.accounts.user_race_ata.to_account_info(),
        to: ctx.accounts.race_pool.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let token_program = ctx.accounts.token_program.to_account_info();
    let transfer_ctx = CpiContext::new(token_program, cpi_accounts);
    token::transfer(transfer_ctx, stake_amount)?;
    Ok(())
}
