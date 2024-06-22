use anchor_lang::prelude::*;
// use anchor_spl::token::{self, TokenAccount};
// use spl_token_2022::instruction as token_2022_instruction;

declare_id!("94L2mJxVu6ZMmHaGsCHRQ65Kk2mea6aTnwWjSdfSsmBC");

#[program]
mod solana_vesting {
    use super::*;

    // pub fn initialize(ctx: Context<InitVestingAccount>, start_time: u64, cliff_duration: u64, end_time: u64, amount: u64) -> Result<()> {
    //     let vesting_schedule = &mut ctx.accounts.vesting_schedule;
    //     vesting_schedule.beneficiary = *ctx.accounts.beneficiary.to_account_info().key;
    //     vesting_schedule.start_time = start_time;
    //     vesting_schedule.cliff_duration = cliff_duration;
    //     vesting_schedule.end_time = end_time;
    //     vesting_schedule.total_amount = amount;
    //     vesting_schedule.released_amount = 0;
    //     Ok(())
    // }

    // pub fn claim(ctx: Context<Claim>) -> ProgramResult {
    //     let vesting_schedule = &mut ctx.accounts.vesting_schedule;
    //     let now = Clock::get()?.unix_timestamp as u64;

    //     if now < vesting_schedule.start_time + vesting_schedule.cliff_duration {
    //         return Err(ProgramError::Custom(1)); // Cliff period has not expired
    //     }

    //     let time_elapsed_since_cliff = now - (vesting_schedule.start_time + vesting_schedule.cliff_duration);
    //     let total_vesting_duration = vesting_schedule.end_time - (vesting_schedule.start_time + vesting_schedule.cliff_duration);
    //     let vested_amount = if total_vesting_duration > 0 {
    //         (vesting_schedule.amount as u128 * time_elapsed_since_cliff as u128 / total_vesting_duration as u128) as u64
    //     } else {
    //         0
    //     };
    //     let available_to_claim = vested_amount.saturating_sub(vesting_schedule.claimed);

    //     if available_to_claim > 0 {
    //         // Determine token version and execute transfer
    //         if ctx.accounts.token_program.key == &spl_token::ID {
    //             token::transfer(ctx.accounts.into_transfer_context(), available_to_claim)?;
    //         } else if ctx.accounts.token_program.key == &spl_token_2022::ID {
    //             let ix = token_2022_instruction::transfer_checked(
    //                 &ctx.accounts.token_program.key,
    //                 &ctx.accounts.vesting_token_account.key,
    //                 &ctx.accounts.beneficiary.key,
    //                 &ctx.accounts.authority.key,
    //                 &[&ctx.accounts.authority.key],
    //                 available_to_claim,
    //             )?;
    //             anchor_lang::solana_program::program::invoke(
    //                 &ix,
    //                 &[
    //                     ctx.accounts.token_program.to_account_info(),
    //                     ctx.accounts.vesting_token_account.to_account_info(),
    //                     ctx.accounts.beneficiary.to_account_info(),
    //                     ctx.accounts.authority.to_account_info(),
    //                 ],
    //             )?;
    //         } else {
    //             return Err(ProgramError::Custom(2)); // Unsupported token program
    //         }

    //         vesting_schedule.claimed += available_to_claim;
    //     }

    //     Ok(())
    // }
}

// #[derive(Accounts)]
// pub struct InitVestingAccount<'info> {
//     #[account(init, payer = payer, space = 8 + 32 + 8 + 8 + 8 + 8 + 8)]
//     pub vesting_schedule: Account<'info, VestingSchedule>,
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub system_program: Program<'info, System>,
//     /// CHECK: this is safe 
//     pub beneficiary: AccountInfo<'info>,
// }

// #[derive(Accounts)]
// pub struct Claim<'info> {
//     #[account(mut)]
//     pub vesting_schedule: Account<'info, VestingSchedule>,
//     #[account(mut)]
//     pub beneficiary: TokenAccount,
//     #[account(signer)]
//     pub authority: AccountInfo<'info>,
//     pub token_program: AccountInfo<'info>,
//     #[account(mut)]
//     pub vesting_token_account: TokenAccount,
// }

// #[account]
// pub struct VestingSchedule {
//     pub beneficiary: Pubkey,
//     pub start_time: u64,
//     pub cliff_duration: u64,
//     pub end_time: u64,
//     pub total_amount: u64,
//     pub released_amount: u64,
// }