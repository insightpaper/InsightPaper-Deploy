import axios from "axios";
import envConfig from "../config/env";
const LLM_SERVER = envConfig.llmServerUrl;

export const axiosInstance = axios.create({
  baseURL: `${LLM_SERVER}/api/`,
  timeout: 60000,
});
