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
    hasMore: true
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
    const status = parseInt(e.currentTarget.dataset.status)
    this.setData({
      activeTab: status
    }, () => {
      this.loadOrders()
    })
  },

  // 加载订单列表
  loadOrders: function() {
    wx.showLoading({
      title: '加载中',
    })
    
    // 尝试调用API，如果失败则使用模拟数据
    // api.getOrderList(this.data.activeTab)
    //   .then(res => {
    //     wx.hideLoading()
    //     wx.stopPullDownRefresh()
    //     
    //     if (res.code === 200) {
    //       const orders = res.data || []
    //       
    //       // 格式化订单数据
    //       orders.forEach(order => {
    //         // 格式化时间
    //         if (order.createTime) {
    //           order.formattedTime = this.formatTime(new Date(order.createTime))
    //         }
    //         
    //         // 设置状态文本
    //         order.statusText = this.getStatusText(order.status)
    //       })
    //       
    //       this.setData({
    //         orders: orders
    //       })
    //     } else {
    //       wx.showToast({
    //         title: res.message || '获取订单失败',
    //         icon: 'none'
    //       })
    //     }
    //   })
    //   .catch(err => {
    //     console.error('获取订单列表失败:', err)
    //     wx.hideLoading()
    //     wx.stopPullDownRefresh()
    //     wx.showToast({
    //       title: '获取订单失败',
    //       icon: 'none'
    //     })
    //   })
    
    // 使用模拟数据（API未实现前临时使用）
    setTimeout(() => {
      const mockOrders = this.getMockOrders(this.data.activeTab)
      this.setData({
        orders: mockOrders
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }, 500)
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
        estimatedTime: 30
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
        estimatedTime: 20
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
        completedTime: new Date().getTime() - 82800000
      },
      {
        id: '10004',
        status: 3,  // 已取消
        createTime: new Date().getTime() - 172800000,
        pickupAddress: '南京市栖霞区文苑路9号',
        deliveryAddress: '南京市浦口区浦泗路120号',
        customerPhone: '13612345678',
        price: 45.5,
        distance: 12.3,
        estimatedTime: 60,
        cancelReason: '客户取消'
      }
    ]
    
    // 格式化订单时间和状态
    allOrders.forEach(order => {
      order.formattedTime = this.formatTime(new Date(order.createTime))
      order.statusText = this.getStatusText(order.status)
    })
    
    // 根据状态过滤订单
    if (status === 0) {  // 全部订单
      return allOrders
    } else {
      return allOrders.filter(order => order.status === status - 1)
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
    if (!userInfo || !userInfo.driverId) {
      // 未登录，跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/index'
      });
      return false;
    }
    return true;
  }
})