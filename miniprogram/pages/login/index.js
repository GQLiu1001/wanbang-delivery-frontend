// pages/login/index.js
const api = require('../../utils/api');

Page({
  data: {
    driverName: '',
    phone: '',
    isRegistering: false,
    isSubmitting: false,
    auditStatus: null, // null=未登录, 0=未审核, 1=已通过, 2=已拒绝
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      
      if (userInfo && userInfo.id) {
        // 如果已登录，则获取审核状态
        const res = await api.getAuditStatus();
        
        if (res.code === 200) {
          const auditStatus = res.data.auditStatus;
          
          if (auditStatus === 1) {
            // 已审核通过，直接跳转到首页
            wx.reLaunch({
              url: '/pages/map/index'
            });
          } else {
            // 设置审核状态
            this.setData({ auditStatus });
          }
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },

  // 输入框内容变化
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 切换到注册模式
  showRegisterForm() {
    this.setData({ isRegistering: true });
  },

  // 切换到登录模式
  showLoginForm() {
    this.setData({ isRegistering: false });
  },

  // 处理登录
  async handleLogin() {
    try {
      if (this.data.isSubmitting) return;
      
      // 表单验证
      if (!this.data.phone) {
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      this.setData({ isSubmitting: true });
      
      // 获取微信登录凭证
      const { code } = await wx.login();
      
      // 调用后端登录接口
      const res = await api.login(code, this.data.phone);
      
      if (res.code === 200) {
        // 保存token和用户信息到本地
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', res.data.driverInfo);
        
        // 判断审核状态
        if (res.data.driverInfo.audit_status === 1) {
          // 已审核通过，跳转到首页
          wx.reLaunch({
            url: '/pages/map/index'
          });
        } else {
          // 设置审核状态
          this.setData({ 
            auditStatus: res.data.driverInfo.audit_status,
            isSubmitting: false
          });
        }
      } else {
        wx.showToast({
          title: res.message || '登录失败，请检查手机号',
          icon: 'none'
        });
        this.setData({ isSubmitting: false });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      this.setData({ isSubmitting: false });
    }
  },

  // 处理注册
  async handleRegister() {
    try {
      if (this.data.isSubmitting) return;
      
      // 表单验证
      if (!this.data.driverName) {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.data.phone) {
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      this.setData({ isSubmitting: true });
      
      // 获取微信登录凭证
      const { code } = await wx.login();
      
      // 调用后端注册接口
      const res = await api.register({
        name: this.data.driverName,
        phone: this.data.phone,
        avatar: ''
      });
      
      if (res.code === 200) {
        // 设置审核状态
        this.setData({ 
          auditStatus: res.data.auditStatus,
          isSubmitting: false
        });
        
        wx.showToast({
          title: '注册成功，等待审核',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.message || '注册失败，请重试',
          icon: 'none'
        });
        this.setData({ isSubmitting: false });
      }
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: '注册失败，请重试',
        icon: 'none'
      });
      this.setData({ isSubmitting: false });
    }
  }
}); 