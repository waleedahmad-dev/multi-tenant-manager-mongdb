const mongoose = require("mongoose");

class MongoDBManager {
  static connections = new Map();

  static async addDatabase(configKey, uri, options = {}) {
    if (this.connections.has(configKey)) {
      return this.connections.get(configKey).conn;
    }

    const conn = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options,
    });

    this.connections.set(configKey, {
      conn,
      models: new Map(),
    });

    await new Promise((resolve, reject) => {
      conn.on("open", () => resolve());
      conn.on("error", (err) => reject(err));
    });

    return conn;
  }

  static getModel(configKey, modelName, schemaDefinition, schemaOptions = {}) {
    if (!this.connections.has(configKey)) {
      throw new Error(
        `Database config "${configKey}" not found. Add database first.`
      );
    }

    const { conn, models } = this.connections.get(configKey);

    if (models.has(modelName)) {
      return models.get(modelName);
    }

    const schema = new mongoose.Schema(schemaDefinition, schemaOptions);
    const model = conn.model(modelName, schema);
    models.set(modelName, model);

    return model;
  }

  static async create(configKey, modelName, data) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.create(data);
  }

  static async find(
    configKey,
    modelName,
    query = {},
    projection = {},
    options = {}
  ) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.find(query, projection, options).lean().exec();
  }

  static async findById(configKey, modelName, id, projection = {}) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.findById(id, projection).lean().exec();
  }

  static async updateOne(configKey, modelName, filter, update, options = {}) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.updateOne(filter, update, options).exec();
  }

  static async deleteOne(configKey, modelName, filter, options = {}) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.deleteOne(filter, options).exec();
  }

  static async aggregate(configKey, modelName, pipeline = []) {
    const Model = this.getExistingModel(configKey, modelName);
    return Model.aggregate(pipeline).exec();
  }

  static async disconnect(configKey) {
    if (!this.connections.has(configKey)) return;

    const { conn } = this.connections.get(configKey);
    await conn.close();
    this.connections.delete(configKey);
  }

  static async disconnectAll() {
    await Promise.all(
      Array.from(this.connections.keys()).map((key) => this.disconnect(key))
    );
  }

  static getExistingModel(configKey, modelName) {
    if (!this.connections.has(configKey)) {
      throw new Error(`Database config "${configKey}" not found`);
    }

    const { models } = this.connections.get(configKey);
    if (!models.has(modelName)) {
      throw new Error(
        `Model "${modelName}" not found in config "${configKey}"`
      );
    }

    return models.get(modelName);
  }
}

module.exports = MongoDBManager;
