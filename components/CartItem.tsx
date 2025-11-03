import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { images } from "@/constants";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  // 👇 calculate extra price from customizations
  const customizationTotal =
    item.customizations?.reduce((sum, c) => sum + c.price, 0) ?? 0;

  const totalPerItem = (item.price + customizationTotal) * item.quantity;

  return (
    <View className="cart-item">
      <View className="flex flex-row items-center gap-x-3">
        {/* --- Product Image --- */}
        <View className="cart-item__image">
          <Image
            source={{ uri: item.image_url }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* --- Product Details --- */}
        <View>
          <Text className="base-bold text-dark-100">{item.name}</Text>

          {/* 👇 show selected customizations under name */}
          {item.customizations && item.customizations.length > 0 && (
            <View className="mt-1">
              {item.customizations.map((c) => (
                <Text key={c.id} className="text-gray-400 text-xs">
                  • {c.name} (+{c.price.toFixed(2)}€)
                </Text>
              ))}
            </View>
          )}

          <Text className="paragraph-bold text-primary mt-1">
            €{totalPerItem.toFixed(2)}
          </Text>

          <View className="flex flex-row items-center gap-x-4 mt-2">
            <TouchableOpacity
              onPress={() => decreaseQty(item.id, item.customizations!)}
              className="cart-item__actions"
            >
              <Image
                source={images.minus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>

            <Text className="base-bold text-dark-100">{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => increaseQty(item.id, item.customizations!)}
              className="cart-item__actions"
            >
              <Image
                source={images.plus}
                className="size-1/2"
                resizeMode="contain"
                tintColor={"#FF9C01"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations!)}
        className="flex-center"
      >
        <Image source={images.trash} className="size-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;
