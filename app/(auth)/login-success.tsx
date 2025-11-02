import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";

const LoginSuccess = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <BottomSheetModal
        ref={bottomSheetModalRef}
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
        <BottomSheetView className="flex-1 items-center justify-center px-6 mb-20">
          <Image
            source={images.emptyState || { uri: "https://via.placeholder.com/150" }}
            resizeMode="contain"
            className="h-32 w-full my-8"
          />
          <Text className="font-bold text-xl mb-3 text-center">🎉 Login Successful!</Text>
          <Text className="text-gray-600 text-base text-center mb-6">
            Welcome back! You've logged in successfully.
          </Text>
          <CustomButton title="Go to Homepage" onPress={() => router.push("/")} style="mb-20" />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default LoginSuccess;
