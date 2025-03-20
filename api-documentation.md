# 万邦送货系统API文档

## 基础信息

- 基础URL: `${config.apiBaseUrl}`
- 全局请求头: 
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## 1. 认证模块

### 1.1 司机登录

- **接口**: `/api/driver/login`
- **方法**: POST
- **描述**: 司机通过微信登录并绑定手机号

#### 请求示例

```json
{
  "code": "071UiWll24juvB0nT4ol2lzFiI1UiWlL",
  "phone": "13800138000"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "driverInfo": {
      "id": 10001,
      "name": "张三",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "workStatus": 1,
      "auditStatus": 1
    }
  }
}
```

### 1.2 司机注册

- **接口**: `/api/driver/register`
- **方法**: POST
- **描述**: 新司机注册信息提交

#### 请求示例

```json
{
  "name": "张三",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg",
  "idCardFront": "https://example.com/id_front.jpg",
  "idCardBack": "https://example.com/id_back.jpg",
  "driverLicense": "https://example.com/license.jpg"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10001,
    "auditStatus": 0,
    "message": "注册成功，请等待审核"
  }
}
```

## 2. 司机模块

### 2.1 获取司机信息

- **接口**: `/api/driver/info`
- **方法**: GET
- **描述**: 获取当前登录司机的详细信息

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10001,
    "name": "张三",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "workStatus": 1,
    "auditStatus": 1,
    "money": 1234.56,
    "totalOrders": 100,
    "completedOrders": 95
  }
}
```

### 2.2 更新工作状态

- **接口**: `/api/driver/status`
- **方法**: POST
- **描述**: 更新司机工作状态

#### 请求示例

```json
{
  "workStatus": 1  // 1=空闲, 2=忙碌, 3=离线
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "workStatus": 1
  }
}
```

### 2.3 更新位置信息

- **接口**: `/api/driver/location`
- **方法**: POST
- **描述**: 更新司机当前位置

#### 请求示例

```json
{
  "latitude": 31.234567,
  "longitude": 121.234567,
  "speed": 30.5,
  "accuracy": 10
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success"
}
```

## 3. 订单模块

### 3.1 获取订单列表

- **接口**: `/api/order/list`
- **方法**: GET
- **描述**: 获取司机相关订单列表

#### 请求参数

```json
{
  "status": 1,        // 配送状态：1=待派送,2=待接单,3=配送中,4=已完成,5=已取消
  "page": 1,
  "size": 10
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "pages": 10,
    "current": 1,
    "records": [
      {
        "id": 1001,
        "orderNo": "DD202403200001",
        "deliveryAddress": "上海市浦东新区张江高科技园区",
        "deliveryStatus": 1,
        "deliveryFee": 50.00,
        "goodsWeight": 0.5,
        "createTime": "2024-03-20 10:00:00"
      }
    ]
  }
}
```

### 3.2 获取订单详情

- **接口**: `/api/order/detail`
- **方法**: GET
- **描述**: 获取订单详细信息

#### 请求参数

```json
{
  "orderId": "1001"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "orderNo": "DD202403200001",
    "deliveryAddress": "上海市浦东新区张江高科技园区",
    "deliveryStatus": 1,
    "deliveryFee": 50.00,
    "deliveryNote": "请轻拿轻放",
    "goodsWeight": 0.5,
    "customerPhone": "13900139000",
    "createTime": "2024-03-20 10:00:00",
    "expectedDeliveryTime": "2024-03-20 14:00:00"
  }
}
```

### 3.3 接单

- **接口**: `/api/order/accept`
- **方法**: POST
- **描述**: 司机接受订单

#### 请求示例

```json
{
  "orderId": "1001"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderNo": "DD202403200001",
    "deliveryStatus": 3
  }
}
```

### 3.4 完成订单

- **接口**: `/api/order/complete`
- **方法**: POST
- **描述**: 标记订单为已完成状态

#### 请求示例

```json
{
  "orderId": "1001",
  "deliveryProof": "https://example.com/proof.jpg"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderNo": "DD202403200001",
    "deliveryStatus": 4,
    "deliveryFee": 50.00
  }
}
```

### 3.5 取消订单

- **接口**: `/api/order/cancel`
- **方法**: POST
- **描述**: 取消已接的订单

#### 请求示例

```json
{
  "orderId": "1001",
  "cancelReason": "客户要求取消"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderNo": "DD202403200001",
    "deliveryStatus": 5
  }
}
```

## 4. 钱包模块

### 4.1 获取钱包余额

- **接口**: `/api/driver/wallet`
- **方法**: GET
- **描述**: 获取司机钱包余额信息

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 1234.56,
    "frozenAmount": 0.00,
    "todayIncome": 200.00
  }
}
```

