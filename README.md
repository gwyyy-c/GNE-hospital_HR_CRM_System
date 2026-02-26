# GNE Hospital Management System

A comprehensive hospital management system with HR, Patient Management (PMS), Doctor, and Billing modules. Built with **React 18 + Vite** (frontend) and **PHP 8 + MySQL/MariaDB** (backend REST API).

Note: We deployed our system in Vercel however the backend doesn't work so we recommend to follow the Quick Start guide.
---

## Features

| Module | Key Features |
|--------|-------------|
| **HR** | Employee wizard (3-step with work day selection), department CRUD, schedule management, auto user account creation |
| **Front Desk (PMS)** | Patient registration, appointment booking, bed management, admissions, discharge-to-billing cascade |
| **Doctor** | Patient consultations, medical record creation, appointment status actions, care type toggle (Outpatient/Inpatient) |
| **Billing** | Invoice generation with line items, payment processing, discharge cascade (bed + doctor + invoice status) |

---

## Requirements

- **XAMPP** 8.0+ (Apache with mod_rewrite, PHP 8.0+, MySQL/MariaDB)
- **Node.js** 18+ with npm
- Modern browser (Chrome, Firefox, Edge)

---

## Quick Start

### 1. Clone & Place Project

Place this folder in your XAMPP htdocs:
```
C:\xampp\htdocs\GNE-Hospital-Management-System\
```

### 2. Database Setup

1. Start Apache and MySQL in XAMPP
2. Open phpMyAdmin (`http://localhost/phpmyadmin`)
3. Create database: `hr_pms_erp`
4. Import: `model/db_setup.sql`

### 3. Configure Database

Edit `config/db_connection.php` if needed:

```php
$host = "127.0.0.1";
$port = "3307";        // Default: 3306, adjust to your XAMPP/MariaDB port
$db_name = "hr_pms_erp";
$username = "root";
$password = "";
```

### 4. Enable Apache mod_rewrite

Ensure `mod_rewrite` is enabled in `httpd.conf`:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

### 5. Install & Run Frontend

```bash
cd views
npm install
npm run dev
```

### 6. Access Application

Open `http://localhost:5173`

> **Important:** Always access the app via port 5173 (Vite dev server). The Vite proxy routes API calls to Apache. Accessing Apache directly will cause "Backend service unavailable" errors.

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| HR Admin | `hr@hospital.com` | `password123` |
| Doctor | `doctor@hospital.com` | `password123` |
| Front Desk | `desk@hospital.com` | `password123` |

> New employees created via the HR module automatically get a user account with their generated corporate email. Default password format: `{email_localpart}123`.

---

## JWT Authentication

The API uses JWT (JSON Web Token) for secure authentication.

### Environment Setup

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Configure your JWT settings in `.env`:
   ```env
   JWT_SECRET_KEY=your_secure_random_secret_key_here
   JWT_EXPIRY=86400
   JWT_ISSUER=GNE-Hospital-System
   ```

### Using Authentication

**Login Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{"email": "hr@hospital.com", "password": "password123"}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": { "id": 1, "email": "hr@hospital.com", "role": "HR", ... }
}
```

**Authenticated Requests:**
```bash
GET /api/employee/get_all
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

Protect API endpoints with role checks:

```php
require_once __DIR__ . '/../../helper/AuthHelper.php';

// Require any valid token
$user = AuthHelper::requireAuth();

// Require specific role(s)
$user = AuthHelper::requireDoctor();
$user = AuthHelper::requireHR();
$user = AuthHelper::requireRole(['Doctor', 'HR']);
```

---

## Project Structure

