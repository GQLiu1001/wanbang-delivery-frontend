const app = getApp()
// 引入地图选点插件
const chooseLocation = requirePlugin('chooseLocation');
// 引入API模块
const api = require('../../utils/api');
const locationService = require('../../utils/locationService');
const routeCache = require('../../utils/routeCache');
const MapService = require('../../utils/MapService');

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
    this.setupLocationService()
    this.setupOrderListener()
  },

  onShow() {
    if (this.data.isOnline) {
      locationService.startLocationUpdate()
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
    locationService.stopLocationUpdate()
  },

  onUnload() {
    locationService.stopLocationUpdate()
    // 页面卸载时，需要取消位置选点
    chooseLocation.setLocation(null);
  },

  // 初始化位置服务
  setupLocationService() {
    // 添加位置更新监听器
    locationService.addListener(this.handleLocationUpdate.bind(this));
  },

  // 处理位置更新
  handleLocationUpdate(location) {
    this.setData({
      latitude: location.latitude,
      longitude: location.longitude
    });

    // 更新司机位置到服务器
    api.updateLocation(
      location.latitude,
      location.longitude,
      location.speed || 0,
      location.accuracy || 0
    ).catch(err => {
      console.error('更新位置失败:', err);
    });

    // 如果有当前订单，刷新路线
    if (this.data.currentOrder) {
      this.refreshRoute();
    }
  },

  // 初始化位置
  async initLocation() {
    try {
      const location = await locationService.getCurrentLocation()
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
  async receiveNewOrder(order) {
    try {
      // 获取当前位置
      const currentLocation = await locationService.getCurrentLocation();
      
      // 通过腾讯位置服务解析目的地经纬度（如果订单中没有提供）
      let destinationLocation;
      if (order.deliveryLatitude && order.deliveryLongitude) {
        destinationLocation = {
          latitude: order.deliveryLatitude,
          longitude: order.deliveryLongitude
        };
      } else {
        // 如果订单只提供地址，需要解析经纬度
        const locationResult = await MapService.searchLocation(order.deliveryAddress);
        if (locationResult && locationResult.data && locationResult.data.length > 0) {
          destinationLocation = {
            latitude: locationResult.data[0].location.lat,
            longitude: locationResult.data[0].location.lng
          };
        } else {
          throw new Error('无法解析配送地址');
        }
      }

      // 调用后端路线规划API
      const routeResult = await api.planRoute({
        startLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        },
        endLocation: {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
          address: order.deliveryAddress
        },
        orderId: order.id
      });

      if (routeResult.code === 0) {
        // 更新订单信息和路线显示
        this.setData({
          newOrder: {
            ...order,
            deliveryLatitude: destinationLocation.latitude,
            deliveryLongitude: destinationLocation.longitude,
            route: routeResult.data
          },
          newOrderVisible: true
        });
        
        // 播放提示音
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.src = '/audio/new_order.mp3';
        innerAudioContext.play();
        
        // 显示路线
        if (routeResult.data.polyline) {
          this.setData({
            polyline: [{
              points: this.decodePolyline(routeResult.data.polyline),
              color: '#3A7FED',
              width: 6
            }],
            routeDistance: (routeResult.data.distance / 1000).toFixed(1),
            routeTime: Math.ceil(routeResult.data.duration / 60)
          });
        }
      }
    } catch (error) {
      console.error('处理新订单失败:', error);
      wx.showToast({
        title: '获取路线失败',
        icon: 'none'
      });
    }
  },
  
  // 接受订单
  async acceptOrder() {
    if (!this.data.newOrder) return
    
    try {
      const res = await api.acceptOrder(this.data.newOrder.id)
      if (res.code === 0) {
        this.setData({
          currentOrder: res.data,
          newOrderVisible: false,
          newOrder: null,
          deliveryStatus: '配送中',
          orderStatus: '已接单',
          customerPhone: res.data.customerPhone,
          customerAddress: res.data.deliveryAddress,
          nextActionText: '完成配送'
        }, () => {
          // 接单后立即规划路线
          this.refreshRoute()
          
          // 显示接单成功提示
          wx.showToast({
            title: '接单成功',
            icon: 'success'
          })
        })
      }
    } catch (error) {
      console.error('接单失败:', error)
      wx.showToast({
        title: '接单失败，请重试',
        icon: 'none'
      })
    }
  },
  
  // 拒绝订单
  async rejectOrder() {
    this.setData({
      newOrderVisible: false,
      newOrder: null
    })
    
    try {
      await api.cancelOrder(this.data.newOrder.id, '司机拒绝接单')
      
      wx.showToast({
        title: '已拒绝订单',
        icon: 'none'
      })
    } catch (error) {
      console.error('拒绝订单失败:', error)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  },

  // 切换在线状态
  async toggleOnlineStatus(e) {
    const isOnline = e.detail.value
    this.setData({ isOnline })

    try {
      if (isOnline) {
        await locationService.startLocationUpdate()
        await api.updateWorkStatus(1) // 1=在线/空闲
        
        wx.showToast({
          title: '已上线',
          icon: 'success'
        })
      } else {
        await locationService.stopLocationUpdate()
        await api.updateWorkStatus(3) // 3=离线
        
        wx.showToast({
          title: '已下线',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('切换在线状态失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 刷新路线
  async refreshRoute() {
    const { currentOrder } = this.data
    if (!currentOrder) return
    
    const from = {
      latitude: this.data.latitude,
      longitude: this.data.longitude
    }
    
    const to = {
      latitude: currentOrder.deliveryLatitude,
      longitude: currentOrder.deliveryLongitude
    }
    
    // 先尝试从缓存获取路线
    let routeData = routeCache.get(from, to)
    
    if (!routeData) {
      try {
        // 缓存未命中，调用API获取路线
        const res = await api.getRoute(from, to, 'driving')
        if (res.code === 0 && res.data.routes.length > 0) {
          routeData = res.data.routes[0]
          // 缓存路线数据
          routeCache.set(from, to, routeData)
        }
      } catch (error) {
        console.error('获取路线失败:', error)
        return
      }
    }
    
    if (routeData) {
      this.setData({
        polyline: [{
          points: this.decodePolyline(routeData.polyline),
          color: '#3A7FED',
          width: 6
        }],
        routeDistance: (routeData.distance / 1000).toFixed(1),
        routeTime: Math.ceil(routeData.duration / 60)
      })
    }
  },
  
  // 解码腾讯地图polyline
  decodePolyline(polyline) {
    const points = []
    const len = polyline.length
    let index = 0
    let lat = 0
    let lng = 0

    while (index < len) {
      let shift = 0
      let result = 0

      let byte
      do {
        byte = polyline.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lat += dlat

      shift = 0
      result = 0

      do {
        byte = polyline.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lng += dlng

      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5
      })
    }

    return points
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

  // 完成订单
  async completeOrder() {
    if (!this.data.currentOrder) return

    try {
      await api.completeOrder(this.data.currentOrder.id)
      this.setData({
        currentOrder: null,
        deliveryStatus: '空闲',
        orderStatus: '',
        customerPhone: '',
        customerAddress: '',
        routeDistance: '0.0',
        routeTime: '0',
        nextActionText: '接单',
        polyline: []
      })

      wx.showToast({
        title: '订单已完成',
        icon: 'success'
      })
    } catch (error) {
      console.error('完成订单失败:', error)
      wx.showToast({
        title: '操作失败，请重试',
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