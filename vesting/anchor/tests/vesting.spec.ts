import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { VestingContract } from '../target/types/vesting_contract';
import { token } from '@coral-xyz/anchor/dist/cjs/utils';

describe('vesting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.VestingContract as Program<VestingContract>;

  const counterKeypair = Keypair.generate();

  const companyName = 'Test Company';

  const [vestingAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(companyName)],
    program.programId
  );

  const [treasuryAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vesting_treasury'), Buffer.from(companyName)],
    program.programId
  );

  const devnetUSDC = new anchor.web3.PublicKey(
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
  );

  const vestingAccounts = {
    vestingAccount: vestingAccountPDA,
    treasuryAccount: treasuryAccountPDA,
    mint: devnetUSDC,
    tokenProgram: token.TOKEN_PROGRAM_ID,
  };

  it('Initialize Vesting Contract', async () => {
    await program.methods
      .createVestingAccount(companyName)
      .accounts(vestingAccounts)
      .rpc();

    const newVesting = await program.account.vestingAccount.fetch(
      counterKeypair.publicKey
    );

    expect(newVesting.companyName).toEqual(companyName);
  });

  //   it('Increment Counter', async () => {
  //     await program.methods
  //       .increment()
  //       .accounts({ counter: counterKeypair.publicKey })
  //       .rpc();

  //     const currentCount = await program.account.counter.fetch(
  //       counterKeypair.publicKey
  //     );

  //     expect(currentCount.count).toEqual(1);
  //   });

  //   it('Increment Counter Again', async () => {
  //     await program.methods
  //       .increment()
  //       .accounts({ counter: counterKeypair.publicKey })
  //       .rpc();

  //     const currentCount = await program.account.counter.fetch(
  //       counterKeypair.publicKey
  //     );

  //     expect(currentCount.count).toEqual(2);
  //   });

  //   it('Decrement Counter', async () => {
  //     await program.methods
  //       .decrement()
  //       .accounts({ counter: counterKeypair.publicKey })
  //       .rpc();

  //     const currentCount = await program.account.counter.fetch(
  //       counterKeypair.publicKey
  //     );

  //     expect(currentCount.count).toEqual(1);
  //   });

  //   it('Set counter value', async () => {
  //     await program.methods
  //       .set(42)
  //       .accounts({ counter: counterKeypair.publicKey })
  //       .rpc();

  //     const currentCount = await program.account.counter.fetch(
  //       counterKeypair.publicKey
  //     );

  //     expect(currentCount.count).toEqual(42);
  //   });

  //   it('Set close the counter account', async () => {
  //     await program.methods
  //       .close()
  //       .accounts({
  //         payer: payer.publicKey,
  //         counter: counterKeypair.publicKey,
  //       })
  //       .rpc();

  //     // The account should no longer exist, returning null.
  //     const userAccount = await program.account.counter.fetchNullable(
  //       counterKeypair.publicKey
  //     );
  //     expect(userAccount).toBeNull();
  //   });
});
