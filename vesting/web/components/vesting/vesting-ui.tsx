'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useVestingProgram, useEmployeeAccount } from './vesting-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [tokenMintAddress, setTokenMintAddress] = useState('');
  const [companyName, setCompanyName] = useState('');

  const isFormValid = tokenMintAddress.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({
        companyName,
        tokenMintAddress,
        signer: publicKey,
      });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        placeholder="Token Mint Address"
        value={tokenMintAddress}
        onChange={(e) => setTokenMintAddress(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        Create Journal Entry {createVestingAccount.isPending && '...'}
      </button>
    </div>
  );
}

// export function CounterList() {
//   const { accounts, getProgramAccount } = useVestingProgram();

//   if (getProgramAccount.isLoading) {
//     return <span className="loading loading-spinner loading-lg"></span>;
//   }
//   if (!getProgramAccount.data?.value) {
//     return (
//       <div className="alert alert-info flex justify-center">
//         <span>
//           Program account not found. Make sure you have deployed the program and
//           are on the correct cluster.
//         </span>
//       </div>
//     );
//   }
//   return (
//     <div className={'space-y-6'}>
//       {accounts.isLoading ? (
//         <span className="loading loading-spinner loading-lg"></span>
//       ) : accounts.data?.length ? (
//         <div className="grid md:grid-cols-2 gap-4">
//           {accounts.data?.map((account) => (
//             <CounterCard
//               key={account.publicKey.toString()}
//               account={account.publicKey}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center">
//           <h2 className={'text-2xl'}>No accounts</h2>
//           No accounts found. Create one above to get started.
//         </div>
//       )}
//     </div>
//   );
// }

// function CounterCard({ account }: { account: PublicKey }) {
//   const {
//     accountQuery,
//     incrementMutation,
//     setMutation,
//     decrementMutation,
//     closeMutation,
//   } = useCounterProgramAccount({ account });

//   const count = useMemo(
//     () => accountQuery.data?.count ?? 0,
//     [accountQuery.data?.count]
//   );

//   return accountQuery.isLoading ? (
//     <span className="loading loading-spinner loading-lg"></span>
//   ) : (
//     <div className="card card-bordered border-base-300 border-4 text-neutral-content">
//       <div className="card-body items-center text-center">
//         <div className="space-y-6">
//           <h2
//             className="card-title justify-center text-3xl cursor-pointer"
//             onClick={() => accountQuery.refetch()}
//           >
//             {count}
//           </h2>
//           <div className="card-actions justify-around">
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => incrementMutation.mutateAsync()}
//               disabled={incrementMutation.isPending}
//             >
//               Increment
//             </button>
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => {
//                 const value = window.prompt(
//                   'Set value to:',
//                   count.toString() ?? '0'
//                 );
//                 if (
//                   !value ||
//                   parseInt(value) === count ||
//                   isNaN(parseInt(value))
//                 ) {
//                   return;
//                 }
//                 return setMutation.mutateAsync(parseInt(value));
//               }}
//               disabled={setMutation.isPending}
//             >
//               Set
//             </button>
//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() => decrementMutation.mutateAsync()}
//               disabled={decrementMutation.isPending}
//             >
//               Decrement
//             </button>
//           </div>
//           <div className="text-center space-y-4">
//             <p>
//               <ExplorerLink
//                 path={`account/${account}`}
//                 label={ellipsify(account.toString())}
//               />
//             </p>
//             <button
//               className="btn btn-xs btn-secondary btn-outline"
//               onClick={() => {
//                 if (
//                   !window.confirm(
//                     'Are you sure you want to close this account?'
//                   )
//                 ) {
//                   return;
//                 }
//                 return closeMutation.mutateAsync();
//               }}
//               disabled={closeMutation.isPending}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
