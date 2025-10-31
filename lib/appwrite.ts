import {Account, Avatars, Client, Databases, ID, Query} from "react-native-appwrite";
import {CreateUserParams, SignInParams} from "@/type";


export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: process.env.EXPO_PUBLIC_PLATFORM!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  userCollectionId: "user",
}

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);

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

