import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, SegmentedButtons, useTheme, Text, Menu } from "react-native-paper";
import { useTransactions } from "../context/TransactionContext";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router, usePathname } from "expo-router";
import { transactionCategories } from "../data/transactionCategories";
import { useForm, Controller } from "react-hook-form";

export default function AddTransactionScreen(): JSX.Element {
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const { addTransaction } = useTransactions();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      category: "",
      notes: "",
      type: "expense",
    },
  });

  const onSubmit = async (data: any) => {
    if (data.amount && data.category) {
      const newTransaction = {
        amount: parseFloat(data.amount),
        category: data.category,
        type: data.type,
        date: new Date().toISOString(),
        notes: data.notes,
      };

      await addTransaction(newTransaction);
      reset();
      router.replace("/");
    }
  };

  useEffect(() => {
    if (pathname === "/add") {
      reset();
    }
  }, [pathname, reset]);

   return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={{
      paddingBottom: 40,
    }}
    showsVerticalScrollIndicator={false}
  >
    <Animated.View entering={FadeInUp.delay(200).duration(700)}>
      <Text style={styles.title}>Add Transaction</Text>

      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            theme={{
              roundness: 5,
            }}
            buttons={[
              {
                value: "expense",
                label: "Expense",
              },
              {
                value: "income",
                label: "Income",
              },
            ]}
            style={styles.segmentedButtons}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        rules={{ required: "Amount is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Amount"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            mode="outlined"
            error={!!errors.amount}
            style={styles.input}
            outlineStyle={{
              borderRadius: 18,
              borderColor: "#E5E7EB",
            }}
            activeOutlineColor={theme.colors.primary}
            contentStyle={{
              paddingVertical: 10,
              fontSize: 16,
            }}
          />
        )}
      />

      {errors.amount && (
        <Text style={styles.errorText}>
          {errors.amount.message}
        </Text>
      )}

      <Controller
        control={control}
        name="category"
        rules={{ required: "Category is required" }}
        render={({ field: { onChange, value } }) => (
          <>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: 5,
                paddingVertical: 8,
                elevation: 5,
              }}
              anchor={
                <TextInput
                  label="Category"
                  value={value}
                  onFocus={() => setMenuVisible(true)}
                  mode="outlined"
                  error={!!errors.category}
                  style={styles.input}
                  outlineStyle={{
                    borderRadius: 18,
                    borderColor: "#E5E7EB",
                  }}
                  activeOutlineColor={theme.colors.primary}
                  contentStyle={{
                    paddingVertical: 10,
                    fontSize: 16,
                  }}
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setMenuVisible(true)}
                    />
                  }
                />
              }
            >
              {transactionCategories.map((cat) => (
                <Menu.Item
                  key={cat}
                  title={cat}
                  onPress={() => {
                    onChange(cat);
                    setMenuVisible(false);
                  }}
                  titleStyle={{
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                  style={{
                    borderRadius: 14,
                    marginHorizontal: 8,
                  }}
                />
              ))}
            </Menu>

            {errors.category && (
              <Text style={styles.errorText}>
                {errors.category.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Notes"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            mode="outlined"
            style={styles.input}
            outlineStyle={{
              borderRadius: 18,
              borderColor: "#E5E7EB",
            }}
            activeOutlineColor={theme.colors.primary}
            contentStyle={{
              paddingVertical: 14,
              fontSize: 16,
            }}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        buttonColor={theme.colors.primary}
      >
        Add Transaction
      </Button>
    </Animated.View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 28,
    letterSpacing: -0.5,
  },

  segmentedButtons: {
    marginBottom: 24,
  },

  input: {
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  button: {
    marginTop: 24,
    borderRadius: 18,
    paddingVertical: 8,
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: -10,
    marginBottom: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
});