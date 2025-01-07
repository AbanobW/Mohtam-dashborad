import axios from "axios";
import { AuthModel, UserModel } from "./_models";

export const GET_USER_BY_ACCESSTOKEN_URL = `https://api.mohtam.org/api/v1/auth/refresh`;
export const CREATE_ADMIN = `https://api.mohtam.org/api/v1/admins`;
export const LOGIN_URL = `https://api.mohtam.org/api/v1/auth/login`;
export const REGISTER_URL = `https://api.mohtam.org/api/v1/auth/register`;
export const REQUEST_PASSWORD_URL = `https://preview.keenthemes.com/metronic8/laravel/api/forgot_password`;

export async function login(email: string, password: string): Promise<AuthModel> {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Network response was not ok');
  }

  const data: AuthModel = await response.json();
  return data;
}

export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}


export function createAdmin(
  email: string,
  password: string,
) {
  return axios.post(CREATE_ADMIN, {
    email,
    password,
  });
}