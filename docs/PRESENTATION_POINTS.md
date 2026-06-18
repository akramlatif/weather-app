# SkyPulse Project Presentation Slide Guide

This document contains slide structures, key bullet points, talking points, and live demo steps for presenting the SkyPulse Smart Weather Dashboard to your Web Technology professors and peers.

---

### Slide 1: Title & Overview
* **Slide Title**: SkyPulse – Smart Full-Stack Weather Dashboard
* **Sub-title**: Web Technology Course Semester PBL Project
* **Bullet Points**:
  * Presenter: Akram (3rd Semester)
  * Technology Stack: MERN (Node, Express, MongoDB, Vanilla JS)
  * Project Domain: Meteorological analytics & smart insights
* **Talking Points**:
  * Good morning, professors. Today I am presenting SkyPulse, a full-stack weather dashboard designed for our Project-Based Learning curriculum. 
  * The goal of this project is to take a simple weather search utility and transform it into a secure, responsive, analytical workspace that delivers smart, personalized climate suggestions.

---

### Slide 2: Problem Statement
* **Slide Title**: Challenges of Modern Weather Portals
* **Bullet Points**:
  * Aggressive monetization (third-party ads, tracking scripts)
  * Tabular data representations that are hard to interpret at a glance
  * No profile personalization (saving favorite locations, preferences)
  * Lack of contextual climate advice (clothing suggestions, travel indexes)
* **Talking Points**:
  * Most weather applications today are cluttered with ads and trackers, which increases page load times and compromises user privacy.
  * In addition, they present raw numerical data in complex tables without context, making it hard for users to get quick answers to simple questions, like "Do I need a jacket today?" or "Is it safe to travel?".

---

### Slide 3: Project Objectives
* **Slide Title**: Objectives of SkyPulse
* **Bullet Points**:
  * Design a lightweight, modern glassmorphic dashboard
  * Implement secure user registration and login with JWT session tracking
  * Map atmospheric parameters (temp, UV, AQI) with Chart.js line and bar graphs
  * Integrate spatial visualizations with Leaflet interactive mapping pins
  * Create a rule-based engine for custom clothing and outdoor travel insights
* **Talking Points**:
  * To solve these problems, SkyPulse was built with five key objectives.
  * We wanted to deliver a fast, ad-free glassmorphic UI, secure logins using JWT, responsive interactive charts for trend analysis, and a map that updates with coordinate searches. Finally, we wanted to generate automated, natural language recommendations.

---

### Slide 4: Tech Stack & System Architecture
* **Slide Title**: Technical Infrastructure
* **Bullet Points**:
  * **Frontend**: HTML5, Vanilla CSS variables, Modular ES6 JavaScript
  * **Backend**: Node.js, Express.js MVC APIs
  * **Database**: MongoDB database with Mongoose schemas
  * **Auth & Security**: JWT session cookies, Bcrypt password hashing
  * **Visualizations**: Leaflet.js (maps), Chart.js (charts)
* **Talking Points**:
  * SkyPulse follows a clean MVC architectural pattern. 
  * The backend uses Express routes to query document schemas in MongoDB, and the frontend is powered by vanilla JavaScript modules to keep the interface fast and lightweight.

---

### Slide 5: Database design (ER Schemas)
* **Slide Title**: Entity-Relationship Schema Design
* **Bullet Points**:
  * `Users` Schema: stores auth details, avatar picture path, and unit/theme settings
  * `Favorites` Schema: maps saved cities to user accounts (max limit 10)
  * `Search History` Schema: logs recent queries (max 50, limits returned to 20)
  * Compound Indexing: `{ userId: 1, cityName: 1 }` on favorites to prevent duplicate bookmarking
* **Talking Points**:
  * Our MongoDB database is divided into three key collections: Users, Favorites, and Search History.
  * We use compound indexing to enforce unique constraints on saved favorite cities and index search history by timestamp for fast retrieval.

---

### Slide 6: Secure Session Auth Flow
* **Slide Title**: Authentication Mechanics
* **Bullet Points**:
  * Client sends login credentials to `/api/auth/login`
  * Server searches user, matching password hash values using bcrypt
  * Generates stateless JWT session token mapping user object
  * Frontend stores token in localStorage and attaches it to subsequent requests in the `Authorization: Bearer` header
* **Talking Points**:
  * Security is a core focus of SkyPulse. We implement a secure, stateless JWT authentication flow.
  * When a user registers or logs in, their password is encrypted using bcrypt with 10 salt rounds. If authenticated, the server returns a JWT that the client attaches to all subsequent requests.

