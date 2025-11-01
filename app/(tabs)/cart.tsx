import React, {useState} from "react";
import {ActivityIndicator, Alert, FlatList, Text, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import cn from "clsx";
import {useCartStore} from "@/store/cart.store";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import CustomHeader from "@/components/CustomHeader";
import {PaymentInfoStripeProps} from "@/type";
import {router} from "expo-router";
import {initPaymentSheet, presentPaymentSheet} from "@stripe/stripe-react-native";
import useAuthStore from "@/store/auth.store";

const PaymentInfoStripe = ({
                             label,
                             value,
                             labelStyle,
                             valueStyle,
                           }: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const {items, getTotalItems, getTotalPrice, clearCart} = useCartStore();
  const {user} = useAuthStore();
  const [loading, setLoading] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = 5.0;
  const discount = 0.5;
  const finalAmount = totalPrice + deliveryFee - discount;

  const handlePayment = async () => {
    console.log("Initiating payment...");
    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Stripe uses cents
          currency: "eur",
          userId: user?.$id,
          email: user?.email,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const {paymentIntent, ephemeralKey, customer} = data;

      // Step 1: Initialize the Payment Sheet
      const {error: initError} = await initPaymentSheet({
        merchantDisplayName: "Food Delivery App",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {name: user?.name || "Customer"},
      });

      if (initError) throw new Error(initError.message);

      // Step 2: Present the sheet
      const {error: paymentError} = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert("Payment failed", paymentError.message);
      } else {
        Alert.alert("Success", "Your order has been placed!");
        clearCart();
        // router.push("/success");
      }
    } catch (err) {
      Alert.alert("Error", "Payment failed. Please try again.");
      console.log("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({item}) => <CartItem item={item}/>}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart"/>}
        ListEmptyComponent={() => <Text>Cart Empty</Text>}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="gap-5">
              <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                <Text className="h3-bold text-dark-100 mb-5">
                  Payment Summary
                </Text>

                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`$${totalPrice.toFixed(2)}`}
                />
                <PaymentInfoStripe label="Delivery Fee" value="$5.00"/>
                <PaymentInfoStripe
                  label="Discount"
                  value="- $0.50"
                  valueStyle="!text-success"
                />
                <View className="border-t border-gray-300 my-2"/>
                <PaymentInfoStripe
                  label="Total"
                  value={`$${finalAmount.toFixed(2)}`}
                  labelStyle="base-bold !text-dark-100"
                  valueStyle="base-bold !text-dark-100 !text-right"
                />
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#000"/>
              ) : (
                <CustomButton title="Order Now" onPress={handlePayment}/>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Cart;
