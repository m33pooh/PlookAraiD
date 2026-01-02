# Project Name: Plook Arai Dee (What to Grow?)
**Description:** A smart agricultural platform that matches farmers' production (crops and livestock) with market demand and seasonality to solve oversupply issues and stabilize prices.

---

## 👥 1. User Management
System for managing accounts and profiles, categorized by user roles.
- [x] **Register / Login:** Support Email, Mobile Number, and Social Login (Line/Facebook/Google).
  > ✅ Implemented: Email/password authentication via NextAuth. Registration page allows role selection (Farmer/Buyer). Social login infrastructure ready but requires OAuth credentials configuration.
- [x] **User Role Selection:**
    - **Farmer:** Producers/Growers.
    - **Buyer:** Middlemen, Factories, Markets, Restaurants.
    - **General User:** General public/Consumers.
  > ✅ Implemented: Role enum (FARMER, BUYER, ADMIN) in schema. Role selection during registration. Separate dashboards for each role.
- [x] **Farmer Profile:**
    - Land Data (Size, Title deeds/Rights, Soil type).
    - Water Sources (Irrigation, Groundwater, Rainfall dependency).
    - Farm GPS Coordinates.
  > ✅ Implemented: Farm model with locationLat/Lng, areaSize, soilType, waterSource. MapPicker component for GPS coordinates with Leaflet integration. Farm management pages at `/farmer/farms`.
- [x] **Buyer Profile:**
    - Business Type.
    - Buying Station Location.
    - Identity Verification (KYC) for credibility.
  > ⚠️ Partially Implemented: Buyer dashboard exists. Buy request management available. KYC verification system not yet implemented.

## 🧠 2. Smart Matching Engine (Core Feature)
The central intelligence system for analyzing "What to produce?"
- [x] **Seasonal Analysis:** Recommendations for crops/livestock based on the agricultural calendar and suitable weather conditions for the current/upcoming period.
  > ✅ Implemented: Smart Matching Engine (`matching-engine.ts`) boosts score if product is in season. Match page displays seasonal suitability properly.
- [x] **Demand-Supply Matching:** Checks market demand within a specific radius (e.g., if a tomato sauce factory is nearby, the system suggests planting tomatoes).
  > ✅ Implemented: Engine checks for active Buy Requests and boosts score. 
- [x] **Suitability Scoring:** Calculates a suitability score (0-100%) based on:
    - Soil and water conditions.
    - Logistics distance to buyers.
    - Historical price trends during the estimated harvest period.
  > ✅ Implemented: Algorithm factors in soil type (basic check), water source, and existing demand. Returns weighted score.
- [x] **Conflict Warning:** Alerts if too many farmers in the same area are planting the same crop to prevent oversupply.
  > ✅ Implemented: Engine checks `Cultivation` records of neighbors and applies penalty/warning if oversupply risk is detected.

## 📊 3. Market & Price Dashboard
- [x] **Real-time Price Ticker:** Displays median prices from major central markets (e.g., Talaad Thai) and factory gate prices.
  > ✅ Implemented: MarketPrice model stores price data. Market page at `/market` displays prices from DB and CSV sources. Price unit detection for different products.
- [x] **Price Trend Graph:** Historical price charts (1-5 years) compared by season.
  > ✅ Implemented: MiniChart component in market-analysis page. Historical data visualization available. Price change percentages displayed.
- [x] **Wants / Buy Requests:** A bulletin board for purchase requests (specifying type, grade, quantity, and guaranteed price).
  > ✅ Implemented: BuyRequest model with quantity, priceOffered, description, expiryDate, status. Buyer can create/manage requests at `/buyer/requests`. Farmers can view available requests.
- [x] **Price Alerts:** Notify when product prices reach a target set by the user or change significantly.
  > ✅ Implemented: `PriceAlert` model with target price, direction (above/below), active status. Full CRUD API at `/api/price-alerts`. UI at `/farmer/price-alerts` with create modal, toggle, and delete functionality.
  - Set target price (upper/lower bounds) for specific products.
  - Alert when price reaches target threshold.
  - Push notification / Line / In-app notification options.

## 🚜 4. Production Planner
- [x] **ROI Calculator:** Tool to estimate costs vs. expected profits (Fertilizer, Feed, Labor).
  > ✅ Implemented: Product model has `baseCostPerRai`. `Cultivation` model stores `costDetails` JSON. Plan page calculates and displays dynamic ROI based on selected product and farm area.
- [x] **Activity Calendar:** Automated schedule generation (Planting date, Fertilizing, Vaccination schedule, Harvest date).
  > ✅ Implemented: Cultivation model tracks startDate, expectedHarvestDate, status (PLANNING, GROWING, HARVESTED, SOLD). Progress tracking in cultivation list. Plan page shows timeline.
- [x] **Weather Integration:** Connects with Weather APIs to alert for natural disasters or optimal working conditions.
  > ✅ Implemented: Integrated Open-Meteo API. `WeatherWidget` displays 5-day forecast (temp, rain) based on farm's specific GPS coordinates.
