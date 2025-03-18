// pages/profile/userInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      driverName: '',
      phone: '',
      idCard: '',
      driverLicense: '',
      driverLicenseFront: '',
      driverLicenseBack: '',
      plateNumber: '',
      vehicleType: '',
      maxLoad: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleLicenseNumber: '',
      vehicleLicenseFront: '',
      vehicleLicenseBack: '',
      avatar: ''
    },
    vehicleTypes: ['小型面包车', '中型厢式货车', '大型货车', '小型轿车', '其他'],
    vehicleTypeIndex: -1
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
        idCard: '330102199001011234',
        driverLicense: 'D12345678',
        driverLicenseFront: '',
        driverLicenseBack: '',
        plateNumber: '浙A12345',
        vehicleType: '中型厢式货车',
        maxLoad: '2000',
        vehicleBrand: '东风',
        vehicleModel: 'DF100',
        vehicleLicenseNumber: 'X12345678',
        vehicleLicenseFront: '',
        vehicleLicenseBack: '',
        avatar: ''
      }
      
      // 设置车辆类型索引
      const vehicleTypeIndex = this.data.vehicleTypes.findIndex(type => type === mockUserInfo.vehicleType)
      
      this.setData({
        userInfo: mockUserInfo,
        vehicleTypeIndex: vehicleTypeIndex !== -1 ? vehicleTypeIndex : 0
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

  // 输入身份证号
  inputIdCard(e) {
    this.setData({
      'userInfo.idCard': e.detail.value
    })
  },

  // 输入驾驶证号
  inputDriverLicense(e) {
    this.setData({
      'userInfo.driverLicense': e.detail.value
    })
  },

  // 输入车牌号
  inputPlateNumber(e) {
    this.setData({
      'userInfo.plateNumber': e.detail.value
    })
  },

  // 选择车辆类型
  vehicleTypeChange(e) {
    const index = e.detail.value
    this.setData({
      vehicleTypeIndex: index,
      'userInfo.vehicleType': this.data.vehicleTypes[index]
    })
  },

  // 输入最大载重
  inputMaxLoad(e) {
    this.setData({
      'userInfo.maxLoad': e.detail.value
    })
  },

  // 上传驾驶证正本
  uploadDriverLicenseFront() {
    this.uploadImage('driverLicenseFront')
  },

  // 上传驾驶证副本
  uploadDriverLicenseBack() {
    this.uploadImage('driverLicenseBack')
  },

  // 输入车辆品牌
  inputVehicleBrand(e) {
    this.setData({
      'userInfo.vehicleBrand': e.detail.value
    })
  },

  // 输入车辆型号
  inputVehicleModel(e) {
    this.setData({
      'userInfo.vehicleModel': e.detail.value
    })
  },

  // 输入行驶证号
  inputVehicleLicenseNumber(e) {
    this.setData({
      'userInfo.vehicleLicenseNumber': e.detail.value
    })
  },

  // 上传行驶证正本
  uploadVehicleLicenseFront() {
    this.uploadImage('vehicleLicenseFront')
  },

  // 上传行驶证副本
  uploadVehicleLicenseBack() {
    this.uploadImage('vehicleLicenseBack')
  },

  // 通用图片上传函数
  uploadImage(field) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 更新对应字段
        const dataField = `userInfo.${field}`
        this.setData({
          [dataField]: tempFilePath
        })
        
        // TODO: 上传图片到服务器
        // wx.uploadFile({
        //   url: 'your-upload-url',
        //   filePath: tempFilePath,
        //   name: field,
        //   success: (res) => {
        //     const data = JSON.parse(res.data)
        //     if (data.success) {
        //       wx.showToast({
        //         title: '图片上传成功',
        //         icon: 'success'
        //       })
        //     }
        //   },
        //   fail: (error) => {
        //     console.error('上传图片失败:', error)
        //     wx.showToast({
        //       title: '上传失败',
        //       icon: 'none'
        //     })
        //   }
        // })
      }
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
    
    if (!this.data.userInfo.idCard || !/^\d{17}[\dX]$/.test(this.data.userInfo.idCard)) {
      return wx.showToast({
        title: '请输入正确的身份证号',
        icon: 'none'
      })
    }
    
    if (!this.data.userInfo.driverLicense) {
      return wx.showToast({
        title: '请输入驾驶证号',
        icon: 'none'
      })
    }
    
    if (!this.data.userInfo.plateNumber) {
      return wx.showToast({
        title: '请输入车牌号',
        icon: 'none'
      })
    }
    
    if (!this.data.userInfo.vehicleType) {
      return wx.showToast({
        title: '请选择车辆类型',
        icon: 'none'
      })
    }
    
    if (!this.data.userInfo.maxLoad) {
      return wx.showToast({
        title: '请输入最大载重',
        icon: 'none'
      })
    }
    
    try {
      // TODO: 调用后端接口保存用户信息
      // await wx.cloud.callFunction({
      //   name: 'updateDriverInfo',
      //   data: this.data.userInfo
      // })
      
      wx.showToast({
        title: '保存成功',
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