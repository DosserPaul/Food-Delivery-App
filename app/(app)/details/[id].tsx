import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "@/components/CustomHeader";
import useAppwrite from "@/lib/useAppwrite";
import { getMenuById } from "@/lib/appwrite";
import { Customizations, MenuItem } from "@/type";
import { Star } from "lucide-react-native";
import { images } from "@/constants";
import CustomizationCard from "@/components/CustomizationCard";
import { CustomizationData } from "@/lib/data";
import { useCartStore } from "@/store/cart.store";

const Details = () => {
  const { addItem } = useCartStore();
  const id = "69061b7f001773a702c9";

  const { data, loading, error } = useAppwrite<MenuItem, { id: string }>({
    fn: getMenuById,
    params: { id },
  });

  const toppings = CustomizationData.filter(
    (item: Customizations) => item.type === "topping"
  );
  const sides = CustomizationData.filter(
    (item: Customizations) => item.type === "side"
  );

  const [selectedCustomizations, setSelectedCustomizations] = useState<Customizations[]>([]);

  const handleToggleCustomization = (customization: Customizations) => {
    setSelectedCustomizations((prev) =>
      prev.some((c) => c.id === customization.id)
        ? prev.filter((c) => c.id !== customization.id)
        : [...prev, customization]
    );
  };

  useEffect(() => {
    console.log("Selected customizations:", selectedCustomizations);
  }, [selectedCustomizations]);

  if (loading)
    return (
      <SafeAreaView className="bg-white h-full items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );

  if (error || !data)
    return (
      <SafeAreaView className="bg-white h-full items-center justify-center">
        <Text className="text-red-500">{error || "Item not found"}</Text>
      </SafeAreaView>
    );

  const totalPrice = (
    data.price +
    selectedCustomizations.reduce((sum, c) => sum + c.price, 0)
  ).toFixed(2);

  return (
    <SafeAreaView className="bg-white h-full pb-[120px]">
      {/* Header */}
      <View className="px-5">
        <CustomHeader title="" className="custom-header" />
      </View>

      {/* --- Main product details --- */}
      <Text className="font-bold text-2xl text-dark-100 font-quicksand-bold ml-5">
        {data.name}
      </Text>

      <View className="flex flex-row">
        {/* --- Left info column --- */}
        <View className="flex-1 mt-2.5 ml-5">
          <Text className="text-gray-100 font-medium mb-[18px]">
            {data.categories?.name}
          </Text>

          {/* Rating */}
          <View className="flex flex-row gap-2.5">
            <View className="flex flex-row gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(data.rating) ? "#FE8C00" : "transparent"}
                  color="#FE8C00"
                />
              ))}
            </View>
            <Text className="font-semibold font-quicksand text-gray-100">
              {data.rating}/5
            </Text>
          </View>

          {/* Price */}
          <Text className="font-bold text-dark-100 text-xl mt-5">
            {data.price}
            <Text className="text-primary">€</Text>
          </Text>

          {/* Nutrition */}
          <View className="row gap-7 mt-9">
            <View className="col gap-1">
              <Text className="text-gray-100">Calories</Text>
              <Text className="text-dark-100 font-semibold">
                {data.calories} Cal
              </Text>
            </View>

            <View className="col gap-1">
              <Text className="text-gray-100">Protein</Text>
              <Text className="text-dark-100 font-semibold">
                {data.protein}g
              </Text>
            </View>
          </View>
        </View>

        {/* --- Right image --- */}
        <View className="flex-1 relative">
          <Image
            source={{ uri: data.image_url }}
            alt={data.name}
            className="size-full object-cover absolute top-0 left-0"
          />
        </View>
      </View>

      {/* --- Info row --- */}
      <View className="row bg-primary/5 justify-around items-center rounded-[30px] p-5 mt-[34px] mx-5">
        <View className="row gap-2 items-center">
          <Image source={images.dollar} className="size-3.5" />
          <Text className="font-medium font-quicksand-semibold">
            Free Delivery
          </Text>
        </View>
        <View className="row gap-2 items-center">
          <Image source={images.clock} className="size-3.5" />
          <Text className="font-medium font-quicksand-semibold">
            20 - 30 mins
          </Text>
        </View>
        <View className="row gap-2 items-center">
          <Image source={images.star} className="size-3.5" />
          <Text className="font-medium font-quicksand-semibold">
            {data.rating}
          </Text>
        </View>
      </View>

      {/* --- Description --- */}
      <Text className="text-gray-100 font-medium mt-6 mx-5">
        {data.description}
      </Text>

      {/* --- Toppings --- */}
      <View className="mt-8 px-5 col gap-3">
        <Text className="font-bold font-quicksand-bold text-base">Toppings</Text>
        <FlatList
          data={toppings}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <CustomizationCard
              customization={item}
              onPress={() => handleToggleCustomization(item)}
              isSelected={selectedCustomizations.some((c) => c.id === item.id)}
            />
          )}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: 30 }} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* --- Side Options --- */}
      <View className="mt-8 px-5 col gap-3 mb-[80px]">
        <Text className="font-bold font-quicksand-bold text-base">
          Side Options
        </Text>
        <FlatList
          data={sides}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <CustomizationCard
              customization={item}
              onPress={() => handleToggleCustomization(item)}
              isSelected={selectedCustomizations.some((c) => c.id === item.id)}
            />
          )}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: 30 }} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* --- Floating Add to Cart Bar --- */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
        style={{
          paddingBottom: 20,
          paddingTop: 10,
          paddingHorizontal: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm font-quicksand-medium">
              Total Price
            </Text>
            <Text className="text-dark-100 text-xl font-quicksand-bold">
              {totalPrice}€
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              addItem({
                id: data.$id,
                name: data.name,
                price: data.price,
                image_url: data.image_url,
                customizations: selectedCustomizations,
              });
              setSelectedCustomizations([]);
            }}
            className="bg-[#EF2A39] px-8 py-3 rounded-full"
            style={{
              shadowColor: "#EF2A39",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <Text className="text-white font-quicksand-bold text-base">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Details;
