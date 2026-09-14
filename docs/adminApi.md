# Admin API — Frontend Integration Docs

> Base URL: `http://localhost:5000/api/v1/admin`
> All routes require: `Authorization: Bearer <admin_token>`

---

## 1. Get All Orders

```
GET /admin/orders
```

**Query Params**
| Param | Type | Required | Example |
|-------|------|----------|---------|
| `status` | string | ❌ | `pending` `paid` `shipped` `delivered` `cancelled` |

**Examples**
```
GET /admin/orders
GET /admin/orders?status=pending
GET /admin/orders?status=shipped
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "All Orders Fetch Successfully",
  "data": [
    {
      "_id": "6a9012077374d3694b9fe961",
      "userId": {
        "_id": "6a8ffc9528c5a9dc59b5bf13",
        "name": "Nadia Farooq",
        "email": "nadia@example.com"
      },
      "items": [
        {
          "productId": "6a9012077374d3694b9fe123",
          "seller_id": "6a8ffc9528c5a9dc59b5bf99",
          "productName": "Brass Paper Clips, Tin of 60",
          "price": 12.99,
          "quantity": 2
        }
      ],
      "totalAmount": 25.98,
      "status": "pending",
      "paymentStatus": "unpaid",
      "createdAt": "2026-06-02T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**
```json
{ "success": false, "message": "User not found" }
{ "success": false, "message": "Access Denied" }
```

---

## 2. Get All Users

```
GET /admin/users
```

**Query Params**
| Param | Type | Required | Example |
|-------|------|----------|---------|
| `role` | string | ❌ | `seller` `customer` |

**Examples**
```
GET /admin/users
GET /admin/users?role=seller
GET /admin/users?role=customer
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "All Users Fetch Successfully",
  "data": [
    {
      "_id": "6a8ffc9528c5a9dc59b5bf13",
      "name": "Nadia Farooq",
      "email": "nadia@example.com",
      "role": "customer",
      "isVerified": true,
      "profilePicture": "https://...",
      "createdAt": "2026-06-02T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**
```json
{ "success": false, "message": "User not found" }
{ "success": false, "message": "Access Denied" }
```

---

## 3. Get All Products

```
GET /admin/products
```

**Query Params**
| Param | Type | Required | Example |
|-------|------|----------|---------|
| `search` | string | ❌ | `clips` |
| `category` | string | ❌ | `stationary` `books` `art_supplies` `home_goods` `apparel` |
| `minPrice` | number | ❌ | `10` |
| `maxPrice` | number | ❌ | `100` |
| `isHidden` | boolean | ❌ | `true` `false` |

**Examples**
```
GET /admin/products
GET /admin/products?search=clips
GET /admin/products?category=stationary
GET /admin/products?minPrice=10&maxPrice=100
GET /admin/products?search=clips&category=stationary&minPrice=10&maxPrice=100&isHidden=false
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "All Products Fetch Successfully",
  "data": [
    {
      "_id": "6a9012077374d3694b9fe123",
      "manufacturer_id": "6a8ffc9528c5a9dc59b5bf99",
      "productName": "Brass Paper Clips, Tin of 60",
      "description": "Premium brass paper clips",
      "price": 12.99,
      "stock": 3,
      "category": "stationary",
      "sku": "BPC-60",
      "tags": ["handmade"],
      "images": ["https://..."],
      "isHidden": false,
      "specifications": [
        { "label": "Material", "value": "Brass" }
      ],
      "returns_note": "Returns accepted within 30 days",
      "createdAt": "2026-06-02T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**
```json
{ "success": false, "message": "User not found" }
{ "success": false, "message": "Access Denied" }
```
