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
import { BN } from '@coral-xyz/anchor';

interface CreateVestingArgs {
  companyName: string;
  tokenMintAddress: string;
  signer: PublicKey;
  tokenProgram: PublicKey;
}

interface CreateEmployeeAccountArgs {
  companyName: string;
  tokenMintAddress: PublicKey;
  beneficiary: PublicKey;
  startTime: BN;
  endTime: BN;
  totalAmount: BN;
  cliffTime: BN;
  signer: PublicKey;
  tokenProgram: PublicKey;
  vestingAccount: PublicKey;
}

interface ClaimTokensArgs {
  beneficiary: PublicKey;
  tokenMintAddress: PublicKey;
  companyName: string;
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
    queryKey: ['vesting-account', 'all', { cluster }],
    queryFn: () => program.account.vestingAccount.all,
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ['vesting-account', 'create', { cluster }],
    mutationFn: async ({
      companyName,
      tokenMintAddress,
      tokenProgram,
      signer,
    }) => {
      return program.methods
        .createVestingAccount(companyName)
        .accounts({
          signer,
          mint: tokenMintAddress,
          tokenProgram,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create vesting program: ${error.message}`);
    },
  });

  const createEmployeeAccount = useMutation<
    string,
    Error,
    CreateEmployeeAccountArgs
  >({
    mutationKey: ['vesting-account', 'create', { cluster }],
    mutationFn: async ({
      companyName,
      beneficiary,
      startTime,
      endTime,
      totalAmount,
      cliffTime,
      tokenMintAddress,
      signer,
      tokenProgram,
      vestingAccount,
    }) => {
      return program.methods
        .createEmployeeVesting(
          beneficiary,
          startTime,
          endTime,
          totalAmount,
          cliffTime
        )
        .accounts({
          signer,
          mint: tokenMintAddress,
          tokenProgram: tokenProgram,
          vestingAccount,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create vesting program: ${error.message}`);
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

export function useEmployeeAccount({
  beneficiary,
}: {
  beneficiary: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts, programId } = useVestingProgram();

  const accountQuery = useQuery({
    queryKey: ['employee', 'fetch', { cluster, beneficiary }],
    queryFn: () => program.account.employeeAccount.fetch(beneficiary),
  });

  const claimMutation = useMutation<string, Error, ClaimTokensArgs>({
    mutationKey: ['employee', 'claim', { cluster }],
    mutationFn: async ({ companyName, beneficiary, tokenMintAddress }) => {
      // return program.methods.claimTokens().accounts(claimAccounts).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create vesting: ${error.message}`);
    },
  });

  return {
    accountQuery,
    claimMutation,
  };
}
