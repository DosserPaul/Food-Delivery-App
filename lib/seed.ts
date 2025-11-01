import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;

  // Stripe
  stripe_product_id: string;
  stripe_price_id: string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];

  // Stripe
  stripe_product_id: string;
  stripe_price_id: string;
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

// -------------------------
// Utility Helpers
// -------------------------
async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId,
  });

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument({
        databaseId: appwriteConfig.databaseId,
        collectionId,
        documentId: doc.$id,
      })
    )
  );

  console.log(`🧹 Cleared collection: ${collectionId}`);
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles({
    bucketId: appwriteConfig.assetsBucketId,
  });

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile({
        bucketId: appwriteConfig.assetsBucketId,
        fileId: file.$id,
      })
    )
  );

  console.log("🗑️ Cleared storage bucket");
}

async function uploadImageToStorage(imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileObj = {
        name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
        type: blob.type,
        size: blob.size,
        uri: imageUrl,
    };

    const file = await storage.createFile(
        appwriteConfig.assetsBucketId,
        ID.unique(),
        fileObj
    );

    return storage.getFileViewURL(appwriteConfig.assetsBucketId, file.$id);
}

// -------------------------
// Seeding Logic
// -------------------------
async function seed(): Promise<void> {
  console.log("🚀 Starting seeding process...");

  await clearAll(appwriteConfig.categoriesCollectionId);
  await clearAll(appwriteConfig.customizationsCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menuCustomizationsCollectionId);
  await clearStorage();

  // 1. Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.categoriesCollectionId,
      documentId: ID.unique(),
      data: cat,
    });
    categoryMap[cat.name] = doc.$id;
  }
  console.log("📁 Categories created:", Object.keys(categoryMap).length);

  // 2. Customizations
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const doc = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.customizationsCollectionId,
      documentId: ID.unique(),
      data: {
        name: cus.name,
        price: cus.price,
        type: cus.type,

        // Stripe
        stripe_price_id: cus.stripe_price_id,
      },
    });
    customizationMap[cus.name] = doc.$id;
  }
  console.log("🧩 Customizations created:", Object.keys(customizationMap).length);

  // 3. Menu Items
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    const uploadedImage = await uploadImageToStorage(item.image_url);

    const menuDoc = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.menuCollectionId,
      documentId: ID.unique(),
      data: {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name], // ✅ matches schema

        // Stripe
        stripe_price_id: item.stripe_price_id,

        // TODO: customizations are linked later
      },
    });

    menuMap[item.name] = menuDoc.$id;

    // 4. Menu Customizations (linking)
    for (const cusName of item.customizations) {
      await databases.createDocument({
        databaseId: appwriteConfig.databaseId,
        collectionId: appwriteConfig.menuCustomizationsCollectionId,
        documentId: ID.unique(),
        data: {
          manu: menuDoc.$id, // ✅ schema uses "manu" (typo in Appwrite)
          customizations: customizationMap[cusName], // ✅ matches schema
        },
      });
    }
  }

  console.log("🍕 Menu items created:", Object.keys(menuMap).length);
  console.log("✅ Seeding complete!");
}

export default seed;
