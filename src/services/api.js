// services/api.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://172.31.57.17:8080/api', // Spring Boot 주소
  withCredentials: true,
});

export default instance;
