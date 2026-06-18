# SkyPulse Project Viva Questions & Answers Guide

This document contains 52 viva questions with answers, organized by category, to help you prepare for your Web Technology PBL course examination.

---

## Category 1: General Project Details

### Q1: What is SkyPulse?
**A**: SkyPulse is a full-stack smart weather dashboard application built using Node.js, Express.js, MongoDB, and modular frontend JavaScript. It provides real-time meteorological statistics, interactive map pins, historical trend graphs, secure user profile logins, and automated clothing and travel recommendations based on current weather conditions.

### Q2: Why did you choose this project?
**A**: I wanted to build a practical application that demonstrates full-stack Web Technology concepts. While many online weather apps are simple and static, SkyPulse showcases MVC architecture, database indexing, user preferences storage, secure JWT authentication, and interactive client-side components like maps and charts.

### Q3: What problem does SkyPulse solve?
**A**: It addresses three main issues found in standard weather portals:
1. **Ad clutter**: SkyPulse is clean, fast, and ad-free.
2. **Tabular layout**: It visualizes weather trends using interactive charts instead of raw data tables.
3. **Lack of personalization**: It remembers user preferences, saves search history, and generates custom clothing and travel recommendations.

### Q4: Explain the term "Project-Based Learning" (PBL) in the context of this project.
**A**: PBL focuses on active exploration of real-world challenges. In this project, PBL involved identifying gaps in existing weather applications, designing database schemas, securing routes, integrating third-party APIs, and writing clean, structured code suitable for a portfolio.

---

## Category 2: Frontend Engineering

