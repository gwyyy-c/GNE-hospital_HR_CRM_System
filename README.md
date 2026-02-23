# GNE Hospital Management System

A hospital management system with HR, Patient Management (PMS), Doctor, and Billing modules. Built with **React + Vite** (frontend) and **PHP + MySQL** (backend).

---

## Features

| Module | Key Features |
|--------|-------------|
| **HR** | Employee & department management, leave requests, schedules |
| **PMS** | Patient registration, appointments, admissions, bed management |
| **Doctor** | Consultations, medical records, prescriptions, lab results |

---

## Requirements

- **XAMPP** 8.0+ (Apache, PHP 8.0+, MySQL/MariaDB)
- **Node.js** 18+ with npm
- Modern browser (Chrome, Firefox, Edge)

---

## Quick Start

### 1. Database Setup

1. Start Apache and MySQL in XAMPP
2. Open phpMyAdmin (`http://localhost/phpmyadmin`)
3. Create database: `hr_pms_erp`
4. Import: `model/db_setup.sql`

### 2. Configure Database

Edit `config/db_connection.php` if needed:

```php
$host = "localhost";
$port = "3306";        // or 3309
$db_name = "hr_pms_erp";
$username = "root";
$password = "";
```

### 3. Install & Run Frontend

```bash
cd views
npm install
npm run dev
```

### 4. Access Application

Open `http://localhost:5173`

---

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| HR Admin | `hr@hospital.com` | `password123` |
| Front Desk | `desk@hospital.com` | `password123` |
| Doctor | `doctor@hospital.com` | `password123` |

---

## Project Structure

```
GNE-Hospital-Management-System/
├── api/           # REST API endpoints
├── config/        # Database configuration
├── controller/    # Business logic
├── helper/        # Utility functions
├── model/         # Data models & SQL setup
└── views/         # React frontend (Vite)
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        └── services/
```

---

## API Endpoints

| Resource | GET | POST |
|----------|-----|------|
| Auth | - | `/api/auth/login` |
| Employees | `/api/employee/get_all` | `/api/employee/create` |
| Departments | `/api/department/get_all` | `/api/department/create` |
| Patients | `/api/patient/get_all` | `/api/patient/register` |
| Appointments | `/api/appointment/get_all` | `/api/appointment/book` |
| Admissions | `/api/admission/get_all` | `/api/admission/admit` |
| Beds | `/api/bed/get_available` | - |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify MySQL is running; check port in `db_connection.php` |
| API returns 500 | Check `xampp/apache/logs/error.log` |
| Login not working | Ensure `users` table has records |
| CORS errors | Access via `http://localhost:5173` (Vite proxy handles CORS) |

---

**Version:** 1.0.0 | **Updated:** February 2026
