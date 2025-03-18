Page({
  data: {
    userInfo: {
      driverName: '',
      driverId: '',
      avatar: '',
      orderCount: '0',
      monthlyIncome: '0.00'
    }
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新用户信息
    this.loadUserInfo()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // TODO: 调用后端接口获取用户信息
      // const res = await wx.cloud.callFunction({
      //   name: 'getDriverInfo'
      // })
      // this.setData({
      //   userInfo: res.result
      // })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
  },

  // 导航到历史订单页面
  navigateToOrders() {
    wx.navigateTo({
      url: '/pages/profile/orderHistory/index'
    })
  },

  // 导航到个人信息页面
  navigateToUserInfo() {
    wx.navigateTo({
      url: '/pages/profile/userInfo/index'
    })
  },

  // 导航到车辆信息页面
  navigateToVehicleInfo() {
    wx.navigateTo({
      url: '/pages/profile/vehicleInfo/index'
    })
  },

  // 导航到钱包页面
  navigateToWallet() {
    wx.navigateTo({
      url: '/pages/profile/wallet/index'
    })
  },

  // 处理退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用退出登录接口
            // await wx.cloud.callFunction({
            //   name: 'logout'
            // })
            
            // 清除本地存储的用户信息
            wx.clearStorageSync()
            
            // 重置用户信息
            this.setData({
              userInfo: {
                driverName: '',
                driverId: '',
                avatar: '',
                orderCount: '0',
                monthlyIncome: '0.00'
              }
            })

            // 跳转到登录页面
            wx.reLaunch({
              url: '/pages/login/index'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
}) 