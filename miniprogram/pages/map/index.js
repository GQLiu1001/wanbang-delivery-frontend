const app = getApp()
// 引入地图选点插件
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    longitude: 121.473701, // 默认经度（示例：上海）
    latitude: 31.230416,   // 默认纬度
    scale: 14,
    markers: [],
    polyline: [],
    isOnline: false,
    currentOrder: null,
    locationUpdateTimer: null,
    // 状态和路线信息
    deliveryStatus: '空闲',
    orderStatus: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    routeDistance: '0.0',
    routeTime: '0',
    nextActionText: '接单',
    // 是否显示位置选择按钮
    showLocationPicker: false,
    // 新订单相关
    newOrderVisible: false,
    newOrder: null
  },

  onLoad() {
    this.initLocation()
    this.checkLoginStatus()
    
    // 监听新订单消息（在实际项目中，这里应该是监听服务器推送）
    this.setupOrderListener()
  },

  onShow() {
    if (this.data.isOnline) {
      this.startLocationUpdate()
    }
    
    // 获取从地图选点插件返回的位置信息
    const location = chooseLocation.getLocation();
    if (location) {
      console.log('选择的位置:', location);
      
      // 可以根据需要处理选点返回的位置信息
      // 例如：设置为配送目的地
      if (!this.data.currentOrder) {
        // 如果没有当前订单，可以创建一个新订单使用选择的位置
        this.createOrderWithLocation(location);
      }
    }
  },

  onHide() {
    this.stopLocationUpdate()
  },

  onUnload() {
    this.stopLocationUpdate()
    // 页面卸载时，需要取消位置选点
    chooseLocation.setLocation(null);
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

  // 设置订单监听器（模拟服务器推送）
  setupOrderListener() {
    // 实际项目中，这里应该连接WebSocket或其他消息推送服务
    // 这里仅用setTimeout模拟5秒后收到新订单
    setTimeout(() => {
      if (this.data.isOnline && !this.data.currentOrder) {
        // 模拟收到新订单
        this.receiveNewOrder({
          id: 'order_' + Date.now(),
          customerName: '张三',
          customerPhone: '13812345678',
          deliveryAddress: '上海市浦东新区张江高科技园区',
          deliveryLatitude: 31.210516,
          deliveryLongitude: 121.585426,
          statusText: '待接单',
          nextActionText: '接单',
          // 添加订单特定信息
          weight: '5吨',
          cargo: '建材',
          price: '￥500'
        })
      }
    }, 5000)
  },
  
  // 接收新订单
  receiveNewOrder(order) {
    this.setData({
      newOrder: order,
      newOrderVisible: true
    })
    
    // 播放提示音
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = '/audio/new_order.mp3'
    innerAudioContext.play()
  },
  
  // 接受订单
  acceptOrder() {
    if (!this.data.newOrder) return
    
    this.setData({
      currentOrder: this.data.newOrder,
      newOrderVisible: false,
      newOrder: null,
      deliveryStatus: '配送中',
      orderStatus: '已接单',
      customerName: this.data.newOrder.customerName,
      customerPhone: this.data.newOrder.customerPhone,
      customerAddress: this.data.newOrder.deliveryAddress,
      nextActionText: '完成配送'
    }, () => {
      // 接单后立即规划路线
      this.refreshRoute();
      
      // 显示接单成功提示
      wx.showToast({
        title: '接单成功',
        icon: 'success'
      })
      
      // TODO: 调用后端接口更新订单状态
    })
  },
  
  // 拒绝订单
  rejectOrder() {
    this.setData({
      newOrderVisible: false,
      newOrder: null
    })
    
    // TODO: 调用后端接口拒绝订单
    
    wx.showToast({
      title: '已拒绝订单',
      icon: 'none'
    })
  },

  // 切换在线状态
  toggleOnlineStatus(e) {
    const isOnline = e.detail.value
    this.setData({ isOnline })

    if (isOnline) {
      this.startLocationUpdate()
      // TODO: 调用后端接口更新司机状态为在线
      
      // 在线后可以接收订单
      this.setupOrderListener()
      
      wx.showToast({
        title: '已上线',
        icon: 'success'
      })
    } else {
      this.stopLocationUpdate()
      // TODO: 调用后端接口更新司机状态为离线
      
      wx.showToast({
        title: '已下线',
        icon: 'none'
      })
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

  // 取消所有订单
  cancelAllOrders() {
    wx.showModal({
      title: '确认操作',
      content: '确定要撤销当前订单吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实际项目中需要调用后端接口取消订单
          
          // 清除当前订单信息
          this.setData({
            currentOrder: null,
            deliveryStatus: '空闲',
            orderStatus: '',
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            routeDistance: '0.0',
            routeTime: '0',
            nextActionText: '接单',
            markers: [],
            polyline: []
          })
          
          wx.showToast({
            title: '已撤销订单',
            icon: 'success'
          })
        }
      }
    })
  },

  // 刷新路线规划
  refreshRoute() {
    if (!this.data.currentOrder) return
    
    const { deliveryLatitude, deliveryLongitude } = this.data.currentOrder
    
    try {
      // 临时解决方案：创建简单的直线路径
      this.renderSimpleRoute({
        from: {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        },
        to: {
          latitude: deliveryLatitude,
          longitude: deliveryLongitude
        }
      })
      
      // 计算简单的距离和时间估计
      const distance = this.calculateDistance(
        this.data.latitude, this.data.longitude,
        deliveryLatitude, deliveryLongitude
      )
      
      // 更新路线信息
      const distanceKm = (distance / 1000).toFixed(1)
      const timeMinutes = this.estimateDuration(distance)
      
      this.setData({
        routeDistance: distanceKm,
        routeTime: timeMinutes
      })
      
    } catch (error) {
      console.error('路线规划失败:', error)
      wx.showToast({
        title: '路线规划失败',
        icon: 'none'
      })
    }
  },
  
  // 临时解决方案：渲染简单路线
  renderSimpleRoute(route) {
    const { from, to } = route
    
    // 创建简单直线连接
    this.setData({
      polyline: [{
        points: [
          {
            longitude: from.longitude,
            latitude: from.latitude
          },
          {
            longitude: to.longitude,
            latitude: to.latitude
          }
        ],
        color: '#3A7FED',
        width: 6,
        arrowLine: true
      }],
      markers: [
        // 起点标记
        {
          id: 0,
          longitude: from.longitude,
          latitude: from.latitude,
          width: 32,
          height: 32,
          callout: {
            content: '当前位置',
            color: '#FFFFFF',
            bgColor: '#3A7FED',
            padding: 8,
            borderRadius: 4,
            display: 'ALWAYS'
          }
        },
        // 终点标记
        {
          id: 1,
          longitude: to.longitude,
          latitude: to.latitude,
          width: 32,
          height: 32,
          callout: {
            content: '配送地址',
            color: '#FFFFFF',
            bgColor: '#FF5151',
            padding: 8,
            borderRadius: 4,
            display: 'ALWAYS'
          }
        }
      ]
    })
  },
  
  // 计算两点之间的距离（米）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // 地球半径，单位米
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance
  },
  
  // 角度转弧度
  deg2rad(deg) {
    return deg * (Math.PI/180)
  },
  
  // 估计行驶时间（分钟）
  estimateDuration(distance) {
    // 假设平均速度为40km/h
    const averageSpeed = 40 * 1000 / 60 // 米/分钟
    return Math.round(distance / averageSpeed)
  },

  // 创建使用选定位置的订单（模拟测试用）
  createOrderWithLocation(location) {
    const mockOrder = {
      id: 'order_' + Date.now(),
      customerName: '新客户',
      customerPhone: '13800138000',
      deliveryAddress: location.address || '选定的位置',
      deliveryLatitude: location.latitude,
      deliveryLongitude: location.longitude,
      statusText: '配送中',
      nextActionText: '完成配送',
      weight: '3吨',
      cargo: '日用品',
      price: '￥300'
    };
    
    this.setData({ 
      currentOrder: mockOrder,
      showLocationPicker: false,
      deliveryStatus: '配送中',
      orderStatus: mockOrder.statusText,
      customerName: mockOrder.customerName,
      customerPhone: mockOrder.customerPhone,
      customerAddress: mockOrder.deliveryAddress,
      nextActionText: mockOrder.nextActionText
    }, () => {
      // 加载订单后规划路线
      if (this.data.latitude && this.data.longitude) {
        this.refreshRoute();
      }
    });
  },

  // 切换位置选择器显示
  toggleLocationPicker() {
    this.setData({
      showLocationPicker: !this.data.showLocationPicker
    });
  },

  // 选择位置类型
  selectLocation(e) {
    const locationType = e.currentTarget.dataset.type;
    this.setData({ showLocationPicker: false });
    
    const key = 'Z6SBZ-W7QWB-PDWU4-N2C2B-JVFD6-DZB7F'; // 这里替换为您实际的腾讯位置服务key
    const referer = '万邦送货'; // 调用插件的app的名称
    
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}`
    });
  },

  // 联系客户
  callCustomer() {
    if (this.data.customerPhone) {
      wx.makePhoneCall({
        phoneNumber: this.data.customerPhone
      });
    } else {
      wx.showToast({
        title: '电话号码不可用',
        icon: 'none'
      });
    }
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
      
      // 如果当前是"接单"状态，更新为"正在前往"
      if (this.data.nextActionText === '接单') {
        this.setData({
          orderStatus: '正在前往',
          nextActionText: '完成配送'
        })
      } 
      // 如果当前是"完成配送"状态，完成订单
      else if (this.data.nextActionText === '完成配送') {
        // 完成订单后重置状态
        this.setData({
          currentOrder: null,
          deliveryStatus: '空闲',
          orderStatus: '',
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          routeDistance: '0.0',
          routeTime: '0',
          nextActionText: '接单',
          markers: [],
          polyline: []
        })
      }
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
  },
  
  // 导航到目的地
  navigateToDestination() {
    if (!this.data.currentOrder) return
    
    const { deliveryAddress, deliveryLatitude, deliveryLongitude } = this.data.currentOrder
    
    // 使用微信内置地图导航
    wx.openLocation({
      latitude: deliveryLatitude,
      longitude: deliveryLongitude,
      name: deliveryAddress,
      scale: 18
    })
  }
}) 