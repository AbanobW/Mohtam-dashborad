import { AuthModel, UserModel } from "./_models";

export const GET_USER_BY_ACCESSTOKEN_URL = `http://167.172.165.109:8080/api/v1/auth/refresh`;
export const LOGIN_URL = `http://167.172.165.109:8080/api/v1/auth/login`;
export const REGISTER_URL = `http://167.172.165.109:8080/api/v1/auth/register`;
export const REQUEST_PASSWORD_URL = `https://preview.keenthemes.com/metronic8/laravel/api/forgot_password`;

// Login function using fetch
export function login(email: string, password: string) {
  return fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json() as Promise<AuthModel>;
  });
}

// Register function using fetch
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return fetch(REGISTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: firstname,
      last_name: lastname,
      password,
      password_confirmation,
    }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json() as Promise<AuthModel>;
  });
}

// Request Password function using fetch
export function requestPassword(email: string) {
  return fetch(REQUEST_PASSWORD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json() as Promise<{ result: boolean }>;
  });
}

// Get User By Token function using fetch
export function getUserByToken(token: string) {
  return fetch(GET_USER_BY_ACCESSTOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ api_token: token }),
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json() as Promise<UserModel>;
  });
}
