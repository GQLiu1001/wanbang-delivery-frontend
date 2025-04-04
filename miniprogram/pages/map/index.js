const app = getApp()
// 引入地图选点插件
const chooseLocation = requirePlugin('chooseLocation');
// 引入API模块
const api = require('../../utils/api');
// 引入腾讯地图SDK
const QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
// 实例化腾讯地图SDK
const qqmapsdk = new QQMapWX({
  key: 'Z6SBZ-W7QWB-PDWU4-N2C2B-JVFD6-DZB7F' // 使用在config.js中相同的key
});

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
    newOrder: null,
    lastGeocoderCalls: {},
    orderPollingTimer: null
  },

  onLoad() {
    this.initLocation()
    this.checkLoginStatus()
    
    // 监听新订单
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
      
      // 由于API配额限制，直接使用选点返回的位置信息
      // 不再额外调用反向地址解析
      // 注释掉模拟订单创建
      // if (!this.data.currentOrder) {
      //   // 如果没有当前订单，可以创建一个新订单使用选择的位置
      //   this.createOrderWithLocation(location);
      // }
    }
  },

  onHide() {
    this.stopLocationUpdate()
  },

  onUnload() {
    this.stopLocationUpdate()
    // 清除订单轮询定时器
    if (this.orderPollingTimer) {
      clearInterval(this.orderPollingTimer);
      this.orderPollingTimer = null;
    }
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
      
      // 由于API配额限制，开发阶段不每次都调用反向地址解析
      // 在生产环境或需要时才调用
      if (app.globalData && app.globalData.enableMapApiCalls) {
        this.reverseGeocoder(location.latitude, location.longitude);
      }
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
    if (!userInfo || !userInfo.id) {
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
    // 立即获取一次新订单
    if (this.data.isOnline && !this.data.currentOrder) {
      this.getNewOrders();
    }
    
    // 每10秒轮询一次新订单接口
    this.orderPollingTimer = setInterval(() => {
      if (this.data.isOnline && !this.data.currentOrder) {
        this.getNewOrders();
      }
    }, 10000); // 10秒轮询一次
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
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '用户信息不完整，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    // 获取当前位置
    this.getCurrentLocation().then(location => {
      // 调用后端接口抢单
      api.robNewOrder(
        userInfo.id,
        this.data.newOrder.orderNo
      )
      .then(res => {
        if (res.code === 200 && res.data === true) {
          // 抢单成功，确保保存完整的订单信息，包括经纬度
          const currentOrder = {
            ...this.data.newOrder,
            // 确保记录经纬度信息，这些值现在来自于地址解析
            deliveryLatitude: this.data.newOrder.deliveryLatitude,
            deliveryLongitude: this.data.newOrder.deliveryLongitude
          };
          
          // 更新当前订单
          this.setData({
            currentOrder: currentOrder,
            newOrderVisible: false,
            newOrder: null,
            deliveryStatus: '配送中',
            orderStatus: '已接单',
            customerPhone: currentOrder.customerPhone,
            customerAddress: currentOrder.deliveryAddress,
            nextActionText: '完成配送'
          }, () => {
            // 接单后立即规划路线
            this.refreshRoute();
          });
          
          // 显示接单成功提示
          wx.showToast({
            title: '抢单成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '抢单失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('抢单失败:', err);
        wx.showToast({
          title: '抢单失败，请重试',
          icon: 'none'
        });
      });
    }).catch(err => {
      console.error('获取位置失败:', err);
      wx.showToast({
        title: '获取位置失败，请允许位置权限',
        icon: 'none'
      });
    });
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

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) return;

    if (isOnline) {
      this.startLocationUpdate()
      // 调用后端接口更新司机状态为在线/空闲
      api.updateWorkStatus(userInfo.id, 1) // 1=空闲
        .then(() => {
          console.log('司机状态更新为在线');
          // 获取新订单
          this.getNewOrders();
          
          // 如果定时器未开启，重新开启定时器
          if (!this.orderPollingTimer) {
            this.setupOrderListener();
          }
          
          wx.showToast({
            title: '已上线',
            icon: 'success'
          });
        })
        .catch(err => {
          console.error('更新状态失败:', err);
        });
    } else {
      this.stopLocationUpdate()
      // 调用后端接口更新司机状态为离线
      api.updateWorkStatus(userInfo.id, 3) // 3=离线
        .then(() => {
          console.log('司机状态更新为离线');
          
          // 清除订单轮询定时器
          if (this.orderPollingTimer) {
            clearInterval(this.orderPollingTimer);
            this.orderPollingTimer = null;
          }
          
          wx.showToast({
            title: '已下线',
            icon: 'none'
          });
        })
        .catch(err => {
          console.error('更新状态失败:', err);
        });
    }
  },

  // 开始定时更新位置
  startLocationUpdate() {
    if (this.data.locationUpdateTimer) return
    
    const updateLocation = async () => {
      try {
        const location = await this.getCurrentLocation()
        this.setData({
          latitude: location.latitude,
          longitude: location.longitude
        })
        
        // 更新司机位置到后端
        this.updateDriverLocation(location)
        
        // 如果有当前订单，刷新路线
        if (this.data.currentOrder) {
          this.refreshRoute()
        }
      } catch (error) {
        console.error('更新位置失败', error)
      }
    }
    
    // 立即执行一次
    updateLocation()
    // 设置30秒更新一次位置
    this.data.locationUpdateTimer = setInterval(updateLocation, 30000)
  },

  // 停止定时更新位置
  stopLocationUpdate() {
    if (this.data.locationUpdateTimer) {
      clearInterval(this.data.locationUpdateTimer)
      this.data.locationUpdateTimer = null
    }
  },

  // 更新司机位置到后端
  async updateDriverLocation(location) {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.id) {
        await api.updateLocation(
          userInfo.id,
          location.latitude,
          location.longitude
        );
        console.log('位置更新成功');
      }
    } catch (error) {
      console.error('位置更新失败', error);
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
          if (this.data.currentOrder && this.data.currentOrder.id) {
            api.cancelOrder(this.data.currentOrder.id, '司机主动取消')
              .then(res => {
                if (res.code === 200) {
                  // 清除当前订单信息
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
                  });
                  
                  wx.showToast({
                    title: '已撤销订单',
                    icon: 'success'
                  });
                } else {
                  wx.showToast({
                    title: res.message || '取消订单失败',
                    icon: 'none'
                  });
                }
              })
              .catch(err => {
                console.error('取消订单失败:', err);
                wx.showToast({
                  title: '取消订单失败',
                  icon: 'none'
                });
              });
          }
        }
      }
    });
  },

  // 刷新路线规划
  refreshRoute() {
    if (!this.data.currentOrder) return
    
    let { deliveryLatitude, deliveryLongitude, deliveryAddress } = this.data.currentOrder
    
    // 检查是否有有效的经纬度信息
    if (!deliveryLatitude || !deliveryLongitude) {
      console.log('订单缺少经纬度信息，尝试通过地址解析获取:', deliveryAddress);
      
      // 如果有地址但没有经纬度，使用地址解析获取经纬度
      if (deliveryAddress) {
        wx.showLoading({
          title: '解析地址中...',
          mask: true
        });
        
        // 使用腾讯地图SDK进行地址解析
        qqmapsdk.geocoder({
          address: deliveryAddress,
          success: (res) => {
            wx.hideLoading();
            if (res.status === 0 && res.result.location) {
              // 解析成功，更新经纬度
              const location = res.result.location;
              console.log('地址解析成功:', location);
              
              // 更新当前订单经纬度
              this.data.currentOrder.deliveryLatitude = location.lat;
              this.data.currentOrder.deliveryLongitude = location.lng;
              
              // 使用解析后的经纬度重新调用路线规划
              this.doRefreshRoute(location.lat, location.lng);
            } else {
              console.error('地址解析失败:', res);
              // 解析失败时使用默认位置
              this.handleRouteWithDefaultLocation();
            }
          },
          fail: (error) => {
            wx.hideLoading();
            console.error('地址解析错误:', error);
            // 解析失败时使用默认位置
            this.handleRouteWithDefaultLocation();
          }
        });
      } else {
        // 没有地址也没有经纬度，使用默认位置
        this.handleRouteWithDefaultLocation();
      }
    } else {
      // 已有经纬度，直接规划路线
      this.doRefreshRoute(deliveryLatitude, deliveryLongitude);
    }
  },
  
  // 使用默认位置进行路线规划
  handleRouteWithDefaultLocation() {
    wx.showToast({
      title: '无法获取目的地位置，请重试',
      icon: 'none',
      duration: 2000
    });
    
    // 提示用户操作失败，不再使用默认坐标
    wx.showModal({
      title: '地址解析失败',
      content: '无法获取配送地址的坐标信息，请联系管理员更新地址信息',
      showCancel: false
    });
    
    // 不再继续路线规划
    if (this.data.currentOrder) {
      this.setData({
        polyline: [],
        markers: []
      });
    }
  },
  
  // 实际执行路线规划
  doRefreshRoute(destLat, destLng) {
    try {
      // 调用后端路线规划API
      api.getRoute(
        this.data.latitude,
        this.data.longitude,
        destLat,
        destLng
      )
        .then(res => {
          console.log('后端路线规划返回:', res);
          
          if (res.code === 200) {
            const routeData = res.data;
            // 处理路线数据
            if (routeData.polyline) {
              // 处理路线坐标点
              this.renderRouteFromBackend(routeData);
            }
            // 更新距离和时间信息
            // duration已经是分钟单位，直接使用
            const durationText = `${routeData.duration}分钟`;
            this.setData({
              routeDistance: routeData.distance ? (routeData.distance / 1000).toFixed(1) : '0.0',
              routeTime: durationText
            });
          } else {
            console.warn('后端路线规划接口返回错误:', res.message);
            // 接口调用失败，使用简单路线
            this.renderSimpleRoute({
              from: {
                latitude: this.data.latitude,
                longitude: this.data.longitude
              },
              to: {
                latitude: destLat,
                longitude: destLng
              }
            });
            
            // 计算简单的距离和时间估计
            const distance = this.calculateDistance(
              this.data.latitude, this.data.longitude,
              destLat, destLng
            );
            
            // 更新路线信息
            const distanceKm = (distance / 1000).toFixed(1);
            const timeMinutes = this.estimateDuration(distance);
            
            this.setData({
              routeDistance: distanceKm,
              routeTime: timeMinutes
            });
          }
        })
        .catch(err => {
          console.error('调用后端路线规划接口失败:', err);
          // 失败时使用简单路线
          this.renderSimpleRoute({
            from: {
              latitude: this.data.latitude,
              longitude: this.data.longitude
            },
            to: {
              latitude: destLat,
              longitude: destLng
            }
          });
          
          // 计算简单的距离和时间估计
          const distance = this.calculateDistance(
            this.data.latitude, this.data.longitude,
            destLat, destLng
          );
          
          // 更新路线信息
          const distanceKm = (distance / 1000).toFixed(1);
          const timeMinutes = this.estimateDuration(distance);
          
          this.setData({
            routeDistance: distanceKm,
            routeTime: timeMinutes
          });
        });
    } catch (error) {
      console.error('路线规划失败:', error);
      wx.showToast({
        title: '路线规划失败',
        icon: 'none'
      });
      
      // 错误时使用简单路线
      this.renderSimpleRoute({
        from: {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        },
        to: {
          latitude: destLat,
          longitude: destLng
        }
      });
    }
  },
  
  // 正确处理后端返回的路线数据
  renderRouteFromBackend(routeData) {
    let points = [];
    
    if (routeData.polyline && Array.isArray(routeData.polyline)) {
      // 后端返回的polyline格式为[[lng,lat], [lng,lat], ...]
      points = routeData.polyline.map(point => ({
        longitude: point[0],  // 经度
        latitude: point[1]    // 纬度
      }));
    }
    
    // 如果没有足够的路线点，使用简单路线
    if (points.length < 2) {
      console.warn('未能从后端获取有效路线数据，使用简单路线');
      this.renderSimpleRoute({
        from: {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        },
        to: {
          latitude: this.data.currentOrder.deliveryLatitude,
          longitude: this.data.currentOrder.deliveryLongitude
        }
      });
      return;
    }
    
    // 创建起点和终点标记
    const markers = [
      // 起点标记
      {
        id: 0,
        longitude: this.data.longitude,
        latitude: this.data.latitude,
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
        longitude: this.data.currentOrder.deliveryLongitude,
        latitude: this.data.currentOrder.deliveryLatitude,
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
    ];
    
    // 设置路线和标记
    this.setData({
      polyline: [{
        points: points,
        color: '#3A7FED',
        width: 6,
        arrowLine: true
      }],
      markers: markers
    });
    
    // 缩放地图以包含起点和终点
    this.includePoints(points);
  },
  
  // 缩放地图以包含所有点
  includePoints(points) {
    if (!points || points.length < 2) return;
    
    console.log('缩放地图以包含所有点');
    
    try {
      const mapCtx = wx.createMapContext('deliveryMap', this);
      mapCtx.includePoints({
        points: points,
        padding: [80, 80, 80, 80]
      });
    } catch (error) {
      console.error('缩放地图失败:', error);
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
        const res = await api.completeOrder(this.data.currentOrder.id);
        if (res.code !== 200) {
          wx.showToast({
            title: res.message || '完成订单失败',
            icon: 'none'
          });
          return;
        }
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
  },

  // 反向地址解析 (坐标转地址)
  reverseGeocoder(lat, lng) {
    // 开发阶段，检查一下是否需要调用API以节省配额
    if (!app.globalData || !app.globalData.enableMapApiCalls) {
      console.log('地图API调用已暂时禁用，以节省配额');
      return;
    }
    
    // 限制调用频率，一分钟内同一位置只解析一次
    const now = Date.now();
    const locationKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    const lastCall = this.lastGeocoderCalls ? this.lastGeocoderCalls[locationKey] : 0;
    
    if (lastCall && now - lastCall < 60000) {
      console.log('短时间内重复请求同一位置，跳过API调用');
      return;
    }
    
    // 记录本次调用时间
    if (!this.lastGeocoderCalls) this.lastGeocoderCalls = {};
    this.lastGeocoderCalls[locationKey] = now;
    
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: (res) => {
        console.log('反向地址解析成功:', res);
        const addressInfo = res.result;
        // 可以在这里更新UI显示当前位置的地址信息
        // 例如：this.setData({ currentAddress: addressInfo.address });
      },
      fail: (error) => {
        console.error('反向地址解析失败:', error);
      }
    });
  },
  
  // 地址搜索功能
  searchAddress(keyword) {
    if (!keyword) return;
    
    // 开发阶段，检查一下是否需要调用API以节省配额
    if (!app.globalData || !app.globalData.enableMapApiCalls) {
      console.log('地图API调用已暂时禁用，以节省配额');
      return;
    }
    
    qqmapsdk.search({
      keyword: keyword,
      page_size: 10,
      success: (res) => {
        console.log('地址搜索成功:', res);
        const searchResults = res.data;
        // 可以使用搜索结果更新UI
        // 这里可以显示搜索结果列表供用户选择
      },
      fail: (error) => {
        console.error('地址搜索失败:', error);
        wx.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取新订单
  getNewOrders() {
    console.log('页面调用getNewOrders开始获取新订单...');
    
    api.getNewOrders()
      .then(res => {
        console.log('获取新订单结果:', res);
        
        if (res.code === 200 && res.data && res.data.length > 0) {
          console.log('成功获取到新订单数据:', res.data);
          
          // 获取第一个可用订单
          const newOrder = res.data[0];
          
          // 如果地址存在但经纬度不存在，通过地址解析获取经纬度
          if (newOrder.deliveryAddress && (!newOrder.deliveryLatitude || !newOrder.deliveryLongitude)) {
            console.log('订单缺少经纬度信息，开始通过地址解析获取:', newOrder.deliveryAddress);
            // 使用腾讯地图SDK进行地址解析
            qqmapsdk.geocoder({
              address: newOrder.deliveryAddress,
              success: (geoRes) => {
                console.log('地址解析成功:', geoRes);
                if (geoRes.status === 0 && geoRes.result.location) {
                  // 解析成功，使用解析结果
                  const location = geoRes.result.location;
                  this.receiveNewOrder({
                    id: newOrder.id,
                    orderNo: newOrder.orderNo,
                    customerPhone: newOrder.customerPhone || '',
                    deliveryAddress: newOrder.deliveryAddress,
                    // 使用解析得到的经纬度
                    deliveryLatitude: location.lat,
                    deliveryLongitude: location.lng,
                    statusText: '待接单',
                    nextActionText: '接单',
                    // 订单特定信息
                    goodsWeight: newOrder.goodsWeight,
                    deliveryFee: newOrder.deliveryFee
                  });
                  
                  console.log('地址解析结果:', location.lat, location.lng);
                } else {
                  // 解析失败，使用默认值并显示警告
                  console.error('地址解析失败，使用默认位置');
                  this.handleNewOrderWithDefaultLocation(newOrder);
                }
              },
              fail: (error) => {
                console.error('地址解析错误:', error);
                // 失败时使用默认值并显示警告
                this.handleNewOrderWithDefaultLocation(newOrder);
              }
            });
          } else {
            // 如果已有经纬度或没有地址，直接使用现有数据
            this.receiveNewOrder({
              id: newOrder.id,
              orderNo: newOrder.orderNo,
              customerPhone: newOrder.customerPhone || '',
              deliveryAddress: newOrder.deliveryAddress,
              deliveryLatitude: newOrder.deliveryLatitude,
              deliveryLongitude: newOrder.deliveryLongitude,
              statusText: '待接单',
              nextActionText: '接单',
              goodsWeight: newOrder.goodsWeight,
              deliveryFee: newOrder.deliveryFee
            });
          }
        } else {
          console.log('没有获取到新订单或订单为空');
          if (this.data.isOnline && !this.data.currentOrder) {
            wx.showToast({
              title: '暂无新订单',
              icon: 'none',
              duration: 1500
            });
          }
        }
      })
      .catch(err => {
        console.error('获取新订单失败:', err);
        wx.showToast({
          title: '获取订单失败',
          icon: 'none'
        });
      });
  },
  
  // 使用默认位置处理新订单
  handleNewOrderWithDefaultLocation(newOrder) {
    wx.showToast({
      title: '地址解析失败，请联系管理员',
      icon: 'none',
      duration: 2000
    });
    
    // 不再使用默认坐标，而是提示失败
    wx.showModal({
      title: '地址解析失败',
      content: '无法获取配送地址的坐标信息，请联系管理员更新地址信息',
      showCancel: false
    });
    
    // 取消当前操作，不显示新订单
    this.setData({
      newOrderVisible: false,
      newOrder: null
    });
  },
}) 