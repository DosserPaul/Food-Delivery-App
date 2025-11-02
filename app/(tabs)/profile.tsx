import {SafeAreaView} from "react-native-safe-area-context";
import CustomHeader from "@/components/CustomHeader";
import React from "react";
import {Alert, Button} from "react-native";
import {router} from "expo-router";
import useAuthStore from "@/store/auth.store";

const Profile = () => {
  const {logout} = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/sign-in");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message || "Something went wrong");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full pb-28 px-5 pt-5">
      <CustomHeader title="Profile"/>
      <Button title="Logout" onPress={handleLogout}/>
      <Button title="Login Success" onPress={() => router.replace("/login-success")}/>
    </SafeAreaView>
  );
};

export default Profile;