### Q5: What is Glassmorphism? How did you implement it in SkyPulse?
**A**: Glassmorphism is a UI design trend that mimics the look of frosted glass. In SkyPulse, it was implemented using a combination of semi-transparent background colors, thin borders, backdrop-filter blur effects, and soft drop shadows:
```css
background: rgba(255, 255, 255, 0.06);
border: 1px solid rgba(255, 255, 255, 0.12);
backdrop-filter: blur(24px);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Q6: How does your theme switching system work?
**A**: It uses CSS custom properties defined on the root element. We toggle the theme by changing the `data-theme` attribute on the `<html>` tag, which swaps the color variables:
```javascript
document.documentElement.setAttribute('data-theme', 'light');
```
Themes are saved in `localStorage` and synced with the backend database.

### Q7: Why did you choose Vanilla JS over React or Angular?
**A**: Using vanilla JavaScript allowed me to demonstrate a strong grasp of core DOM manipulation and modern ES6 features (like modular imports and async/await). It also avoids the build steps, dependencies, and bundle sizes associated with single-page application frameworks.

### Q8: What is Chart.js? How does it integrate with SkyPulse?
**A**: Chart.js is a lightweight, responsive JavaScript charting library. In SkyPulse, it renders line and bar charts on canvas elements using slices of weather data, such as 24-hour temperature curves and weekly ranges.

### Q9: What is Leaflet.js? How does it display spatial coordinates?
**A**: Leaflet.js is an open-source, mobile-friendly interactive mapping library. It displays maps in a target container using OpenStreetMap tile coordinates. In SkyPulse, Leaflet markers are updated dynamically on city searches.

### Q10: How do click events work on your interactive map?
**A**: We bind an event listener to the Leaflet map object. When a user clicks the map, Leaflet captures the coordinates, which are sent to the Nominatim reverse-geocoding API to resolve the city name and fetch its weather.

### Q11: Explain CSS Custom Properties. Why are they useful?
**A**: CSS Custom Properties (variables) allow developers to store values that can be reused throughout a stylesheet. They are particularly useful for theme toggles because changing a variable value at the root level instantly updates all elements referencing it.

### Q12: How did you implement mobile responsiveness?
**A**: By using a mobile-first design approach with CSS Flexbox, CSS Grid layouts, and media queries. The dashboard sidebar collapses into a slide-over drawer on smaller screens, and detail cards stack vertically.

### Q13: What is the purpose of debouncing in search autocomplete inputs?
**A**: Debouncing prevents rate limit issues by delaying geocoding requests. Instead of calling the API on every keystroke, the application waits for the user to pause typing for 350ms before fetching suggestions.

### Q14: How do you handle loading and error states on the frontend?
**A**: We use a `loader` overlay element. When an API request starts, we show the spinner and hide the weather cards. If the request fails, we display an error toast and restore the previous dashboard state.

### Q15: What is the viewport meta tag?
**A**: The `<meta name="viewport" content="width=device-width, initial-scale=1.0">` tag tells mobile browsers to render the page layout at the device's width, preventing pages from appearing zoomed out on mobile screens.

### Q16: How does browser `localStorage` differ from cookies?
**A**: LocalStorage is persistent, has a larger storage limit (approx. 5MB), and is never sent automatically to the server with HTTP requests. Cookies have a 4KB limit, can be set to expire, and are sent automatically in request headers.

---

## Category 3: Backend & API Engineering

### Q17: What is Express.js?
**A**: Express.js is a minimal, flexible Node.js web application framework that provides robust routing, middleware support, and request handling capabilities for building RESTful APIs.

### Q18: What is Middleware in Express? Provide an example.
**A**: Middleware functions run sequentially during the request-response cycle. They can modify request/response objects, validate inputs, or block unauthorized requests. An example in SkyPulse is the `protect` auth middleware.

### Q19: Explain the MVC software architecture pattern.
**A**: MVC divides an application into three components:
1. **Model**: Database schemas (Mongoose) that define the data structure.
2. **View**: The user interface files (HTML/CSS) rendered in the browser.
3. **Controller**: Route handlers that contain the business logic.

### Q20: What is CORS? How do you configure it in Express?
**A**: Cross-Origin Resource Sharing (CORS) is a browser security feature that restricts cross-origin HTTP requests. In Express, we configure it using the `cors` middleware package to control which domains can access our APIs:
```javascript
app.use(cors());
```

### Q21: What is a RESTful API?
**A**: Representational State Transfer (REST) is an architectural style for designing networked applications. It uses standard HTTP methods (GET, POST, PUT, DELETE) and stateless operations to perform CRUD actions on resources.

### Q22: What HTTP status codes does SkyPulse return?
**A**:
* `200 OK`: Successful requests.
* `201 Created`: Successful registrations or new favorites.
* `400 Bad Request`: Input validation failures.
* `401 Unauthorized`: Missing or invalid JWT tokens.
* `404 Not Found`: Requesting a resource that doesn't exist.
* `500 Internal Server Error`: Unexpected database or application errors.

### Q23: Why do we use `dotenv` in Node.js?
**A**: The `dotenv` package loads environment variables from a `.env` file into `process.env`. This keeps sensitive details (like database credentials and JWT keys) out of source control.

### Q24: What is the difference between `app.use()` and `app.get()` in Express?
**A**: `app.use()` mounts middleware functions globally or to a specific path prefix for all HTTP methods. `app.get()` only matches GET requests for the specified route.

### Q25: How does Multer handle file uploads in Express?
**A**: Multer is middleware for handling `multipart/form-data`. It parses uploaded files, saves them to a designated directory, and attaches file metadata to `req.file`.

### Q26: What is a Global Error Handler in Express?
**A**: A middleware function defined with four arguments `(err, req, res, next)`. It catches unhandled errors thrown in route controllers, prevents server crashes, and returns clean error payloads to the client.

### Q27: How does `app.listen()` start your application?
**A**: It binds the Express application to a specified port (e.g., 5000), starting the server so it can listen for and respond to incoming network requests.

### Q28: How do you handle unhandled promise rejections in Node.js?
**A**: By listening to the `unhandledRejection` event on the global process object. When a promise rejection goes uncaught, we log the error, gracefully close the server, and exit the process:
```javascript
process.on('unhandledRejection', (err) => {
  server.close(() => process.exit(1));
});
```

---

## Category 4: Database Engineering

### Q29: Why did you choose MongoDB over a SQL database like MySQL?
**A**: Weather forecasts and user searches often contain nested structures, making MongoDB's flexible, schema-less document model a great fit. It allows us to store user preferences and search history as JSON-like documents without complex table joins.

### Q30: What is Mongoose? Why is it useful?
**A**: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a structured, schema-based solution for modeling application data, handling validation rules, and writing database queries.

### Q31: What is a database Index? Why is it useful?
**A**: An index is a database structure that makes query lookups faster. Without indexes, MongoDB has to scan every document in a collection. In SkyPulse, we index user searches on `searchedAt` for faster history lookups.

### Q32: Explain compound indexes. Provide an example.
**A**: A compound index index is defined on multiple fields. In SkyPulse, we use a compound index on the Favorites collection to prevent users from saving the same city twice:
```javascript
FavoriteSchema.index({ userId: 1, cityName: 1 }, { unique: true });
```

### Q33: How does MongoDB scale compared to traditional SQL databases?
**A**: MongoDB is designed to scale horizontally by distributing document collections across shards (multiple servers). Traditional SQL databases typically scale vertically by upgrading the hardware of a single server.

### Q34: What is the purpose of Mongoose validation rules?
**A**: Validation rules ensure that data meets required formats before it is saved to the database. For example, we validate that names are between 2 and 50 characters and check email addresses against a regex pattern.

### Q35: How do you handle relations in Mongoose?
**A**: By using the `ref` option in schemas. The Favorite and SearchHistory schemas store references to the User ID, which can be populated with user details during queries if needed:
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

### Q36: What is a pre-save hook in Mongoose?
**A**: A Mongoose middleware function that runs automatically before a document is saved to the database. In SkyPulse, we use a pre-save hook to hash user passwords before they are stored.

---

## Category 5: Authentication & Security

### Q37: What is JWT? How is it structured?
**A**: A JSON Web Token is a compact, URL-safe means of representing claims between two parties. It consists of three parts separated by dots:
1. **Header**: Specifies the signature algorithm (e.g., HS256).
2. **Payload**: Contains the user claims (e.g., User ID).
3. **Signature**: Verifies that the sender is authentic and the token hasn't been altered.

### Q38: Why is JWT preferred over session-based authentication?
**A**: JWTs are stateless. Since the user payload is encoded within the token, the server doesn't need to look up session records in a database for every request, which improves scalability.

### Q39: What is bcrypt? Why is it used for password hashing?
**A**: Bcrypt is a password-hashing function designed to defend against brute-force attacks. It incorporates a work factor (round salt) that makes password checks slow enough to deter hackers, while keeping logins fast for legitimate users.

### Q40: What is the difference between hashing and encryption?
**A**:
* **Hashing**: A one-way function. Once data is hashed (e.g., a password), it cannot be decrypted back to its original form.
* **Encryption**: A two-way function. Encrypted data can be decrypted back to plain text using a matching key.

### Q41: What is a Salt in hashing?
**A**: A salt is random data added to the input of a hash function. Salting ensures that identical passwords result in different hashes, protecting against rainbow table attacks.

### Q42: How are routes protected in SkyPulse?
**A**: We use the `protect` middleware. It extracts the JWT from the request's Authorization header, verifies the signature, fetches the user, and attaches them to `req.user`. If verification fails, it blocks access and returns a 401 status.

### Q43: How do you prevent XSS (Cross-Site Scripting) attacks?
**A**: By sanitizing user input and escaping HTML tags before rendering them in the DOM. On the frontend, we use `textContent` instead of `innerHTML` for displaying user-submitted values like city search names.

### Q44: How would you prevent SQL/NoSQL Injection attacks?
**A**: By using Mongoose object queries instead of executing raw, unsanitized strings. Mongoose schemas sanitize inputs and cast values to their defined types automatically.

---

## Category 6: APIs & System Integration

### Q45: What is Open-Meteo? Why did you choose it?
**A**: Open-Meteo is a free, open-source weather API that offers global coverage, requires no API key registration, and provides generous request limits. It includes comprehensive metrics like Air Quality, UV Indexes, and hourly forecasts.

### Q46: How do you resolve city coordinates from text inputs?
**A**: We use the Open-Meteo Geocoding API. It takes a city name string (e.g., "Paris") and returns matching results with latitude, longitude, and country details.

### Q47: How does reverse geocoding work in SkyPulse?
**A**: When the user triggers a GPS lookup or clicks the Leaflet map, the coordinates are sent to the Nominatim reverse-geocoding API to resolve the city and country names.

### Q48: What are WMO Weather Codes?
**A**: The World Meteorological Organization defines weather code numbers (0–99) to classify weather conditions. In SkyPulse, we map these numbers to custom descriptions and emojis:
* `0`: Clear Sky (☀️)
* `95`: Thunderstorm (⛈️)

---

## Category 7: Rule Engines & Architecture

### Q49: How does the Clothing recommendation engine work?
**A**: It runs conditional rules on real-time weather parameters. If the temperature is below 0°C, it recommends heavy winter coats. If rain is expected, it suggests carrying an umbrella. If the UV index is above 6, it advises wearing sunscreen.

### Q50: How do you calculate the Travel Suitability score?
**A**: The travel engine starts with a base score of 100 and applies deductions for unfavorable weather conditions. For example, it deducts 30 points for heavy rain, 25 points for strong winds, and 20 points for low visibility.

### Q51: How does history auto-cleanup work?
**A**: The search history controller logs every search. If the database logs count exceeds 50, it queries for the oldest records and deletes them automatically to keep the collection clean:
```javascript
const oldest = await SearchHistory.find({ userId: req.user.id })
  .sort({ searchedAt: 1 })
  .limit(count - 50);
```

### Q52: If this application had to scale to support millions of active users, what changes would you make?
**A**:
1. Implement a caching layer with Redis to store geocoding and weather API responses.
2. Store user avatars on cloud storage (like AWS S3) instead of local folders.
3. Configure MongoDB replication shards to handle read/write loads across databases.
4. Scale Express instances horizontally using load balancers.
