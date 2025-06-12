'use client';

import axios from 'axios';
import envConfig from '../configs/envConfig';

const getAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
// สร้าง axios instance
export const axiosInstance = axios.create({
    baseURL: `${envConfig.apiBaseUrl}`, // กำหนด base URL
    timeout: 10000, // กำหนด timeout ในการร้องขอ (10 วินาที)
    headers: {
        'Content-Type': 'application/json', // ตั้งค่า headers เริ่มต้น
        'Authorization': getAccessToken ? `Bearer ${getAccessToken}` : '' // ถ้ามีการใช้ token
    }
});