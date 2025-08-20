import create from 'zustand';

export interface User {
    id: number;
    email: string;
    name: string;
    isActive: boolean;
}

// Define AuthState type
export interface AuthState {
    status: 'checking' | 'authenticated' | 'unauthenticated';
    token?: string;
    user?: User;
    login: (email: string, password: string) => Promise<boolean>;
    checkStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()( (set) => ({
    //properties
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
// Import Zustand's create function for store creation



