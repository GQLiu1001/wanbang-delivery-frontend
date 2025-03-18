// pages/order/index.js
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

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    
    this.setData({
      activeTab: tab,
      orders: [],
      page: 1,
      hasMore: true
    })
    
    this.loadOrders()
  },

  // 加载订单列表
  async loadOrders() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      // TODO: 调用后端接口获取订单列表
      // const res = await wx.cloud.callFunction({
      //   name: 'getOrders',
      //   data: {
      //     status: this.data.activeTab,
      //     page: this.data.page,
      //     size: 10
      //   }
      // })
      
      // 模拟数据
      const mockOrders = this.getMockOrders(this.data.activeTab) || []
      
      setTimeout(() => {
        this.setData({
          orders: this.data.page === 1 ? mockOrders : [...(this.data.orders || []), ...mockOrders],
          loading: false,
          page: this.data.page + 1,
          hasMore: mockOrders.length === 10
        })
      }, 500)
    } catch (error) {
      console.error('获取订单列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '获取订单失败',
        icon: 'none'
      })
    }
  },

  // 加载更多订单
  loadMoreOrders() {
    this.loadOrders()
  },

  // 接单
  async acceptOrder(e) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) return
    
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({
        title: '订单信息无效',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认接单',
      content: '确定要接此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用后端接口接单
            // await wx.cloud.callFunction({
            //   name: 'acceptOrder',
            //   data: { orderId }
            // })
            
            wx.showToast({
              title: '接单成功',
              icon: 'success'
            })
            
            // 刷新订单列表
            this.setData({
              page: 1,
              orders: [],
              hasMore: true
            })
            this.loadOrders()
          } catch (error) {
            console.error('接单失败:', error)
            wx.showToast({
              title: '接单失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 完成配送
  async completeOrder(e) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) return
    
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({
        title: '订单信息无效',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认完成',
      content: '确认已完成配送？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用后端接口完成订单
            // await wx.cloud.callFunction({
            //   name: 'completeOrder',
            //   data: { orderId }
            // })
            
            wx.showToast({
              title: '配送完成',
              icon: 'success'
            })
            
            // 刷新订单列表
            this.setData({
              page: 1,
              orders: [],
              hasMore: true
            })
            this.loadOrders()
          } catch (error) {
            console.error('完成配送失败:', error)
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 取消订单
  async cancelOrder(e) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) return
    
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({
        title: '订单信息无效',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？取消后无法恢复',
      success: async (res) => {
        if (res.confirm) {
          try {
            // TODO: 调用后端接口取消订单
            // await wx.cloud.callFunction({
            //   name: 'cancelOrder',
            //   data: { orderId }
            // })
            
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            
            // 刷新订单列表
            this.setData({
              page: 1,
              orders: [],
              hasMore: true
            })
            this.loadOrders()
          } catch (error) {
            console.error('取消订单失败:', error)
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 导航到地图
  navigateToMap(e) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) return
    
    const orderId = e.currentTarget.dataset.id
    if (!orderId) {
      wx.showToast({
        title: '订单信息无效',
        icon: 'none'
      })
      return
    }
    
    // 跳转到地图页面并传递订单ID
    wx.switchTab({
      url: '/pages/map/index'
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    // TODO: 跳转到订单详情页面
  },

  // 获取模拟订单数据
  getMockOrders(status) {
    const statusMap = {
      'waiting': {
        status: 2,
        statusText: '待接单'
      },
      'ongoing': {
        status: 3,
        statusText: '配送中'
      },
      'completed': {
        status: 4,
        statusText: '已完成'
      }
    }
    
    // 如果status不在statusMap中，使用waiting作为默认值
    const currentStatus = statusMap[status] || statusMap['waiting']
    
    const orders = []
    // 确保至少返回1条数据
    const count = status === 'waiting' ? 
                  Math.min(10, Math.floor(Math.random() * 10) + 3) : 
                  Math.min(10, Math.floor(Math.random() * 5) + 1)
    
    for (let i = 0; i < count; i++) {
      orders.push({
        id: `order_${Date.now()}_${i}`,
        deliveryNo: `D${Date.now().toString().substr(-8)}${i}`,
        customerName: `客户${i + 1}`,
        customerPhone: `1381234${(1000 + i).toString().substr(-4)}`,
        deliveryAddress: `杭州市西湖区文三路${100 + i}号`,
        tonnage: (Math.random() * 5 + 1).toFixed(1),
        deliveryFee: (15 + Math.random() * 10).toFixed(2),
        status: currentStatus.status,
        statusText: currentStatus.statusText
      })
    }
    
    return orders
  }
})