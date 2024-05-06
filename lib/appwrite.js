import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const appwriteconfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.devs.aora",
    projectId: "6630f90b000daa185f14",
    databaseId: "6631b8fe003ced37f906",
    userCollectionId: "6631b93900066131fa8b",
    videoCollectionId: "6631b992001394db8a42",
    storageId: "6631bc91002dcdb37051"
}


const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId
} = appwriteconfig;


// Init your react-native SDK
const client = new Client();

client
    .setEndpoint(appwriteconfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteconfig.projectId) // Your project ID
    .setPlatform(appwriteconfig.platform) // Your application ID or bundle ID.
    ;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            appwriteconfig.databaseId,
            appwriteconfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailSession(email, password);
        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteconfig.databaseId,
            appwriteconfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getAllPosts = async () => {
    try {
        const allPosts = await databases.listDocuments(
            databaseId,
            videoCollectionId
        )
        return allPosts.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try {
        const allPosts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )
        return allPosts.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try {
        const allPosts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', query)]
        )
        return allPosts.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try {
        const allPosts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId)]
        )
        return allPosts.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}