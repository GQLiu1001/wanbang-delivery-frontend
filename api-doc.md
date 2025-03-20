-- 创建万邦送货数据库
CREATE DATABASE IF NOT EXISTS `wanbang_delivery` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `wanbang_delivery`;

-- 司机信息表
CREATE TABLE IF NOT EXISTS `driver_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '司机ID',
  `name` VARCHAR(50) NOT NULL COMMENT '司机姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `audit_status` TINYINT DEFAULT 0 COMMENT '审核状态(0=未审核,1=已通过,2=已拒绝)',
  `work_status` TINYINT DEFAULT 3 COMMENT '工作状态(1=空闲,2=忙碌,3=离线)',
  `openid` VARCHAR(100) COMMENT '微信OpenID',
  `money` DECIMAL COMMENT '总金额', 
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_phone` (`phone`),
  UNIQUE KEY `uniq_openid` (`openid`),
  KEY `idx_status` (`work_status`),
  KEY `idx_audit_status` (`audit_status`)
) ENGINE=InnoDB COMMENT='司机信息表';

-- 司机审核记录表
CREATE TABLE IF NOT EXISTS `driver_audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `driver_id` BIGINT NOT NULL COMMENT '司机ID',
  `audit_status` TINYINT NOT NULL COMMENT '审核状态(0=未审核,1=已通过,2=已拒绝)',
  `audit_remark` VARCHAR(255) COMMENT '审核备注',
  `auditor` VARCHAR(50) COMMENT '审核人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_driver_id` (`driver_id`)
) ENGINE=InnoDB COMMENT='司机审核记录表';

-- 配送订单表
CREATE TABLE IF NOT EXISTS `delivery_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT ,
  `order_no` VARCHAR(30) NOT NULL COMMENT '订单编号',
  `driver_id` BIGINT COMMENT '司机ID',
  `customer_phone` VARCHAR(11) COMMENT '司机手机号',
  `delivery_address` VARCHAR(100) NOT NULL COMMENT '派送地址',
  `delivery_status` TINYINT DEFAULT 1 COMMENT '配送状态(1=待派送,2=待接单,3=配送中,4=已完成,5=已取消)',
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '配送费用',
  `delivery_note` VARCHAR(500) COMMENT '配送备注',
  `goods_weight` DECIMAL(10,2) COMMENT '货物重量(吨)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_delivery_no` (`order_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_driver_id` (`driver_id`),
  KEY `idx_status` (`delivery_status`)
) ENGINE=InnoDB COMMENT='配送订单表';