```
GNE-Hospital-Management-System/
├── api/                    # REST API endpoints (PHP)
│   ├── .htaccess          # URL rewriting rules (clean URLs → .php files)
│   ├── admission/         # admit.php, discharge.php, get_all.php, update.php
│   ├── appointment/       # book.php, get_all.php, update.php, delete.php
│   ├── auth/              # login.php (token-based authentication)
│   ├── bed/               # get_all.php, get_available.php, update.php
│   ├── billing/           # create.php, get_all.php, get_by_patient.php, update_status.php
│   ├── department/        # create.php, get_all.php
│   ├── employee/          # create.php, get_all.php, get_doctors.php, update.php, delete.php
│   ├── medical_record/    # create.php, get.php, get_all.php, update.php
│   ├── patient/           # register.php, get_all.php, update.php, delete.php
│   └── schedule/          # create.php, get_all.php, update.php, delete.php
├── config/
│   └── db_connection.php  # PDO connection, CORS headers, error handling
├── controller/            # Business logic layer (MVC controllers)
│   ├── UserController.php # Auth helpers (token generation, login)
│   ├── EmployeeController.php
│   ├── DepartmentController.php
│   ├── PatientController.php
│   ├── AppointmentController.php
│   ├── AdmissionController.php
│   ├── BedController.php
│   ├── BillingController.php
│   ├── MedicalRecordController.php
│   └── ScheduleController.php
├── helper/
│   ├── AuthHelper.php     # JWT authentication & role-based access control
│   └── ResponseHelper.php # Standardized JSON response formatter
├── config/
│   ├── db_connection.php  # PDO connection, CORS headers
│   └── env.php            # Environment variable loader (.env parser)
├── model/                 # Data access layer (MVC models)
│   ├── db_setup.sql       # Full database schema (10 tables)
│   ├── User.php           # Login, account creation from employee
│   ├── Employee.php       # CRUD with department/schedule joins
│   ├── Department.php     # CRUD for hospital departments
│   ├── Patient.php        # Patient registration and management
│   ├── Appointment.php    # Booking, status updates, doctor/patient joins
│   ├── Admission.php      # Admit/discharge with bed transaction
│   ├── Bed.php            # Ward beds, occupancy tracking
│   ├── Billing.php        # Invoice CRUD with patient joins
│   ├── MedicalRecord.php  # Clinical records with doctor/patient joins
│   └── Schedule.php       # Employee shift schedules
└── views/                 # React 18 frontend (Vite)
    ├── vite.config.js     # Dev server with API proxy to Apache
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx        # Route definitions and role-based guards
        ├── main.jsx       # React entry point
        ├── index.css      # Tailwind base + custom design tokens
        ├── services/
        │   ├── apiClient.js    # Centralized fetch wrapper + API definitions
        │   └── authService.js  # Login, logout, session management
        ├── context/
        │   ├── AuthContext.jsx  # Auth state provider
        │   ├── HRContext.jsx    # HR module state
        │   ├── LoadingContext.jsx
        │   └── SearchContext.jsx
        ├── hooks/
        │   ├── useHRStore.js      # HR data + API calls
        │   ├── usePMSStore.js     # PMS data + API calls
        │   ├── useDoctorStore.js  # Doctor data + API calls
        │   ├── useBillingStore.js # Billing logic + invoice calculations
        │   └── useAPIData.js      # Generic API data fetcher
        ├── pages/
        │   ├── Login.jsx
        │   ├── HRDashboard.jsx
        │   ├── DoctorDashboard.jsx
        │   ├── FrontDeskDashboard.jsx
        │   └── NotFound.jsx
        ├── components/
        │   ├── Layout.jsx         # Role-based sidebar + header
        │   ├── auth/              # SecurityRoute, Logout
        │   ├── HR/                # AddEmployee, EmployeeTable, Department, ScheduleView
        │   ├── Doctor/            # AppointmentList, PatientConsult, CareToggle,
        │   │                      # Notification, AddMedicalRecord
        │   ├── PMS/               # PatientRegistrationForm, PatientEditForm,
        │   │                      # BedManagement, DoctorAvailabilityChecker,
        │   │                      # PatientAssignment
        │   ├── Billing/           # BillingSummary (dashboard), Discharge (modal)
        │   └── ui/                # Toast, DashboardBanner
        └── data/                  # Static constants and mock/seed data
            ├── Billing.js         # Ward rates, charges, invoices, payment methods
            ├── Doctor.js          # Diagnosis presets, medications, lab panels
            ├── HR.js              # Department list, role/status colors
            ├── PMS.js             # Mock beds, doctors, patients
            └── pmsData.js         # Status styles, ward defs, form options
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employee/get_all` | List all employees |
| GET | `/api/employee/get_doctors` | List active doctors |
| POST | `/api/employee/create` | Create employee (auto-creates schedules and user account) |
| PUT | `/api/employee/update/:id` | Update employee |
| DELETE | `/api/employee/delete/:id` | Delete employee |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule/get_all` | List all schedules |
| POST | `/api/schedule/create` | Create schedule entry |
| PUT | `/api/schedule/update/:id` | Update schedule |
| DELETE | `/api/schedule/delete/:id` | Delete schedule |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/department/get_all` | List departments |
| POST | `/api/department/create` | Create department |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/get_all` | List all patients |
| POST | `/api/patient/register` | Register patient |
| PUT | `/api/patient/update/:id` | Update patient |
| DELETE | `/api/patient/delete/:id` | Delete patient |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointment/get_all` | List all appointments |
| POST | `/api/appointment/book` | Book appointment |
| PUT | `/api/appointment/update/:id` | Update appointment status |
| DELETE | `/api/appointment/delete/:id` | Delete appointment |

### Admissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admission/get_all` | List all admissions |
| POST | `/api/admission/admit` | Admit patient |
| PUT | `/api/admission/update/:id` | Update admission |
| POST | `/api/admission/discharge/:id` | Discharge patient |

### Beds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bed/get_all` | List all beds |
| GET | `/api/bed/get_available` | List available beds |
| PUT | `/api/bed/update/:id` | Update bed status |

### Medical Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medical_record/get_all` | List all medical records |
| GET | `/api/medical_record/get/:id` | Get specific record by patient ID |
| POST | `/api/medical_record/create` | Create medical record |
| PUT | `/api/medical_record/update/:id` | Update medical record |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/get_all` | List all billing records |
| GET | `/api/billing/get_by_patient?patient_id=X` | Get billing by patient |
| POST | `/api/billing/create` | Create billing record |
| PUT | `/api/billing/update_status` | Update payment status |

---

## Billing System

The billing module handles patient invoices, payments, and discharge workflow.

### Billing API Details

#### Create Invoice
```http
POST /api/billing/create
Content-Type: application/json

