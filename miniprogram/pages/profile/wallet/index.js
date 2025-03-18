Page({
  data: {
    balance: 0.00
  },

  onLoad: function() {
    this.loadWalletInfo();
  },

  onPullDownRefresh: function() {
    this.loadWalletInfo();
    wx.stopPullDownRefresh();
  },

  // 加载钱包信息
  loadWalletInfo: function() {
    // 这里应该调用API获取钱包余额
    // 模拟API调用
    setTimeout(() => {
      this.setData({
        balance: 1234.56
      });
    }, 500);
  }
}) 