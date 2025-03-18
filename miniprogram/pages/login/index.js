// pages/login/index.js
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
      
      if (userInfo && userInfo.driverId) {
        // 如果已登录，则获取审核状态
        // TODO: 调用后端接口获取审核状态
        // const res = await wx.cloud.callFunction({
        //   name: 'getDriverAuditStatus',
        //   data: { driverId: userInfo.driverId }
        // });
        // const auditStatus = res.result.auditStatus;
        
        // 模拟数据
        const auditStatus = 1; // 假设已审核通过
        
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
      
      // TODO: 调用后端登录接口
      // const res = await wx.cloud.callFunction({
      //   name: 'login',
      //   data: {
      //     code,
      //     phone: this.data.phone
      //   }
      // });
      
      // 模拟登录成功响应
      const res = {
        result: {
          success: true,
          data: {
            driverId: '123456',
            driverName: '张三',
            avatar: '',
            auditStatus: 1 // 1=已通过
          }
        }
      };
      
      if (res.result.success) {
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', res.result.data);
        
        // 判断审核状态
        if (res.result.data.auditStatus === 1) {
          // 已审核通过，跳转到首页
          wx.reLaunch({
            url: '/pages/map/index'
          });
        } else {
          // 设置审核状态
          this.setData({ 
            auditStatus: res.result.data.auditStatus,
            isSubmitting: false
          });
        }
      } else {
        wx.showToast({
          title: '登录失败，请检查手机号',
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
      
      // TODO: 调用后端注册接口
      // const res = await wx.cloud.callFunction({
      //   name: 'register',
      //   data: {
      //     code,
      //     driverName: this.data.driverName,
      //     phone: this.data.phone
      //   }
      // });
      
      // 模拟注册成功响应
      const res = {
        result: {
          success: true,
          data: {
            driverId: '123456',
            driverName: this.data.driverName,
            avatar: '',
            auditStatus: 0 // 0=未审核
          }
        }
      };
      
      if (res.result.success) {
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', res.result.data);
        
        // 设置审核状态
        this.setData({ 
          auditStatus: res.result.data.auditStatus,
          isSubmitting: false
        });
        
        wx.showToast({
          title: '注册成功，等待审核',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '注册失败，请重试',
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