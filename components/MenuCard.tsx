import {Image, Platform, Text, TouchableOpacity} from 'react-native'
import {MenuItem} from "@/type";
import {useCartStore} from "@/store/cart.store";
import {router} from "expo-router";

const MenuCard = ({item: {$id, image_url, name, price, stripe_price_id}}: { item: MenuItem }) => {
  const {addItem} = useCartStore();

  const handleClick = () => {
    router.push(`/details/${$id}`);
  }

  return (
    <TouchableOpacity className="menu-card"
                      style={Platform.OS === 'android' ? {elevation: 10, shadowColor: '#878787'} : {}}
                      onPress={handleClick}
    >
      <Image source={{uri: image_url}} className="size-32 absolute -top-10" resizeMode="contain"/>
      <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
      <Text className="body-regular text-gray-200 mb-4">From {price}€</Text>
      <TouchableOpacity
        onPress={() => addItem({id: $id, name, price, image_url: image_url, customizations: []})}>
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}
export default MenuCard
