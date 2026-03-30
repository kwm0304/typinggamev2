export interface SignupDto {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface LoginDto {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface AuthResponse {
    token: string;
    username: string;
    email: string;
}

export interface AlertDTO {
    message: string;
    type: AlertType;
}

export type AlertType = 'success' | 'error' | 'warning';