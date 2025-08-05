// services/api.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.219.105:8080/api', // Spring Boot 주소
  withCredentials: true,
});

export default instance;