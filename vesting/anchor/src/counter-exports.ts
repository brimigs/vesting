// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import VestingIDL from '../target/idl/vesting_contract.json';
import type { VestingContract } from '../target/types/vesting_contract';

// Re-export the generated IDL and type
export { VestingContract, VestingIDL };

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(
  'FJMQBnLFuLPTBHAKgYyBdoZ4PAu9f6ewrZbhHAgBt4Rw'
);

// This is a helper function to get the Counter Anchor program.
export function getVestingProgram(provider: AnchorProvider) {
  return new Program(VestingIDL as VestingContract, provider);
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getVestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
      return new PublicKey('FJMQBnLFuLPTBHAKgYyBdoZ4PAu9f6ewrZbhHAgBt4Rw');
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('FJMQBnLFuLPTBHAKgYyBdoZ4PAu9f6ewrZbhHAgBt4Rw');
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID;
  }
}
