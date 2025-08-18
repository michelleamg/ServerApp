
export type AuthStatus = 'unauthenticated' | 'authenticated' | 'error'| 'checking';

export interface AuthorStore {
    status: AuthStatus;
    token: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}