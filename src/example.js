const MongoDBManager = require("./mongodb-manager");

async function main() {
  try {
    // Add databases
    await MongoDBManager.addDatabase(
      "tenant1",
      "mongodb://localhost:27017/tenant1"
    );
    await MongoDBManager.addDatabase(
      "tenant2",
      "mongodb://localhost:27017/tenant2"
    );

    // Define schemas
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

    // Register models
    MongoDBManager.getModel("tenant1", "User", userSchema, {
      timestamps: true,
    });
    MongoDBManager.getModel("tenant2", "User", userSchema);
    MongoDBManager.getModel("tenant1", "Product", productSchema);

    // Usage examples
    const user1 = await MongoDBManager.create("tenant1", "User", {
      name: "John Doe",
      email: "john@example.com",
    });

    const products = await MongoDBManager.find("tenant1", "Product", {
      price: { $lt: 100 },
    });

    await MongoDBManager.updateOne(
      "tenant2",
      "User",
      { email: "john@example.com" },
      { $set: { name: "Johnny Doe" } }
    );
  } catch (error) {
    console.error("Application error:", error);
  } finally {
    await MongoDBManager.disconnectAll();
  }
}

main();