## 5. 地图模块

### 5.1 获取路线规划

- **接口**: `/api/map/route`
- **方法**: GET
- **描述**: 使用腾讯位置服务获取两点之间的最优配送路线

#### 请求参数

```json
{
  "from": {
    "latitude": 31.234567,
    "longitude": 121.234567,
    "name": "起点名称"  // 可选
  },
  "to": {
    "latitude": 31.234999,
    "longitude": 121.234999,
    "name": "终点名称"  // 可选
  },
  "mode": "driving"  // 导航模式：driving=驾车，walking=步行，bicycling=骑行
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "routes": [{
      "distance": 5000,         // 路线距离，单位：米
      "duration": 900,          // 预计用时，单位：秒
      "polyline": [],          // 路线坐标点串，经过压缩的坐标串
      "steps": [{              // 路线步骤说明
        "instruction": "往前直行100米",  // 行驶指示
        "road_name": "张江路",          // 道路名称
        "distance": 100,               // 分段距离，单位：米
        "duration": 30,                // 分段用时，单位：秒
        "polyline": [],               // 分段坐标点串
        "direction": 0,               // 行驶方向（0-360度）
        "road_type": 0                // 道路类型
      }],
      "traffic_condition": 1,        // 路况：1=畅通，2=缓慢，3=拥堵
      "restriction": {              // 道路限制信息
        "navi_restriction": false    // 是否限行
      }
    }],
    "taxi_fee": "50",              // 预估打车费用，单位：元
    "restriction_info": {          // 限行信息
      "status": 0,                // 0=无限行，1=限行
      "restriction_info": ""      // 限行说明
    }
  }
}
```

### 5.2 关键词搜索

- **接口**: `/api/map/search`
- **方法**: GET
- **描述**: 搜索地点、地址、POI等信息

#### 请求参数

```json
{
  "keyword": "张江高科技园区",
  "location": {           // 可选，基准点坐标
    "latitude": 31.234567,
    "longitude": 121.234567
  },
  "page_size": 10,       // 每页条数，默认10
  "page_index": 1        // 页码，默认1
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "count": 10,          // 总条数
    "pois": [{
      "id": "poi_id",     // POI唯一标识
      "title": "张江高科技园区",  // 名称
      "address": "上海市浦东新区张江高科技园区",  // 地址
      "category": "园区",  // 分类
      "location": {
        "latitude": 31.234567,
        "longitude": 121.234567
      },
      "distance": 500,    // 距离基准点距离，单位：米
      "tel": "021-12345678",  // 电话
      "ad_info": {        // 行政区划信息
        "province": "上海市",
        "city": "上海市",
        "district": "浦东新区"
      }
    }]
  }
}
```

### 5.3 逆地址解析（坐标位置描述）

- **接口**: `/api/map/regeo`
- **方法**: GET
- **描述**: 将坐标转换为结构化地址信息

#### 请求参数

```json
{
  "location": {
    "latitude": 31.234567,
    "longitude": 121.234567
  },
  "get_poi": 1          // 是否返回周边POI列表：0=不返回，1=返回
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "address": "上海市浦东新区张江高科技园区",  // 详细地址
    "formatted_addresses": {
      "recommend": "张江高科技园区",  // 推荐地址描述
      "rough": "浦东新区张江"        // 粗略地址描述
    },
    "address_component": {
      "province": "上海市",
      "city": "上海市",
      "district": "浦东新区",
      "street": "张江路",
      "street_number": "100号"
    },
    "ad_info": {
      "adcode": "310115"           // 行政区划代码
    },
    "pois": []                     // 周边POI列表（get_poi=1时返回）
  }
}
```

## 错误码说明

```json
{
  "200": "请求成功",
  "400": "请求参数错误",
  "401": "未授权或token已过期",
  "403": "权限不足",
  "404": "资源不存在",
  "500": "服务器内部错误"
}
```

## 注意事项

1. 所有需要认证的接口必须在请求头中携带token
2. 收到401状态码时，客户端需要清除本地token并跳转到登录页
3. 金额相关数据使用decimal类型，前端展示时注意保留2位小数
4. 图片上传接口的文件大小限制为5MB
5. 位置更新建议间隔不少于10秒
6. 订单状态变更会通过WebSocket推送通知
7. 腾讯位置服务的坐标系统采用GCJ02坐标系
8. 路线规划API调用频率限制为100次/秒 