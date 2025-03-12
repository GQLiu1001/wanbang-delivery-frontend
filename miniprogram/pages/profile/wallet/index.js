Page({
  data: {
    balance: 0.00,
    currentTab: 0, // 0: 全部, 1: 收入, 2: 支出
    transactions: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad: function() {
    this.loadWalletInfo();
    this.loadTransactions();
  },

  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      transactions: [],
      hasMore: true
    });
    this.loadWalletInfo();
    this.loadTransactions().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreTransactions();
    }
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
  },

  // 加载交易记录
  loadTransactions: function() {
    return new Promise((resolve) => {
      this.setData({ loading: true });
      
      // 这里应该调用API获取交易记录
      // 模拟API调用
      setTimeout(() => {
        // 模拟数据
        const mockTransactions = [
          { id: 1, type: '配送收入', time: '2023-05-15 14:30', amount: 25.00, isIncome: true },
          { id: 2, type: '提现', time: '2023-05-14 16:45', amount: 100.00, isIncome: false },
          { id: 3, type: '配送收入', time: '2023-05-13 09:20', amount: 30.00, isIncome: true },
          { id: 4, type: '提现手续费', time: '2023-05-14 16:45', amount: 2.00, isIncome: false },
          { id: 5, type: '配送收入', time: '2023-05-12 11:10', amount: 28.50, isIncome: true }
        ];
        
        this.setData({
          transactions: mockTransactions,
          loading: false,
          hasMore: mockTransactions.length >= this.data.pageSize
        });
        
        resolve();
      }, 1000);
    });
  },

  // 加载更多交易记录
  loadMoreTransactions: function() {
    if (this.data.loading) return;
    
    this.setData({
      loading: true,
      page: this.data.page + 1
    });
    
    // 这里应该调用API获取更多交易记录
    // 模拟API调用
    setTimeout(() => {
      // 模拟数据
      const moreTransactions = [
        { id: 6, type: '配送收入', time: '2023-05-11 13:25', amount: 32.00, isIncome: true },
        { id: 7, type: '提现', time: '2023-05-10 17:30', amount: 150.00, isIncome: false },
        { id: 8, type: '提现手续费', time: '2023-05-10 17:30', amount: 3.00, isIncome: false }
      ];
      
      // 如果当前页大于3，模拟没有更多数据
      const hasMore = this.data.page < 3;
      
      this.setData({
        transactions: [...this.data.transactions, ...moreTransactions],
        loading: false,
        hasMore: hasMore
      });
    }, 1000);
  },

  // 切换标签
  switchTab: function(e) {
    const tabIndex = e.currentTarget.dataset.index;
    if (tabIndex === this.data.currentTab) return;
    
    this.setData({
      currentTab: tabIndex,
      page: 1,
      transactions: [],
      hasMore: true
    });
    
    this.loadTransactions();
  },

  // 提现
  goToWithdraw: function() {
    wx.showToast({
      title: '提现功能开发中',
      icon: 'none'
    });
    // 实际应该跳转到提现页面
    // wx.navigateTo({
    //   url: '/pages/profile/wallet/withdraw/index',
    // });
  },

  // 充值
  goToRecharge: function() {
    wx.showToast({
      title: '充值功能开发中',
      icon: 'none'
    });
    // 实际应该跳转到充值页面
    // wx.navigateTo({
    //   url: '/pages/profile/wallet/recharge/index',
    // });
  },

  // 查看交易详情
  viewTransactionDetail: function(e) {
    const transactionId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '交易详情功能开发中',
      icon: 'none'
    });
    // 实际应该跳转到交易详情页面
    // wx.navigateTo({
    //   url: `/pages/profile/wallet/transaction-detail/index?id=${transactionId}`,
    // });
  }
}) 