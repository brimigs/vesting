'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useVestingProgram } from './vesting-data-access';
import { VestingCreate } from './vesting-ui';
import { useState } from 'react';

export default function VestingFeature() {
  const { publicKey } = useWallet();
  const [companyName, setCompanyName] = useState<string>('');
  const { programId } = useVestingProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Company Vesting Account"
        subtitle={
          'Create a new vesting account by clicking the "Create" button.'
        }
      >
        <VestingCreate />
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
