const { config } = require('./config');

// API路径
const API = {
  // 认证相关
  auth: {
    login: `${config.apiBaseUrl}/driver/auth/login`,
    register: `${config.apiBaseUrl}/driver/auth/register`,
    logout: `${config.apiBaseUrl}/driver/auth/logout/:id`,
    auditStatus: `${config.apiBaseUrl}/driver/auth/audit-status/:id`
  },
  // 司机相关
  driver: {
    info: `${config.apiBaseUrl}/driver/info/:id`,
    updateInfo: `${config.apiBaseUrl}/driver/update-info/:id`,
    status: `${config.apiBaseUrl}/driver/status/:id`,
    location: `${config.apiBaseUrl}/driver/location/:id`,
    wallet: `${config.apiBaseUrl}/driver/wallet/:id`
  },
  // 订单相关
  order: {
    list: `${config.apiBaseUrl}/order/list`,
    accept: `${config.apiBaseUrl}/order/accept`,
    complete: `${config.apiBaseUrl}/order/complete`,
    cancel: `${config.apiBaseUrl}/order/cancel`
  },
  // 地图相关
  map: {
    route: `${config.apiBaseUrl}/map/route`
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          if (res.statusCode === 401) {
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
  // 认证相关
  login: (code, phone) => {
    return request(API.auth.login, 'POST', { code, phone });
  },
  
  register: (data) => {
    return request(API.auth.register, 'POST', data);
  },
  
  logout: (id) => {
    return request(API.auth.logout, 'POST', null, { id });
  },
  
  getAuditStatus: (id) => {
    return request(API.auth.auditStatus, 'GET', null, { id });
  },
  
  // 司机相关
  getDriverInfo: (id) => {
    return request(API.driver.info, 'GET', null, { id });
  },
  
  updateDriverInfo: (id, data) => {
    return request(API.driver.updateInfo, 'POST', data, { id });
  },
  
  updateWorkStatus: (id, status) => {
    return request(API.driver.status, 'POST', { workStatus: status }, { id });
  },
  
  updateLocation: (id, latitude, longitude) => {
    return request(API.driver.location, 'POST', { latitude, longitude }, { id });
  },
  
  getWallet: (id) => {
    return request(API.driver.wallet, 'GET', null, { id });
  },
  
  // 订单相关
  getOrders: (params = {}) => {
    return request(API.order.list, 'GET', null, params);
  },
  
  acceptOrder: (data) => {
    return request(API.order.accept, 'POST', data);
  },
  
  completeOrder: (orderId) => {
    return request(API.order.complete, 'POST', { orderId });
  },
  
  cancelOrder: (orderId, cancelReason) => {
    return request(API.order.cancel, 'POST', { orderId, cancelReason });
  },
  
  // 地图相关
  getRoute: (fromLat, fromLng, toLat, toLng) => {
    return request(API.map.route, 'GET', null, {
      fromLat,
      fromLng,
      toLat,
      toLng
    });
  }
}; 