- [ ] **Activity Reminders:** Automated notifications for scheduled daily farm activities (e.g., Water, Fertilize, Harvest) derived from the Production Plan.
  - Daily reminder push for upcoming activities.
  - Pre-harvest countdown notifications.
  - Disaster alerts when severe weather detected (typhoon, flood, drought) integrated with Weather API.

## 🤝 5. Trading & Contracts
- [x] **Pre-order System:** Allows buyers to reserve produce before harvest.
  > ✅ Implemented: BuyRequest can target specific products with expiry dates. Contract links cultivation to buy request.
- [x] **Contract Farming Module:** Digital contract drafting system between farmers and buyers.
  > ✅ Implemented: Contract model with agreedPrice, agreedQuantity, status (DRAFT, SIGNED, COMPLETED, CANCELLED). Contract management pages for both farmers and buyers.
- [ ] **Order Tracking:** Tracks order status from planting/breeding to delivery.
  > ⚠️ Partially Implemented: CultivationStatus and ContractStatus track production/contract stages. Delivery tracking not yet implemented.
- [ ] **Status Updates:** Real-time notifications for contract updates (Signed/Completed), buy request matches, and service booking status changes.
  - Contract lifecycle: Draft → Signed → Completed/Cancelled.
  - Buy request matched notifications.
  - Service booking: Accepted → On the Way → Working → Completed.

## 🚚 6. Logistics & Support
- [x] **Logistics Matching:** Finds available agricultural transport vehicles in the area.
  > ✅ Implemented: TransportVehicle model with vehicle types (Pickup, Lorry, Tractor, Refrigerated, Flatbed). `/farmer/logistics` page for browsing vehicles. `/farmer/logistics/my-vehicles` for vehicle owners to register and manage vehicles. Distance-based filtering with Haversine formula.
- [x] **Co-Transportation:** Carpooling system for goods to share transport space and reduce costs.
  > ✅ Implemented: TransportRoute and TransportRouteParticipant models. `/farmer/logistics/share` page for viewing/creating shared routes. Farmers can join routes with available capacity. Real-time capacity tracking.
- [x] **Knowledge Base (Wiki):** Library of techniques for growing specific crops and raising livestock.
  > ✅ Implemented: KnowledgeArticle model with categories (Crop Guide, Livestock Guide, Pest Control, etc.). Public `/knowledge` page with search and category filtering. `/knowledge/[slug]` for article detail. `/admin/knowledge` for content management.


## 🚜 7. Service Marketplace
Centralized marketplace for agricultural services, integrated with the Production Planner.
- [x] **Service Booking:** Book services such as harvesting, drone spraying (fertilizer/pesticide), ploughing, and manual labor.
  > ✅ Implemented: Services page at `/farmer/services` with service categories (Harvesting, DroneSpray, Ploughing, Labor). Mock provider data displayed.
- [x] **Provider Matching:** Find nearby service providers with price comparisons and reviews.
  > ⚠️ Partially Implemented: UI shows providers with ratings and prices. Backend matching logic uses mock data.
- [x] **Integration with Planner:** Book services directly from the Production Plan calendar when scheduled activities are due.
  > ✅ Implemented: "Book Service" button added to Activity Schedule in Planner. Redirects to booking page with pre-filled parameters.
- [x] **Status Tracking:** Track job status (Accepted, On the Way, Working, Completed).
  > ✅ Implemented: Status tracking API (PATCH) and UI created. Provider Dashboard (`/provider/bookings`) and Farmer Booking List (`/farmer/services/bookings`) implemented.
- [ ] **Service Status Notifications:** Real-time alerts when service status changes.
  - Provider accepted booking notification.
  - "On the way" arrival alert.
  - Job completion confirmation.

## 🤖 8. AI Plant Doctor & IoT
Technology to assist during cultivation and reduce disease risks.
- [ ] **AI Disease Detection:** Analyzes plant diseases and pests via images.
- [ ] **Smart Chatbot:** 24/7 agricultural assistant (connected to Department of Agriculture data).
- [x] **IoT Dashboard Integration:** Supports connection with IoT devices (soil/air sensors) to view data via the app.
  > ✅ Implemented: IotDevice and IotReading models for sensor registration and data storage. Device management dashboard at `/farmer/iot` with real-time status, sensor cards, and add device modal. API endpoints for device CRUD and sensor readings.

## 💰 9. Agri-Finance & Crowdfunding
Solving liquidity problems for farmers.
- [ ] **Plot Crowdfunding:** "Farm Plot Reservation" funding system for retail investors.
- [ ] **Micro-Insurance:** Plot-based crop insurance (Drought/Flood) connected to weather data for automatic claims.
- [ ] **Credit Score for Farmers:** Generates credit scores from planting/selling history for loan applications.

## 🏷️ 10. Standard & Traceability
Elevating product standards and building trust.
- [ ] **GAP/Organic Checklist:** Checklist to prepare for standard certification requests.
- [ ] **Product Story (QR Code):** Generates QR codes for products allowing buyers to scan and see the source and planting methods.
- [ ] **E-Certificate Wallet:** Digital wallet for storing certification documents.

