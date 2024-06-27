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
  companyName: string;
  tokenMintAddress: string;
  signer: PublicKey;
}

interface CreateEmployeeAccountArgs {
  companyName: string;
  tokenMintAddress: string;
  beneficiary: PublicKey;
  startTime: BN;
  endTime: BN;
  totalAmount: BN;
  cliffTime: BN;
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
    mutationFn: async ({ companyName, tokenMintAddress }) => {
      const [vestingAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(companyName)],
        programId
      );

      const [treasuryAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('vesting_treasury'), Buffer.from(companyName)],
        programId
      );

      const vestingAccounts = {
        vestingAccount: vestingAccountAddress,
        treasuryAccount: treasuryAccountAddress,
        mint: new PublicKey(tokenMintAddress),
        tokenProgram: token.TOKEN_PROGRAM_ID,
      };

      return program.methods
        .createVestingAccount(companyName)
        .accounts(vestingAccounts)
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
    }) => {
      const [vestingAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(companyName)],
        programId
      );

      const [employeeAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('employee_vesting'), beneficiary.toBuffer()],
        programId
      );

      const [employeeTokenAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('employee_tokens'),
          beneficiary.toBuffer(),
          vestingAccountAddress.toBuffer(),
        ],
        programId
      );

      const employeeAccounts = {
        employeeAccount: employeeAccountAddress,
        mint: new PublicKey(tokenMintAddress),
        employeeTokenAccount: employeeTokenAccount,
        tokenProgram: token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: token.ASSOCIATED_PROGRAM_ID,
        vestingAccount: vestingAccountAddress,
      };

      return program.methods
        .createEmployeeVesting(
          beneficiary,
          startTime,
          endTime,
          totalAmount,
          cliffTime
        )
        .accounts(employeeAccounts)
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
      const [vestingAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(companyName)],
        programId
      );

      const [employeeAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('employee_vesting'), beneficiary.toBuffer()],
        programId
      );

      const [employeeTokenAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('employee_tokens'),
          beneficiary.toBuffer(),
          vestingAccountAddress.toBuffer(),
        ],
        programId
      );

      const [treasuryAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from('vesting_treasury'), Buffer.from(companyName)],
        programId
      );

      const claimAccounts = {
        mint: new PublicKey(tokenMintAddress),
        employeeAccount: employeeAccountAddress,
        vestingAccount: vestingAccountAddress,
        treasuryTokenAccount: treasuryAccountAddress,
        employeeTokenAccount: employeeTokenAccount,
        tokenProgram: token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: token.ASSOCIATED_PROGRAM_ID,
      };

      return program.methods.claimTokens().accounts(claimAccounts).rpc();
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
