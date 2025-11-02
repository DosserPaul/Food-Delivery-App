import React, {useMemo} from "react";
import {animations} from "@/constants";
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import LottieView from "lottie-react-native";
import {Text} from "react-native";
import CustomButton from "@/components/CustomButton";

const PaymentModal = ({
  refObj,
  success = true,
  onPrimaryAction,
  onSecondaryAction,
}: {
  refObj: any;
  success?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}) => {
  const snapPoints = useMemo(() => ["50%"], []);
  const animation = success ? animations.successAnimation : animations.errorAnimation;

  return (
    <BottomSheetModal
      ref={refObj}
      snapPoints={snapPoints}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      )}
      backgroundStyle={{ backgroundColor: "white" }}
    >
      <BottomSheetView className="flex-1 items-center justify-center px-6">
        <LottieView
          source={animation}
          autoPlay
          loop={false}
          style={{ width: 180, height: 180, marginBottom: 24 }}
          onAnimationFinish={() => {
            if (success) onPrimaryAction?.();
          }}
        />
        <Text
          className={`font-bold text-xl mb-3 text-center ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {success ? "🎉 Payment Successful!" : "❌ Payment Failed!"}
        </Text>

        <Text className="text-gray-600 text-base text-center mb-6">
          {success
            ? "Your order has been placed successfully."
            : "Something went wrong. Please try again."}
        </Text>

        <CustomButton
          title={success ? "Go Home" : "Try Again"}
          onPress={onPrimaryAction}
          style="mb-20"
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default PaymentModal;
