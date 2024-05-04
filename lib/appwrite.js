import { Account, Avatars, Client, Databases, ID } from 'react-native-appwrite';

export const appwriteconfig = {
    endpoint: "https://api.appwrite.io/v1",
    platform: "com.devs.aora",
    projectId: "6630f90b000daa185f14",
    databaseId: "6631b8fe003ced37f906",
    userCollectionId: "6631b93900066131fa8b",
    videoCollectionId: "6631b992001394db8a42",
    storageId: "6631bc91002dcdb37051"
}


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

export const createUser = async(email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

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
                avatarUrl: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export async function signIn(email, password) {
    try {
        const session = await account.createEmailSession(email, password);
        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}