import axios, { type AxiosInstance } from "axios";

let activeAxiosInstance: AxiosInstance = axios.create();

export function setAxiosInstance(instance: AxiosInstance): void {
  activeAxiosInstance = instance;
}

export function getAxiosInstance(): AxiosInstance {
  return activeAxiosInstance;
}
