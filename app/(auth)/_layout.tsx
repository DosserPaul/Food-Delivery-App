import {Redirect, Slot} from "expo-router";
import {View} from "react-native";

export default function AuthLayout() {
  return (
    <View>
      <Slot/>
    </View>
  )
}
