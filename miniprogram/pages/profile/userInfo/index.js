// pages/profile/userInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  onLoad(options) {
    this.loadUserInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // TODO: 调用后端接口获取用户信息
      // const res = await wx.cloud.callFunction({
      //   name: 'getDriverInfo'
      // })
      
      // 模拟数据
      const mockUserInfo = {
        driverName: '张师傅',
        phone: '13812345678',
        avatar: '',
        auditStatus: 0
      }
      
      this.setData({
        userInfo: mockUserInfo
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 更新头像
        this.setData({
          'userInfo.avatar': tempFilePath
        })
        
        // TODO: 上传头像到服务器
        // wx.uploadFile({
        //   url: 'your-upload-url',
        //   filePath: tempFilePath,
        //   name: 'avatar',
        //   success: (res) => {
        //     const data = JSON.parse(res.data)
        //     if (data.success) {
        //       wx.showToast({
        //         title: '头像上传成功',
        //         icon: 'success'
        //       })
        //     }
        //   },
        //   fail: (error) => {
        //     console.error('上传头像失败:', error)
        //     wx.showToast({
        //       title: '上传失败',
        //       icon: 'none'
        //     })
        //   }
        // })
      }
    })
  },

  // 输入姓名
  inputDriverName(e) {
    this.setData({
      'userInfo.driverName': e.detail.value
    })
  },

  // 输入手机号
  inputPhone(e) {
    this.setData({
      'userInfo.phone': e.detail.value
    })
  },

  // 保存用户信息
  async saveUserInfo() {
    // 表单验证
    if (!this.data.userInfo.driverName) {
      return wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
    }
    
    if (!this.data.userInfo.phone || !/^1\d{10}$/.test(this.data.userInfo.phone)) {
      return wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
    }
    
    try {
      // 设置为待审核状态
      this.setData({
        'userInfo.auditStatus': 0
      })
      
      // TODO: 调用后端接口保存用户信息
      // await wx.cloud.callFunction({
      //   name: 'updateDriverInfo',
      //   data: this.data.userInfo
      // })
      
      wx.showToast({
        title: '提交成功，等待审核',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存用户信息失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})