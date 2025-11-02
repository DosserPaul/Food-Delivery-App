import {Alert, Image, Text, View} from "react-native";
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useMemo, useRef, useState} from "react";
import {signIn} from "@/lib/appwrite";
import * as Sentry from "@sentry/react";
import useAuthStore from "@/store/auth.store";
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetView} from "@gorhom/bottom-sheet";
import {images} from "@/constants";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({email: "", password: ""});
  const {fetchAuthenticatedUser} = useAuthStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  const submit = async () => {
    const {email, password} = form;

    if (!email || !password)
      return Alert.alert("Error", "Please enter valid email address & password.");

    setIsSubmitting(true);

    try {
      await signIn({email, password});

      // 🎉 Show success modal instead of navigating away
      bottomSheetModalRef.current?.present();
    } catch (error: any) {
      Sentry.captureException(error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = async () => {
    fetchAuthenticatedUser()
      .then(async () => {
        bottomSheetModalRef.current?.close();
        router.push("/")
      })
  }

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({...prev, email: text}))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({...prev, password: text}))}
        label="Password"
        secureTextEntry
      />

      <CustomButton title="Sign In" isLoading={isSubmitting} onPress={submit}/>

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Don't have an account?</Text>
        <Link href="/sign-up" className="base-bold text-primary">
          Sign Up
        </Link>
      </View>

      {/* 🎉 Success Modal */}
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
        backgroundStyle={{backgroundColor: "white"}}
      >
        <BottomSheetView className="flex-1 items-center justify-center px-6">
          <Image
            source={images.success || {uri: "https://via.placeholder.com/150"}}
            resizeMode="contain"
            className="h-32 w-full my-8"
          />
          <Text className="font-bold text-xl mb-3 text-center">
            🎉 Login Successful!
          </Text>
          <Text className="text-gray-600 text-base text-center mb-6">
            Welcome back! You've logged in successfully.
          </Text>

          <CustomButton
            title="Go to Homepage"
            onPress={handleGoHome}
            style="mb-20"
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default SignIn;
