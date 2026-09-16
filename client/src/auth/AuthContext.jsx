import {useEffect,useState} from 'react';
import {getCurrentUser,login,logout} from '../services/api';
import {AuthContext} from './context';
export function AuthProvider({children}){
 const[user,setUser]=useState(null);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
 useEffect(()=>{let active=true;getCurrentUser().then(value=>{if(active)setUser(value);}).catch(err=>{if(active&&err.response?.status!==401)setError('Unable to connect to the server. Check the API connection.');}).finally(()=>{if(active)setLoading(false);});const expired=()=>setUser(null);window.addEventListener('bloodcare-auth-expired',expired);return()=>{active=false;window.removeEventListener('bloodcare-auth-expired',expired)};},[]);
 async function signIn(username,password){const value=await login({username,password});setUser(value);setError('');return value;}
 async function signOut(){try{await logout();setUser(null);}catch(err){if(err.response?.status===401)setUser(null);else throw err;}}
 return <AuthContext.Provider value={{user,loading,error,signIn,signOut}}>{children}</AuthContext.Provider>;
}
