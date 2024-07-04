'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useVestingProgram } from './employee-data-access';
import { EmployeeCreate } from './employee-ui';
import { useState } from 'react';
import React from 'react';

export default function EmployeeFeature() {
  const { publicKey } = useWallet();
  const [companyName, setCompanyName] = useState<string>('');
  const { programId } = useVestingProgram();

  return publicKey ? (
    <div>
      <AppHero
        title={`Your Vesting Accounts`}
        subtitle={`Accounts associated with: ${publicKey}`}
      >
        <EmployeeCreate />
      </AppHero>
      {/* <CounterList /> */}
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
