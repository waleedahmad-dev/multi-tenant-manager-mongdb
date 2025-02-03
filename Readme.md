# Multi-Tenant MongoDB Manager

This project provides a simple way to manage multiple MongoDB databases for a multi-tenant application using Mongoose.

## Installation

```bash
npm install mongoose
```

## Usage

### Importing the MongoDBManager

```javascript
const MongoDBManager = require("./mongodb-manager");
```

### Adding Databases

```javascript
await MongoDBManager.addDatabase(
  "tenant1",
  "mongodb://localhost:27017/tenant1"
);
await MongoDBManager.addDatabase(
  "tenant2",
  "mongodb://localhost:27017/tenant2"
);
```

### Defining Schemas

```javascript
const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
};

const productSchema = {
  name: String,
  price: Number,
  inventory: Number,
};
```

### Registering Models

```javascript
MongoDBManager.getModel("tenant1", "User", userSchema, { timestamps: true });
MongoDBManager.getModel("tenant2", "User", userSchema);
MongoDBManager.getModel("tenant1", "Product", productSchema);
```

### Creating Documents

```javascript
const user1 = await MongoDBManager.create("tenant1", "User", {
  name: "John Doe",
  email: "john@example.com",
});
```

### Finding Documents

```javascript
const products = await MongoDBManager.find("tenant1", "Product", {
  price: { $lt: 100 },
});
```

### Updating Documents

```javascript
await MongoDBManager.updateOne(
  "tenant2",
  "User",
  { email: "john@example.com" },
  { $set: { name: "Johnny Doe" } }
);
```

### Deleting Documents

```javascript
await MongoDBManager.deleteOne("tenant1", "User", {
  email: "john@example.com",
});
```

### Aggregating Documents

```javascript
const results = await MongoDBManager.aggregate("tenant1", "Product", [
  { $match: { price: { $gt: 50 } } },
  { $group: { _id: "$category", total: { $sum: "$price" } } },
]);
```

### Disconnecting Databases

```javascript
await MongoDBManager.disconnect("tenant1");
await MongoDBManager.disconnectAll();
```

## Error Handling

All methods throw errors if the specified database or model is not found. Ensure to use try-catch blocks to handle these errors gracefully.

```javascript
try {
  // ...your code...
} catch (error) {
  console.error("Application error:", error);
}
```

## License

This project is licensed under the MIT License.
