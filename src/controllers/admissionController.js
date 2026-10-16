import crypto from 'crypto';
import pool from '../config/db.js';

/**
 * Generates a unique, formatted admission reference ID (e.g. ADM-2025-784920)
 */
function generateReferenceId() {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomInt(100000, 999999);
  return `ADM-${year}-${randomSuffix}`;
}

/**
 * Controller: Submit new Admission Form
 * Saves student admission data safely to MySQL using Prepared Statements
 */
export async function createAdmission(req, res, next) {
  try {
    const data = req.sanitizedData;
    const referenceId = generateReferenceId();
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').slice(0, 45);

    // SQL with 100% parameterized prepared statement (Blocks SQL Injection completely)
    const insertQuery = `
      INSERT INTO admissions (
        reference_id,
        full_name,
        dob,
        gender,
        parent_name,
        parent_phone,
        email,
        address,
        previous_school,
        class_applying_for,
        additional_info,
        status,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
    `;

    const values = [
      referenceId,
      data.fullName,
      data.dob,
      data.gender,
      data.parentName,
      data.parentPhone,
      data.email,
      data.address,
      data.previousSchool,
      data.classApplyingFor,
      data.additionalInfo,
      clientIp
    ];

    const [result] = await pool.execute(insertQuery, values);

    return res.status(201).json({
      success: true,
      message: 'Admission application received and recorded successfully.',
      data: {
        id: result.insertId,
        referenceId,
        fullName: data.fullName,
        email: data.email,
        classApplyingFor: data.classApplyingFor,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        status: 'Pending',
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Lookup Admission by Reference ID
 * Uses parameterized query for security
 */
export async function getAdmissionByReference(req, res, next) {
  try {
    const { referenceId } = req.params;

    if (!referenceId || !/^ADM-\d{4}-\d{6}$/.test(referenceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application reference ID format.'
      });
    }

    const selectQuery = `
      SELECT 
        reference_id AS referenceId,
        full_name AS fullName,
        email,
        class_applying_for AS classApplyingFor,
        status,
        created_at AS createdAt
      FROM admissions 
      WHERE reference_id = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute(selectQuery, [referenceId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admission record found with the given Reference ID.'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Health Check Endpoint
 * Checks server uptime and MySQL connection status
 */
export async function getHealth(req, res) {
  try {
    const [rows] = await pool.query('SELECT 1 AS alive');
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}

