/**
 * Input sanitization function to prevent XSS (Cross-Site Scripting)
 * Strips HTML control characters and trims leading/trailing spaces.
 */
function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip angle brackets to prevent HTML/script injection
    .trim()
    .slice(0, maxLength);
}

const ALLOWED_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const ALLOWED_CLASSES = [
  'Kindergarten',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8',
  'Grade 9 (Freshman)', 'Grade 10 (Sophomore)', 'Grade 11 (Junior)', 'Grade 12 (Senior)'
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9+\s\-().]{7,25}$/;

/**
 * Middleware: validate and sanitize admission application form data
 */
export function validateAdmissionForm(req, res, next) {
  const {
    fullName,
    dob,
    gender,
    parentName,
    parentPhone,
    email,
    address,
    previousSchool,
    classApplyingFor,
    additionalInfo
  } = req.body || {};

  const errors = {};

  // 1. Full Name
  const cleanFullName = sanitizeString(fullName, 150);
  if (!cleanFullName) {
    errors.fullName = 'Student Full Name is required';
  } else if (cleanFullName.length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  }

  // 2. Date of Birth
  if (!dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const parsedDate = new Date(dob);
    const today = new Date();
    if (isNaN(parsedDate.getTime())) {
      errors.dob = 'Invalid date format (must be YYYY-MM-DD)';
    } else if (parsedDate >= today) {
      errors.dob = 'Date of birth must be in the past';
    }
  }

  // 3. Gender
  if (!gender || !ALLOWED_GENDERS.includes(gender)) {
    errors.gender = `Gender must be one of: ${ALLOWED_GENDERS.join(', ')}`;
  }

  // 4. Parent / Guardian Name
  const cleanParentName = sanitizeString(parentName, 150);
  if (!cleanParentName) {
    errors.parentName = 'Parent or Guardian Name is required';
  } else if (cleanParentName.length < 2) {
    errors.parentName = 'Parent name must be at least 2 characters';
  }

  // 5. Parent / Guardian Phone
  const cleanPhone = sanitizeString(parentPhone, 25);
  if (!cleanPhone) {
    errors.parentPhone = 'Parent or Guardian Phone is required';
  } else if (!PHONE_REGEX.test(cleanPhone)) {
    errors.parentPhone = 'Please provide a valid phone number (min 7 digits)';
  }

  // 6. Email
  const cleanEmail = sanitizeString(email, 150).toLowerCase();
  if (!cleanEmail) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(cleanEmail)) {
    errors.email = 'Please provide a valid email address';
  }

  // 7. Address
  const cleanAddress = sanitizeString(address, 500);
  if (!cleanAddress) {
    errors.address = 'Residential Address is required';
  } else if (cleanAddress.length < 5) {
    errors.address = 'Please enter a complete address (at least 5 characters)';
  }

  // 8. Previous School
  const cleanPreviousSchool = sanitizeString(previousSchool, 200);
  if (!cleanPreviousSchool) {
    errors.previousSchool = 'Previous School name is required';
  }

  // 9. Class Applying For
  const cleanClass = sanitizeString(classApplyingFor, 50);
  if (!cleanClass || (!ALLOWED_CLASSES.includes(cleanClass) && cleanClass.length < 2)) {
    errors.classApplyingFor = 'Please select a valid class or grade level';
  }

  // 10. Additional Info (Optional)
  const cleanAdditionalInfo = additionalInfo ? sanitizeString(additionalInfo, 1000) : null;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors
    });
  }

  // Attach strictly sanitized values for database insertion
  req.sanitizedData = {
    fullName: cleanFullName,
    dob,
    gender,
    parentName: cleanParentName,
    parentPhone: cleanPhone,
    email: cleanEmail,
    address: cleanAddress,
    previousSchool: cleanPreviousSchool,
    classApplyingFor: cleanClass,
    additionalInfo: cleanAdditionalInfo
  };

  next();
}

