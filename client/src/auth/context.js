import {createContext,useContext} from 'react';
export const AuthContext=createContext(null);
export const ROLE_LABELS={ADMIN:'Admin',BLOOD_BANK_USER:'Blood Bank User',RESEARCH_STUDENT:'Research Student'};
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider is required');return value;}
