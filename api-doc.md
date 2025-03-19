# 万邦送货小程序 API接口文档

## 基础信息

- 基础URL: `https://api.wanbang-delivery.com` (示例)
- 请求格式: JSON
- 响应格式: JSON
- 鉴权方式: Bearer Token

## 通用响应格式

```json
{
  "code": 200,               // 状态码: 200成功, 400请求错误, 401未授权, 500服务器错误
  "message": "success",      // 状态描述
  "data": {                  // 响应数据
    // 具体响应数据
  }
}
```

## 1. 认证相关接口

### 1.1 司机登录

- **接口路径**: `/api/driver/login`
- **请求方式**: POST
- **功能说明**: 司机通过手机号和微信凭证登录
- **请求参数**:

```json
{
  "code": "wx_login_code",    // 微信登录凭证
  "phone": "13800138000"      // 手机号
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "driverId": "12345",      // 司机ID
    "driverName": "张三",     // 司机姓名
    "avatar": "https://...",  // 头像URL
    "token": "jwt_token...",  // 登录令牌
    "auditStatus": 1          // 审核状态(0=未审核,1=已通过,2=已拒绝)
  }
}
```

### 1.2 司机注册

- **接口路径**: `/api/driver/register`
- **请求方式**: POST
- **功能说明**: 司机首次登录进行注册
- **请求参数**:

```json
{
  "code": "wx_login_code",    // 微信登录凭证
  "driverName": "张三",       // 司机姓名
  "phone": "13800138000",     // 手机号
  "avatarUrl": "https://..."  // 头像URL(可选,来自getUserProfile接口)
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "driverId": "12345",      // 司机ID
    "driverName": "张三",     // 司机姓名
    "avatar": "https://...",  // 头像URL
    "token": "jwt_token...",  // 登录令牌
    "auditStatus": 0          // 审核状态(0=未审核)
  }
}
```

### 1.3 获取审核状态

- **接口路径**: `/api/driver/audit-status`
- **请求方式**: GET
- **功能说明**: 获取司机审核状态
- **请求参数**: 无 (通过Token识别司机)
- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "auditStatus": 1,          // 审核状态(0=未审核,1=已通过,2=已拒绝)
    "auditRemark": "审核通过"  // 审核备注
  }
}
```

### 1.4 刷新Token

- **接口路径**: `/api/driver/refresh-token`
- **请求方式**: POST
- **功能说明**: 刷新登录令牌
- **请求参数**:

```json
{
  "token": "current_token_string"  // 当前令牌
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "new_jwt_token...",  // 新的登录令牌
    "expireIn": 7200              // 令牌有效期(秒)
  }
}
```

### 1.5 退出登录

- **接口路径**: `/api/driver/logout`
- **请求方式**: POST
- **功能说明**: 司机退出登录
- **请求参数**: 无 (通过Token识别司机)
- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

## 2. 司机信息接口

### 2.1 获取司机信息

- **接口路径**: `/api/driver/info`
- **请求方式**: GET
- **功能说明**: 获取当前登录司机的详细信息
- **请求参数**: 无 (通过Token识别司机)
- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "driverId": "12345",          // 司机ID
    "driverName": "张三",         // 司机姓名
    "phone": "13800138000",       // 手机号
    "avatar": "https://...",      // 头像URL
    "orderCount": 156,            // 总单数
    "monthlyIncome": 8520.50,     // 月收入
    "balance": 3500.75            // 钱包余额
  }
}
```

### 2.2 更新司机信息

- **接口路径**: `/api/driver/update-info`
- **请求方式**: POST
- **功能说明**: 更新司机个人信息
- **请求参数**:

```json
{
  "driverName": "李四",        // 司机姓名
  "phone": "13900139000",      // 手机号
  "avatar": "https://..."      // 头像URL (可选)
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "driverId": "12345",       // 司机ID
    "driverName": "李四",      // 更新后的司机姓名
    "phone": "13900139000",    // 更新后的手机号
    "avatar": "https://...",   // 更新后的头像URL
    "auditStatus": 0           // 审核状态(更新信息后重新变为未审核)
  }
}
```

### 2.3 获取钱包余额

