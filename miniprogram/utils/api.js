const { config } = require('./config');

// API路径 - 根据后端实际接口进行更新
const API = {
  // 认证相关
  auth: {
    login: `${config.apiBaseUrl}/driver/auth/login`,
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
    complete: `${config.apiBaseUrl}/order/complete`,
    cancel: `${config.apiBaseUrl}/order/cancel`,
    newOrders: `${config.apiBaseUrl}/order/newOrders`,
    robNewOrder: `${config.apiBaseUrl}/order/robNewOrder/:driverId/:orderNo`
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

// 导出API方法 - 根据后端实际接口进行更新
module.exports = {
  // 认证相关
  login: (code, phone) => {
    return request(API.auth.login + `?code=${code}&phone=${phone}`, 'POST', null);
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
  
  updateDriverInfo: (id, name) => {
    return request(API.driver.updateInfo + `?name=${name}`, 'POST', null, { id });
  },
  
  updateWorkStatus: (id, workStatus) => {
    return request(API.driver.status + `?workStatus=${workStatus}`, 'POST', null, { id });
  },
  
  updateLocation: (id, latitude, longitude) => {
    return request(API.driver.location + `?latitude=${latitude}&longitude=${longitude}`, 'POST', null, { id });
  },
  
  getWallet: (id) => {
    return request(API.driver.wallet, 'GET', null, { id });
  },
  
  // 订单相关
  getOrders: (page = 1, size = 10, status) => {
    let url = API.order.list + `?page=${page}&size=${size}`;
    if (status !== undefined) {
      url += `&status=${status}`;
    }
    return request(url, 'GET', null);
  },
  
  completeOrder: (orderId) => {
    return request(API.order.complete + `?orderId=${orderId}`, 'POST', null);
  },
  
  cancelOrder: (orderId, cancelReason) => {
    let url = API.order.cancel + `?orderId=${orderId}`;
    if (cancelReason) {
      url += `&cancelReason=${encodeURIComponent(cancelReason)}`;
    }
    return request(url, 'POST', null);
  },
  
  // 地图相关
  getRoute: (fromLat, fromLng, toLat, toLng) => {
    const url = `${API.map.route}?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`;
    return request(url, 'GET', null);
  },
  
  // 获取新订单
  getNewOrders: () => {
    console.log('开始获取新订单...');
    return request(API.order.newOrders, 'GET', null)
      .then(res => {
        console.log('获取新订单接口响应:', res);
        return res;
      })
      .catch(err => {
        console.error('获取新订单接口错误:', err);
        throw err;
      });
  },
  
  // 抢单
  robNewOrder: (driverId, orderNo) => {
    return request(API.order.robNewOrder, 'GET', null, { driverId, orderNo });
  }
}; 