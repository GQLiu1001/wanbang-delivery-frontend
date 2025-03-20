# 万邦送货API文档

## 通用返回格式

所有API返回均遵循以下格式：

```json
{
  "code": 200,      // 状态码：200成功，400参数错误，401未授权，500服务器错误
  "message": "操作成功", // 状态描述
  "data": {}        // 返回数据，不同接口内容不同
}
```

## 认证相关API

### 1. 司机登录

- **URL**: `/api/driver/login`
- **方法**: `POST`
- **请求参数**:

```json
{
  "code": "微信小程序登录凭证", 
  "phone": "13800138000"
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "driverInfo": {
      "id": 1,
      "name": "张师傅",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "audit_status": 1,
      "work_status": 1
    }
  }
}
```

### 2. 司机注册

- **URL**: `/api/driver/register`
- **方法**: `POST`
- **请求参数**:

```json
{
  "name": "张师傅",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "注册成功，等待审核",
  "data": {
    "driverId": 1,
    "auditStatus": 0
  }
}
```

### 3. 司机退出登录

- **URL**: `/api/driver/logout`
- **方法**: `POST`
- **请求参数**: 无
- **返回示例**:

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

### 4. 获取审核状态

- **URL**: `/api/driver/audit-status`
- **方法**: `GET`
- **请求参数**: 无
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "auditStatus": 1,  // 0=未审核,1=已通过,2=已拒绝
    "auditRemark": "审核通过"
  }
}
```

## 司机相关API

### 1. 获取司机信息

- **URL**: `/api/driver/info`
- **方法**: `GET`
- **请求参数**: 无
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "张师傅",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "auditStatus": 1,
    "workStatus": 1
  }
}
```

### 2. 更新司机信息

- **URL**: `/api/driver/update-info`
- **方法**: `POST`
- **请求参数**:

```json
{
  "name": "张师傅",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "driverId": 1
  }
}
```

### 3. 更新工作状态

- **URL**: `/api/driver/status`
- **方法**: `POST`
- **请求参数**:

```json
{
  "workStatus": 1  // 1=空闲,2=忙碌,3=离线
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "workStatus": 1
  }
}
```

### 4. 更新位置信息

- **URL**: `/api/driver/location`
- **方法**: `POST`
- **请求参数**:

```json
{
  "latitude": 31.230416,
  "longitude": 121.473701,
  "speed": 0,
  "accuracy": 10
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "位置更新成功",
  "data": null
}
```

### 5. 获取钱包信息

- **URL**: `/api/driver/wallet`
- **方法**: `GET`
- **请求参数**: 无
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "balance": 1250.00,
    "records": [
      {
        "id": 1,
        "amount": 55.00,
        "type": "收入",
        "orderNo": "D20230315001",
        "createTime": "2023-03-15 15:30:45"
      }
    ]
  }
}
```

## 订单相关API

### 1. 获取订单列表

- **URL**: `/api/order/list`
- **方法**: `GET`
- **请求参数**: 
  - `status`: 订单状态（可选）
  - `page`: 页码（默认1）
  - `size`: 每页数量（默认10）
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 25,
    "list": [
      {
        "id": 1,
        "orderNo": "D20230315001",
        "deliveryAddress": "上海市浦东新区张江高科技园区",
        "deliveryStatus": 3,
        "deliveryFee": 55.00,
        "goodsWeight": 5.0,
        "createTime": "2023-03-15 10:30:00"
      }
    ]
  }
}
```

### 2. 获取可接单列表

- **URL**: `/api/order/available`
- **方法**: `GET`
- **请求参数**: 
  - `page`: 页码（默认1）
  - `size`: 每页数量（默认10）
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 5,
    "list": [
      {
        "id": 2,
        "orderNo": "D20230315002",
        "deliveryAddress": "上海市浦东新区陆家嘴金融贸易区",
        "deliveryFee": 45.00,
        "goodsWeight": 3.5,
        "createTime": "2023-03-15 11:20:00",
        "deliveryLatitude": 31.238109,
        "deliveryLongitude": 121.501643
      }
    ]
  }
}
```

### 3. 获取订单详情

- **URL**: `/api/order/detail`
- **方法**: `GET`
- **请求参数**: 
  - `orderId`: 订单ID
- **返回示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "orderNo": "D20230315001",
    "deliveryAddress": "上海市浦东新区张江高科技园区",
    "deliveryStatus": 3,
    "deliveryFee": 55.00,
    "deliveryNote": "请轻拿轻放",
    "goodsWeight": 5.0,
    "customerPhone": "13812345678",
    "createTime": "2023-03-15 10:30:00",
    "deliveryLatitude": 31.210516,
    "deliveryLongitude": 121.585426
  }
}
```

