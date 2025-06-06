import React,{useState,useEffect  } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {AuthStack} from './AuthStack';
import {AppStack} from './AppStack';
import auth,{FirebaseAuthTypes} from "@react-native-firebase/auth"
import { ActivityIndicator, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useUser } from '../context/Auth';

export function Router(){

  const{user,initializing,action,loged} = useUser();

  if(initializing){
  return(
    <View style = {{flex:1,justifyContent : 'center',alignItems:'center'}}>
      <ActivityIndicator size = {'large'} color={Colors.primary}/>
    </View>
  )
  }

 return(
  <NavigationContainer>  
    {user&&action=="login"&&loged? <AppStack/> : <AuthStack/>}
  </NavigationContainer>
 );
}