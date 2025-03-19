Page({
  data: {
    isLogin: false,
    userInfo: null,
    defaultAvatar: '/miniprogram/assets/images/default-avatar.png',
    balance: 0,
    totalIncome: 0,
    name: '',
    phone: '',
    vehicleNo: '',
    vehicleType: '',
    idCard: '',
    avatar: '',
    editDialogVisible: false,
    editName: '',
    editPhone: '',
    editVehicleNo: '',
    editVehicleType: '',
    editIdCard: ''
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.fetchUserInfo()
    this.fetchWallet()
  },

  // 获取用户信息
  fetchUserInfo: function() {
    // 检查本地存储中是否有token
    const token = wx.getStorageSync('token')
    if (!token) {
      // 未登录状态
      this.setData({
        isLogin: false,
        userInfo: null
      })
      return
    }
    
    // 调用获取司机信息API
    api.getDriverInfo()
      .then(res => {
        if (res.code === 200 && res.data) {
          // 更新用户信息
          this.setData({
            isLogin: true,
            userInfo: res.data,
            name: res.data.name,
            phone: res.data.phone,
            vehicleNo: res.data.vehicleNo,
            vehicleType: res.data.vehicleType,
            idCard: res.data.idCard,
            avatar: res.data.avatar || this.data.defaultAvatar
          })
        } else {
          // 获取信息失败，可能是token过期
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          this.setData({
            isLogin: false,
            userInfo: null
          })
          
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('获取用户信息失败:', err)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      })
  },

  // 获取钱包信息
  fetchWallet: function() {
    // 检查是否登录
    const token = wx.getStorageSync('token')
    if (!token) return
    
    // 调用获取钱包API
    api.getWallet()
      .then(res => {
        if (res.code === 200 && res.data) {
          // 更新钱包信息
          this.setData({
            balance: res.data.balance || 0,
            totalIncome: res.data.totalIncome || 0
          })
        }
      })
      .catch(err => {
        console.error('获取钱包信息失败:', err)
        // 不显示错误提示，避免影响体验
      })
  },

  // 前往登录页
  goToLogin: function() {
    wx.navigateTo({
      url: '/miniprogram/pages/login/index'
    })
  },

  // 前往钱包页面
  goToWallet: function() {
    if (!this.data.isLogin) {
      this.goToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/miniprogram/pages/wallet/index'
    })
  },

  // 打开编辑信息对话框
  openEditDialog: function() {
    this.setData({
      editDialogVisible: true,
      editName: this.data.name,
      editPhone: this.data.phone,
      editVehicleNo: this.data.vehicleNo,
      editVehicleType: this.data.vehicleType,
      editIdCard: this.data.idCard
    })
  },

  // 关闭编辑对话框
  closeEditDialog: function() {
    this.setData({
      editDialogVisible: false
    })
  },

  // 处理输入变化
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    const data = {}
    data['edit' + field.charAt(0).toUpperCase() + field.slice(1)] = value
    
    this.setData(data)
  },

  // 保存用户信息
  saveUserInfo: function() {
    // 构建更新数据对象
    const updateData = {
      name: this.data.editName,
      phone: this.data.editPhone,
      vehicleNo: this.data.editVehicleNo,
      vehicleType: this.data.editVehicleType,
      idCard: this.data.editIdCard
    }
    
    // 显示加载中
    wx.showLoading({
      title: '保存中',
    })
    
    // 调用更新信息API
    api.updateDriverInfo(updateData)
      .then(res => {
        wx.hideLoading()
        
        if (res.code === 200) {
          // 更新本地数据
          this.setData({
            name: updateData.name,
            phone: updateData.phone,
            vehicleNo: updateData.vehicleNo,
            vehicleType: updateData.vehicleType,
            idCard: updateData.idCard,
            userInfo: {
              ...this.data.userInfo,
              ...updateData
            },
            editDialogVisible: false
          })
          
          // 保存到本地存储
          wx.setStorageSync('userInfo', this.data.userInfo)
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('更新用户信息失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      })
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用登出API
          api.logout()
            .then(() => {
              // 清除本地存储
              wx.removeStorageSync('token')
              wx.removeStorageSync('userInfo')
              
              // 更新状态
              this.setData({
                isLogin: false,
                userInfo: null,
                balance: 0,
                totalIncome: 0
              })
              
              wx.showToast({
                title: '已退出登录',
                icon: 'success'
              })
              
              // 跳转到登录页
              setTimeout(() => {
                wx.navigateTo({
                  url: '/miniprogram/pages/login/index'
                })
              }, 1000)
            })
            .catch(err => {
              console.error('退出登录失败:', err)
              // 即使API调用失败，仍然清除本地数据
              wx.removeStorageSync('token')
              wx.removeStorageSync('userInfo')
              
              this.setData({
                isLogin: false,
                userInfo: null
              })
              
              wx.showToast({
                title: '已退出登录',
                icon: 'success'
              })
            })
        }
      }
    })
  }
}) 