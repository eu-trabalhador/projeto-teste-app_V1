
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import MeusArquivos from '../screens/MeusArquivos';
import MeusArquivosImagens from '../screens/MeusArquivosImagens';
import MeusArquivosDocumentos from '../screens/MeusArquivosDocumentos';
import Relatorios from '../screens/Relatorios';
import User from '../screens/User';

const Stack = createNativeStackNavigator();

type AppStackParams = {
  Home: undefined;
  MeusArquivos: undefined;
  MeusArquivosImagens: undefined;
  MeusArquivosDocumentos: undefined;
  Relatorios: undefined;
  User: undefined;
};
export type AppStack = NativeStackNavigationProp<AppStackParams>;


export function AppStack() {
 return (
   <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false, headerTitle: ""}}>
    <Stack.Screen name="Home" component={Home}/>
    <Stack.Screen name="MeusArquivos" component={MeusArquivos}/>
    <Stack.Screen name="MeusArquivosImagens" component={MeusArquivosImagens}/>
    <Stack.Screen name="MeusArquivosDocumentos" component={MeusArquivosDocumentos}/>
    <Stack.Screen name="Relatorios" component={Relatorios}/>
    <Stack.Screen name="User" component={User}/>
   </Stack.Navigator>
 );
}