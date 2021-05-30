/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import 'react-native-gesture-handler';
 import React, {useEffect} from 'react';
 import {View,Text,Button,SafeAreaView, StatusBar} from 'react-native';
 
 import Navigation from './src/navigation';
 
 import {Auth, API, graphqlOperation} from 'aws-amplify';
 import {withAuthenticator} from 'aws-amplify-react-native';
 
 import {createUser} from './src/graphql/mutations';
 import {getUser} from './src/graphql/queries';
import { withOAuth } from 'aws-amplify-react-native/dist/Auth';
 
const randomImages = [
   'https://hieumobile.com/wp-content/uploads/avatar-among-us-2.jpg',
   'https://hieumobile.com/wp-content/uploads/avatar-among-us-3.jpg',
   'https://hieumobile.com/wp-content/uploads/avatar-among-us-6.jpg',
   'https://hieumobile.com/wp-content/uploads/avatar-among-us-9.jpg',
 ];
 
 const getRandomImage = () => {
   return randomImages[Math.floor(Math.random() * randomImages.length)];
 };
 
 
 const App: () => React$Node = (props) => {

  const {
    oAuthUser,
    oAuthError,
    hostedUISignIn,
    facebookSignIn,
    googleSignIn,
    amazonSignIn,
    customProviderSignIn,
    signOut,
  } = props; 
   useEffect(() => {
    
     const fetchUser = async () => {
       // get currently authenticated user
       const userInfo = await Auth.currentAuthenticatedUser({bypassCache: true});
       if (!userInfo) {
         return;
       }
 
       // check if THE user exist in database
       const getUserResponse = await API.graphql(
         graphqlOperation(getUser, {id: userInfo.attributes.sub}),
       );
 
       if (getUserResponse.data.getUser) {
         console.log('User already exists in database');
         return;
       }
 
       // if it doesn't (it's newly registered user)
       // then, create a new user in database
       const newUser = {
         id: userInfo.attributes.sub,
         username: userInfo.username,
         email: userInfo.attributes.email,
         imageUri: getRandomImage(),
       };
 
       await API.graphql(graphqlOperation(createUser, {input: newUser}));
     };
 
     fetchUser();
   }, []);
 
   return (
    <>
       <StatusBar barStyle="light-content" />
       <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
       {oAuthUser ? (
            <Button title="Sign Out" onPress={signOut} />
        ) : (
            <>
                {/* Go to the Cognito Hosted UI */}
                
                {/* Go directly to a configured identity provider */}
                <Button title="Google" onPress={googleSignIn}  />
            </>
        )}
         <Navigation />
       </SafeAreaView>
     </>
   );
 };
 
 export default withOAuth(App);