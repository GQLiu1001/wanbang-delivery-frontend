// pages/order/index.js
const api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'waiting',
    orders: [],
    loading: false,
    page: 1,
    hasMore: true,
    isMapPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!this.checkLoginStatus()) return;
    
    // 确保初始化后立即加载数据
    setTimeout(() => {
      this.loadOrders()
    }, 100)
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
    // 每次显示页面时刷新订单列表
    this.setData({
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
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
  onPullDownRefresh: function () {
    this.loadOrders()
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

  // 切换选项卡
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      page: 1,
      orders: [],
      hasMore: true
    }, () => {
      this.loadOrders()
    })
  },

  // 加载订单列表
  loadOrders: function() {
    wx.showLoading({
      title: '加载中',
    })
    
    // 获取订单状态对应的后端API状态值
    let orderStatus = null;
    switch(this.data.activeTab) {
      case 'waiting': // 待接单
        orderStatus = 2;
        break;
      case 'ongoing': // 配送中
        orderStatus = 3;
        break;
      case 'completed': // 已完成
        orderStatus = 4;
        break;
      case 'cancelled': // 已取消
        orderStatus = 5;
        break;
    }
    
    // 调用API获取订单列表
    api.getOrders(this.data.page, 10, orderStatus)
      .then(res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        
        console.log('API Response:', JSON.stringify(res));

        if (res.code === 200) {
          const orders = res.data.records || []
          
          console.log('Processed Orders Data:', JSON.stringify(orders));

          // 格式化订单数据
          orders.forEach(order => {
            // 格式化时间
            if (order.createTime) {
              order.formattedTime = this.formatTime(new Date(order.createTime))
            }
            
            // 设置状态文本
            order.statusText = this.getStatusText(order.deliveryStatus)
          })
          
          this.setData({
            orders: this.data.page === 1 ? orders : [...this.data.orders, ...orders],
            hasMore: orders.length === 10,
            page: this.data.page + 1
          })
        } else {
          wx.showToast({
            title: res.message || '获取订单失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('获取订单列表失败:', err)
        wx.hideLoading()
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '获取订单失败',
          icon: 'none'
        })
      })
  },

  // 加载更多订单
  loadMoreOrders() {
    this.loadOrders()
  },

  // 查看订单详情
  viewOrderDetail: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/miniprogram/pages/order-detail/index?id=' + orderId
    })
  },

  // 接单操作
  acceptOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认接单',
      content: '确定要接受这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          })
          
          // 调用接单API
          api.acceptOrder(orderId)
            .then(res => {
              wx.hideLoading()
              
              if (res.code === 200) {
                wx.showToast({
                  title: '接单成功',
                  icon: 'success'
                })
                
                // 刷新订单列表
                this.loadOrders()
                
                // 更新全局订单状态
                const app = getApp()
                if (app.globalData) {
                  app.globalData.currentOrder = res.data
                }
                
                // 延迟后跳转到地图页面
                setTimeout(() => {
                  wx.switchTab({
                    url: '/miniprogram/pages/map/index'
                  })
                }, 1500)
              } else {
                wx.showToast({
                  title: res.message || '接单失败',
                  icon: 'none'
                })
              }
            })
            .catch(err => {
              console.error('接单失败:', err)
              wx.hideLoading()
              wx.showToast({
                title: '接单失败，请重试',
                icon: 'none'
              })
            })
        }
      }
    })
  },

  // 完成订单
  completeOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认完成',
      content: '确定已完成该订单的配送吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          })
          
          // 调用完成订单API
          api.completeOrder(orderId)
            .then(res => {
              wx.hideLoading()
              
              if (res.code === 200) {
                wx.showToast({
                  title: '订单已完成',
                  icon: 'success'
                })
                
                // 更新订单列表
                this.loadOrders()
                
                // 更新全局订单状态
                const app = getApp()
                if (app.globalData) {
                  app.globalData.currentOrder = null
                }
              } else {
                wx.showToast({
                  title: res.message || '操作失败',
                  icon: 'none'
                })
              }
            })
            .catch(err => {
              console.error('完成订单失败:', err)
              wx.hideLoading()
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              })
            })
        }
      }
    })
  },

  // 取消订单
  cancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示取消原因选择
          this.setData({
            reasonSelectorVisible: true,
            selectedOrderId: orderId
          })
        }
      }
    })
  },

  // 提交取消原因
  submitCancelReason: function() {
    const reason = this.data.cancelReasons[this.data.selectedReasonIndex]
    
    if (this.data.selectedOrderId) {
      wx.showLoading({
        title: '处理中',
      })
      
      // 调用取消订单API
      api.cancelOrder(this.data.selectedOrderId, reason)
        .then(res => {
          wx.hideLoading()
          
          if (res.code === 200) {
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            
            // 更新订单列表
            this.loadOrders()
            
            // 如果取消的是当前正在配送的订单，清除全局状态
            const app = getApp()
            if (app.globalData && app.globalData.currentOrder && 
                app.globalData.currentOrder.id === this.data.selectedOrderId) {
              app.globalData.currentOrder = null
            }
          } else {
            wx.showToast({
              title: res.message || '取消失败',
              icon: 'none'
            })
          }
        })
        .catch(err => {
          console.error('取消订单失败:', err)
          wx.hideLoading()
          wx.showToast({
            title: '取消失败，请重试',
            icon: 'none'
          })
        })
        .finally(() => {
          // 关闭选择器
          this.hideReasonSelector()
        })
    }
  },

  // 获取模拟订单数据
  getMockOrders: function(status) {
    // 所有状态的订单
    const allOrders = [
      {
        id: '10001',
        status: 0,  // 待接单
        createTime: new Date().getTime() - 3600000,
        pickupAddress: '南京市江宁区胜太路58号',
        deliveryAddress: '南京市建邺区奥体大街168号',
        customerPhone: '13812345678',
        price: 18.8,
        distance: 5.2,
        estimatedTime: 30,
        weight: '2.5吨',
        goodsType: '建材'
      },
      {
        id: '10002',
        status: 1,  // 已接单，配送中
        createTime: new Date().getTime() - 7200000,
        pickupAddress: '南京市玄武区珠江路88号',
        deliveryAddress: '南京市鼓楼区中山北路321号',
        customerPhone: '13912345678',
        price: 25.5,
        distance: 3.8,
        estimatedTime: 20,
        weight: '1.8吨',
        goodsType: '钢材'
      },
      {
        id: '10003',
        status: 2,  // 已完成
        createTime: new Date().getTime() - 86400000,
        pickupAddress: '南京市雨花台区小行路36号',
        deliveryAddress: '南京市秦淮区光华路5号',
        customerPhone: '13712345678',
        price: 32.0,
        distance: 7.5,
        estimatedTime: 45,
        completedTime: new Date().getTime() - 82800000,
        weight: '3.2吨',
        goodsType: '建材'
      },
      {
        id: '10005',
        status: 0,  // 待接单
        createTime: new Date().getTime() - 1800000,
        pickupAddress: '南京市江宁区东山街道',
        deliveryAddress: '南京市雨花台区软件大道',
        customerPhone: '13888888888',
        price: 28.5,
        distance: 6.8,
        estimatedTime: 35,
        weight: '2.8吨',
        goodsType: '钢筋'
      },
      {
        id: '10006',
        status: 1,  // 配送中
        createTime: new Date().getTime() - 5400000,
        pickupAddress: '南京市栖霞区仙林大学城',
        deliveryAddress: '南京市江宁区百家湖',
        customerPhone: '13777777777',
        price: 42.0,
        distance: 8.5,
        estimatedTime: 50,
        weight: '4.0吨',
        goodsType: '水泥'
      },
      {
        id: '10007',
        status: 2,  // 已完成
        createTime: new Date().getTime() - 172800000,
        pickupAddress: '南京市浦口区浦口大道',
        deliveryAddress: '南京市六合区大厂街道',
        customerPhone: '13666666666',
        price: 55.0,
        distance: 15.2,
        estimatedTime: 70,
        completedTime: new Date().getTime() - 169200000,
        weight: '5.5吨',
        goodsType: '混凝土'
      },
      {
        id: '10008',
        status: 0,  // 待接单
        createTime: new Date().getTime() - 2700000,
        pickupAddress: '南京市溧水区柘塘街道',
        deliveryAddress: '南京市高淳区淳溪街道',
        customerPhone: '13555555555',
        price: 68.0,
        distance: 18.5,
        estimatedTime: 80,
        weight: '6.0吨',
        goodsType: '钢材'
      }
    ]
    
    // 格式化订单时间和状态
    allOrders.forEach(order => {
      order.formattedTime = this.formatTime(new Date(order.createTime))
      order.statusText = this.getStatusText(order.status)
    })
    
    // 根据activeTab过滤订单
    switch(status) {
      case 'waiting':
        return allOrders.filter(order => order.status === 0);
      case 'ongoing':
        return allOrders.filter(order => order.status === 1);
      case 'completed':
        return allOrders.filter(order => order.status === 2);
      default:
        return allOrders;
    }
  },
  
  // 格式化时间为 MM-DD HH:MM
  formatTime: function(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    return [
      month.toString().padStart(2, '0'),
      day.toString().padStart(2, '0')
    ].join('-') + ' ' + [
      hour.toString().padStart(2, '0'),
      minute.toString().padStart(2, '0')
    ].join(':')
  },
  
  // 根据状态码获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      0: '待接单',
      1: '配送中',
      2: '已完成',
      3: '已取消'
    }
    return statusMap[status] || '未知状态'
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

  // 处理订单操作按钮的显示逻辑
  processOrderActions(order) {
    // 根据订单状态设置按钮显示
    let actions = [];
    
    // 只在地图页面显示这些操作按钮，订单列表页面不显示
    if (this.data.isMapPage) {
      switch(order.status) {
        case 1: // 待接单
          actions = ['accept'];
          break;
        case 2: // 配送中
          actions = ['navigate', 'cancel', 'complete'];
          break;
        // 其他状态...
      }
    }
    
    return {
      ...order,
      actions: actions
    };
  },

  // 渲染订单列表
  renderOrders(orders) {
    const processedOrders = orders.map(order => {
      // 添加状态文本
      let statusText = '';
      switch(order.status) {
        case 1:
          statusText = '待接单';
          break;
        case 2:
          statusText = '配送中';
          break;
        case 3:
          statusText = '已完成';
          break;
        case 4:
          statusText = '已取消';
          break;
        default:
          statusText = '未知状态';
      }
      
      return {
        ...order,
        statusText: statusText,
        // 配送中状态下不显示任何操作按钮
        showActions: order.status !== 2
      };
    });
    
    this.setData({
      orders: processedOrders
    });
  }
})