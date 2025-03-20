class RouteCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // 最大缓存数量
    this.expireTime = 30 * 60 * 1000; // 缓存过期时间（30分钟）
  }

  // 生成缓存key
  generateKey(from, to) {
    return `${from.latitude},${from.longitude}-${to.latitude},${to.longitude}`;
  }

  // 获取缓存的路线
  get(from, to) {
    const key = this.generateKey(from, to);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // 设置路线缓存
  set(from, to, routeData) {
    // 如果缓存已满，删除最早的记录
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const key = this.generateKey(from, to);
    this.cache.set(key, {
      data: routeData,
      timestamp: Date.now()
    });
  }

  // 清除过期缓存
  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.expireTime) {
        this.cache.delete(key);
      }
    }
  }

  // 清除所有缓存
  clearAll() {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

// 导出单例实例
module.exports = new RouteCache(); 