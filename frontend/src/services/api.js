import axios from 'axios';
import Swal from 'sweetalert2';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('academic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && localStorage.getItem('academic_token')) {
    localStorage.removeItem('academic_token');
    localStorage.removeItem('academic_user');
    if (window.location.pathname !== '/login') window.location.assign('/login');
  }
  return Promise.reject(error);
});

export const alertError = (error, fallback = 'No fue posible completar la acción.') => Swal.fire({
  icon: 'error', title: 'Algo salió mal', text: error.response?.data?.message || fallback, confirmButtonText: 'Entendido'
});

export const alertSuccess = (message) => Swal.fire({ icon: 'success', title: '¡Listo!', text: message, timer: 1800, showConfirmButton: false });

export const confirmAction = (title, text, confirmButtonText = 'Confirmar') => Swal.fire({
  icon: 'question', title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'Cancelar', reverseButtons: true
});

