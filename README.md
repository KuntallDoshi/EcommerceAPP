# ecomerceAppAPI
This is EcommerceApp Api in Nodejs 
# E-Commerce REST API Documentation

**Base URL Note:** The endpoints below are relative to where you mount these routers in your main Express app (e.g., `/api/brands`, `/api/categories`, etc.). 

**Standard Success Response Format:**
\`\`\`json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... } // or null
}
\`\`\`

---

## 1. Brands API
**Model Requirements:** `name` (String, required), `subcategoryId` (ObjectId, required).

* **GET `/`** - Get all brands (sorted by subcategoryId)
* **GET `/:id`** - Get brand by ID
* **POST `/`** - Create a new brand
  * **Body (JSON):** `{ "name": "Brand Name", "subcategoryId": "ObjectId" }`
* **PUT `/:id`** - Update a brand
  * **Body (JSON):** `{ "name": "Updated Name", "subcategoryId": "ObjectId" }`
* **DELETE `/:id`** - Delete a brand *(Fails if products reference this brand)*

---

## 2. Categories API
**Model Requirements:** `name` (String, required), `image` (String URL, required).

* **GET `/`** - Get all categories
* **GET `/:id`** - Get category by ID
* **POST `/`** - Create a new category
  * **Headers:** `Content-Type: multipart/form-data`
  * **Payload:** `name` (Text), `img` (File, max 5MB)
* **PUT `/:id`** - Update a category
  * **Headers:** `Content-Type: multipart/form-data`
  * **Payload:** `name` (Text), `image` (Text - existing URL), `img` (File - optional new image)
* **DELETE `/:id`** - Delete a category *(Fails if subcategories or products reference it)*

---

## 3. Coupons API

* **GET `/`** - Get all coupons
* **GET `/:id`** - Get coupon by ID
* **POST `/`** - Create a coupon
  * **Body (JSON):** \`\`\`json
    {
      "couponCode": "SUMMER20",
      "discountType": "fixed", 
      "discountAmount": 150,
      "minimumPurchaseAmount": 1000,
      "endDate": "2026-12-31T23:59:59.000Z",
      "status": "active", 
      "applicableCategory": "ObjectId (Optional)",
      "applicableSubCategory": "ObjectId (Optional)",
      "applicableProduct": "ObjectId (Optional)"
    }
    \`\`\`
* **PUT `/:id`** - Update a coupon (Same body as POST)
* **POST `/check-coupon`** - Validate a coupon
  * **Body (JSON):** `{ "couponCode": "SUMMER20", "productIds": ["ObjectId1"], "purchaseAmount": 1200 }`
* **DELETE `/:id`** - Delete a coupon

---

## 4. Notifications API (OneSignal)

* **GET `/all-notification`** - Get all notification logs
* **GET `/track-notification/:id`** - Track notification stats (uses OneSignal ID)
* **POST `/send-notification`** - Send push notification to all users
  * **Body (JSON):** `{ "title": "Mega Sale!", "description": "50% off!", "imageUrl": "url (Optional)" }`
* **DELETE `/delete-notification/:id`** - Delete a notification log

---

## 5. Orders API

* **GET `/`** - Get all orders
* **GET `/:id`** - Get order by ID
* **GET `/orderByUserId/:userId`** - Get all orders for a specific user
* **POST `/`** - Create a new order
  * **Body (JSON):**
    \`\`\`json
    {
      "userID": "ObjectId",
      "orderStatus": "pending",
      "items": [
        { "productID": "ObjectId", "productName": "Item 1", "quantity": 2, "price": 500, "variant": "Black" }
      ],
      "totalPrice": 1000,
      "shippingAddress": { "phone": "9876543210", "street": "123 Main St", "city": "City", "state": "State", "postalCode": "123456", "country": "Country" },
      "paymentMethod": "cod", 
      "couponCode": "ObjectId (Optional)",
      "orderTotal": { "subtotal": 1000, "discount": 100, "total": 900 },
      "trackingUrl": "url"
    }
    \`\`\`
* **PUT `/:id`** - Update order status
  * **Body (JSON):** `{ "orderStatus": "shipped", "trackingUrl": "url" }`
* **DELETE `/:id`** - Delete an order

---

## 6. Posters API

* **GET `/`** - Get all posters
* **GET `/:id`** - Get poster by ID
* **POST `/`** - Create a poster
  * **Headers:** `multipart/form-data`
  * **Payload:** `posterName` (Text), `img` (File, max 5MB)
* **PUT `/:id`** - Update a poster
  * **Headers:** `multipart/form-data`
  * **Payload:** `posterName` (Text), `image` (Text - existing URL), `img` (File - optional)
* **DELETE `/:id`** - Delete a poster

---

## 7. Products API

* **GET `/`** - Get all products
* **GET `/:id`** - Get product by ID
* **POST `/`** & **PUT `/:id`** - Create / Update product
  * **Headers:** `multipart/form-data`
  * **Payload:** * `name`, `description`, `quantity`, `price`, `offerPrice`
    * `proCategoryId`, `proSubCategoryId`, `proBrandId`, `proVariantTypeId`, `proVariantId`
    * `image1` to `image5` (Files - up to 5 images, max 5MB each)
* **DELETE `/:id`** - Delete a product

---

## 8. Users API

* **GET `/`** - Get all users
* **GET `/:id`** - Get user by ID
* **POST `/register`** - Register a new user
  * **Body (JSON):** `{ "name": "John", "email": "john@email.com", "password": "pass", "role": "user" }`
* **POST `/login`** - User login
  * **Body (JSON):** `{ "email": "john@email.com", "password": "pass" }`
* **PUT `/:id`** - Update user details
  * **Body (JSON):** `{ "name": "John Updated", "password": "newpass" }`
* **DELETE `/:id`** - Delete a user
