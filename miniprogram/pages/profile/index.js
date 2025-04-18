const api = require('../../utils/api');

Page({
  data: {
    userInfo: {
      name: '',
      id: '',
      avatar: ''
    }
  },

  onLoad() {
    // 检查登录状态
    if (!this.checkLoginStatus()) return;
    
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新用户信息
    this.loadUserInfo()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo && localUserInfo.id) {
        // 调用后端接口获取最新用户信息
        const res = await api.getDriverInfo(localUserInfo.id);
        if (res.code === 200) {
          const driverInfo = res.data;
          // 更新本地存储的用户信息
          wx.setStorageSync('userInfo', driverInfo);
          
          // 更新页面显示
          this.setData({
            userInfo: driverInfo
          });
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      });
    }
  },

  // 导航到个人信息页面
  navigateToUserInfo() {
    wx.navigateTo({
      url: '/pages/profile/userInfo/index'
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
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo && userInfo.id) {
              // 调用退出登录接口
              await api.logout(userInfo.id);
            }
            
            // 清除本地存储的用户信息
            wx.clearStorageSync();
            
            // 重置用户信息
            this.setData({
              userInfo: {
                name: '',
                id: '',
                avatar: ''
              }
            });

            // 跳转到登录页面
            wx.reLaunch({
              url: '/pages/login/index'
            });
          } catch (error) {
            console.error('退出登录失败:', error);
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      // 未登录，跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/index'
      });
      return false;
    }
    return true;
  }
}) 