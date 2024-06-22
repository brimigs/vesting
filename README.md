# Solana Vesting Contract

This repository contains a Solana smart contract developed using Anchor, a framework for Solana's Sealevel runtime providing tools to build comprehensive, secure, and safe Solana programs. This contract implements a token vesting schedule that allows tokens to be locked up over a specified period, including a cliff period, after which tokens begin to vest.

## Features

- Dual Token Support: Compatible with both SPL Token and Token2022 standards.
- Token Vesting: Tokens are locked and vested to a beneficiary over a defined period following a cliff period, during which no tokens are vested.
- Cliff Period: A specific duration at the beginning of the vesting schedule during which no tokens can be claimed, even though they accumulate towards vesting.
- Vesting Schedule: After the cliff has expired, tokens begin to vest linearly over the remaining duration until the end time is reached.
- Claim Functionality: Beneficiaries can claim their vested tokens after the cliff period if tokens are available to be claimed.

## Contract Functions

### Initialize

Initializes a new vesting schedule for a beneficiary.

Parameters:

- ctx: Context<Initialize>: The transaction context, including accounts, program IDs, and signers.
- start_time: u64: The UNIX timestamp indicating when the vesting schedule starts.
- cliff_duration: u64: The duration of the cliff period in seconds.
- end_time: u64: The UNIX timestamp indicating when the vesting schedule ends.
- amount: u64: The total amount of tokens to be vested.

Returns:

- ProgramResult: Result of the initialization operation, indicating success or failure.

### Claim

Allows the beneficiary to claim their vested tokens after the cliff period.

Parameters:

- ctx: Context<Claim>: The transaction context.

Returns:

- ProgramResult: Result of the claim operation, indicating the number of tokens successfully claimed or an error if the operation fails.

## Data Structures

### VestingSchedule

Stores the vesting schedule details for a beneficiary.

Fields:

- **beneficiary: Pubkey** - Public key of the beneficiary who will receive the vested tokens.
- **start_time: u64** - Start time of the vesting schedule as a UNIX timestamp.
- **cliff_duration: u64** - Duration of the cliff in seconds.
- **end_time: u64** - End time of the vesting schedule as a UNIX timestamp.
- **amount: u64** - Total amount of tokens that will be vested.
- **claimed: u64** - Amount of tokens that have already been claimed by the beneficiary.

## Setup and Deployment

Prerequisites:

- Install Rust and the Solana tool suite.
- Anchor framework should be installed and properly configured on your system.

Deployment:

- Clone the repository.
- Navigate to the project directory.
- Build the project using Anchor:

```shell
anchor build
```

- Deploy to Solana blockchain:

```shell
anchor deploy
```
