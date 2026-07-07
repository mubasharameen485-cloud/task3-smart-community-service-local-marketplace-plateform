# 🌆 Smart Community Service & Local Marketplace Platform

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-RealTime-black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

A production-ready **Smart Community Service & Local Marketplace Platform** developed as the final advanced task (FSWD-3) for the **Teyzix Core Internship (June Batch)**. This platform enables users to offer services, list products, manage bookings, and interact securely through a modern, scalable web application.

## Core Features

### 1. User Authentication & Security
- Secure Registration, Login, and Logout using JWT.
- Password Hashing with Bcrypt.
- Forgot Password & Email-based Password Reset functionality.
- Role-Based Access Control (Buyer, Seller, Admin) & Protected Routes.

### 2. Comprehensive User Profiles
- Complete profiles with Profile Picture (Cloudinary), Bio, Location, and Contact Info.
- Provider's Skills/Services, Average Ratings, Active Listings, and Completed Orders.

### 3. Product Marketplace
- Full CRUD operations for Product Listings.
- Multi-Image Upload support.
- Advanced Search & Filter (by Category, Price, Keyword).
- "Save to Favorites" functionality for buyers.

### 4. Service Marketplace
- Professional service offerings (Web Dev, Graphic Design, Home Services, etc.).
- Includes Pricing, Estimated Delivery Time, Availability Status, and Portfolio Images.

### 5. Advanced Booking System
- Request services with Preferred Date & Time.
- Track Booking Status (`Pending`, `Accepted`, `Completed`, `Rejected`, `Cancelled`).
- Providers can Accept/Reject requests; Customers can Cancel pending bookings.

### 6. Real-Time Messaging (Socket.io)
- Live Instant Messaging between buyers and service providers.
- **Bonus:** Typing Indicators, Read Receipts (Double Ticks), and Image Sharing.
- Secure message deletion (users can only delete their own messages).

### 7. Reviews & Ratings
- Post-booking 1-5 Star Ratings and Feedback submission.
- Real-time seller reputation calculation and display.

### 8. Smart Search & Filtering
- Robust search engine combining Keyword, Category, Location, Price Range, and Rating Filters.
- Sorting capabilities (Latest vs Oldest).

### 9. In-App Notification System
- Real-time Bell  Notifications for Booking Requests, Status Updates, New Messages, and Reviews.
- Direct Email Alerts integrated via Nodemailer.

### 10. Personalized User Dashboard
- Visual statistics for Earnings, Active Listings, and Favorite Items.
- Dedicated sections for Incoming Service Requests, Booking History, and Activity Logs.

### 11. Admin Control Panel
- Centralized dashboard to view Platform Statistics (Total Users, Listings, Bookings).
- Manage Users: Suspend/Activate accounts.
- Moderate Marketplace: Approve or Remove product/service listings.
## Advanced Industry Features Included
- **Progressive Web App (PWA):** Installable on desktop and mobile devices.
- **Dark Mode:** Flicker-free, system-aware Light/Dark theme toggling using `next-themes`.
- **PDF Invoice Generation:** Client-side generation of professional booking invoices using `jsPDF`.

##  Technology Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, TanStack Query, React-Hook-Form, Lucide-React.
* **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io.
* **Third-Party Integrations:** Cloudinary (Media), Nodemailer (Emails).

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-community-marketplace.git
cd smart-community-marketplace
```
2. Backend Setup
```
cd backend
npm install
```
Create a .env file in the backend directory:

```
PORT=5000
DATABASE_URL="mongodb://127.0.0.1:27017/teyzix_smart_community"
JWT_SECRET="your_jwt_secret_key"
FRONTEND_URL="http://localhost:3000"
```
# Admin Setup
ADMIN_EMAIL="admin@teyzix.com"
ADMIN_PASSWORD="super_secure_admin"

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Nodemailer Setup
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_gmail_app_password"
Start the backend server:
```
npm run dev
```
## 3. Frontend Setup
Open a new terminal window:
```
cd frontend
npm install
npm run dev
```
Open your browser and navigate to http://localhost:3000.
