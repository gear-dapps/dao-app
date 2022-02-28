// Copyright 2021-2022 @gear-tech/create-gear-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { InjectedExtension } from '@polkadot/extension-inject/types';

import { UserAccount } from '../types/user';
import { useApi } from 'hooks/useApi';
import { nodeApi } from '../api/initApi';

type InitContextProps = {
  currentAccount: UserAccount | null;
  injectedAccounts: Array<UserAccount> | null;
  setCurrentAccount: any;
  accountBalance: string | null;
  selectAccount: (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => void;
};

export const UserContext = React.createContext({} as InitContextProps);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: any) => {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(
    null
  );
  const [injectedAccounts, setInjectedAccounts] = useState<
    UserAccount[] | null
  >(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);

  const { api } = useApi();

  /**
   * Fetch accounts from the extension
   */

  const fetchAccounts = useCallback(async () => {
    if (typeof window !== `undefined`) {
      const { web3Accounts, web3Enable } = await import(
        '@polkadot/extension-dapp'
      );

      const extensions: InjectedExtension[] = await web3Enable('Gear App');

      if (extensions.length === 0) {
        return null;
      }

      const accounts: UserAccount[] = await web3Accounts();

      return accounts;
    }

    return null;
  }, []);

  const selectAccount = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    if (injectedAccounts) {
      injectedAccounts.forEach((acc: UserAccount, i: number) => {
        acc.isActive = false;
        if (i === index) {
          acc.isActive = true;
          localStorage.setItem('savedAccount', acc.address);
        }
      });
      setCurrentAccount(injectedAccounts[index]);
    }
  };

  const user = {
    currentAccount: currentAccount,
    injectedAccounts: injectedAccounts,
    accountBalance: accountBalance,
    setCurrentAccount: setCurrentAccount,
    selectAccount: selectAccount,
  };

  useEffect(() => {
    setTimeout(() => {
      fetchAccounts()
        .then((allAccounts) => {
          if (allAccounts) {
            allAccounts.forEach((account: UserAccount) => {
              if (account.address === localStorage.getItem('savedAccount')) {
                account.isActive = true;
                setCurrentAccount(account);
              }
            });
            setInjectedAccounts(allAccounts);
          }
        })
        .catch((err) => console.error(err));
    }, 300);
  }, []);

  const getBalance = useCallback(
    async (ADDR: string) => {
      const freeBalance = await api.balance.findOut(ADDR);
      return freeBalance;
    },
    [api]
  );

  // Get account balance

  useEffect(() => {
    if (currentAccount && api) {
      getBalance(currentAccount.address).then((result) => {
        setAccountBalance(result.toHuman());
      });
    }
  }, [currentAccount, api, getBalance]);

  // Listen to balance changes

  useEffect(() => {
    if (currentAccount) {
      nodeApi.subscribeBalanceChange(currentAccount.address, (balance) => {
        setAccountBalance(balance.toHuman());
      });
    }

    return () => {
      nodeApi.unsubscribeBalanceChange();
    };
  }, [currentAccount]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
