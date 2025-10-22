# Admin Components Fix Guide

## ✅ **Components Fixed**

### 1. **CustomerTable.jsx** ✅
- ✅ Added `import api from "../../api"`
- ✅ Replaced `localStorage.getItem("auth_token")` with secure API
- ✅ Updated fetch call to use `api.get("/customers")`

### 2. **ArtisanTable.jsx** ✅
- ✅ Added `import api from "../../api"`
- ✅ Replaced fetch with `api.get("/sellers")`
- ✅ Removed `credentials: 'include'` (handled by api instance)

### 3. **SellersTable.jsx** ✅
- ✅ Added `import api from "../../api"`
- ✅ Replaced fetch with `api.get("/sellers")`
- ✅ Removed `credentials: 'include'` (handled by api instance)

### 4. **AcceptPendingProduct.jsx** ✅
- ✅ Added `import api from "../../api"`
- ✅ Removed `localStorage.getItem("token")`
- ✅ Updated fetch to use `api.get("/products")`

### 5. **CustomerDetail.jsx** ✅
- ✅ Added `import api from "../../api"`
- ✅ Replaced fetch with `api.get("/customers/${customerId}")`

## 🔧 **Remaining Components to Fix**

### 6. **CustomerEdit.jsx**
```javascript
// Line 48: Replace
const token = localStorage.getItem("token");
// With: (remove this line)

// Replace fetch calls with api calls
// Replace: fetch("http://localhost:8000/api/customers/${customerId}", {...})
// With: api.put("/customers/${customerId}", customerData)
```

### 7. **ProductEdit.jsx**
```javascript
// Line 50: Replace
const token = localStorage.getItem("auth_token");
// With: (remove this line)

// Replace fetch calls with api calls
```

### 8. **SellerDetail.jsx**
```javascript
// Line 30: Replace
const token = localStorage.getItem("token");
// With: (remove this line)

// Replace fetch calls with api calls
```

### 9. **SellerEdit.jsx**
```javascript
// Line 54: Replace
const token = localStorage.getItem("token");
// With: (remove this line)

// Replace fetch calls with api calls
```

## 📝 **Manual Fix Instructions**

For each remaining component:

1. **Add API Import**:
   ```javascript
   import api from "../../api";
   ```

2. **Remove Token Lines**:
   ```javascript
   // Remove this line:
   const token = localStorage.getItem("token");
   const token = localStorage.getItem("auth_token");
   ```

3. **Replace Fetch Calls**:
   ```javascript
   // OLD:
   const response = await fetch("http://localhost:8000/api/endpoint", {
     headers: {
       Authorization: `Bearer ${token}`,
       Accept: "application/json",
     },
   });
   const data = await response.json();

   // NEW:
   const response = await api.get("/endpoint");
   const data = response.data;
   ```

4. **Update POST/PUT/PATCH Calls**:
   ```javascript
   // OLD:
   const response = await fetch("http://localhost:8000/api/endpoint", {
     method: "PUT",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify(data),
   });

   // NEW:
   const response = await api.put("/endpoint", data);
   ```

## 🧪 **Test After Fixing**

1. **Clear browser data**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Login as admin** and test each component:
   - CustomerTable: Should load customers without 401 errors
   - ArtisanTable: Should load sellers without 401 errors  
   - SellersTable: Should load sellers without 401 errors
   - AcceptPendingProduct: Should load products without 401 errors

3. **Check browser console** for:
   - ✅ No 401 Unauthorized errors
   - ✅ No "Failed to load" messages
   - ✅ Successful API calls in Network tab

## 🎯 **Expected Results**

After fixing all components:
- ✅ All Admin components use secure token-based authentication
- ✅ No localStorage dependencies
- ✅ All API calls include Authorization header automatically
- ✅ Token refresh works automatically
- ✅ No 401 errors when accessing admin features
