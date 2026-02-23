# GNE Hospital Management System - HR & PMS

A comprehensive hospital management system with Human Resources (HR) and Patient Management System (PMS) modules built with React (frontend) and PHP/MySQL (backend).

---

## Table of Contents

1. [Features](#features)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [User Roles & Login Credentials](#user-roles--login-credentials)
7. [User Guide](#user-guide)
   - [HR Dashboard](#hr-dashboard)
   - [Front Desk Dashboard](#front-desk-dashboard)
   - [Doctor Dashboard](#doctor-dashboard)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Features

### Human Resources Module
- **Employee Management**: Add, view, edit, and manage all employees
- **Department Management**: Organize staff by departments
- **Leave Requests**: Track and manage employee leave requests
- **Schedules**: View and manage employee work schedules
- **Analytics**: HR performance metrics and reporting

### Patient Management System
- **Patient Registration**: Register new patients with complete details
- **Patient List**: View all patients with IDs, contact info, and appointment history
- **Appointments**: Book, view, and manage patient appointments
- **Admissions**: Manage patient bed assignments and admissions
- **Doctor Availability**: Check doctor schedules and availability
- **Billing**: View billing information (managed by Billing dept)

### Doctor Portal
- **Patient Overview**: View assigned patients
- **Consultations**: Manage patient consultations
- **Medical Records**: Access and update medical records
- **Lab Results**: View laboratory results
- **Prescriptions**: Create and manage prescriptions

---

## System Requirements

- **XAMPP** (version 8.0+ recommended) with:
  - Apache 2.4+
  - PHP 8.0+
  - MySQL/MariaDB 10.4+
- **Node.js** 18+ and npm 9+
- **Modern Web Browser** (Chrome, Firefox, Edge)

---

## Installation

### Step 1: Clone/Extract the Project

Place the project folder in your XAMPP htdocs directory:
```
C:\xampp\htdocs\GNE-Hospital-Management-System--HR-CRM-\
```

### Step 2: Install Frontend Dependencies

Open a terminal and navigate to the frontend folder:

```bash
cd "C:\xampp\htdocs\GNE-Hospital-Management-System--HR-CRM-\hr-patient-msys (With Backend)\hr-patient-msys\hr-patient-msys"
npm install
```

### Step 3: Configure Database Connection

Edit the database connection file if needed:
```
hr-patient-mysys-backend/hr-pms/config/db_connection.php
```

Default configuration:
```php
$host = "localhost";
$port = "3309";      // Change to 3306 if using default MySQL port
$db_name = "hr_pms_erp";
$username = "root";
$password = "";
```

---

## Database Setup

### Step 1: Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services

### Step 2: Create Database

1. Open phpMyAdmin: http://localhost/phpmyadmin (or http://localhost:3309/phpmyadmin)
2. Create a new database named: `hr_pms_erp`
3. Select the database and import the SQL file:

```
hr-patient-mysys-backend/hr-pms/db_setup.sql
```

### Step 3: Verify Tables

The database should contain these tables:
- `users` - Login credentials
- `employees` - Staff records
- `departments` - Hospital departments
- `patients` - Patient records
- `appointments` - Patient appointments
- `admissions` - Patient bed assignments
- `beds` - Hospital beds
- `billing` - Invoice records
- `schedules` - Staff schedules

---

## Running the Application

### Step 1: Start Backend (XAMPP)

Ensure Apache and MySQL are running in XAMPP Control Panel.

### Step 2: Start Frontend Development Server

```bash
cd "hr-patient-msys (With Backend)/hr-patient-msys/hr-patient-msys"
npm run dev
```

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## User Roles & Login Credentials

### Default Test Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| HR Admin | `hr.admin` | `password123` | HR Dashboard, Employee Management |
| Front Desk | `frontdesk` | `password123` | PMS Dashboard, Patient Management |
| Doctor | `doctor1` | `password123` | Doctor Dashboard, Medical Records |
| Billing | `billing` | `password123` | Billing Dashboard |

### Password Requirements
- Minimum 6 characters
- Passwords are hashed with bcrypt in the database

---

## User Guide

### HR Dashboard

**URL:** `/hr/dashboard`

#### Dashboard
- View key HR metrics (total employees, active staff, pending requests)
- Quick access to recent activities

#### Employees (`/hr/employees`)
- **View**: See all employees with ID, name, department, and status
- **Add**: Click "Add Employee" to register new staff
  - Fill in: Name, Role, Department, Contact, Email, Address
  - Employee ID (EMP-XXX) is auto-generated
- **Edit**: Click on an employee row to edit details
- **Status**: Active, On-Leave, or Resigned

#### Departments (`/hr/recruitment`)
- View and manage hospital departments
- Each department shows employee count

#### Leave Requests (`/hr/leave`)
- View and process employee leave requests
- Approve/Deny requests

#### Schedules (`/hr/schedules`)
- View employee work schedules by department

---

### Front Desk Dashboard

**URL:** `/pms/dashboard`

#### Dashboard
- KPI cards: Total Patients, Appointments Today, Current Admissions, Available Beds
- Today's appointments overview
- Room/bed status summary

#### Patients (`/pms/patients`)
- **View**: Complete patient list with:
  - Patient ID (PAT-XXX)
  - Name, Date of Birth, Gender, Contact
  - Last Appointment Date and Doctor Name
- **Register Patient**: Click "Register Patient" button
  - Fill in: Full Name, Age/DOB, Gender, Contact, Email
  - Emergency contact information
  - Patient ID auto-generated

#### Appointments (`/pms/appointments`)
- View all appointments with:
  - Appointment ID (APT-XXXX)
  - Patient ID and Name
  - Doctor Name
  - Date/Time
  - Status (Pending/Completed/Cancelled)
- Check doctor availability

#### Admissions (`/pms/admissions`)
- View current admissions with:
  - Admission ID (ADM-XXXX)
  - Patient ID and Name
  - Bed Number and Ward Type
  - Admit Date
  - Status (Active/Discharged)

#### Inquiries (`/pms/inquiries`)
- Hospital contact information
- Doctor availability checker

---

### Doctor Dashboard

**URL:** `/doctor/dashboard`

#### Dashboard
- Patient overview and statistics
- Quick access to consultations

#### My Patients (`/doctor/patients`)
- View assigned patients
- Access patient history

#### Consultations (`/doctor/consultations`)
- Schedule and manage consultations

#### Medical Records (`/doctor/records`)
- View and update patient medical records

#### Lab Results (`/doctor/lab`)
- Access laboratory test results

#### Prescriptions (`/doctor/prescriptions`)
- Create and manage prescriptions

---

## API Reference

All API endpoints are accessed via `/api/` prefix.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employee/get_all` | List all employees |
| GET | `/api/employee/get_doctors` | List doctors only |
| POST | `/api/employee/create` | Create new employee |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/department/get_all` | List all departments |
| POST | `/api/department/create` | Create new department |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/get_all` | List all patients |
| POST | `/api/patient/register` | Register new patient |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointment/get_all` | List all appointments |
| POST | `/api/appointment/book` | Book new appointment |

### Admissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admission/get_all` | List all admissions |
| POST | `/api/admission/admit` | Admit patient |

### Beds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bed/get_available` | Get available beds |

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to database"
- Verify MySQL is running in XAMPP
- Check the port number in `db_connection.php` (default: 3309)
- Ensure database `hr_pms_erp` exists

#### 2. "API returns 500 error"
- Check Apache error logs: `xampp/apache/logs/error.log`
- Verify PHP files have correct syntax
- Check database connection credentials

#### 3. "Login not working"
- Verify the `users` table has records
- Run the test users SQL: `insert_test_users.sql`
- Check browser console for error messages

#### 4. "Patient not appearing after registration"
- Refresh the page to fetch updated data
- Check browser Network tab for API errors
- Verify required fields are filled

#### 5. "CORS errors"
- The Vite proxy handles CORS automatically
- Ensure you're accessing via `http://localhost:5173`
- Don't access the PHP API directly in the browser

### Log Files

- **Apache Logs**: `xampp/apache/logs/error.log`
- **PHP Errors**: Check `display_errors` in `php.ini`
- **Browser Console**: Press F12 → Console tab

### Support

For additional support or bug reports, check the project repository or contact the development team.

---

## Project Structure

```
GNE-Hospital-Management-System--HR-CRM-/
├── hr-patient-msys (With Backend)/
│   └── hr-patient-msys/
│       ├── hr-patient-msys/          # Frontend (React + Vite)
│       │   ├── src/
│       │   │   ├── components/       # Reusable UI components
│       │   │   ├── context/          # React contexts (Auth, Search)
│       │   │   ├── hooks/            # Custom hooks (stores)
│       │   │   ├── pages/            # Page components
│       │   │   └── services/         # API client
│       │   ├── package.json
│       │   └── vite.config.js
│       │
│       └── hr-patient-mysys-backend/  # Backend (PHP + MySQL)
│           └── hr-pms/
│               ├── api/              # API subdirectories
│               │   ├── admission/
│               │   ├── appointment/
│               │   ├── auth/
│               │   ├── bed/
│               │   ├── department/
│               │   ├── employee/
│               │   └── patient/
│               ├── config/           # Database connection
│               ├── controller/       # Business logic
│               ├── model/            # Data models
│               └── db_setup.sql      # Database schema
└── htdocs/api/                       # API Router (central entry point)
    └── index.php
```

---

**Version:** 1.0.0  
**Last Updated:** February 2026
