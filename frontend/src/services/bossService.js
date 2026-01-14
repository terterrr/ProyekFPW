import axios from "axios";
import { getAccessToken } from "../utils/tokenStorage";

const API_URL = "http://localhost:3001/api/v1/boss";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
  },
});

export const getBoss = () => {
  return axios.get(API_URL, authHeader());
};

export const createBoss = (data) => {
  return axios.post(API_URL, data, authHeader());
};

export const updateBoss = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, authHeader());
};

export const deleteBoss = (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeader());
};
