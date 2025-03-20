const { config } = require('./config');
const QQMapWX = require('../libs/qqmap-wx-jssdk.min.js');

// 初始化腾讯地图SDK
const qqmapsdk = new QQMapWX({
  key: config.map.key
});

// 处理腾讯地图SDK的Promise化
const promisifyMap = (method, options = {}) => {
  return new Promise((resolve, reject) => {
    qqmapsdk[method]({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

// 地图服务工具类
const MapService = {
  // 路线规划
  getRoute: async (from, to, mode = 'driving') => {
    try {
      const result = await promisifyMap('direction', {
        mode: mode,
        from: `${from.latitude},${from.longitude}`,
        to: `${to.latitude},${to.longitude}`,
        success: function(res) {
          return res;
        },
        fail: function(error) {
          throw error;
        }
      });

      // 处理返回数据格式
      const route = result.result.routes[0];
      return {
        code: 0,
        message: 'success',
        data: {
          routes: [{
            distance: route.distance,
            duration: route.duration,
            polyline: route.polyline,
            steps: route.steps.map(step => ({
              instruction: step.instruction,
              road_name: step.road_name,
              distance: step.distance,
              duration: step.duration,
              polyline: step.polyline,
              direction: step.direction,
              road_type: step.road_type
            })),
            traffic_condition: 1, // 默认畅通
            restriction: {
              navi_restriction: false
            }
          }],
          taxi_fee: result.result.taxi_fare || "0",
          restriction_info: {
            status: 0,
            restriction_info: ""
          }
        }
      };
    } catch (error) {
      console.error('路线规划失败:', error);
      throw error;
    }
  },

  // 关键词搜索
  searchLocation: async (keyword, location = null, pageSize = 10, pageIndex = 1) => {
    try {
      const options = {
        keyword: keyword,
        page_size: pageSize,
        page_index: pageIndex
      };

      // 如果提供了位置信息，添加到请求参数中
      if (location) {
        options.location = `${location.latitude},${location.longitude}`;
      }

      const result = await promisifyMap('search', options);
      
      return {
        code: 0,
        message: 'success',
        data: {
          count: result.count,
          pois: result.data.map(item => ({
            id: item.id,
            title: item.title,
            address: item.address,
            category: item.category,
            location: {
              latitude: item.location.lat,
              longitude: item.location.lng
            },
            distance: item._distance || 0,
            tel: item.tel,
            ad_info: {
              province: item.ad_info.province,
              city: item.ad_info.city,
              district: item.ad_info.district
            }
          }))
        }
      };
    } catch (error) {
      console.error('位置搜索失败:', error);
      throw error;
    }
  },

  // 逆地址解析
  reverseGeocode: async (latitude, longitude, getPoi = 1) => {
    try {
      const result = await promisifyMap('reverseGeocoder', {
        location: {
          latitude,
          longitude
        },
        get_poi: getPoi
      });

      return {
        code: 0,
        message: 'success',
        data: {
          address: result.result.address,
          formatted_addresses: {
            recommend: result.result.formatted_addresses?.recommend,
            rough: result.result.formatted_addresses?.rough
          },
          address_component: {
            province: result.result.address_component.province,
            city: result.result.address_component.city,
            district: result.result.address_component.district,
            street: result.result.address_component.street,
            street_number: result.result.address_component.street_number
          },
          ad_info: {
            adcode: result.result.ad_info.adcode
          },
          pois: getPoi ? result.result.pois : []
        }
      };
    } catch (error) {
      console.error('逆地址解析失败:', error);
      throw error;
    }
  },

  // 坐标转换（WGS84转GCJ02）
  convertWGS84ToGCJ02: async (latitude, longitude) => {
    try {
      const result = await promisifyMap('coord', {
        location: {
          latitude,
          longitude
        },
        type: 1 // 1: WGS84 转 GCJ02
      });

      return {
        latitude: result.latitude,
        longitude: result.longitude
      };
    } catch (error) {
      console.error('坐标转换失败:', error);
      throw error;
    }
  }
};

module.exports = MapService; 