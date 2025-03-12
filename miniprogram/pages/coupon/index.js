// pages/coupon/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'available',
    coupons: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadCoupons()
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
    // 每次显示页面时刷新优惠券列表
    this.loadCoupons()
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
      activeTab: tab
    })
    
    this.loadCoupons()
  },

  // 加载优惠券列表
  async loadCoupons() {
    try {
      // TODO: 调用后端接口获取优惠券列表
      // const res = await wx.cloud.callFunction({
      //   name: 'getCoupons',
      //   data: {
      //     status: this.data.activeTab
      //   }
      // })
      
      // 模拟数据
      const mockCoupons = this.getMockCoupons(this.data.activeTab)
      
      this.setData({
        coupons: mockCoupons
      })
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
      wx.showToast({
        title: '获取优惠券失败',
        icon: 'none'
      })
    }
  },

  // 获取模拟优惠券数据
  getMockCoupons(status) {
    const coupons = []
    const count = Math.floor(Math.random() * 5) + (status === 'available' ? 3 : 0)
    
    const couponTypes = [
      { name: '新司机优惠券', description: '新司机首单可用' },
      { name: '周末特惠券', description: '周末配送可用' },
      { name: '长途配送券', description: '配送距离超过10公里可用' },
      { name: '满减优惠券', description: '订单满额可用' },
      { name: '节日特惠券', description: '节假日可用' }
    ]
    
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    
    for (let i = 0; i < count; i++) {
      const startDate = new Date(now.getTime() - (status === 'expired' ? 30 : 0) * oneDay)
      const endDate = new Date(startDate.getTime() + (status === 'expired' ? 15 : 30) * oneDay)
      
      const formatDate = (date) => {
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
      }
      
      coupons.push({
        id: `coupon_${Date.now()}_${i}`,
        name: couponTypes[i % couponTypes.length].name,
        description: couponTypes[i % couponTypes.length].description,
        amount: (Math.floor(Math.random() * 10) + 5).toString(),
        minAmount: (Math.floor(Math.random() * 5) + 1) * 10,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        status: status
      })
    }
    
    return coupons
  }
})