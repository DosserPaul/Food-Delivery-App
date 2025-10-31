import {Redirect, Slot} from "expo-router";
import {View} from "react-native";

export default function AuthLayout() {
  const isAuthenticated = false; // TODO: Implement authentication logic

    if(!isAuthenticated) return <Redirect href="/sign-in" />

  return (
      <Slot/>
  )
}
