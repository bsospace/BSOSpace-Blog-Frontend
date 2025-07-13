import axios from 'axios';
import envConfig from '../configs/envConfig';

// สร้าง axios instance
export const axiosInstanceServer = axios.create({
    baseURL: `${envConfig.apiBaseUrl}`, // กำหนด base URL
    timeout: 60000, // กำหนด timeout ในการร้องขอ (10 วินาที)
    headers: {
        'Content-Type': 'application/json', // ตั้งค่า headers เริ่มต้น
    },
    withCredentials: true, // ส่งคุกกี้ไปกับคำขอ
});