import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Customizations } from "@/type";
import { Plus, Check } from "lucide-react-native";

interface Props {
  customization: Customizations;
  onPress: () => void;
  isSelected?: boolean;
}

const CustomizationCard = ({ customization, onPress, isSelected }: Props) => {
  const { name, image_url } = customization;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[84px] h-[99px] bg-[#3C2F2F] rounded-2xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 12,
      }}
    >
      {/* --- White image section with shadow --- */}
      <View
        className="h-[61px] bg-white rounded-2xl flex items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Image source={image_url} className="size-[55px]" />
      </View>

      {/* --- Bottom name + plus/check button --- */}
      <View className="row justify-between items-center px-1.5 mt-1.5">
        <Text
  className="font-quicksand-semibold text-white text-xs flex-shrink leading-tight flex-1"
  style={{ flexWrap: "wrap", textAlign: "left" }}
>
  {name}
</Text>

        <View className="bg-[#EF2A39] size-5 rounded-full flex items-center justify-center">
          {isSelected ? <Check color="#fff" size={16} /> : <Plus color="#fff" size={16} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomizationCard;
