# Railway Management System API - IRCTC

This repository contains the implementation of a Railway Management System API inspired by the IRCTC platform. The system allows users to check available trains, book seats, and retrieve booking details. The platform includes a role-based access system, where admins can manage trains, and users can perform tasks like checking availability and booking seats.

## Problem Statement

You are tasked with building an API that handles the following:
1. User registration and login functionality.
2. Train management for admins, including adding trains with source and destination.
3. Seat availability checking for users between two stations.
4. Seat booking functionality that handles race conditions efficiently when multiple users attempt to book seats simultaneously.
5. Specific booking details retrieval.

The API ensures proper user authentication using JWT tokens and protects admin routes using an API key.

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: TypeORM (for PostgreSQL)
- **Hashing**: bcrypt (for password hashing)
- **Testing Framework**: Jest, Supertest (for API tests)
- **Environment Variables**: dotenv for environment-specific configurations

## Features

1. **User Registration**: Register a new user with a username and password.
2. **User Login**: Login and receive a JWT token for authentication.
3. **Add New Train (Admin)**: Admins can add new trains with details like train name, source station, destination station, and total seats.
4. **Get Train Availability**: Users can check available trains between a given source and destination.
5. **Book a Seat**: Users can book a seat on a particular train if available.
6. **Get Booking Details**: Users can fetch details of their specific booking.

## API Endpoints

### 1. User Routes

- **POST /api/user/register**  
  Registers a new user.
  - Request Body: `{ "username": "string", "password": "string" }`

- **POST /api/user/login**  
  Logs in the user and returns a JWT token.
  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "JWT Token" }`

- **GET /api/user/trains**  
  Fetches available trains between the given source and destination.
  - Query Parameters: `sourceStation` (string), `destinationStation` (string)
  - Headers: `Authorization: Bearer <JWT Token>`

- **POST /api/user/book-seat**  
  Books a seat on a particular train.
  - Request Body: `{ "trainId": "int", "seatCount": "int" }`
  - Headers: `Authorization: Bearer <JWT Token>`

- **GET /api/user/bookings/:bookingId**  
  Fetches specific booking details.
  - Path Parameters: `bookingId` (int)
  - Headers: `Authorization: Bearer <JWT Token>`

### 2. Admin Routes

- **POST /api/admin/add-train**  
  Adds a new train (accessible only by admins).
  - Request Body: `{ "trainName": "string", "sourceStation": "string", "destinationStation": "string", "totalSeats": "int" }`
  - Headers: `x-api-key: <API Key>`

## Race Condition Handling

### Solving Race Conditions

One of the key challenges addressed in this API is handling **race conditions** during seat booking. When multiple users attempt to book the same seat on a train simultaneously, the system ensures that **only one booking succeeds**.

#### **How It Works:**
- The application uses **pessimistic locking** (`setLock("pessimistic_write")`) to lock the train row for each booking attempt.
- This ensures that when a user is booking a seat, no other transaction can modify the train's seat availability until the first booking is completed.
- If another user tries to book the same seat during this locked period, the system will prevent them from booking, and they will receive an error indicating insufficient seats.

This approach eliminates the possibility of users overbooking seats, ensuring **consistent and reliable seat bookings** even under heavy traffic.

### Testing Race Conditions

To verify that the system handles race conditions correctly, a **test** is included that simulates two parallel booking requests for the same seat. The test ensures that **only one booking is successful**, and the other receives a failure response.

#### **Test Details:**
- The test simulates two users attempting to book the same seat on a train at the same time.
- One booking will succeed, while the other will fail due to the race condition prevention mechanism.
  
This test guarantees that the system functions correctly under concurrent booking attempts.

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd railway-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and provide the necessary environment variables:

```ini
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=railway_management

# Server Configuration
PORT=3000

# Authentication
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=your_admin_api_key
```

### 4. Initialize the Database

Run the following command to initialize the PostgreSQL database:

```bash
npm run dev
```

### 5. Run the Application

To start the application, run the following command:

```bash
npm start
```

The server will be running on port `3000` (or the port you configured in the `.env` file).

### 6. Run Tests

To run the tests, including the race condition test, use the following command:

```bash
npm test
```

This will run all the test cases, including the one to verify that only one booking request succeeds in case of a race condition.

## Folder Structure

```
├── src
│   ├── config          # Configuration files (e.g., database setup)
│   ├── controllers     # Logic for handling requests
│   ├── middleware      # Authentication and admin verification middleware
│   ├── models          # Database entities (User, Train, Booking)
│   ├── routes          # API route definitions
│   ├── utils           # Utility functions (JWT token generation)
│   ├── app.js          # Express app setup
│   └── server.js       # Server initialization
├── .env                # Environment variables
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## Assumptions

- The database has been set up and is accessible from the application.
- The environment variables are correctly configured for both local development and production environments.
- The API key used for admin access should be kept confidential and not shared.

## Notes

- The application is designed to handle race conditions during seat booking using **pessimistic locking** (`setLock("pessimistic_write")`) to ensure that only one user can book a seat when multiple users try to do so simultaneously.
- The system supports JWT authentication for user login and role-based access control (RBAC).
- Admin routes are protected by an API key that must be passed in the headers (`x-api-key`).

## Conclusion

This Railway Management System API is designed to handle user registration, login, train management, seat availability, and booking with efficient handling of race conditions. It uses modern technologies like Node.js, PostgreSQL, and JWT for authentication and authorization. The included tests verify that the race condition prevention mechanism is functioning correctly, ensuring a reliable and scalable booking system.# railway-management-system