{
  "patient_id": 1,
  "admission_id": 5,
  "net_amount": 1500.00,
  "payment_status": "Pending"
}
```

#### Update Payment Status
```http
PUT /api/billing/update_status
Content-Type: application/json

{
  "bill_id": 1,
  "payment_status": "Paid"
}
```

**Valid payment statuses:** `Pending`, `Paid`, `Partial`, `Waived`

### Billing Data Structure

| Field | Type | Description |
|-------|------|-------------|
| `bill_id` | INT | Primary key |
| `patient_id` | INT | Foreign key to patients |
| `admission_id` | INT | Foreign key to admissions (optional) |
| `net_amount` | DECIMAL | Total invoice amount |
| `payment_status` | ENUM | Pending, Paid, Partial, Waived |
| `created_at` | TIMESTAMP | Invoice creation date |

### Invoice Calculation (Frontend)

The frontend calculates invoice totals using:

1. **Room Charges**: Based on ward type and length of stay
   - General Ward: $180/day
   - ICU: $950/day
   - Pediatrics: $220/day
   - Maternity: $310/day
   - Surgical: $420/day
   - Cardiology: $580/day

2. **Treatment Charges**: Line items for consultations, procedures, medications

3. **Totals**:
   - Subtotal = Room + Treatment charges
   - Discount = Subtotal × discount percentage
   - Tax = (Subtotal - Discount) × 8.5%
   - Grand Total = Subtotal - Discount + Tax

### Discharge Cascade

When a patient is discharged via the billing module:
1. Invoice marked as **Paid**
2. Assigned bed status → **Available**
3. Doctor availability restored
4. Patient status → **Discharged**
5. Discharge notification sent

---

## Employee Roles

| Role | Description | User Access Level |
|------|-------------|-------------------|
| Doctor | Medical practitioners | Doctor |
| Nurse | Nursing staff | FrontDesk |
| HR | Human resources | HR |
| FrontDesk | Reception staff | FrontDesk |
| Admin | System administrators | HR |
| Pharmacist | Pharmacy staff | FrontDesk |
| Radiologist | Radiology specialists | Doctor |
| Technician | Technical support | FrontDesk |

---

## Appointment Status Values

| Status | Description |
|--------|-------------|
| `Pending` | Scheduled, awaiting visit |
| `Completed` | Visit completed |
| `Cancelled` | Appointment cancelled |
| `No-show` | Patient did not attend |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Backend service unavailable"** | Access app via `http://localhost:5173` — Vite proxy is required for API routing |
| **"Database connection failed"** | Verify MySQL/MariaDB is running; check port in `db_connection.php` (default: 3307). Use `127.0.0.1` instead of `localhost` |
| **doctor_id is null** | Log out, clear localStorage (`F12` → Application → Storage → Clear), log back in |
| **API returns 404** | Ensure `.htaccess` exists in `api/` and `mod_rewrite` is enabled in Apache |
| **API returns 500** | Check `apache/logs/error.log` for PHP errors |
| **Login fails** | Ensure `users` table has records. Default password: `password123` (bcrypt hashed) |
| **CORS errors** | Always access via `http://localhost:5173`. The Vite proxy handles CORS |
| **Two XAMPP installations** | Ensure only one Apache is running and its DocumentRoot points to your project's htdocs |

### Debug Mode

To enable PHP error display for debugging:
```php
// In config/db_connection.php
ini_set('display_errors', '1');
```

### Test API Directly

```powershell
# Test login (from PowerShell)
Invoke-WebRequest -Uri "http://127.0.0.1/GNE-Hospital-Management-System/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"hr@hospital.com","password":"password123"}'

# Test employee list
Invoke-WebRequest -Uri "http://127.0.0.1/GNE-Hospital-Management-System/api/employee/get_all"
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, Lucide Icons |
| State | Custom hooks (usePMSStore, useHRStore, useBillingStore, useDoctorStore) |
| Backend | PHP 8, PDO |
| Database | MySQL/MariaDB |
| Server | Apache (XAMPP) |

---

## Database Tables

| Table | Description |
|-------|-------------|
| `users` | System user accounts with access roles (HR, Doctor, FrontDesk) |
| `employees` | Employee records with roles, departments, contact info |
| `departments` | Hospital departments |
| `schedules` | Employee work schedules (day, shift times) |
| `patients` | Patient registration data |
| `appointments` | Patient appointments with doctors |
| `admissions` | Patient bed admissions |
| `beds` | Hospital bed inventory by ward |
| `billing` | Invoice records per patient/admission |
| `medical_records` | Patient medical history and notes |

---

**Version:** 2.3.0 | **Updated:** February 2026 | **Status:** Full MVC with token-based auth
