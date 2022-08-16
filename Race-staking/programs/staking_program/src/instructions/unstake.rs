use crate::{constants::*, error::*, states::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

#[derive(Accounts)]
pub struct UnstakeRace<'info> {
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

    #[account(address = pool_state.race_mint)]
    pub race_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [RS_STAKEINFO_SEED.as_ref(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    // send race to user
    #[account(
      init_if_needed,
      payer = owner,
      associated_token::mint = race_mint,
      associated_token::authority = owner
    )]
    pub user_race_ata: Box<Account<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> UnstakeRace<'info> {
    pub fn validate(&self) -> Result<()> {
        require!(
            self.stake_info_account.owner == self.owner.key(),
            StakingError::InvalidUserAddress
        );
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn unstake(ctx: Context<UnstakeRace>) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;
    let staking_info = &mut ctx.accounts.stake_info_account;
    let pool_state = &mut ctx.accounts.pool_state;

    let mut stake_amount = staking_info.stake_amount as u64;
    let vault_balance = ctx.accounts.race_pool.amount;
    if vault_balance < stake_amount {
        stake_amount = vault_balance;
    }

    ctx.accounts.pool_state.staked_user -= 1;
    ctx.accounts.pool_state.staked_amount -= staking_info.stake_amount;

    // get pool_state seed
    let (_pool_state_seed, _pool_state_bump) =
        Pubkey::find_program_address(&[&(RS_PREFIX.as_bytes())], ctx.program_id);
    let seeds = &[RS_PREFIX.as_bytes(), &[_pool_state_bump]];
    let signer = &[&seeds[..]];

    if stake_amount > 0 {
        let token_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.race_pool.to_account_info().clone(),
            to: ctx.accounts.user_race_ata.to_account_info().clone(),
            authority: ctx.accounts.pool_state.to_account_info().clone(),
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info().clone(),
            token_accounts,
        );
        msg!(
            "Calling the token program to transfer reward {} to the user",
            stake_amount
        );
        anchor_spl::token::transfer(cpi_ctx.with_signer(signer), stake_amount)?;
    }
    Ok(())
}
