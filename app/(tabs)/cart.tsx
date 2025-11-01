import React, {useState} from "react";
import {ActivityIndicator, Alert, FlatList, Text, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import cn from "clsx";
import {useCartStore} from "@/store/cart.store";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import CustomHeader from "@/components/CustomHeader";
import {PaymentInfoStripeProps} from "@/type";
import {initPaymentSheet, presentPaymentSheet,} from "@stripe/stripe-react-native";
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
    // Check if user is logged in
    if (!user?.$id || !user?.email) {
      Alert.alert("Error", "You must be logged in to make a payment.");
      return;
    }

    // Check if cart has items
    if (totalItems === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      // Call Appwrite Function using fetch
      console.log("🔍 Calling payment function:", {
        userId: user.$id,
        email: user.email,
        amount: Math.round(finalAmount * 100),
      });

      const response = await fetch(
        "https://69065ee7000e20aabd8a.fra.appwrite.run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(finalAmount * 100), // amount in cents
            currency: "eur",
            userId: user.$id,
            email: user.email,
          }),
        }
      );

      console.log("✅ Response status:", response.status);

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`
        );
      }

      // Parse JSON response
      const data = await response.json();
      console.log("✅ Parsed payment data:", data);

      // Check for errors in response
      if (data.error || !data.success) {
        throw new Error(data.error || "Payment initialization failed");
      }

      // Validate required fields
      const {paymentIntent, ephemeralKey, customer} = data;

      if (!paymentIntent || !ephemeralKey || !customer) {
        throw new Error(
          "Missing required payment data from server. Please try again."
        );
      }

      // Initialize Stripe Payment Sheet
      const {error: initError} = await initPaymentSheet({
        merchantDisplayName: "Food Delivery App",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user.name || "Customer",
          email: user.email,
        },
        returnURL: "your-app-scheme://stripe-redirect",
      });

      if (initError) {
        throw new Error(`Failed to initialize payment: ${initError.message}`);
      }

      // Present the payment sheet
      const {error: paymentError} = await presentPaymentSheet();

      if (paymentError) {
        // User cancelled or payment failed
        if (paymentError.code === "Canceled") {
          Alert.alert("Cancelled", "Payment was cancelled.");
        } else {
          Alert.alert("Payment Failed", paymentError.message);
        }
      } else {
        // Payment successful
        Alert.alert(
          "Success",
          "Your order has been placed successfully!",
          [
            {
              text: "OK",
              onPress: () => clearCart(),
            },
          ]
        );
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      Alert.alert("Payment Error", errorMessage);
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
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="h4-medium text-gray-400">Your cart is empty</Text>
          </View>
        )}
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
