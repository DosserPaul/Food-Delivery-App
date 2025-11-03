import {useRouter} from "expo-router";
import {Image, Text, TouchableOpacity, View} from "react-native";

import {CustomHeaderProps} from "@/type";
import {images} from "@/constants";
import cn from "clsx";

const CustomHeader = ({title, className}: CustomHeaderProps) => {
  const router = useRouter();

  return (
    <View className={cn("custom-header", className)}>
      <TouchableOpacity onPress={() => router.back()}>
        <Image
          source={images.arrowBack}
          className="size-5"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {title && <Text className="base-semibold text-dark-100">{title}</Text>}

      <TouchableOpacity onPress={() => router.push("/search")}>
        <Image source={images.search} className="size-5" resizeMode="contain"/>
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
