import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // La dirección de tu servidor Spring Boot
});

export default api;