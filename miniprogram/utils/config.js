// 环境配置
const ENV = {
  DEV: 'development',  // 开发环境
  PROD: 'production'   // 生产环境
};

// 当前环境
const CURRENT_ENV = ENV.DEV;

// 配置信息
const CONFIG = {
  // 开发环境配置
  [ENV.DEV]: {
    apiBaseUrl: 'http://localhost:8080',
    appName: '万邦送货',
    // 腾讯位置服务配置
    map: {
      key: 'Z6SBZ-W7QWB-PDWU4-N2C2B-JVFD6-DZB7F', // 使用已有的腾讯地图key
      referer: 'wanbang.delivery.driver'
    }
  },
  // 生产环境配置
  [ENV.PROD]: {
    apiBaseUrl: 'https://api.wanbang.com',
    appName: '万邦送货',
    // 腾讯位置服务配置
    map: {
      key: 'Z6SBZ-W7QWB-PDWU4-N2C2B-JVFD6-DZB7F', // 使用已有的腾讯地图key
      referer: 'wanbang.delivery.driver'
    }
  }
};

// 获取当前环境配置
const getCurrentConfig = () => CONFIG[CURRENT_ENV];

module.exports = {
  ENV,
  CURRENT_ENV,
  config: getCurrentConfig()
}; 