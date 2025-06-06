import React,{useContext, createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"
import auth, { FirebaseAuthTypes, reload } from "@react-native-firebase/auth";
import { Alert } from "react-native";
import errorMessages from './msgAlertFireBase.json';
import firestore from "@react-native-firebase/firestore";

interface AuthProviderProps {
  children: ReactNode;
}

type UsuarioType = {
  id: string,
  nome:string,
  cpf:string,
  email:string,
  telefone:string,
  dataCadastro: string,
  imagem:string,
}

interface AuthContexDate{
 user:FirebaseAuthTypes.User | null;
 usuario:UsuarioType;
 visibleBar:boolean,
 setVisibleBar:React.Dispatch<React.SetStateAction<boolean>>,
 initializing : boolean;
 setInitializing: React.Dispatch<React.SetStateAction<boolean>>
 setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
 setUsuario:React.Dispatch<React.SetStateAction<UsuarioType>>;
 signUp:(email:string,password : string) => Promise<FirebaseAuthTypes.User | null | undefined>;
 signIn:(email:string,password : string) => Promise<void>;
 signOut:() => Promise<void>;
 modifyPassword:(email:string) => Promise<void>;
 action:string,
 loged:boolean,
 setAction:React.Dispatch<React.SetStateAction<string>>,
 setLoged:React.Dispatch<React.SetStateAction<boolean>>,
}

export const AuthContex = createContext<AuthContexDate>(
 {} as AuthContexDate,
);

export function useUser(){
  const context = useContext(AuthContex);
  return context;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children})=>{
  
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioType>({} as UsuarioType);
  const [initializing , setInitializing] = useState(true);
  const [visibleBar , setVisibleBar] = useState(false);
  const [action , setAction] = useState('');
  const [loged , setLoged] = useState(false);


  
  useEffect(() => { 
    console.log("v1 - ",action)
    if(action == "cadastro") {
      return
    }

    


    else if(action=='login'){
      const unsubscribe = auth().onAuthStateChanged(async(_user)=>{
        try{
          setUser(_user)
          if(_user && auth().currentUser){
            try{
    
              if (!_user.emailVerified) {
                await auth().currentUser?.sendEmailVerification()
                Alert.alert("E-mail não verificado","Acesse no e-mail cadastrado, clique no link enviado e tente novamente!");
                setTimeout(async () => { 
                  await auth().signOut();
                  AsyncStorage.removeItem("@user");
                  setInitializing(false)
                  setUsuario({} as UsuarioType);
                }, 500);
                return;
              } else{


                const querySnapshot = await firestore().collection("usuario").where("email", "==", _user.email).get();
                
                if (!querySnapshot.empty) {
                  const usuarioData = querySnapshot.docs[0].data() as UsuarioType;
                  setUsuario(usuarioData)
                }else{
                  console.warn("Nenhum documento encontrado para o usuário");
                  setUsuario({} as UsuarioType)
                }
              
                const userData = {
                  uid : _user.uid,
                  email : _user.email
                }
    
                AsyncStorage.setItem("@user",JSON.stringify(userData))
                setLoged(true)

                setTimeout(async () => { 
                  setInitializing(false);
                }, 1000);                
              }            
            }catch(error:any){
              if(initializing) setInitializing(false)
              if (__DEV__) {
              console.error("Erro ao buscar dados do Firestore:", error);
              }
            }
          }else{
            if(initializing) setInitializing(false)
            AsyncStorage.removeItem("@user")
          }
        }catch (error) {
          if(initializing) setInitializing(false)
          if (__DEV__) {
          console.error("Erro ao salvar ou remover dados do AsyncStorage:", error); 
          }
        }
        
      });   
      return unsubscribe;   
    }
    else if( action == 'reload'){
      const _user = auth().currentUser
      const reload = async()=>{
          try{
          const querySnapshot = await firestore().collection("usuario").where("email", "==", _user?.email).get();
          
          if (!querySnapshot.empty) {
            const usuarioData = querySnapshot.docs[0].data() as UsuarioType;
            setUsuario(usuarioData)
          }else{
            console.warn("Nenhum documento encontrado para o usuário");
            // setUsuario({} as UsuarioType)
          }
        }catch(error){
          Alert.alert("Erro ao carregar dados atualizados!")
        }
      }
      return reload;  
    };


    if(!action) setInitializing(false)

  },[action]) 

  useEffect(()=>{loadFromStorage()},[]) 

  async function loadFromStorage(){
    setAction("login")
    setInitializing(true)
    const userLoged = await AsyncStorage.getItem('@user')
    console.log("v1 - User",userLoged)
    if(userLoged){
      setUser(JSON.parse(userLoged) as FirebaseAuthTypes.User)
    }else{
      await AsyncStorage.removeItem("@user");
      setAction("")
    }
  }

  async function signUp(email:string , password:string):Promise<FirebaseAuthTypes.User | null | undefined> {
    try{
      setAction("cadastro")
      setInitializing(true)
      if(email && password){
        
        const user = await auth()
        .createUserWithEmailAndPassword(email , password)
        .then((data) => {return data.user})
        .catch((error)=>{
          setInitializing(false)
          handleError(error)
          return null;
        })
        return user;
      }else{
        handleError('email ou senha inválidos')
        if(initializing) setInitializing(false)
        return null;
      }
    }catch(error:any){
      handleError(error)
      return null;
    }
    finally {
      setTimeout(async () => { 
        if (initializing) setInitializing(false);
      }, 1000); 
      
    }
  }

  async function signIn(email:string , password:string):Promise<void>{
    try{
      setAction("login")
      setInitializing(true)
      if(email!=="" && password!==""){
        await auth()
        .signInWithEmailAndPassword(email , password)
        .catch(error => {
          handleError(error)
          setInitializing(false);
        })
        

      }else{
        setInitializing(false);
        handleError('Credenciais não inseridas.')
      }
    }catch(error:any){
      handleError(error)
      setInitializing(false);
    }
  }

  async function signOut():Promise<void>{
    try{
      setInitializing(true)
      setLoged(false)
      await auth().signOut()
      await AsyncStorage.removeItem("@user");
      setInitializing(false)
    }catch (error) {
      Alert.alert("Erro ao fazer logout, tente novamente!");
    }
  }

  async function modifyPassword(email:string):Promise<void>{
    try{
      await auth()
      .sendPasswordResetEmail(email)
      .catch(error => handleError(error))
    }catch (error) {
      Alert.alert("Erro ao modificar a senha, tente novamente!");
    }
  }

  const contextValue = {
    user,
    initializing,
    visibleBar,
    setVisibleBar,
    setUser,
    setInitializing,
    usuario,
    setUsuario,
    signUp,
    signIn,
    signOut,
    modifyPassword,
    action,
    setAction,
    loged,
    setLoged
  }

 return(
  <AuthContex.Provider value={contextValue}>
   {children}
  </AuthContex.Provider>
 )
}


export const handleError = (error: any) => {
  const message = errorMessages[error.code as keyof typeof errorMessages];
  if (message) {
    Alert.alert(message);
  } else {
    Alert.alert(error);
  }
};


export type fileDoc = {
  id:string,
  cidade : string,
  dataCadastro : string,
  dataCriacao : string,
  uid: string,
  type: string,
  url:string,
  extencao:string,
  nome:string,
  geolocalizacao:{
    latitude:string,
    longitute:string
  },
  uf:string
}

export type records = {
  id:string,
  dataCadastro: string,
  dataCriacao: string,
  type: string,
  cidade: string,
  quantidade: number ,
  uf:string
  timestamp: number,
  itens:fileDoc[]
}

