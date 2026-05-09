import React, { useState } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Text, Card, useTheme, Button } from "react-native-paper";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { router } from "expo-router";
import { useTransactions } from "@/context/TransactionContext";

type TransactionType = "income" | "expense";

interface ParsedTransaction {
  amount: number;
  category: string;
  type: TransactionType;
  notes: string;
}

const INCOME_WORDS = ["got", "received", "earned", "salary"];

export function parseTransactionInput(input: string): ParsedTransaction | null {
  const words = input.toLowerCase().trim().split(/\s+/);

  let type: TransactionType = "expense";

  // detect income
  if (INCOME_WORDS.includes(words[0])) {
    type = "income";
    words.shift();
  }

  // amount
  const amountToken = words.shift();

  if (!amountToken) return null;

  const amountMatch = amountToken.match(/(\d+(\.\d+)?)(k)?/);

  if (!amountMatch) return null;

  let amount = parseFloat(amountMatch[1]);

  if (amountMatch[3] === "k") {
    amount *= 1000;
  }

  // category
  const category = words.shift() || "other";

  // notes
  const notes = words.join(" ");

  return {
    amount,
    category,
    type,
    notes,
  };
}

const AddInputField = () => {
  const theme = useTheme();
  const [newTransaction, setNewTransaction] = useState<string>("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { amount: "", category: "", notes: "", type: "expense" } });
  const { addTransaction } = useTransactions();

  const onSubmit = async (data: any) => {
    if (data.amount && data.category) {
      const newTransaction = {
        amount: parseFloat(data.amount),
        category: data.category,
        type: data.type, //expense income
        date: new Date().toISOString(),
        notes: data.notes,
      };

      await addTransaction(newTransaction);
      reset();
      router.replace("/");
    }
  };

  const submitNewTransaction = async () => {
    const parsed = parseTransactionInput(newTransaction);

    if (!parsed) return;

    const transaction = {
      amount: parsed.amount,
      category: parsed.category,
      type: parsed.type,
      date: new Date().toISOString(),
      notes: parsed.notes,
    };

    await addTransaction(transaction);

    setNewTransaction("");
    //   router.replace('/');
  };
  return (
    <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
      <Card style={{ marginBottom: 16, elevation: 4 }}>
        <Card.Content style={{ justifyContent: "center" }}>
          <TextInput value={newTransaction} onChangeText={setNewTransaction} placeholder="Enter New Transaction...."   onSubmitEditing={submitNewTransaction} />
          <TouchableOpacity
            onPress={() => submitNewTransaction()}
            style={{ position: "absolute", right: 8, height: "100%", justifyContent: "center", width: 40, alignItems: "flex-end" }}
          >
            <Ionicons name="chevron-forward-sharp" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export default AddInputField;