- **接口路径**: `/api/driver/wallet`
- **请求方式**: GET
- **功能说明**: 获取司机钱包余额
- **请求参数**: 无 (通过Token识别司机)
- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "balance": 3500.75,          // 钱包余额
    "totalIncome": 15800.50,     // 总收入
    "monthlyIncome": 3200.25     // 本月收入
  }
}
```

## 3. 位置与状态接口

### 3.1 更新司机位置

- **接口路径**: `/api/driver/location`
- **请求方式**: POST
- **功能说明**: 每5秒更新司机位置信息
- **请求参数**:

```json
{
  "latitude": 31.230416,      // 纬度
  "longitude": 121.473701,    // 经度
  "speed": 45.5,              // 速度(km/h, 可选)
  "accuracy": 10.0            // 精度(米, 可选)
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 3.2 更新司机工作状态

- **接口路径**: `/api/driver/status`
- **请求方式**: POST
- **功能说明**: 更新司机工作状态(在线/离线/忙碌)
- **请求参数**:

```json
{
  "workStatus": 1    // 工作状态(1=在线/空闲,2=忙碌,3=离线)
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "workStatus": 1  // 更新后的工作状态
  }
}
```

## 4. 订单相关接口

### 4.1 获取订单列表

- **接口路径**: `/api/order/list`
- **请求方式**: GET
- **功能说明**: 获取司机订单列表
- **请求参数**: 

```
status: 订单状态(waiting=待接单,delivering=配送中,completed=已完成)
page: 页码, 从1开始
size: 每页条数
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 125,               // 总记录数
    "pages": 13,                // 总页数
    "current": 1,               // 当前页码
    "records": [                // 订单记录列表
      {
        "orderId": "1001",                    // 订单ID
        "orderNo": "WB202405010001",          // 订单编号(与系统端一致)
        "customerName": "王五",               // 客户姓名
        "customerPhone": "13700137000",       // 客户电话
        "deliveryAddress": "上海市浦东新区XX路",  // 配送地址
        "deliveryStatus": 2,                  // 配送状态(1=待派送,2=待接单,3=配送中,4=已完成,5=已取消)
        "deliveryFee": 80.00,                 // 配送费用
        "goodsWeight": 2.5,                   // 货物重量(吨)
        "createTime": "2024-05-01 10:00:00"   // 创建时间
      },
      // 更多订单...
    ]
  }
}
```

### 4.2 获取待接单列表

- **接口路径**: `/api/order/available`
- **请求方式**: GET
- **功能说明**: 获取可接单的订单列表
- **请求参数**: 

```
page: 页码, 从1开始
size: 每页条数
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,                // 总记录数
    "pages": 2,                 // 总页数
    "current": 1,               // 当前页码
    "records": [                // 订单记录列表
      {
        "orderId": "1001",                    // 订单ID
        "orderNo": "WB202405010001",          // 订单编号
        "customerName": "王五",               // 客户姓名
        "deliveryAddress": "上海市浦东新区XX路",  // 配送地址
        "deliveryFee": 80.00,                 // 配送费用
        "goodsWeight": 2.5,                   // 货物重量(吨)
        "expiresAt": "2024-05-01 10:10:00",   // 抢单截止时间(1分钟内)
        "distance": 5.2                       // 距离(公里, 可选)
      },
      // 更多订单...
    ]
  }
}
```

### 4.3 接单

- **接口路径**: `/api/order/accept`
- **请求方式**: POST
- **功能说明**: 司机接单
- **请求参数**:

```json
{
  "orderId": "1001"    // 订单ID
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "1001",                      // 订单ID
    "orderNo": "WB202405010001",            // 订单编号
    "customerName": "王五",                 // 客户姓名
    "customerPhone": "13700137000",         // 客户电话
    "deliveryAddress": "上海市浦东新区XX路", // 配送地址
    "deliveryLatitude": 31.230416,          // 配送地址纬度
    "deliveryLongitude": 121.473701,        // 配送地址经度
    "deliveryFee": 80.00,                   // 配送费用
    "goodsWeight": 2.5,                     // 货物重量(吨)
    "route": {                              // 路线信息(腾讯位置服务返回)
      "distance": 8.5,                      // 距离(公里)
      "duration": 35,                       // 预计时间(分钟)
      "polyline": "..."                     // 路线坐标串
    }
  }
}
```

### 4.4 完成订单

- **接口路径**: `/api/order/complete`
- **请求方式**: POST
- **功能说明**: 司机完成订单
- **请求参数**:

```json
{
  "orderId": "1001"    // 订单ID
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "1001",              // 订单ID
    "deliveryStatus": 4,            // 更新后的状态(4=已完成)
    "completedTime": "2024-05-01 11:30:00",  // 完成时间
    "earnedFee": 80.00              // 获得配送费
  }
}
```

### 4.5 取消订单

- **接口路径**: `/api/order/cancel`
- **请求方式**: POST
- **功能说明**: 司机取消订单
- **请求参数**:

```json
{
  "orderId": "1001",             // 订单ID
  "cancelReason": "道路拥堵"      // 取消原因(可选)
}
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "1001",              // 订单ID
    "deliveryStatus": 5,            // 更新后的状态(5=已取消)
    "cancelledTime": "2024-05-01 10:45:00"  // 取消时间
  }
}
```

### 4.6 订单详情

- **接口路径**: `/api/order/detail`
- **请求方式**: GET
- **功能说明**: 获取订单详情
- **请求参数**: 

```
orderId: 订单ID
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": "1001",                      // 订单ID
    "orderNo": "WB202405010001",            // 订单编号
    "customerName": "王五",                 // 客户姓名
    "customerPhone": "13700137000",         // 客户电话
    "deliveryAddress": "上海市浦东新区XX路",  // 配送地址
    "deliveryLatitude": 31.230416,          // 配送地址纬度
    "deliveryLongitude": 121.473701,        // 配送地址经度
    "deliveryStatus": 3,                    // 配送状态
    "deliveryFee": 80.00,                   // 配送费用
    "goodsWeight": 2.5,                     // 货物重量(吨)
    "createTime": "2024-05-01 10:00:00",    // 创建时间
    "acceptTime": "2024-05-01 10:05:00",    // 接单时间
    "completeTime": null,                   // 完成时间
    "cancelTime": null                      // 取消时间
  }
}
```

### 4.7 接收新订单推送

- **接口路径**: WebSocket `/api/ws/order`
- **请求方式**: WebSocket
- **功能说明**: 接收新订单推送(RabbitMQ)
- **消息格式**:

```json
{
  "type": "NEW_ORDER",           // 消息类型
  "data": {
    "orderId": "1001",                    // 订单ID
    "orderNo": "WB202405010001",          // 订单编号
    "customerName": "王五",               // 客户姓名
    "deliveryAddress": "上海市浦东新区XX路",  // 配送地址
    "deliveryFee": 80.00,                 // 配送费用
    "goodsWeight": 2.5,                   // 货物重量(吨)
    "expiresAt": "2024-05-01 10:10:00"    // 抢单截止时间(1分钟内)
  }
}
```

## 5. 地图与路线接口

### 5.1 获取路线规划

- **接口路径**: `/api/map/route`
- **请求方式**: GET
- **功能说明**: 获取从当前位置到目的地的路线规划
- **请求参数**: 

```
fromLat: 起点纬度
fromLng: 起点经度
toLat: 终点纬度
toLng: 终点经度
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "distance": 8.5,             // 距离(公里)
    "duration": 35,              // 预计时间(分钟)
    "polyline": "...",           // 路线坐标串(编码后)
    "steps": [                   // 导航步骤(可选)
      {
        "instruction": "向东行驶100米",
        "distance": 0.1,
        "duration": 0.5
      },
      // 更多步骤...
    ]
  }
}
```

## 6. 文件上传接口

### 6.1 上传图片

- **接口路径**: `/api/upload/image`
- **请求方式**: POST
- **功能说明**: 上传图片到服务器(头像等)
- **请求参数**: 

```
file: 图片文件(multipart/form-data)
type: 图片类型(avatar=头像,other=其他)
```

- **响应数据**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://cdn.wanbang-delivery.com/images/12345.jpg",  // 图片访问URL
    "filename": "12345.jpg"                                     // 图片文件名
  }
}
```

## 7. 技术实现要点

1. **微信小程序接入**
   - 使用微信登录API获取临时code
   - 服务端调用微信接口获取openid和session_key
   - 基于openid实现用户身份识别和登录态管理
   - 支持静默登录，提升用户体验

2. **Redis相关**
   - 使用Redis GEO存储和查询司机位置
   - 司机位置每5秒更新一次
   - 使用Redisson实现分布式锁保证抢单机制
   - 使用Redis缓存用户登录态信息

3. **消息队列**
   - 使用RabbitMQ实现订单派送消息推送
   - 订单消息1分钟不抢进入死信队列
   - 系统端可以通过管理界面重新派单

4. **定时任务**
   - 使用xxl-job实现超时订单(10分钟)自动重新派单
   - 使用cron表达式配置每5分钟检查一次未接单订单

5. **位置服务**
   - 集成腾讯位置服务实现路线规划
   - 返回距离、时间和路线坐标信息

6. **订单流程**
   - 管理端派单 → 司机抢单(1分钟) → 未抢则进入普通待接单池(9分钟) → 超过10分钟自动重新派单
   - 配送状态流转: 待派送 → 待接单 → 配送中 → 已完成/已取消

7. **状态管理**
   - 司机状态: 在线、离线、忙碌
   - 订单完成或取消后自动恢复在线状态
   - 离线状态不接收订单推送

8. **安全与数据保护**
   - 使用HTTPS确保数据传输安全
   - 敏感信息（如session_key）不在前端存储
   - 定期刷新登录态，防止Token被盗用
