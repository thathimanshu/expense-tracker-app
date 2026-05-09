import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import 'react-native-get-random-values';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionContextType } from '../types';

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider'
    );
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await loadTransactions();
    };

    initialize();
  }, []);

  /**
   * Load transactions from AsyncStorage
   */
  const loadTransactions = async (): Promise<void> => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');

      if (storedTransactions) {
        setTransactions(() => JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
        await AsyncStorage.setItem('transactions', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load transactions.',
      });
    }
  };

  /**
   * Add a new transaction
   */
  const addTransaction = async (
    newTransaction: Omit<Transaction, 'id'>
  ): Promise<void> => {
    try {
      const transactionWithId: Transaction = {
        ...newTransaction,
        id: uuidv4(),
      };

      const updatedTransactions = [...transactions, transactionWithId];

      await AsyncStorage.setItem(
        'transactions',
        JSON.stringify(updatedTransactions)
      );

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        transactionWithId,
      ]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add transaction.',
      });
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
