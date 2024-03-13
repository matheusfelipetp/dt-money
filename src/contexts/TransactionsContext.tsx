import { ReactNode, useCallback, useEffect, useState } from 'react';
import { api } from '../api/axios';
import { createContext } from 'use-context-selector';

interface Transaction {
  id: number;
  description: string;
  type: 'income' | 'outcome';
  category: string;
  price: number;
  createdAt: string;
}

interface TransactionCreate {
  description: string;
  type: 'income' | 'outcome';
  category: string;
  price: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  fetchTransactions: (query: string) => Promise<void>;
  createTransaction: (newTransaction: TransactionCreate) => Promise<void>;
}

export const TransactionsContext = createContext({} as TransactionContextType);

interface TransactionsProviderProps {
  children: ReactNode;
}

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async (query?: string) => {
    const { data } = await api.get('transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    });

    setTransactions(data);
  }, []);

  const createTransaction = useCallback(
    async (newTransaction: TransactionCreate) => {
      const { description, price, category, type } = newTransaction;

      const { data } = await api.post('transactions', {
        description,
        price,
        category,
        type,
        createdAt: new Date(),
      });

      setTransactions((state) => [data, ...state]);
    },
    [],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <TransactionsContext.Provider
      value={{ transactions, fetchTransactions, createTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
