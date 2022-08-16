use crate::{constants::*, error::*, states::*};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitializeStakingPool<'info> {
    // The pool owner
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        seeds = [RS_PREFIX.as_bytes()],
        bump,
        payer = admin,
        space = 8 + std::mem::size_of::<PoolConfig>(),
    )]
    pub pool_state: Account<'info, PoolConfig>,

    // reward mint
    pub race_mint: Account<'info, Mint>,

    // reward vault that holds the reward mint for distribution
    #[account(
        init,
        token::mint = race_mint,
        token::authority = pool_state,
        seeds = [ RS_VAULT_SEED.as_bytes(), race_mint.key().as_ref() ],
        bump,
        payer = admin,
    )]
    pub race_pool: Box<Account<'info, TokenAccount>>,

    // The rent sysvar
    pub rent: Sysvar<'info, Rent>,
    // system program
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: Program<'info, System>,

    // token program
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeStakingPool<'info> {
    pub fn validate(&self) -> Result<()> {
        if self.pool_state.is_initialized == true {
            require!(
                self.pool_state.admin.eq(&self.admin.key()),
                StakingError::NotAllowedAuthority
            )
        }
        Ok(())
    }
}

/**
 * Initialize Staking program for the first time to init staking pool config with some data for validation.
 */
#[access_control(ctx.accounts.validate())]
pub fn initialize_staking_pool(
    ctx: Context<InitializeStakingPool>,
) -> Result<()> {
    msg!("initializing");

    let pool_state = &mut ctx.accounts.pool_state;

    pool_state.is_initialized = true;
    pool_state.admin = *ctx.accounts.admin.key;
    pool_state.paused = false; // initial status is paused
    pool_state.race_mint = *ctx.accounts.race_mint.to_account_info().key;
    pool_state.race_pool = ctx.accounts.race_pool.key();
    pool_state.last_update_time = Clock::get()?.unix_timestamp;
    pool_state.staked_user = 0;
    pool_state.staked_amount = 0;
    Ok(())
}
