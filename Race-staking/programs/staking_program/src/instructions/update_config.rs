use crate::{constants::*, states::*};
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct ChangePoolSetting<'info> {
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

pub fn handle(
    ctx: Context<ChangePoolSetting>,
    paused: bool,
) -> Result<()> {
    let pool_state = &mut ctx.accounts.pool_state;
    pool_state.paused = paused; // initial status is paused
    pool_state.last_update_time = Clock::get()?.unix_timestamp;
    Ok(())
}
