# School Admission Portal — Backend

A secure, scalable Node.js + Express.js + MySQL backend service for managing school admission applications.

---

## 🔒 Security Architecture

| Security Layer | Implementation Detail |
| :--- | :--- |
| **SQL Injection Prevention** | 100% Prepared Statements (`pool.execute(sql, [params])`). No raw query string concatenation. |
| **HTTP Security Headers** | `helmet` configured with Content Security Policy (CSP), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and removal of `X-Powered-By`. |
| **Rate Limiting** | `express-rate-limit` prevents brute-force, DDoS, and form-flooding attacks (strict rate limits on `/api/admissions`). |
| **Cross-Origin Security (CORS)** | Strict origin validation against allowed frontends (`http://localhost:3000`), blocking unauthorized cross-origin requests. |
| **Payload Size Restrictions** | Strict body limit of `10kb` to block memory-exhaustion / large buffer attacks. |
| **XSS & Input Sanitization** | Server-side validation and character stripping to prevent Stored XSS in database text fields. |
| **Information Leakage Shield** | Centralized error handler masks internal SQL error codes, database paths, and server stack traces in non-development environments. |
| **Environment Variable Isolation** | Database credentials and runtime configs are strictly isolated via `.env` and excluded from source control. |

---

## 🗄️ Database Architecture (MySQL)

* **Database**: `school_admission_db`
* **Table**: `admissions`
  * `id`: `INT AUTO_INCREMENT PRIMARY KEY`
  * `reference_id`: `VARCHAR(50) UNIQUE NOT NULL` (e.g., `ADM-2025-XXXXXX`)
  * `full_name`: `VARCHAR(150) NOT NULL`
  * `dob`: `DATE NOT NULL`
  * `gender`: `ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL`
  * `parent_name`: `VARCHAR(150) NOT NULL`
  * `parent_phone`: `VARCHAR(30) NOT NULL`
  * `email`: `VARCHAR(150) NOT NULL`
  * `address`: `TEXT NOT NULL`
  * `previous_school`: `VARCHAR(200) NOT NULL`
  * `class_applying_for`: `VARCHAR(50) NOT NULL`
  * `additional_info`: `TEXT NULL`
  * `status`: `ENUM('Pending', 'Under Review', 'Approved', 'Rejected') DEFAULT 'Pending'`
  * `ip_address`: `VARCHAR(45) NULL`
  * `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

*The table and database are automatically created on server start if they do not already exist.*

---

## 🚀 How to Run Backend

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify `.env` configuration**:
   Ensure `DB_PASSWORD`, `DB_USER`, `DB_NAME`, and `PORT` in `.env` match your MySQL setup.

4. **Start the server**:
   * For Development (with auto-reload):
     ```bash
     npm run dev
     ```
   * For Production:
     ```bash
     npm start
     ```

5. **Test Endpoints**:
   * **Health Check**: `GET http://localhost:5000/health`
   * **Submit Form**: `POST http://localhost:5000/api/admissions`
   * **Query Application**: `GET http://localhost:5000/api/admissions/ADM-2025-XXXXXX`

