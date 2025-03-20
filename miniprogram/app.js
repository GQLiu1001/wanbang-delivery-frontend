// app.js
App({
  onLaunch() {
    // 引入位置选点插件
    this.globalData = {
      // 可以存储选点后返回的位置
      selectedLocation: null,
      userInfo: null,
      // 控制是否启用地图API调用，避免开发过程中超出配额
      enableMapApiCalls: false
    };
  }
});
