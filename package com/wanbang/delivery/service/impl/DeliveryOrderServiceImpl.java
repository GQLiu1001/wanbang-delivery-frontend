package com/wanbang/delivery/service/impl/DeliveryOrderServiceImpl.java

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wanbang.delivery.entity.DeliveryOrder;
import com.wanbang.delivery.entity.DriverInfo;
import com.wanbang.delivery.mapper.DriverInfoMapper;
import com.wanbang.delivery.config.RabbitMQConfig;

@Service
public class DeliveryOrderServiceImpl extends ServiceImpl<DeliveryOrderMapper, DeliveryOrder> {

    @Autowired
    private DriverInfoMapper driverInfoMapper;

    @RabbitListener(queues = RabbitMQConfig.DELIVERY_QUEUE)
    private void addDriverMoney(DeliveryOrder order) {
        System.out.println("开始处理rabbitmq");
        try {
            Long driverId = order.getDriverId();
            // 获取订单金额
            BigDecimal deliveryFee = order.getDeliveryFee();

            if (driverId != null && deliveryFee != null) {
                // 这里应该调用司机信息服务来增加账户余额
                DriverInfo driverInfo = driverInfoMapper.selectById(driverId);
                // 计算新余额 = 原余额 + 配送费
                BigDecimal newMoney = driverInfo.getMoney().add(deliveryFee);
                LambdaUpdateWrapper<DriverInfo> wrapper=new LambdaUpdateWrapper<>();
                wrapper.eq(DriverInfo::getId, driverId);
                wrapper.set(DriverInfo::getMoney, newMoney);
                driverInfoMapper.update(null, wrapper);
                // 记录日志
                System.out.println("司机(" + driverId + ")完成订单(" + order.getOrderNo() +
                        "), 增加余额: " + deliveryFee);
            } else {
                System.out.println("订单信息不完整，无法增加司机余额: " + order);
            }
        } catch (Exception e) {
            // 异常处理
            System.err.println("处理司机收益失败: " + e.getMessage());
            // 可以选择重试或记录失败日志
        }
    }
} 