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
    apiBaseUrl: 'http://192.168.2.7:8001/api',  // 开发环境API地址
    mapKey: 'Z6SBZ-W7QWB-PDWU4-N2C2B-JVFD6-DZB7F',  // 新申请的腾讯地图API密钥
    appName: '万邦送货-司机端'
  },
  // 生产环境配置
  [ENV.PROD]: {
    apiBaseUrl: 'https://api.wanbang-delivery.com/api',  // 更新为实际生产环境API地址
    mapKey: 'MXPBZ-ZMNEH-5U6DL-WQBE3-JCXCF-M3FSD',  // 请替换为新申请的腾讯地图API密钥
    appName: '万邦送货-司机端'
  }
};

// 获取当前环境配置
const getCurrentConfig = () => CONFIG[CURRENT_ENV];

module.exports = {
  ENV,
  CURRENT_ENV,
  config: getCurrentConfig()
}; 