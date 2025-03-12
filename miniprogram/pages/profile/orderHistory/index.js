// pages/profile/orderHistory/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'all',
    orders: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadOrders()
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
      //   name: 'getHistoryOrders',
      //   data: {
      //     status: this.data.activeTab,
      //     page: this.data.page,
      //     size: 10
      //   }
      // })
      
      // 模拟数据
      const mockOrders = this.getMockOrders(this.data.activeTab)
      
      setTimeout(() => {
        this.setData({
          orders: this.data.page === 1 ? mockOrders : [...this.data.orders, ...mockOrders],
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

  // 获取模拟订单数据
  getMockOrders(status) {
    const statusMap = {
      'all': ['已完成', '已取消'],
      'completed': ['已完成'],
      'canceled': ['已取消']
    }
    
    const orders = []
    const count = Math.min(10, Math.floor(Math.random() * 10) + 1)
    
    for (let i = 0; i < count; i++) {
      const statusText = statusMap[status][Math.floor(Math.random() * statusMap[status].length)]
      
      // 生成随机日期（过去30天内）
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))
      const deliveryTime = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      
      orders.push({
        id: `order_${Date.now()}_${i}`,
        deliveryNo: `D${Date.now().toString().substr(-8)}${i}`,
        customerName: `客户${i + 1}`,
        customerPhone: `1381234${(1000 + i).toString().substr(-4)}`,
        deliveryAddress: `杭州市西湖区文三路${100 + i}号`,
        deliveryFee: (15 + Math.random() * 10).toFixed(2),
        deliveryTime: deliveryTime,
        statusText: statusText
      })
    }
    
    return orders
  }
})