## ♻️ 11. Waste & By-product Exchange
Turning agricultural waste into income and reducing burning.
- [x] **Biomass Marketplace:** Marketplace for trading rice straw, corn cobs, animal manure, etc.
  > ✅ Implemented: BiomassListing model with WasteCategory enum (RICE_STRAW, CORN_COB, SUGARCANE_LEAVES, ANIMAL_MANURE, FRUIT_WASTE, VEGETABLE_WASTE, OTHER). Full CRUD API at `/api/waste/listings`. Marketplace UI at `/farmer/waste` with category filters, search, location-based filtering. My Listings management at `/farmer/waste/my-listings`.
- [x] **Waste Logistics:** Transport system specifically for agricultural by-products.
  > ✅ Implemented: Integrated with existing Transport system. Waste listings include location data and can use existing Logistics features for transportation.

## 🔔 12. Notification Center
Centralized system for managing all alerts and notifications across the platform.
- [x] **Multi-channel Support:** Unified notification delivery across multiple channels.
  > ✅ Implemented: `Notification` model with type enum (PRICE_ALERT, ACTIVITY_REMINDER, WEATHER_ALERT, CONTRACT_STATUS, SERVICE_BOOKING, QUEST_REWARD, SYSTEM). Full CRUD API at `/api/notifications`. NotificationDropdown component with real-time polling. Notification Center UI at `/farmer/notifications` with filtering and pagination.
  - **In-App Notifications:** Real-time notification bell/inbox within the application.
  - **Push Notifications:** Mobile push alerts via Firebase Cloud Messaging (FCM) for instant delivery.
  - **Line Messaging API:** Integration with Line Official Account for Thai user base.
- [x] **Notification Settings:** Granular user preferences for each notification category.
  > ✅ Implemented: `NotificationPreference` model with per-category toggles and quiet hours. API at `/api/notifications/preferences`. Settings UI at `/farmer/notifications/settings`.
  - Enable/disable notifications per category (Price Alerts, Activity Reminders, Status Updates, Weather Alerts, etc.).
  - Choose preferred channel per category (In-App only, Push, Line, or All).
  - Quiet hours / Do Not Disturb mode configuration.
- [x] **Notification Types Covered:**
  > ✅ Implemented: NotificationType enum covers all categories.
  - Price Alerts (Market & Price Dashboard)
  - Activity Reminders (Production Planner)
  - Disaster/Weather Alerts (Production Planner - Weather Integration)
  - Contract Status Updates (Trading & Contracts)
  - Service Booking Updates (Service Marketplace)
  - Quest Rewards & Points (Gamification)

---

## 🎮 13. Gamification
- [x] **Daily Quest:** Daily missions (e.g., Log activity, Take a photo of the plot) to earn points.
  > ✅ Implemented: Quest and QuestCompletion models. 6 quest types (DAILY_LOGIN, LOG_ACTIVITY, PHOTO_UPLOAD, MARKET_CHECK, PLAN_UPDATE, IOT_CHECK). Quest API at `/api/quests`. Daily Quests UI at `/farmer/quests` with progress tracking and point celebration animations.
- [x] **Reward System:** Redeem points for fertilizer discounts, seeds, or service fees.
  > ✅ Implemented: RewardItem and PointTransaction models. Point balance tracking on User model. Rewards API at `/api/rewards` with redemption. Rewards Shop UI at `/farmer/rewards` with balance display, reward catalog, stock tracking, and transaction history.

---

## 📈 Implementation Summary

| Feature Area | Implemented | Partial | Not Implemented |
|-------------|-------------|---------|-----------------|
| 1. User Management | 3 | 1 | 0 |
| 2. Smart Matching Engine | 4 | 0 | 0 |
| 3. Market & Price Dashboard | 3 | 0 | 0 |
| 4. Production Planner | 3 | 0 | 0 |
| 5. Trading & Contracts | 2 | 1 | 0 |
| 6. Logistics & Support | 3 | 0 | 0 |
| 7. Service Marketplace | 3 | 1 | 0 |
| **Total** | **21** | **3** | **0** |

### Priority Recommendations:
1. **High Priority - Smart Matching Engine:** Core differentiator not yet implemented. Focus on seasonal analysis algorithm and demand-supply matching.
2. **Medium Priority - Weather Integration:** Important for farmer decision-making. Integrate Thai Meteorological Dept API or OpenWeather.
3. **Medium Priority - Logistics:** Essential for end-to-end platform experience.
4. **Lower Priority - Service Planner Integration:** Can be phased in after core features are stable.

---

## 🛠 Tech Stack (Preliminary)
* **Frontend:** ~~React.js / Vue.js~~ Next.js 16 (App Router) / Tailwind CSS ✅
* **Backend:** ~~Node.js / Python~~ Next.js API Routes / Prisma ORM ✅
* **Database:** PostgreSQL (Relational Data) ✅
* **Maps API:** ~~Google Maps Platform / Longdo Map / Mapbox~~ Leaflet + OpenStreetMap ✅
* **Authentication:** NextAuth.js ✅