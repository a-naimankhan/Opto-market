# OptoMarket: Wholesale Agricultural Marketplace 🌾🛒
 
OptoMarket is a two-sided wholesale marketplace for agricultural goods. Buyers can browse products, add them to a cart, place orders, and leave reviews. Sellers manage their inventory, track incoming orders, update statuses, and view customer summaries — all through a dedicated dashboard.
 
---
 
## 🤝 Team Members
 
## Naimankhan Aibar
## Muratov Nurali
   Baltabay Akniyet
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | Angular 21, Standalone Components, Angular Router, Reactive Forms, RxJS |
| Backend | Django 5.1 + Django REST Framework |
| Database | SQLite |
| Authentication | JWT (JSON Web Tokens) + HTTP Interceptor |
| File Uploads | Django FileField for product images |
 
---
 
## 🚀 Key Features
 
### 1. Buyer Storefront 🏪
The landing page serves as the main product catalog for buyers.
 
- **Product Catalog** — browse all available agricultural products with images, seller name, stock, rating, and review count
- **Search & Filter** — search by product name, seller, or category; filter for discounted "Выгодные предложения"
- **Cart Sidebar** — quickly add products and manage quantities directly from the landing page
### 2. Cart & Checkout 💳
 
- **Cart Page** — increase/decrease quantity, manual input, remove items, clear cart
- **Cart Persistence** — cart state is saved per authenticated user in `localStorage`
- **Checkout Form** — buyer contact details, optional alternate recipient, pickup or delivery, cash or non-cash payment, draft save, template save/load, and full validation
### 3. Buyer Orders & Reviews 📋
 
- View full order history with date range and status filtering
- Submit product reviews directly from the orders page
- Existing reviews are pre-filled if the buyer already reviewed a product
### 4. Seller Dashboard 📊
 
- **Products Page** — list, create, and edit products with image upload, sale toggle, discount percent, and client-side validation
- **Orders Page** — view incoming orders, filter by date, update order statuses via modal
- **Customers Page** — grouped customer list with contact details and per-customer order history
- **Categories Page** — catalog-style browser with category filters, search, and pagination
### 5. Authentication & Roles 🔐
 
- Separate buyer and seller registration with role selection
- JWT login with access token stored in `localStorage`
- HTTP interceptor automatically attaches `Authorization: Bearer` header to all requests
- Buyer-only route guard protects cart, checkout, and orders pages
---
 
## 🗺️ Routing Structure
 
| Route | Description |
|---|---|
| `/` | Buyer landing page / product catalog |
| `/buyer/cart` | Buyer cart management |
| `/buyer/checkout` | Order placement form |
| `/buyer/orders` | Buyer order history and reviews |
| `/seller/login` | Seller authentication |
| `/seller/products` | Seller inventory management |
| `/seller/orders` | Seller order management |
| `/seller/customers` | Seller customer overview |
| `/seller/categories` | Category browser |
 
---
 
## 🗄️ Data Models
 
| Model | Description |
|---|---|
| `UserProfile` | Extends Django `User` with `buyer` / `seller` role |
| `Category` | Product categories |
| `Product` | Catalog item with owner, stock, unit, image, sale flags, seller contact info |
| `ProductReview` | Review tied to a product and user, unique per user/product pair |
| `Order` | One product per row; includes customer, recipient, delivery, payment metadata, and status |
| `OrderStatusHistory` | Audit log of all order status transitions |
 
---
 
## 🔌 API Endpoints
 
### 🔐 Auth / User
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register/` | Register a new buyer or seller account |
| `POST` | `/api/token/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/token/refresh/` | Refresh the access token |
| `GET` | `/api/user/profile/` | Get the authenticated user's profile and role |
 
### 📦 Products & Categories
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products/` | List all available products |
| `POST` | `/api/products/` | Create a new product (seller) |
| `PATCH` | `/api/products/<id>/` | Partially update a product (seller) |
| `DELETE` | `/api/products/<id>/` | Delete a product (seller) |
| `GET` | `/api/categories/` | List all product categories |
 
### ⭐ Reviews
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products/<id>/reviews/` | Get all reviews for a product |
| `POST` | `/api/products/<id>/reviews/` | Submit a review (buyer who ordered the product) |
 
### 🧾 Orders
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders/` | Get orders (buyer sees own, seller sees orders for their products) |
| `POST` | `/api/orders/` | Place an order (checkout) |
| `PATCH` | `/api/orders/<id>/status/` | Update order status (seller only) |
 
---
 
## 🔄 Key Data Flows
 
### Buyer Checkout Flow
 
```
1. Buyer adds products to local cart
2. Checkout page builds CheckoutPayload
3. POST /api/orders/ — creates one Order row per cart item
4. Backend decrements product stock
5. Frontend clears cart and redirects to buyer orders page
```
 
### Seller Order Status Update Flow
 
```
1. Seller loads orders via GET /api/orders/
2. Seller opens modal and selects new status
3. PATCH /api/orders/<id>/status/ is sent
4. Backend verifies seller owns the product in that order
5. Backend updates status and writes OrderStatusHistory entry
6. Frontend reloads the seller orders page
```
 
---
 
## 🚀 Getting Started
 
### Start Everything With Docker

```bash
docker compose up --build
```

This starts both services together:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8000/api/`

The backend runs migrations automatically on startup. The Angular container proxies `/api` and `/media` requests to Django, so the frontend and backend work together from a single `docker compose up --build` command.

### Backend Without Docker

```bash
cd Server/optomarket_back
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Without Docker

```bash
cd Client
npm install
npm start
```
 
