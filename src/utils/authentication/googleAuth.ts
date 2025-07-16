import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { YOUR_WEB_CLIENT_ID_HERE } from "@env"
import { Post } from '../apiUtils';

export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: YOUR_WEB_CLIENT_ID_HERE,
        offlineAccess: true,
    });
};


// export const googleLogin = async () => {
//     try {
//         await GoogleSignin.hasPlayServices();
//         const { idToken, user } = await GoogleSignin.signIn();
//         console.log('Google User:', user);

//         // Optional: Send idToken to backend for verification
//     } catch (error) {
//         console.error('Google Login Error:', error);
//         throw error;
//     }
// };

export const googleSignOut = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
    }
};


export const googleLogin = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo: any = await GoogleSignin.signIn();

        console.log(userInfo)
        return { token: userInfo?.data?.idToken, user: userInfo?.data?.user } // contains token and user
    } catch (error) {
        console.error('Google Login Error', error);
        throw error;
    }
};


// export const googleSignOut = async () => {
//     await GoogleSignin.signOut();
// };