const { envList } = require('../../envList');

// pages/user-center/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    showTip: false,
    title: "",
    content: "",
    userInfo: {
      driverName: '',
      phone: '',
      avatar: '',
      auditStatus: 0 // 0: 未审核, 1: 已通过, 2: 被拒绝
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次页面显示时都刷新用户信息
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      // TODO: 调用后端接口获取用户信息
      // const res = await wx.cloud.callFunction({
      //   name: 'getDriverInfo'
      // })

      // 模拟用户数据，实际应从接口获取
      const mockUserInfo = {
        driverName: '张师傅',
        phone: '13812345678',
        avatar: '',
        auditStatus: 0 // 模拟未审核状态
      };

      this.setData({
        userInfo: mockUserInfo
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  // 跳转到个人信息页面
  navigateToUserInfo() {
    wx.navigateTo({
      url: '/pages/profile/userInfo/index'
    });
  },

  // 跳转到订单历史页面
  navigateToOrderHistory() {
    wx.navigateTo({
      url: '/pages/profile/orderHistory/index'
    });
  },

  // 跳转到钱包页面
  navigateToWallet() {
    wx.navigateTo({
      url: '/pages/profile/wallet/index'
    });
  },

  // 处理登出
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用登出接口
          // wx.cloud.callFunction({
          //   name: 'logout'
          // })

          // 清除本地存储的用户信息
          try {
            wx.clearStorageSync();
          } catch (e) {
            console.error('清除缓存失败:', e);
          }

          // 重置用户信息
          this.setData({
            userInfo: {
              driverName: '',
              phone: '',
              avatar: '',
              auditStatus: 0
            }
          });
        }
      }
    });
  },

  getOpenId() {
    wx.showLoading({
      title: '',
    });
    wx.cloud
      .callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getOpenId',
        },
      })
      .then((resp) => {
        this.setData({
          haveGetOpenId: true,
          openId: resp.result.openid,
        });
        wx.hideLoading();
      })
      .catch((e) => {
        wx.hideLoading();
        const { errCode, errMsg } = e
      });
  },

  gotoWxCodePage() {
    wx.navigateTo({
      url: `/pages/exampleDetail/index?envId=${envList?.[0]?.envId}&type=getMiniProgramCode`,
    });
  },
});
