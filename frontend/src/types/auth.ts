export interface FormErrors {
  [key: string]: string;
}

export interface AuthFormData {
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  confirm_password?: string;
  username?: string;
  phone_number?: string;
}

export interface AuthState {
  isLogin: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  errors: FormErrors;
  successMessage: string;
  direction: number;
}

export type AuthAction =
  | { type: "SET_MODE"; payload: boolean }
  | { type: "TOGGLE_PASSWORD_VISIBILITY" }
  | { type: "TOGGLE_CONFIRM_PASSWORD_VISIBILITY" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERRORS"; payload: FormErrors }
  | { type: "SET_SUCCESS_MESSAGE"; payload: string }
  | { type: "SET_DIRECTION"; payload: number }
  | { type: "CLEAR_MESSAGES" };