---

### Slide 7: Interactive Map Integration
* **Slide Title**: Geographic Visualizations
* **Bullet Points**:
  * Map tiles powered by Leaflet.js
  * Pins mapped automatically for current search locations and saved favorites
  * Interactive click events: Click anywhere on the map to reverse-geocode coordinates and fetch local weather instantly
* **Talking Points**:
  * Instead of using expensive, proprietary map solutions, SkyPulse uses Leaflet.js.
  * The map displays custom marker pins for all the user's favorite cities. Additionally, users can click anywhere on the map to trigger a coordinate lookup and query that area's weather immediately.

---

### Slide 8: Data Visualization Charts
* **Slide Title**: Dynamic Trend Visualizations
* **Bullet Points**:
  * Interactive graphs powered by Chart.js
  * Temperature Trend line graph with accent gradient fills
  * Humidity bar graph & Wind speed dotted line trend plots
  * Grouped bar charts mapping weekly high/low temperature ranges
* **Talking Points**:
  * To make weather trends easy to understand, we integrated Chart.js.
  * The charts are fully interactive and update automatically on new searches. They render line and bar graphs mapping temperature, humidity, wind patterns, and weekly high/low ranges.

---

### Slide 9: Smart Insights Recommendations Engine
* **Slide Title**: Rule-Based Recommendation Engine
* **Bullet Points**:
  * Automated Daily Summary: Natural language descriptions of current conditions
  * Clothing Engine: Custom suggestions based on temperature, rain, wind, and UV readings
  * Travel Score: Scoring logic (0-100) recommending outdoor suitability
  * Severe Weather Warnings: Highlighted alerts for poor AQI, high UV levels, and freezing temperatures
* **Talking Points**:
  * The highlight of this project is the Smart Insights engine, which runs rules on fetched data points to generate personalized recommendations.
  * It suggests appropriate clothing, calculates an outdoor suitability score (0-100), and flags severe weather alerts for conditions like high UV or poor air quality.

---

### Slide 10: Live Demonstration (Walkthrough steps)
* **Slide Title**: Live System Demonstration
* **Action Steps**:
  1. Show registration page, create account `test@pbl.com`
  2. Search for `Karachi` in search autocomplete dropdown list
  3. View temperature details, air quality levels, and hourly forecast scrolls
  4. Toggle Celsius to Fahrenheit, showing conversion across dashboard
  5. Add location to favorites, show heart change and favorites list update
  6. Click map to show location update
  7. Toggle light mode, showing glassmorphic layout updates
* **Talking Points**:
  * Let me walk you through the system. 
  * I will start by registering a new account. Once inside, we search for a city. Note the autocomplete dropdown suggestions list as I type.
  * As you can see, the weather dashboard details, maps, charts, and smart insights all update in real time. We can toggle units, bookmark favorites, and see the map reflect our current search.

---

### Slide 11: Challenges & Solutions
* **Slide Title**: Engineering Challenges
* **Bullet Points**:
  * *Challenge*: API quota limits on geocoding lookups  
    *Solution*: Implemented client-side input debounce timers (350ms)
  * *Challenge*: Multer file uploads path issues  
    *Solution*: Created auto-saved uploads directories with `.gitkeep` files
  * *Challenge*: Chart.js overlapping canvas bugs  
    *Solution*: Implemented cleanup lifecycle hook triggers (`chart.destroy()`)
* **Talking Points**:
  * During development, we resolved several key challenges.
  * For instance, to avoid hitting API rate limits during search typing, we implemented a 350ms input debounce. We also resolved Chart.js canvas overlap issues by calling `destroy()` on previous chart instances before rendering new ones.

---

### Slide 12: Project Learning Outcomes
* **Slide Title**: Conclusion & Academic Takeaways
* **Bullet Points**:
  * Mastered MVC full-stack architectural design principles
  * Learned to implement secure JWT token structures and password hashing
  * Gained experience integrating third-party REST APIs (Open-Meteo)
  * Developed skills in responsive UI engineering using vanilla CSS variables
* **Talking Points**:
  * In conclusion, building SkyPulse has been an invaluable learning experience.
  * I gained hands-on experience structuring a full-stack MVC codebase, implementing secure token-based user sessions, handling file uploads, and creating responsive interfaces without relying on heavy frameworks.
  * Thank you for your time. I am now open to any questions you may have.
