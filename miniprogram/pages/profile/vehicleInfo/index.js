Page({
  data: {
    vehicleInfo: {
      plateNumber: '',
      vehicleType: '',
      brand: '',
      model: '',
      maxLoad: '',
      color: '',
      licenseNumber: '',
      licenseFront: '',
      licenseBack: ''
    },
    vehicleTypes: ['小型面包车', '中型厢式货车', '大型货车', '小型轿车', '其他'],
    vehicleTypeIndex: -1
  },

  onLoad() {
    this.loadVehicleInfo()
  },

  // 加载车辆信息
  async loadVehicleInfo() {
    try {
      // TODO: 调用后端接口获取车辆信息
      // const res = await wx.cloud.callFunction({
      //   name: 'getVehicleInfo'
      // })
      
      // 模拟数据
      const mockVehicleInfo = {
        plateNumber: '浙A12345',
        vehicleType: '中型厢式货车',
        brand: '东风',
        model: 'D9',
        maxLoad: '2000',
        color: '白色',
        licenseNumber: 'X12345678',
        licenseFront: '',
        licenseBack: ''
      }
      
      // 设置车辆类型索引
      const vehicleTypeIndex = this.data.vehicleTypes.findIndex(type => type === mockVehicleInfo.vehicleType)
      
      this.setData({
        vehicleInfo: mockVehicleInfo,
        vehicleTypeIndex: vehicleTypeIndex !== -1 ? vehicleTypeIndex : 0
      })
    } catch (error) {
      console.error('获取车辆信息失败:', error)
      wx.showToast({
        title: '获取信息失败',
        icon: 'none'
      })
    }
  },

  // 输入车牌号
  inputPlateNumber(e) {
    this.setData({
      'vehicleInfo.plateNumber': e.detail.value
    })
  },

  // 选择车辆类型
  vehicleTypeChange(e) {
    const index = e.detail.value
    this.setData({
      vehicleTypeIndex: index,
      'vehicleInfo.vehicleType': this.data.vehicleTypes[index]
    })
  },

  // 输入车辆品牌
  inputBrand(e) {
    this.setData({
      'vehicleInfo.brand': e.detail.value
    })
  },

  // 输入车辆型号
  inputModel(e) {
    this.setData({
      'vehicleInfo.model': e.detail.value
    })
  },

  // 输入最大载重
  inputMaxLoad(e) {
    this.setData({
      'vehicleInfo.maxLoad': e.detail.value
    })
  },

  // 输入车辆颜色
  inputColor(e) {
    this.setData({
      'vehicleInfo.color': e.detail.value
    })
  },

  // 输入行驶证号
  inputLicenseNumber(e) {
    this.setData({
      'vehicleInfo.licenseNumber': e.detail.value
    })
  },

  // 上传行驶证正本
  uploadLicenseFront() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 更新图片
        this.setData({
          'vehicleInfo.licenseFront': tempFilePath
        })
        
        // TODO: 上传图片到服务器
        // wx.uploadFile({
        //   url: 'your-upload-url',
        //   filePath: tempFilePath,
        //   name: 'licenseFront',
        //   success: (res) => {
        //     const data = JSON.parse(res.data)
        //     if (data.success) {
        //       wx.showToast({
        //         title: '上传成功',
        //         icon: 'success'
        //       })
        //     }
        //   },
        //   fail: (error) => {
        //     console.error('上传失败:', error)
        //     wx.showToast({
        //       title: '上传失败',
        //       icon: 'none'
        //     })
        //   }
        // })
      }
    })
  },

  // 上传行驶证副本
  uploadLicenseBack() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 更新图片
        this.setData({
          'vehicleInfo.licenseBack': tempFilePath
        })
        
        // TODO: 上传图片到服务器
        // wx.uploadFile({
        //   url: 'your-upload-url',
        //   filePath: tempFilePath,
        //   name: 'licenseBack',
        //   success: (res) => {
        //     const data = JSON.parse(res.data)
        //     if (data.success) {
        //       wx.showToast({
        //         title: '上传成功',
        //         icon: 'success'
        //       })
        //     }
        //   },
        //   fail: (error) => {
        //     console.error('上传失败:', error)
        //     wx.showToast({
        //       title: '上传失败',
        //       icon: 'none'
        //     })
        //   }
        // })
      }
    })
  },

  // 保存车辆信息
  async saveVehicleInfo() {
    // 表单验证
    if (!this.data.vehicleInfo.plateNumber) {
      return wx.showToast({
        title: '请输入车牌号',
        icon: 'none'
      })
    }
    
    try {
      // TODO: 调用后端接口保存车辆信息
      // await wx.cloud.callFunction({
      //   name: 'updateVehicleInfo',
      //   data: this.data.vehicleInfo
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
      console.error('保存车辆信息失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
}) 