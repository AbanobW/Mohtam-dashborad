/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from '../auth';


export function useAuthenticatedRequest() {
    const API_URL = process.env.VITE_APP_API_URL || '';
    const { auth } = useAuth();
    const authToken = auth?.accessToken;

    const postRequest = (url: string, data: any = {}, params: any = {}, method: any = 'POST') => {
        const config: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
          params,
        };
    
        data = { ...data};
    
        return axios
          .post(`${API_URL}${url}`, data, config)
          .then(response => response.data)
          .catch(error => {
            throw error;
          });
      };

      const editRequest = (selectedRowId:string,url: string, data: unknown = {}, params: any = {}, method: any = 'PUT') => {
        const config: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
          params,
        };
    
        // data = { ...data};
    
        return axios
          .put(`${API_URL}${url}/${selectedRowId}`, data, config)
          .then(response => response.data)
          .catch(error => {
            throw error;
          });
      };

      const editCmsRequests = (url: string, data: any = {}, params: any = {}, method: any = 'POST') => {
        const config: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
          params,
        };
    
        data = { ...data};
    
        return axios
          .post(`${API_URL}${url}`, data, config)
          .then(response => response.data)
          .catch(error => {
            throw error;
          });
      };
      
  const getRequest = (url: string, params: any = {}): Promise<any> => {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params,
    };

    return axios
      .get(`${API_URL}${url}`, config)
      .then(response => response.data.data)
      .catch(error => {
        throw error;
      });
  };

  return { postRequest, getRequest ,editRequest,editCmsRequests};
}
