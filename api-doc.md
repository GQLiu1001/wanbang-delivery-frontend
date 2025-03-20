### 接单
- 接口：`/api/order/accept`
- 方法：POST
- 请求参数：
```json
{
  "orderId": 2,
  "deliveryAddress": "上海市浦东新区陆家嘴金融贸易区",
  "deliveryLatitude": 31.238109,
  "deliveryLongitude": 121.501643
}
```
- 返回示例：
```json
{
  "code": 200,
  "message": "接单成功",
  "data": {
    "orderId": 2,
    "status": "delivering",
    "deliveryAddress": "上海市浦东新区陆家嘴金融贸易区",
    "deliveryLatitude": 31.238109,
    "deliveryLongitude": 121.501643,
    "deliveryFee": 15.00,
    "distance": 5.2,
    "estimatedTime": 15
  }
}
``` 