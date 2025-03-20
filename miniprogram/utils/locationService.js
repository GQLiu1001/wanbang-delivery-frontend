const { config } = require('./config');

class LocationService {
  constructor() {
    this.lastLocation = null;
    this.updateTimeout = null;
    this.minDistance = 10; // 最小更新距离（米）
    this.debounceTime = 3000; // 防抖时间（毫秒）
    this.listeners = new Set();
  }

  // 计算两点之间的距离（米）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 角度转弧度
  toRad(degree) {
    return degree * Math.PI / 180;
  }

  // 检查是否需要更新位置
  shouldUpdateLocation(newLocation) {
    if (!this.lastLocation) return true;

    const distance = this.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance >= this.minDistance;
  }

  // 添加位置更新监听器
  addListener(callback) {
    this.listeners.add(callback);
  }

  // 移除位置更新监听器
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // 通知所有监听器
  notifyListeners(location) {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('位置更新监听器执行失败:', error);
      }
    });
  }

  // 开始监听位置变化
  startLocationUpdate() {
    return new Promise((resolve, reject) => {
      wx.startLocationUpdate({
        success: () => {
          wx.onLocationChange(this.handleLocationChange.bind(this));
          resolve();
        },
        fail: reject
      });
    });
  }

  // 停止监听位置变化
  stopLocationUpdate() {
    return new Promise((resolve, reject) => {
      wx.stopLocationUpdate({
        success: () => {
          this.lastLocation = null;
          if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
          }
          resolve();
        },
        fail: reject
      });
    });
  }

  // 处理位置变化（使用防抖）
  handleLocationChange(location) {
    if (this.shouldUpdateLocation(location)) {
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }

      this.updateTimeout = setTimeout(() => {
        this.lastLocation = location;
        this.notifyListeners(location);
      }, this.debounceTime);
    }
  }

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: resolve,
        fail: reject
      });
    });
  }
}

// 导出单例实例
module.exports = new LocationService(); 