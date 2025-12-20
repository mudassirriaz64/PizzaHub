-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 20, 2025 at 09:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pizzahub_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `name`, `created_at`) VALUES
(1, 'admin', '$2y$10$6HDKcmUqPVTsL51z8KRzf.g7K8cKTsLemaQ75CTxEQ4lZN6aj4SM2', 'Mudassir Riaz', '2025-12-18 15:10:28');

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `notifications_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 0,
  `order_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `product_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `system_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `auto_backup` tinyint(1) NOT NULL DEFAULT 1,
  `backup_frequency` varchar(20) NOT NULL DEFAULT 'daily',
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_settings`
--

INSERT INTO `admin_settings` (`id`, `admin_id`, `notifications_enabled`, `email_notifications`, `order_notifications`, `product_notifications`, `system_notifications`, `auto_backup`, `backup_frequency`, `maintenance_mode`, `updated_at`) VALUES
(1, 1, 1, 0, 1, 1, 1, 1, 'daily', 0, '2025-12-18 20:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL COMMENT 'create, update, delete, login, logout',
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `description`, `ip_address`, `created_at`) VALUES
(1, 1, 'update', 'Updated profile information', '::1', '2025-12-18 20:00:13'),
(4, 1, 'update', 'Updated profile information', '::1', '2025-12-18 20:17:26'),
(5, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:39:26'),
(6, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:39:28'),
(7, 1, 'update', 'Updated order ORD-019 status to: Completed', '::1', '2025-12-18 20:39:32'),
(8, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:39:36'),
(9, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:39:46'),
(10, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:39:53'),
(11, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:39:59'),
(12, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:44:43'),
(13, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:44:52'),
(14, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:45:54'),
(15, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:46:24'),
(16, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:49:08'),
(17, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:49:11'),
(18, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:49:26'),
(19, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:49:43'),
(20, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:49:47'),
(21, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:49:49'),
(22, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:50:16'),
(23, 1, 'update', 'Updated order ORD-021 status to: Cancelled', '::1', '2025-12-18 20:50:44'),
(24, 1, 'update', 'Updated order ORD-021 status to: Completed', '::1', '2025-12-18 20:50:52'),
(25, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:50:58'),
(26, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:51:58'),
(27, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-18 20:52:05'),
(28, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-18 20:52:56'),
(29, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 14:58:02'),
(30, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-19 15:00:13'),
(31, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 15:00:23'),
(32, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 15:05:16'),
(33, 1, 'update', 'Updated order ORD-022 status to: In progress', '::1', '2025-12-19 15:05:21'),
(34, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 15:05:24'),
(35, 1, 'update', 'Updated order ORD-022 status to: Cancelled', '::1', '2025-12-19 15:05:26'),
(36, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 15:05:28'),
(37, 1, 'update', 'Updated order ORD-022 status to: In progress', '::1', '2025-12-19 15:26:21'),
(38, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 15:26:24'),
(39, 1, 'update', 'Updated order ORD-021 status to: Cancelled', '::1', '2025-12-19 15:26:30'),
(40, 1, 'update', 'Updated order ORD-021 status to: Completed', '::1', '2025-12-19 15:26:36'),
(41, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 15:41:31'),
(42, 1, 'logout', 'Admin logged out of the system', '::1', '2025-12-19 15:41:50'),
(43, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 15:43:01'),
(44, 1, 'logout', 'Admin logged out of the system', '::1', '2025-12-19 15:50:45'),
(45, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 16:29:23'),
(46, 1, 'update', 'Updated order ORD-022 status to: In progress', '::1', '2025-12-19 16:29:42'),
(47, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 16:29:56'),
(48, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 17:02:39'),
(49, 1, 'update', 'Updated order ORD-022 payment status to: paid', '::1', '2025-12-19 17:32:15'),
(50, 1, 'update', 'Updated order ORD-022 payment status to: paid', '::1', '2025-12-19 17:32:18'),
(51, 1, 'update', 'Updated order ORD-022 status to: In progress', '::1', '2025-12-19 17:32:21'),
(52, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 17:32:23'),
(53, 1, 'update', 'Updated order ORD-022 status to: In progress', '::1', '2025-12-19 17:32:25'),
(54, 1, 'update', 'Updated order ORD-019 status to: In progress', '::1', '2025-12-19 17:32:36'),
(55, 1, 'login', 'Admin logged into the system', '::1', '2025-12-19 17:33:20'),
(56, 1, 'update', 'Updated order ORD-022 status to: Completed', '::1', '2025-12-19 17:33:27'),
(57, 1, 'update', 'Updated order ORD-019 payment status to: paid', '::1', '2025-12-19 17:33:31'),
(58, 1, 'update', 'Updated order ORD-019 payment status to: paid', '::1', '2025-12-19 17:33:36'),
(59, 1, 'logout', 'Admin logged out of the system', '::1', '2025-12-19 17:59:24'),
(60, 1, 'login', 'Admin logged into the system', '::1', '2025-12-20 19:16:13'),
(61, 1, 'update', 'Updated order ORD-024 payment status to: paid', '::1', '2025-12-20 19:16:39'),
(62, 1, 'update', 'Updated order ORD-025 status to: In progress', '::1', '2025-12-20 19:22:31'),
(63, 1, 'update', 'Updated order ORD-023 payment status to: paid', '::1', '2025-12-20 19:23:20'),
(64, 1, 'update', 'Updated order ORD-025 payment status to: paid', '::1', '2025-12-20 19:26:11'),
(65, 1, 'update', 'Updated order ORD-026 payment status to: paid', '::1', '2025-12-20 19:34:46'),
(66, 1, 'login', 'Admin logged into the system', '::1', '2025-12-20 19:48:54'),
(67, 1, 'login', 'Admin logged into the system', '::1', '2025-12-20 19:57:24'),
(68, 1, 'update', 'Updated order ORD-030 payment status to: paid', '::1', '2025-12-20 19:59:31'),
(69, 1, 'update', 'Updated order ORD-031 payment status to: paid', '::1', '2025-12-20 20:05:33'),
(70, 1, 'login', 'Admin logged into the system', '::1', '2025-12-20 20:30:48');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Pizza', 'Delicious pizzas with various toppings', '2025-12-18 15:10:28'),
(2, 'Fast Food', 'Burgers, fries, and more', '2025-12-18 15:10:28'),
(3, 'Drinks', 'Soft drinks, juices, and beverages', '2025-12-18 15:10:28'),
(4, 'Desserts', 'Sweet treats and desserts', '2025-12-18 15:10:28');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `order_id`, `invoice_number`, `invoice_date`) VALUES
(2, 2, 'INV-20251218-0002', '2025-12-18 19:28:14');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL COMMENT 'NULL means for all admins',
  `type` varchar(50) NOT NULL COMMENT 'order, product, system, user',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `related_id` int(11) DEFAULT NULL COMMENT 'Related order/product/user ID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `admin_id`, `type`, `title`, `message`, `is_read`, `related_id`, `created_at`) VALUES
(1, NULL, 'order', 'New Order', 'New order #ORD-001 has been placed', 1, 1, '2025-12-18 20:05:25'),
(2, NULL, 'order', 'Order Completed', 'Order #ORD-002 has been completed', 1, 2, '2025-12-18 20:05:25'),
(3, NULL, 'system', 'Database Backup', 'Daily database backup completed successfully', 1, NULL, '2025-12-18 20:05:25'),
(4, 1, 'product', 'Low Stock Alert', 'Product \"Pepperoni Pizza\" is running low on stock', 1, 1, '2025-12-18 20:05:25');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `order_type` enum('online','instore') NOT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `delivery_type` enum('delivery','pickup') DEFAULT 'pickup',
  `delivery_address` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `customer_name`, `order_type`, `status`, `delivery_type`, `delivery_address`, `subtotal`, `discount`, `tax`, `total`, `payment_status`, `payment_method`, `created_at`, `updated_at`) VALUES
(2, NULL, 'Mudassir', 'instore', 'completed', 'pickup', NULL, 4090.00, 0.00, 613.50, 4703.50, 'paid', 'cash', '2025-12-16 16:12:31', '2025-12-18 20:12:31'),
(3, NULL, 'Ahmed Ali', 'instore', 'completed', 'pickup', NULL, 2575.00, 100.00, 371.25, 2846.25, 'paid', 'cash', '2025-12-11 20:38:49', '2025-12-11 20:38:49'),
(4, NULL, 'Fatima Siddiqui', 'instore', 'completed', 'pickup', NULL, 1940.00, 0.00, 291.00, 2231.00, 'paid', 'card', '2025-12-11 20:38:49', '2025-12-11 20:38:49'),
(5, NULL, 'Hassan Khan', 'instore', 'completed', 'pickup', NULL, 3090.00, 200.00, 433.50, 3323.50, 'paid', 'cash', '2025-12-12 20:38:49', '2025-12-12 20:38:49'),
(6, NULL, 'Ayesha Malik', 'instore', 'completed', 'pickup', NULL, 1445.00, 50.00, 209.25, 1604.25, 'paid', 'card', '2025-12-12 20:38:49', '2025-12-12 20:38:49'),
(7, NULL, 'Bilal Ahmed', 'instore', 'completed', 'pickup', NULL, 2680.00, 0.00, 402.00, 3082.00, 'paid', 'cash', '2025-12-12 20:38:49', '2025-12-12 20:38:49'),
(8, NULL, 'Zainab Hussain', 'instore', 'completed', 'pickup', NULL, 1940.00, 100.00, 276.00, 2116.00, 'paid', 'card', '2025-12-13 20:38:49', '2025-12-13 20:38:49'),
(9, NULL, 'Usman Tariq', 'instore', 'completed', 'pickup', NULL, 4090.00, 0.00, 613.50, 4703.50, 'paid', 'cash', '2025-12-13 20:38:49', '2025-12-13 20:38:49'),
(10, NULL, 'Mariam Iqbal', 'instore', 'completed', 'pickup', NULL, 770.00, 0.00, 115.50, 885.50, 'paid', 'card', '2025-12-13 20:38:49', '2025-12-13 20:38:49'),
(11, NULL, 'Kamran Shah', 'instore', 'completed', 'pickup', NULL, 2575.00, 150.00, 363.75, 2788.75, 'paid', 'cash', '2025-12-14 20:38:49', '2025-12-14 20:38:49'),
(12, NULL, 'Hira Nawaz', 'instore', 'completed', 'pickup', NULL, 1345.00, 0.00, 201.75, 1546.75, 'paid', 'card', '2025-12-14 20:38:49', '2025-12-14 20:38:49'),
(13, NULL, 'Faisal Raza', 'instore', 'completed', 'pickup', NULL, 3090.00, 100.00, 448.50, 3438.50, 'paid', 'cash', '2025-12-14 20:38:49', '2025-12-14 20:38:49'),
(14, NULL, 'Sana Butt', 'instore', 'completed', 'pickup', NULL, 1940.00, 0.00, 291.00, 2231.00, 'paid', 'card', '2025-12-15 20:38:49', '2025-12-15 20:38:49'),
(15, NULL, 'Imran Haider', 'instore', 'completed', 'pickup', NULL, 2575.00, 200.00, 356.25, 2731.25, 'paid', 'cash', '2025-12-15 20:38:49', '2025-12-15 20:38:49'),
(16, NULL, 'Nida Farooq', 'instore', 'completed', 'pickup', NULL, 495.00, 0.00, 74.25, 569.25, 'paid', 'card', '2025-12-15 20:38:49', '2025-12-15 20:38:49'),
(17, NULL, 'Arslan Majeed', 'instore', 'completed', 'pickup', NULL, 1445.00, 0.00, 216.75, 1661.75, 'paid', 'cash', '2025-12-16 20:38:49', '2025-12-16 20:38:49'),
(18, NULL, 'Rabia Akram', 'instore', 'completed', 'pickup', NULL, 3090.00, 150.00, 441.00, 3381.00, 'paid', 'card', '2025-12-16 20:38:49', '2025-12-16 20:38:49'),
(19, NULL, 'Saad Malik', 'instore', 'completed', 'pickup', NULL, 2680.00, 0.00, 402.00, 3082.00, 'paid', 'cash', '2025-12-16 20:38:49', '2025-12-19 17:33:31'),
(20, NULL, 'Alisha Rehman', 'instore', 'completed', 'pickup', NULL, 1940.00, 50.00, 283.50, 2173.50, 'paid', 'card', '2025-12-18 15:38:49', '2025-12-18 15:38:49'),
(21, NULL, 'Hamza Yousaf', 'instore', 'completed', 'pickup', NULL, 485.00, 0.00, 72.75, 557.75, 'paid', 'cash', '2025-12-18 17:38:49', '2025-12-19 15:26:36'),
(22, NULL, 'Maha Sheikh', 'instore', 'completed', 'pickup', NULL, 755.00, 0.00, 113.25, 868.25, 'paid', 'cash', '2025-12-18 19:38:49', '2025-12-19 17:33:27'),
(34, 1, 'Sami Shahid', 'online', 'pending', 'delivery', 'Street 9, Ghauri Town Phase 2 , Islamabad', 5770.00, 0.00, 865.50, 6635.50, 'pending', 'cod', '2025-12-20 20:17:46', '2025-12-20 20:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_name` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `subtotal` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `size_name`, `quantity`, `price`, `subtotal`) VALUES
(2, 2, 14, NULL, 1, 4090, 4090),
(3, 3, 11, 'Large', 1, 2575, 2575),
(4, 4, 11, 'Medium', 1, 1940, 1940),
(5, 5, 12, 'Extra Large', 1, 3090, 3090),
(6, 6, 11, 'Small', 1, 1445, 1445),
(7, 7, 15, NULL, 1, 2680, 2680),
(8, 8, 13, 'Medium', 1, 1940, 1940),
(9, 9, 14, NULL, 1, 4090, 4090),
(10, 10, 18, NULL, 1, 770, 770),
(11, 11, 11, 'Large', 1, 2575, 2575),
(12, 12, 16, NULL, 1, 1345, 1345),
(13, 13, 13, 'Extra Large', 1, 3090, 3090),
(14, 14, 12, 'Medium', 1, 1940, 1940),
(15, 15, 12, 'Large', 1, 2575, 2575),
(16, 16, 19, NULL, 1, 495, 495),
(17, 17, 12, 'Small', 1, 1445, 1445),
(18, 18, 11, 'Extra Large', 1, 3090, 3090),
(19, 19, 15, NULL, 1, 2680, 2680),
(20, 20, 13, 'Medium', 1, 1940, 1940),
(21, 21, 17, NULL, 1, 485, 485),
(22, 22, 11, 'Personal (Mini)', 1, 755, 755),
(36, 34, 13, 'Extra Large', 1, 3090, 3090),
(37, 34, 15, NULL, 1, 2680, 2680);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `price` decimal(10,0) DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `category_id`, `price`, `image`, `is_available`, `created_at`, `updated_at`) VALUES
(11, 'Bar.B.Q Pizza', 'Featuring tender chicken smothered in our signature barbeque sauce, melted mozzarella cheese, and a medley of sautéed onions and bell peppers.', 1, 0, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/1/_/1_51_1_5.jpg', 1, '2025-12-18 18:15:35', '2025-12-18 18:15:44'),
(12, 'Smoked Chicken Pizza', 'A flavorful fusion of tender smoked chicken, creamy mozzarella cheese with a sweet and tangy BBQ sauce, all on top of our signature crust.', 1, 0, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/p/i/pizza_7_of_13__1.jpg', 1, '2025-12-18 18:20:29', '2025-12-18 18:20:29'),
(13, 'Hawaiian Pizza', 'A classic favorite, featuring sweet pineapple rings on our signature crust, topped with a blend of melted mozzarella and cheddar cheese.', 1, 0, 'https://tehzeeb.com/media/catalog/product/cache/7c6673d2d4f410edb2df8d69ecb26752/p/i/pizza_5_of_13__2.jpg', 1, '2025-12-18 18:22:06', '2025-12-18 18:22:29'),
(14, 'New York Cheesecake', 'Experience New York-style cheesecake, simple and elegant. Crafted with Danish cheese and a biscuit base. It’s classic and creamy with cheesy after-node.', 4, 4090, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/b/u/buttercream_cakes_1.png', 1, '2025-12-18 18:25:30', '2025-12-18 18:25:30'),
(15, 'Java Mousse Cake', 'Discover a rich and velvety coffee-chocolate mousse, a whisper-thin layer of sponge cake and a delicate chocolate glaze.', 4, 2680, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/j/a/java_mousse_1.jpeg', 1, '2025-12-18 18:27:07', '2025-12-18 18:27:07'),
(16, 'Chocolate Fudge Cake', 'An Elegant Cake that combines the flavors of premium fudge and chocolate with a smooth buttercream frosting.', 4, 1345, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/2/_/2_80.jpg', 1, '2025-12-18 18:28:22', '2025-12-18 18:28:22'),
(17, 'Club Sandwich - 2 Pieces', 'A true Classic. The Club sandwich has layers of bread, shredded chicken, mayonnaise, egg, lettuce, and cheese. Perfect to be shared for a picnic day with your friends and family.', 2, 485, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/1/0/1080x_720_px_club_sanwich_3_1.png', 1, '2025-12-18 18:33:59', '2025-12-18 18:33:59'),
(18, 'Mighty Zinger', 'Our signature Zinger but Bigger! Double Zinger fillet with a combination of spicy and plain mayo, lettuce and cheese- sandwiched between a sesame seed bun', 2, 770, 'https://www.kfcpakistan.com/images/65428500-ea56-11ef-bf82-75f537a23a2b-Mighty_variant_0-2025-02-13220345.png', 1, '2025-12-18 18:35:57', '2025-12-18 18:40:33'),
(19, 'Chicken Grill Burger', 'Simply the best. Bits of chicken, shredded on the iceberg, the chicken burger is simple and is perfectly made for your daily lunchtime. Eat it and you will love it.', 2, 495, 'https://tehzeeb.com/media/catalog/product/cache/ec83a351b5f6d541b9ac5b053f333af0/1/0/1080x_720_px_grilled_burger_1.png', 1, '2025-12-18 18:36:40', '2025-12-18 18:36:40'),
(20, 'Pepsi', '', 3, 0, 'https://www.kfcpakistan.com/images/97a8fe70-7688-11f0-9442-f17609a5500f-Pepsi345ml_variant_0-2025-08-11075548.png', 1, '2025-12-18 18:38:47', '2025-12-18 18:38:47'),
(21, 'Mint Margarita', 'Organic mint, homemade syrup and crushed ice', 3, 349, 'https://loafology.com/cdn/shop/products/Mint-Margarita_900x.jpg?v=1675318510', 1, '2025-12-18 18:44:53', '2025-12-18 18:45:02');

-- --------------------------------------------------------

--
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_name` varchar(50) NOT NULL,
  `price` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`id`, `product_id`, `size_name`, `price`) VALUES
(6, 11, 'Extra Large', 3090),
(7, 11, 'Large', 2575),
(8, 11, 'Medium', 1940),
(9, 11, 'Small', 1445),
(10, 11, 'Personal (Mini)', 755),
(11, 12, 'Extra Large', 3090),
(12, 12, 'Large', 2575),
(13, 12, 'Medium', 1940),
(14, 12, 'Small', 1445),
(15, 12, 'Personal (Mini)', 755),
(21, 13, 'Extra Large', 3090),
(22, 13, 'Large', 2575),
(23, 13, 'Medium', 1940),
(24, 13, 'Small', 1445),
(25, 13, 'Personal (Mini)', 755),
(26, 20, '1.5 Litre', 200),
(27, 20, '1 Litre', 140),
(28, 20, 'Regular', 80);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Sami Shahid', 'samishahid@gmail.com', '$2y$10$1Fo9r1RuK9Q9lgda98qHv.5.Bc27lSKl/pn.HN2LkYXvx/vp4g9ri', '03405039807', 'Street 9, Ghauri Town Phase 2 , Islamabad', '2025-12-19 18:35:03', '2025-12-20 20:10:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_id` (`admin_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `action` (`action`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `type` (`type`),
  ADD KEY `is_read` (`is_read`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_settings`
--
ALTER TABLE `admin_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD CONSTRAINT `admin_settings_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `product_sizes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
