import create from 'zustand';
import { AuthState, User } from "@/core/auth/interfaces/user";


export type AuthStatus = 'unauthenticated' | 'authenticated' | 'checking';

export interface AuthStore {
    status: AuthStatus;
    token: string;
    user?: User;

    login: (email: string, password: string) => Promise<boolean>;
    checkStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create <AuthState>()((set) => ({
    status: 'checking',
    token: undefined,
    user: undefined,
    login: async (email: string, password: string) => {
        return true;
    },

    checkStatus: async () => {

    },


    logout: async () => {

    },
}));