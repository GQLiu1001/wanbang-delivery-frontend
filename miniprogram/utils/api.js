const { config } = require('./config');

// API路径
const API = {
  // 认证相关
  auth: {
    login: `${config.apiBaseUrl}/api/driver/login`,
    register: `${config.apiBaseUrl}/api/driver/register`,
    logout: `${config.apiBaseUrl}/api/driver/logout`,
    auditStatus: `${config.apiBaseUrl}/api/driver/audit-status`
  },
  // 司机相关
  driver: {
    info: `${config.apiBaseUrl}/api/driver/info`,
    updateInfo: `${config.apiBaseUrl}/api/driver/update-info`,
    status: `${config.apiBaseUrl}/api/driver/status`,
    location: `${config.apiBaseUrl}/api/driver/location`,
    wallet: `${config.apiBaseUrl}/api/driver/wallet`
  },
  // 订单相关
  order: {
    list: `${config.apiBaseUrl}/api/order/list`,
    available: `${config.apiBaseUrl}/api/order/available`,
    accept: `${config.apiBaseUrl}/api/order/accept`,
    complete: `${config.apiBaseUrl}/api/order/complete`,
    cancel: `${config.apiBaseUrl}/api/order/cancel`,
    detail: `${config.apiBaseUrl}/api/order/detail`
  },
  // 地图与路线相关
  map: {
    route: `${config.apiBaseUrl}/api/map/route`
  }
};

// 替换URL中的参数
const formatUrl = (url, params) => {
  let formattedUrl = url;
  if (params) {
    Object.keys(params).forEach(key => {
      formattedUrl = formattedUrl.replace(`:${key}`, params[key]);
    });
  }
  return formattedUrl;
};

// 处理请求头
const getHeaders = () => {
  const token = wx.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 封装请求方法
const request = (url, method, data, params) => {
  const formattedUrl = formatUrl(url, params);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: formattedUrl,
      method,
      data,
      header: getHeaders(),
      success: (res) => {
        // 统一处理返回结果和错误
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 处理错误状态码
          if (res.statusCode === 401) {
            // 未授权，清除本地token并跳转到登录页
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.reLaunch({
              url: '/pages/login/index'
            });
          }
          reject(new Error(`请求失败: ${res.statusCode} ${res.data.message || ''}`));
        }
      },
      fail: (err) => {
        reject(new Error(`网络请求失败: ${err.errMsg}`));
      }
    });
  });
};

// 导出API方法
module.exports = {
  // 登录
  login: (code, phone) => {
    return request(API.auth.login, 'POST', { code, phone });
  },
  
  // 注册
  register: (data) => {
    return request(API.auth.register, 'POST', data);
  },
  
  // 登出
  logout: () => {
    return request(API.auth.logout, 'POST');
  },
  
  // 获取审核状态
  getAuditStatus: () => {
    return request(API.auth.auditStatus, 'GET');
  },
  
  // 获取司机信息
  getDriverInfo: () => {
    return request(API.driver.info, 'GET');
  },
  
  // 更新司机信息
  updateDriverInfo: (data) => {
    return request(API.driver.updateInfo, 'POST', data);
  },
  
  // 获取钱包余额
  getWallet: () => {
    return request(API.driver.wallet, 'GET');
  },
  
  // 更新司机工作状态
  updateWorkStatus: (status) => {
    return request(API.driver.status, 'POST', { workStatus: status });
  },
  
  // 更新司机位置
  updateLocation: (latitude, longitude, speed, accuracy) => {
    return request(API.driver.location, 'POST', {
      latitude,
      longitude,
      speed,
      accuracy
    });
  },
  
  // 获取订单列表
  getOrders: (status, page = 1, size = 10) => {
    return request(API.order.list, 'GET', null, { status, page, size });
  },
  
  // 获取可接单列表
  getAvailableOrders: (page = 1, size = 10) => {
    return request(API.order.available, 'GET', null, { page, size });
  },
  
  // 获取订单详情
  getOrderDetail: (orderId) => {
    return request(API.order.detail, 'GET', null, { orderId });
  },
  
  // 接单
  acceptOrder: (orderId) => {
    return request(API.order.accept, 'POST', { orderId });
  },
  
  // 完成订单
  completeOrder: (orderId) => {
    return request(API.order.complete, 'POST', { orderId });
  },
  
  // 取消订单
  cancelOrder: (orderId, cancelReason) => {
    return request(API.order.cancel, 'POST', { orderId, cancelReason });
  },
  
  // 获取路线规划
  getRoute: (fromLat, fromLng, toLat, toLng) => {
    return request(API.map.route, 'GET', null, {
      fromLat,
      fromLng,
      toLat,
      toLng
    });
  }
}; 