### 4. 接单

- **URL**: `/api/order/accept`
- **方法**: `POST`
- **请求参数**:

```json
{
  "orderId": 2
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "接单成功",
  "data": {
    "orderId": 2,
    "orderNo": "D20230315002",
    "deliveryAddress": "上海市浦东新区陆家嘴金融贸易区",
    "deliveryStatus": 3,
    "customerPhone": "13823456789",
    "deliveryLatitude": 31.238109,
    "deliveryLongitude": 121.501643
  }
}
```

### 5. 完成订单

- **URL**: `/api/order/complete`
- **方法**: `POST`
- **请求参数**:

```json
{
  "orderId": 2
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "订单完成",
  "data": {
    "orderId": 2,
    "deliveryFee": 45.00
  }
}
```

### 6. 取消订单

- **URL**: `/api/order/cancel`
- **方法**: `POST`
- **请求参数**:

```json
{
  "orderId": 2,
  "cancelReason": "货物信息有误"
}
```

- **返回示例**:

```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "orderId": 2
  }
}
```

## 地图相关API

### 1. 路线规划

- **URL**: `/api/map/route`
- **方法**: `GET`
- **请求参数**: 
  - `fromLat`: 起点纬度
  - `fromLng`: 起点经度
  - `toLat`: 终点纬度
  - `toLng`: 终点经度
- **返回示例**:

```json
{
  "code": 200,
  "message": "路线规划成功",
  "data": {
    "distance": 12500,  // 单位：米
    "duration": 1800,   // 单位：秒
    "polyline": [
      31.230416, 121.473701,
      31.230987, 121.480610,
      31.225436, 121.490181,
      /* ... 更多坐标点 ... */
      31.210516, 121.585426
    ],
    "toll": 0,
    "traffic_condition": 1
  }
}
```

## 错误码说明

| 错误码 | 说明 |
| ------ | ---- |
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权/登录过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据库表结构

### 司机信息表 (driver_info)

| 字段名 | 类型 | 说明 |
| ------ | ---- | ---- |
| id | BIGINT | 司机ID |
| name | VARCHAR(50) | 司机姓名 |
| phone | VARCHAR(20) | 手机号 |
| avatar | VARCHAR(255) | 头像URL |
| audit_status | TINYINT | 审核状态(0=未审核,1=已通过,2=已拒绝) |
| work_status | TINYINT | 工作状态(1=空闲,2=忙碌,3=离线) |
| openid | VARCHAR(100) | 微信OpenID |
| money | DECIMAL | 总金额 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 司机审核记录表 (driver_audit_log)

| 字段名 | 类型 | 说明 |
| ------ | ---- | ---- |
| id | BIGINT | ID |
| driver_id | BIGINT | 司机ID |
| audit_status | TINYINT | 审核状态(0=未审核,1=已通过,2=已拒绝) |
| audit_remark | VARCHAR(255) | 审核备注 |
| auditor | VARCHAR(50) | 审核人 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### 配送订单表 (delivery_order)

| 字段名 | 类型 | 说明 |
| ------ | ---- | ---- |
| id | BIGINT | ID |
| order_no | VARCHAR(30) | 订单编号 |
| driver_id | BIGINT | 司机ID |
| customer_phone | VARCHAR(11) | 客户手机号 |
| delivery_address | VARCHAR(100) | 派送地址 |
| delivery_status | TINYINT | 配送状态(1=待派送,2=待接单,3=配送中,4=已完成,5=已取消) |
| delivery_fee | DECIMAL(10,2) | 配送费用 |
| delivery_note | VARCHAR(500) | 配送备注 |
| goods_weight | DECIMAL(10,2) | 货物重量(吨) |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |