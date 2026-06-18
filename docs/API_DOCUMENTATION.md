# SkyPulse REST API Documentation

Base URL: `http://localhost:5000/api`  
Authentication: **JWT Token** sent inside `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### POST `/auth/register`
* **Description**: Registers a new user account.
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "name": "Akram Latif",
    "email": "akram@domain.com",
    "password": "mysecurepassword"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "603d2b270a6c6a2b8478ff11",
      "name": "Akram Latif",
      "email": "akram@domain.com",
      "preferences": {
        "temperatureUnit": "C",
        "theme": "dark"
      },
      "profilePicture": ""
    }
  }
  ```
* **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "A user with this email already exists"
  }
  ```

### POST `/auth/login`
* **Description**: Logins user and returns JWT token.
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "email": "akram@domain.com",
    "password": "mysecurepassword"
  }
  ```
* **Success Response (200 OK)**: (Same structure as registration)
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

### GET `/auth/me`
* **Description**: Returns current authenticated user profile payload.
* **Auth Required**: Yes (Bearer Token)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "603d2b270a6c6a2b8478ff11",
      "name": "Akram Latif",
      "email": "akram@domain.com",
      "preferences": {
        "temperatureUnit": "C",
        "theme": "dark"
      },
      "profilePicture": "/uploads/avatar-16035032.png",
      "createdAt": "2026-06-01T20:15:30.000Z"
    }
  }
  ```

---

## 2. User & Preferences Endpoints

### PUT `/users/profile`
* **Description**: Updates profile details and themes preferences.
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "name": "Akram L.",
    "preferences": {
      "theme": "light",
      "temperatureUnit": "F"
    }
  }
  ```
* **Success Response (200 OK)**: Updated user document.

### PUT `/users/profile/picture`
* **Description**: Upload profile photo.
* **Auth Required**: Yes
* **Request Headers**: `Content-Type: multipart/form-data`
* **Request Body**: Form-data with key `profilePicture` mapping file.
* **Success Response (200 OK)**: Updated user document with new picture URL path.

### PUT `/users/password`
* **Description**: Update user account password.
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "currentPassword": "oldpassword123",
    "newPassword": "newsecurepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

## 3. Favorites Endpoints

### GET `/favorites`
* **Description**: Get list of favorited locations for active user.
* **Auth Required**: Yes
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "603d2b270a6c6a2b8478ff22",
        "cityName": "London",
        "country": "United Kingdom",
        "latitude": 51.5085,
        "longitude": -0.1257,
        "addedAt": "2026-06-01T21:00:00.000Z"
      }
    ]
  }
  ```

### POST `/favorites`
* **Description**: Add new city to favorites. Max limit of 10.
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "cityName": "London",
    "country": "United Kingdom",
    "latitude": 51.5085,
    "longitude": -0.1257
  }
  ```
* **Success Response (201 Created)**: Saved favorite document.

### DELETE `/favorites/:id`
* **Description**: Remove a favorite location.
* **Auth Required**: Yes
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Favorite city removed"
  }
  ```

---

## 4. Search History Endpoints

### GET `/history`
* **Description**: Get 20 most recent search history logs.
* **Auth Required**: Yes
* **Success Response (200 OK)**: List of history items.

### POST `/history`
* **Description**: Log a new city search. Triggered automatically on search events.
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "cityName": "Paris",
    "country": "France",
    "latitude": 48.8566,
    "longitude": 2.3522
  }
  ```

### DELETE `/history`
* **Description**: Clear entire search logs.
* **Auth Required**: Yes
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Search history cleared successfully"
  }
  ```
