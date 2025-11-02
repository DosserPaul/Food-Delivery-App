import {Account, Avatars, Client, Databases, Functions, ID, Query, Storage} from "react-native-appwrite";
import {Category, CreateUserParams, GetMenuParams, MenuItem, SignInParams} from "@/type";


export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: process.env.EXPO_PUBLIC_PLATFORM!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
  categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
  menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID!,
  customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COSTIMIZATIONS_COLLECTION_ID!,
  menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COSTIMIZATIONS_COLLECTION_ID!,
  assetsBucketId: process.env.EXPO_PUBLIC_APPWRITE_ASSETS_BUCKET_ID!,
}

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const functions = new Functions(client);

export const createUser = async ({email, password, name}: CreateUserParams) => {
  try {
    const newAccount = await account.create({userId: ID.unique(), email, password, name});
    if (!newAccount) throw Error;

    await signIn({email, password});

    const avatarUrl = avatars.getInitialsURL(name);

    await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: ID.unique(),
      data: {
        email,
        name,
        accountId: newAccount.$id,
        avatar: avatarUrl,
      },
    });
  } catch (e) {
    throw new Error(e as string);
  }
}

export const signIn = async ({email, password}: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession({email, password});
  } catch (e) {
    throw new Error(e as string);
  }
}

export const logOut = async () => {
  try {
    await account.deleteSessions();
  } catch (e: any) {
    throw new Error(e.message || 'Failed to log out');
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error('No current account found');

    const currentUser = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.equal('accountId', currentAccount.$id)],
    });

    if (!currentUser || currentUser.total === 0) {
      throw new Error('User not found');
    }

    return currentUser.documents[0];
  } catch (e: any) {
    console.error(e);
    throw new Error(e.message || 'Failed to fetch current user');
  }
};

export const getMenu = async ({category, query, limit = 6}: GetMenuParams): Promise<MenuItem[]> => {
  const queries: string[] = [];

  if (category) queries.push(Query.equal("categories", category));
  if (query) queries.push(Query.search("name", query));
  if (limit) queries.push(Query.limit(limit));

  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.menuCollectionId,
    queries
  );

  return res.documents as unknown as MenuItem[];
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
    )

    return categories.documents as unknown as Category[];
  } catch (e) {
    throw new Error(e as string);
  }
}
