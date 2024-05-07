import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

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
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform) // Your application ID or bundle ID.
    ;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

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
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
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

export const getFilePreview = async (fileId, type) => {
    let fileUrl;
    try {
        if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
        } else if (type === 'video') {
            fileUrl = storage.getFileView(storageId, fileId)
        } else {
            throw new Error('Invalid file type')
        }

        if (!fileUrl) throw Error;
        return fileUrl;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const uploadFile = async (file, type) => {
    if (!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        );
        console.log("uploaded file", uploadedFile)

        const fileUrl = await getFilePreview(uploadedFile.$id, type)

        console.log("file url", fileUrl)
        return fileUrl;

    } catch (error) {
        console.log("Error occurs in upload file function",error);
        throw new Error(error);
    }
}

export const createVideo = async (form) => {
    console.log(form);
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            await uploadFile(form.thumbnail, 'image').catch(error => console.error('Thumbnail upload error:', error)),
            await uploadFile(form.video, 'video').catch(error => console.error('Video upload error:', error))
          ]);

        console.log("thubnailUrl", thumbnailUrl)
        console.log("videoUrl", videoUrl)

        const newPost = await databases.createDocument(
            databaseId,
            videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                prompt: form.prompt,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                creator: form.userId
            }
        )

        return newPost;
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
}