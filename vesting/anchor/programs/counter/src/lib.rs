use anchor_lang::prelude::*;

declare_id!("Fg6PaFzmS4wXbGhZr4tRvt9sghVvct7AZJuXr3D5Sx4");

#[program]
pub mod solana_vesting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, start_time: i64, end_time: i64, amount: u64) -> ProgramResult {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        vesting_schedule.beneficiary = *ctx.accounts.beneficiary.key;
        vesting_schedule.start_time = start_time;
        vesting_schedule.end_time = end_time;
        vesting_schedule.amount = amount;
        vesting_schedule.claimed = 0;
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> ProgramResult {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        let now = Clock::get()?.unix_timestamp;
        if now < vesting_schedule.start_time {
            return Err(ProgramError::Custom(0)); // Not started
        }

        let time_elapsed = now - vesting_schedule.start_time;
        let total_duration = vesting_schedule.end_time - vesting_schedule.start_time;
        let vested_amount = (vesting_schedule.amount as u128 * time_elapsed as u128 / total_duration as u128) as u64;
        let available_to_claim = vested_amount - vesting_schedule.claimed;

        if available_to_claim > 0 {
            **ctx.accounts.beneficiary.try_borrow_mut_lamports()? += available_to_claim;
            vesting_schedule.claimed += available_to_claim;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 8 + 8 + 8 + 8)]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub beneficiary: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    #[account(mut)]
    pub beneficiary: AccountInfo<'info>,
}

#[account]
pub struct VestingSchedule {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub amount: u64,
    pub claimed: u64,
}