import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_admission_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Create the connection pool
export const pool = mysql.createPool(dbConfig);

/**
 * Initializes database and creates necessary tables if they do not exist.
 * This ensures the backend runs out of the box without manual SQL execution.
 */
export async function initDatabase() {
  let connection;
  try {
    // 1. Connect without database first to ensure database existence
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.end();

    // 2. Test pool connection and create admissions table
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log(`[DB] Connected successfully to MySQL database "${dbConfig.database}".`);

    const createTableQuery = `
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
        INDEX idx_class (class_applying_for)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableQuery);
    console.log('[DB] "admissions" table verified and ready.');
  } catch (error) {
    console.error('[DB Error] Failed to initialize MySQL database:', error.message);
    throw error;
  }
}

export default pool;

