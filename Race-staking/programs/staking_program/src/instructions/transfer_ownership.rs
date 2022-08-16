use crate::{constants::*, states::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [RS_PREFIX.as_bytes()],
        bump,
        has_one = admin,
        constraint = pool_state.is_initialized == true,
    )]
    pub pool_state: Account<'info, PoolConfig>,
}

pub fn handle(ctx: Context<TransferOwnership>, new_admin: Pubkey) -> Result<()> {
    let pool_state = &mut ctx.accounts.pool_state;
    pool_state.admin = new_admin;
    Ok(())
}
