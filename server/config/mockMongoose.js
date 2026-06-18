const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', '..', 'uploads', 'db.json');

// Ensure database file exists
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // Ensure parent uploads folder exists
    const uploadsDir = path.dirname(DB_FILE);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], favorites: [], searchhistorys: [] }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], favorites: [], searchhistorys: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const mockMongoose = {
  Schema: (function() {
    class Schema {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
        this.methods = {};
        this.statics = {};
        this.hooks = { pre: {} };
      }
      index() {}
      pre(hookName, fn) {
        this.hooks.pre[hookName] = fn;
      }
    }
    Schema.Types = { ObjectId: 'ObjectId' };
    return Schema;
  })(),

  model(modelName, schema) {
    const collectionName = modelName.toLowerCase() + 's';

    function makePlainObject(obj) {
      if (obj && typeof obj === 'object') {
        if (!obj.toObject) {
          obj.toObject = function() {
            const plain = { ...this };
            delete plain.toObject;
            return plain;
          };
        }
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            makePlainObject(obj[key]);
          }
        }
      }
    }

    function applyDefaults(data, definition) {
      for (const [key, spec] of Object.entries(definition)) {
        if (spec && typeof spec === 'object') {
          if (spec.hasOwnProperty('default')) {
            if (data[key] === undefined) {
              data[key] = typeof spec.default === 'function' ? spec.default() : spec.default;
            }
          } else if (!spec.type) {
            // Nested object without type
            if (data[key] === undefined) data[key] = {};
            applyDefaults(data[key], spec);
          }
        }
      }
    }

    class ModelInstance {
      constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = generateId();

        // Bind schema methods
        if (schema && schema.methods) {
          for (const [name, fn] of Object.entries(schema.methods)) {
            this[name] = fn.bind(this);
          }
        }

        // Apply defaults
        if (schema && schema.definition) {
          applyDefaults(this, schema.definition);
        }

        makePlainObject(this);
      }

      isModified(field) {
        return true;
      }

      toObject() {
        const plain = { ...this };
        delete plain.toObject;
        delete plain.isModified;
        return plain;
      }

      async save() {
        // Run pre-save hooks (like password hashing)
        if (schema && schema.hooks && schema.hooks.pre['save']) {
          const next = () => {};
          await schema.hooks.pre['save'].call(this, next);
        }

        const db = readDB();
        if (!db[collectionName]) db[collectionName] = [];
        
        const index = db[collectionName].findIndex(item => item._id === this._id);

        const plainData = { ...this };
        // Remove functions/methods before storing
        for (const key of Object.keys(plainData)) {
          if (typeof plainData[key] === 'function') {
            delete plainData[key];
          }
        }
        if (schema && schema.methods) {
          for (const name of Object.keys(schema.methods)) {
            delete plainData[name];
          }
        }

        if (index >= 0) {
          db[collectionName][index] = plainData;
        } else {
          db[collectionName].push(plainData);
        }

        writeDB(db);
        return this;
      }

      async deleteOne() {
        const db = readDB();
        if (db[collectionName]) {
          db[collectionName] = db[collectionName].filter(item => item._id !== this._id);
          writeDB(db);
        }
        return { deletedCount: 1 };
      }
    }

    const ModelClass = {
      modelName,
      schema,

      createInstance(data) {
        return new ModelInstance(data);
      },

      async create(data) {
        const instance = new ModelInstance(data);
        await instance.save();
        return instance;
      },

      async findOne(query) {
        const db = readDB();
        const collection = db[collectionName] || [];
        const found = collection.find(item => {
          return Object.entries(query).every(([key, val]) => {
            if (val && typeof val === 'object' && val.$in) {
              return val.$in.includes(item[key]);
            }
            return item[key] === val;
          });
        });
        if (!found) return null;
        return new ModelInstance(found);
      },

      async findById(id) {
        if (!id) return null;
        return ModelClass.findOne({ _id: id.toString() });
      },

      async findByIdAndUpdate(id, update, options) {
        const instance = await ModelClass.findById(id);
        if (!instance) return null;

        const plainUpdate = update.$set || update;
        Object.assign(instance, plainUpdate);
        
        // Preserve any mongoose preference logic
        if (plainUpdate.preferences && instance.preferences) {
          instance.preferences = {
            ...instance.preferences,
            ...plainUpdate.preferences
          };
        }

        await instance.save();
        return instance;
      },

      async countDocuments(query) {
        const db = readDB();
        const collection = db[collectionName] || [];
        const filtered = collection.filter(item => {
          return Object.entries(query).every(([key, val]) => item[key] === val);
        });
        return filtered.length;
      },

      async deleteMany(query) {
        const db = readDB();
        const collection = db[collectionName] || [];
        db[collectionName] = collection.filter(item => {
          const match = Object.entries(query).every(([key, val]) => {
            if (val && typeof val === 'object' && val.$in) {
              return val.$in.includes(item[key]);
            }
            return item[key] === val;
          });
          return !match;
        });
        writeDB(db);
        return { deletedCount: collection.length - db[collectionName].length };
      },

      find(query) {
        const db = readDB();
        const collection = db[collectionName] || [];
        let results = collection.filter(item => {
          return Object.entries(query).every(([key, val]) => {
            if (val && typeof val === 'object' && val.$in) {
              return val.$in.includes(item[key]);
            }
            return item[key] === val;
          });
        });

        const queryBuilder = {
          results,
          sort(sortQuery) {
            const [key, dir] = Object.entries(sortQuery)[0];
            this.results.sort((a, b) => {
              if (a[key] < b[key]) return dir === 1 ? -1 : 1;
              if (a[key] > b[key]) return dir === 1 ? 1 : -1;
              return 0;
            });
            return this;
          },
          limit(num) {
            this.results = this.results.slice(0, num);
            return this;
          },
          select(fields) {
            return this;
          },
          then(resolve, reject) {
            resolve(this.results.map(item => new ModelInstance(item)));
          }
        };

        return queryBuilder;
      }
    };

    // Support select('+password') chained onto findOne
    const originalFindOne = ModelClass.findOne;
    ModelClass.findOne = function(query) {
      const queryBuilder = {
        select(fields) {
          return this;
        },
        then(resolve, reject) {
          originalFindOne(query).then(resolve, reject);
        }
      };
      return queryBuilder;
    };

    return ModelClass;
  },

  connect(uri, options) {
    console.log('Connecting to Local JSON Database Fallback...');
    return Promise.resolve({
      connection: {
        host: 'LocalJSONFile'
      }
    });
  }
};

module.exports = mockMongoose;
