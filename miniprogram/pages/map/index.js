const app = getApp()

Page({
  data: {
    longitude: 121.473701, // 默认经度（示例：杭州）
    latitude: 31.230416,   // 默认纬度
    scale: 14,
    markers: [],
    polyline: [],
    isOnline: false,
    currentOrder: null,
    locationUpdateTimer: null
  },

  onLoad() {
    this.initLocation()
    this.checkLoginStatus()
  },

  onShow() {
    if (this.data.isOnline) {
      this.startLocationUpdate()
    }
  },

  onHide() {
    this.stopLocationUpdate()
  },

  onUnload() {
    this.stopLocationUpdate()
  },

  // 初始化位置
  async initLocation() {
    try {
      const location = await this.getCurrentLocation()
      this.setData({
        latitude: location.latitude,
        longitude: location.longitude
      })
    } catch (error) {
      wx.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
    }
  },

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: resolve,
        fail: reject
      })
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    // TODO: 实现登录状态检查
    // 如果未登录，跳转到登录页面
  },

  // 切换工作状态
  async toggleWorkStatus(e) {
    const isOnline = e.detail.value
    this.setData({ isOnline })

    if (isOnline) {
      this.startLocationUpdate()
      // TODO: 调用后端接口更新司机状态为在线
    } else {
      this.stopLocationUpdate()
      // TODO: 调用后端接口更新司机状态为离线
    }
  },

  // 开始定时更新位置
  startLocationUpdate() {
    this.stopLocationUpdate() // 先清除可能存在的定时器
    
    const updateLocation = async () => {
      try {
        const location = await this.getCurrentLocation()
        // TODO: 调用后端接口更新位置
        await this.updateDriverLocation(location)
      } catch (error) {
        console.error('更新位置失败:', error)
      }
    }

    // 立即更新一次
    updateLocation()
    // 每30秒更新一次位置
    this.data.locationUpdateTimer = setInterval(updateLocation, 30000)
  },

  // 停止定时更新位置
  stopLocationUpdate() {
    if (this.data.locationUpdateTimer) {
      clearInterval(this.data.locationUpdateTimer)
      this.data.locationUpdateTimer = null
    }
  },

  // 更新司机位置到服务器
  async updateDriverLocation(location) {
    try {
      // TODO: 实现位置上报接口调用
      const { latitude, longitude } = location
      // const res = await wx.cloud.callFunction({
      //   name: 'updateDriverLocation',
      //   data: { latitude, longitude }
      // })
    } catch (error) {
      console.error('位置上报失败:', error)
    }
  },

  // 导航到配送地址
  navigateToAddress() {
    if (!this.data.currentOrder) return
    
    const { deliveryAddress, deliveryLatitude, deliveryLongitude } = this.data.currentOrder
    wx.openLocation({
      latitude: deliveryLatitude,
      longitude: deliveryLongitude,
      name: deliveryAddress,
      scale: 18
    })
  },

  // 更新订单状态
  async updateOrderStatus() {
    if (!this.data.currentOrder) return

    try {
      // TODO: 实现订单状态更新接口调用
      wx.showToast({
        title: '状态更新成功',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '状态更新失败',
        icon: 'none'
      })
    }
  },

  // 标记点击事件
  onMarkerTap(e) {
    const markerId = e.markerId
    // TODO: 处理标记点击事件
  }
}) 