'use client';

import { getVestingProgram, getVestingProgramId } from '@vesting/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { token } from '@coral-xyz/anchor/dist/cjs/utils';
import { BN } from '@coral-xyz/anchor';

interface CreateVestingArgs {
  company_name: string;
  token_mint_address: string;
  signer: PublicKey;
}

interface CreateExmployeeAccountArgs {
  company_name: string;
  beneficiary: PublicKey;
  start_time: BN;
  end_time: BN;
  total_amount: BN;
  cliff_time: BN;
}

interface ClaimTokensArgs {
  beneficiary: PublicKey;
  token_mint_address: PublicKey;
  company_name: string;
}

export function useVestingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getVestingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getVestingProgram(provider);

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ['vesting-account', 'create', { cluster }],
    mutationFn: async ({ company_name, token_mint_address, signer }) => {
      const [vestingAccountAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(company_name)],
        programId
      );

      const [treasuryAccountAddress] = await PublicKey.findProgramAddress(
        [
          Buffer.from('vesting_treasury'),
          signer.toBuffer(),
          Buffer.from(company_name),
        ],
        programId
      );

      return program.methods
        .createVestingAccount(company_name)
        .accounts({
          vestingAccount: vestingAccountAddress,
          mint: token_mint_address,
          treasury: treasuryAccountAddress,
          tokenProgram: token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: token.ASSOCIATED_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  const createEmployeeAccount = useMutation<
    string,
    Error,
    CreateExmployeeAccountArgs
  >({
    mutationKey: ['vesting-account', 'create', { cluster }],
    mutationFn: async ({
      company_name,
      beneficiary,
      start_time,
      end_time,
      total_amount,
      cliff_time,
    }) => {
      const [vestingAccountAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(company_name)],
        programId
      );

      const [employeeAccountAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('employee_vesting'), beneficiary.toBuffer()],
        programId
      );

      const [employeeTokenAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('employee_tokens'),
          beneficiary.toBuffer(),
          vestingAccountAddress.toBuffer(),
        ],
        programId
      );

      return program.methods
        .createEmployeeVesting(
          beneficiary,
          start_time,
          end_time,
          total_amount,
          cliff_time
        )
        .accounts({
          vestingAccount: vestingAccountAddress,
          employeeAccount: employeeAccountAddress,
          employeeTokenAccount: employeeTokenAccount,
          tokenProgram: token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: token.ASSOCIATED_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
    createEmployeeAccount,
  };
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useVestingProgram();

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.employeeAccount.fetch(account),
  });

  const claimMutation = useMutation<string, Error, ClaimTokensArgs>({
    mutationKey: ['employee', 'claim', { cluster }],
    mutationFn: async ({ company_name, beneficiary, token_mint_address }) => {
      const [vestingAccountAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(company_name)],
        programId
      );

      const [employeeAccountAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('employee_vesting'), beneficiary.toBuffer()],
        programId
      );

      const [employeeTokenAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('employee_tokens'),
          beneficiary.toBuffer(),
          vestingAccountAddress.toBuffer(),
        ],
        programId
      );

      return program.methods
        .claimTokens()
        .accounts({
          vestingAccount: vestingAccountAddress,
          employeeAccount: employeeAccountAddress,
          employeeTokenAccount: employeeTokenAccount,
          tokenProgram: token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: token.ASSOCIATED_PROGRAM_ID,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  return {
    accountQuery,
    claimMutation,
  };
}
