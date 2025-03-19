const app = getApp()
// 引入地图选点插件
const chooseLocation = requirePlugin('chooseLocation');
// 引入API模块
const api = require('../../utils/api');

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
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.driverId) {
      // 未登录，跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/index'
      });
      return false;
    }
    return true;
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
          customerPhone: '13812345678',
          deliveryAddress: '上海市浦东新区张江高科技园区',
          deliveryLatitude: 31.210516,
          deliveryLongitude: 121.585426,
          statusText: '待接单',
          nextActionText: '接单',
          // 添加订单特定信息
          tonnage: '5.0',
          deliveryFee: '55.00'
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
    
    // 调用后端接口接单
    // api.acceptOrder(this.data.newOrder.id)
    //   .then(res => {
    //     if (res.code === 200) {
    //       // 使用返回的订单信息更新当前订单
    //       this.setData({
    //         currentOrder: res.data,
    //         newOrderVisible: false,
    //         newOrder: null,
    //         deliveryStatus: '配送中',
    //         orderStatus: '已接单',
    //         customerPhone: res.data.customerPhone,
    //         customerAddress: res.data.deliveryAddress,
    //         nextActionText: '完成配送'
    //       }, () => {
    //         // 接单后立即规划路线
    //         this.refreshRoute();
    //       });
    //       
    //       // 显示接单成功提示
    //       wx.showToast({
    //         title: '接单成功',
    //         icon: 'success'
    //       });
    //     } else {
    //       wx.showToast({
    //         title: res.message || '接单失败',
    //         icon: 'none'
    //       });
    //     }
    //   })
    //   .catch(err => {
    //     console.error('接单失败:', err);
    //     wx.showToast({
    //       title: '接单失败，请重试',
    //       icon: 'none'
    //     });
    //   });
    
    // 模拟接单成功
    this.setData({
      currentOrder: this.data.newOrder,
      newOrderVisible: false,
      newOrder: null,
      deliveryStatus: '配送中',
      orderStatus: '已接单',
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
    })
  },
  
  // 拒绝订单
  rejectOrder() {
    this.setData({
      newOrderVisible: false,
      newOrder: null
    })
    
    // 目前API没有专门的拒绝订单接口，可能需要通过取消订单实现
    // if (this.data.newOrder && this.data.newOrder.id) {
    //   api.cancelOrder(this.data.newOrder.id, '司机拒绝接单')
    //     .then(() => {
    //       console.log('拒绝订单成功');
    //     })
    //     .catch(err => {
    //       console.error('拒绝订单失败:', err);
    //     });
    // }
    
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
      // 调用后端接口更新司机状态为在线
      // api.updateWorkStatus(1) // 1=在线/空闲
      //   .then(() => {
      //     console.log('更新司机状态为在线成功');
      //   })
      //   .catch(err => {
      //     console.error('更新司机状态失败:', err);
      //   });
      
      // 在线后可以接收订单
      this.setupOrderListener()
      
      wx.showToast({
        title: '已上线',
        icon: 'success'
      })
    } else {
      this.stopLocationUpdate()
      // 调用后端接口更新司机状态为离线
      // api.updateWorkStatus(3) // 3=离线
      //   .then(() => {
      //     console.log('更新司机状态为离线成功');
      //   })
      //   .catch(err => {
      //     console.error('更新司机状态失败:', err);
      //   });
      
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
        // 调用后端接口更新位置
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
      // 实现位置上报接口调用
      const { latitude, longitude } = location
      // 可计算速度和精度，或者直接从location获取
      const speed = location.speed || 0;
      const accuracy = location.accuracy || 0;
      
      // await api.updateLocation(latitude, longitude, speed, accuracy);
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
          // 调用后端接口取消订单
          // if (this.data.currentOrder && this.data.currentOrder.id) {
          //   api.cancelOrder(this.data.currentOrder.id, '司机主动取消')
          //     .then(res => {
          //       if (res.code === 200) {
          //         // 清除当前订单信息
          //         this.setData({
          //           currentOrder: null,
          //           deliveryStatus: '空闲',
          //           orderStatus: '',
          //           customerPhone: '',
          //           customerAddress: '',
          //           routeDistance: '0.0',
          //           routeTime: '0',
          //           nextActionText: '接单',
          //           markers: [],
          //           polyline: []
          //         });
          //         
          //         wx.showToast({
          //           title: '已撤销订单',
          //           icon: 'success'
          //         });
          //       } else {
          //         wx.showToast({
          //           title: res.message || '取消订单失败',
          //           icon: 'none'
          //         });
          //       }
          //     })
          //     .catch(err => {
          //       console.error('取消订单失败:', err);
          //       wx.showToast({
          //         title: '取消订单失败',
          //         icon: 'none'
          //       });
          //     });
          // }
          
          // 模拟取消成功
          this.setData({
            currentOrder: null,
            deliveryStatus: '空闲',
            orderStatus: '',
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
      // 调用后端路线规划API
      // api.getRoute(
      //   this.data.latitude,
      //   this.data.longitude,
      //   deliveryLatitude,
      //   deliveryLongitude
      // )
      //   .then(res => {
      //     if (res.code === 200) {
      //       const routeData = res.data;
      //       // 处理路线数据
      //       if (routeData.polyline) {
      //         // 可能需要解码腾讯地图格式的polyline
      //         this.renderRoute(routeData);
      //       }
      //       // 更新距离和时间信息
      //       this.setData({
      //         routeDistance: routeData.distance,
      //         routeTime: routeData.duration
      //       });
      //     } else {
      //       // 接口调用失败，使用简单路线
      //       this.renderSimpleRoute({
      //         from: {
      //           latitude: this.data.latitude,
      //           longitude: this.data.longitude
      //         },
      //         to: {
      //           latitude: deliveryLatitude,
      //           longitude: deliveryLongitude
      //         }
      //       });
      //     }
      //   })
      //   .catch(err => {
      //     console.error('获取路线失败:', err);
      //     // 失败时使用简单路线
      //     this.renderSimpleRoute({
      //       from: {
      //         latitude: this.data.latitude,
      //         longitude: this.data.longitude
      //       },
      //       to: {
      //         latitude: deliveryLatitude,
      //         longitude: deliveryLongitude
      //       }
      //     });
      //   });
      
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
      customerPhone: '13800138000',
      deliveryAddress: location.address || '选定的位置',
      deliveryLatitude: location.latitude,
      deliveryLongitude: location.longitude,
      statusText: '配送中',
      nextActionText: '完成配送',
      tonnage: '3.0',
      deliveryFee: '35.00'
    };
    
    this.setData({ 
      currentOrder: mockOrder,
      showLocationPicker: false,
      deliveryStatus: '配送中',
      orderStatus: mockOrder.statusText,
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
      // 如果当前是"完成配送"状态，完成订单
      if (this.data.nextActionText === '完成配送') {
        // 调用后端接口完成订单
        // const res = await api.completeOrder(this.data.currentOrder.id);
        // if (res.code !== 200) {
        //   wx.showToast({
        //     title: res.message || '完成订单失败',
        //     icon: 'none'
        //   });
        //   return;
        // }
      }
      
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