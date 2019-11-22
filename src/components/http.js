import Vue from 'vue'
import Store from '../store'
import axios from 'axios'

// 创建 axios 实例
const http = axios.create({
    // 统一 url 配置，定义访问前缀 baseURL
    baseURL: Store.state.server,
    // 定义请求超时时间
    timeout: 10000,
    // 请求带上 cookie
    withCredentials: true,
    // 定义消息头
    headers: {
        'Authorization': 'bearer ' + localStorage.getItem("jwt")
    }
})

// 定义请求拦截器
http.interceptors.request.use(
    config => {
        config.headers['from-id'] = '1';
        return config;
    },
    error => {
        Promise.reject(error)
    }
)

// 定义响应拦截器
http.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        return Promise.reject(error)
    }
)

export default http