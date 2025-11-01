import {Button, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import seed from "@/lib/seed";

const Search = () => {
  return (
    <SafeAreaView>
      <Text>Search</Text>

      <Button title="Seed Data" onPress={async () => {
        try {
          await seed();
          console.log("Database seeded successfully.");
        } catch (error) {
          console.error("Error seeding database:", error);
        }
      }} />
    </SafeAreaView>
  )
}

export default Search;
