import React, {useRef, useState} from "react";
import {ActivityIndicator, FlatList, Text, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {BottomSheetModal} from "@gorhom/bottom-sheet";
import {useCartStore} from "@/store/cart.store";
import useAuthStore from "@/store/auth.store";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import CustomHeader from "@/components/CustomHeader";
import {initPaymentSheet, presentPaymentSheet} from "@stripe/stripe-react-native";
import PaymentModal from "@/components/PaymentModal";

const PaymentSummary = ({totalItems, totalPrice, deliveryFee, discount, finalAmount}: any) => (
  <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
    <Text className="h3-bold text-dark-100 mb-5">Payment Summary</Text>

    <Row label={`Total Items (${totalItems})`} value={`$${totalPrice.toFixed(2)}`}/>
    <Row label="Delivery Fee" value={`$${deliveryFee.toFixed(2)}`}/>
    <Row label="Discount" value={`- $${discount.toFixed(2)}`} valueStyle="!text-success"/>
    <View className="border-t border-gray-300 my-2"/>
    <Row
      label="Total"
      value={`$${finalAmount.toFixed(2)}`}
      labelStyle="base-bold !text-dark-100"
      valueStyle="base-bold !text-dark-100 !text-right"
    />
  </View>
);

const Row = ({label, value, labelStyle, valueStyle}: any) => (
  <View className="flex-between flex-row my-1">
    <Text className={`paragraph-medium text-gray-200 ${labelStyle || ""}`}>{label}</Text>
    <Text className={`paragraph-bold text-dark-100 ${valueStyle || ""}`}>{value}</Text>
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

  const successModalRef = useRef<BottomSheetModal>(null);
  const failModalRef = useRef<BottomSheetModal>(null);

  const handlePayment = async () => {
    if (!user?.$id || !user?.email || totalItems === 0) {
      failModalRef.current?.present();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://69065ee7000e20aabd8a.fra.appwrite.run", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100),
          currency: "eur",
          userId: user.$id,
          email: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error || !data.success) throw new Error(data.error);

      const {paymentIntent, ephemeralKey, customer} = data;
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
      });

      if (initError) throw new Error(initError.message);

      const {error: paymentError} = await presentPaymentSheet();
      if (paymentError) {
        failModalRef.current?.present();
      } else {
        clearCart();
        successModalRef.current?.present();
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      failModalRef.current?.present();
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
              <PaymentSummary
                totalItems={totalItems}
                totalPrice={totalPrice}
                deliveryFee={deliveryFee}
                discount={discount}
                finalAmount={finalAmount}
              />

              {loading ? (
                <ActivityIndicator size="large" color="#000"/>
              ) : (
                <CustomButton title="Order Now" onPress={handlePayment}/>
              )}
            </View>
          )
        }
      />

      <PaymentModal
        refObj={successModalRef}
        success
        onPrimaryAction={() => {
          successModalRef.current?.close();
        }}
        onSecondaryAction={() => console.log("Track Order")}
      />

      <PaymentModal
        refObj={failModalRef}
        success={false}
        onPrimaryAction={() => {
          failModalRef.current?.close();
        }}
        onSecondaryAction={() => console.log("Go Back")}
      />
    </SafeAreaView>
  );
};

export default Cart;


