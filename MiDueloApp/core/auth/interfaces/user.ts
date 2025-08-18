export interface User {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
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
