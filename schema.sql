-- School Admission Database Schema
CREATE DATABASE IF NOT EXISTS school_admission_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_admission_db;

-- Table: admissions
CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  parent_phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  previous_school VARCHAR(200) NOT NULL,
  class_applying_for VARCHAR(50) NOT NULL,
  additional_info TEXT NULL,
  status ENUM('Pending', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending',
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reference_id (reference_id),
  INDEX idx_email (email),
  INDEX idx_class (class_applying_for),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

