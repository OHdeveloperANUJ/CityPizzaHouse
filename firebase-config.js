// Shared Firebase configuration. Import this before other scripts that need 'db'.
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "city-pizza-house.firebaseapp.com",
  databaseURL: "https://city-pizza-house-default-rtdb.firebaseio.com",
  projectId: "city-pizza-house",
  storageBucket: "city-pizza-house.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Check if the config contains default REPLACE placeholders
const isPlaceholderConfig = 
  firebaseConfig.apiKey.includes("REPLACE") || 
  firebaseConfig.databaseURL.includes("REPLACE") ||
  firebaseConfig.databaseURL.includes("replace-default-rtdb");

let db;

if (isPlaceholderConfig) {
  console.warn("CityHut Pizza: Using LocalStorage Mock Database fallback because Firebase is not configured.");

  // Mock Database Ref Class
  class MockDbRef {
    constructor(path, dbInstance) {
      this.path = path;
      this.db = dbInstance;
    }

    _generatePushKey() {
      return 'mock_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    _getDataAtPath() {
      const data = this.db._getData();
      if (!this.path) return data;
      const parts = this.path.split('/').filter(Boolean);
      let current = data;
      for (const part of parts) {
        if (current === null || current === undefined) return null;
        current = current[part];
      }
      return current !== undefined ? current : null;
    }

    _setDataAtPath(value) {
      const data = this.db._getData();
      if (!this.path) {
        this.db._setData(value);
        return;
      }
      const parts = this.path.split('/').filter(Boolean);
      let current = data;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
          current[part] = {};
        }
        current = current[part];
      }
      const lastPart = parts[parts.length - 1];
      if (value === null) {
        delete current[lastPart];
      } else {
        current[lastPart] = value;
      }
      this.db._setData(data);
      this.db._triggerListeners(this.path, value);
    }

    async set(value) {
      this._setDataAtPath(value);
      return Promise.resolve();
    }

    async update(value) {
      const current = this._getDataAtPath() || {};
      const updated = typeof current === 'object' && current !== null ? { ...current, ...value } : value;
      this._setDataAtPath(updated);
      return Promise.resolve();
    }

    push(value) {
      const key = this._generatePushKey();
      const newPath = this.path ? `${this.path}/${key}` : key;
      const newRef = new MockDbRef(newPath, this.db);
      if (value !== undefined) {
        newRef.set(value);
      }
      newRef.key = key;
      return newRef;
    }

    async remove() {
      this._setDataAtPath(null);
      return Promise.resolve();
    }

    once(eventType, callback) {
      if (eventType !== 'value') return Promise.reject("Only value events are supported in mock");
      const val = this._getDataAtPath();
      const snap = {
        val: () => val,
        key: this.path ? this.path.split('/').pop() : null,
        forEach: (cb) => {
          if (val && typeof val === 'object') {
            Object.keys(val).forEach(k => {
              cb({
                key: k,
                val: () => val[k]
              });
            });
          }
        }
      };
      if (typeof callback === 'function') {
        callback(snap);
      }
      return Promise.resolve(snap);
    }

    on(eventType, callback) {
      if (eventType !== 'value') return;
      this.db._addListener(this.path, callback);
      // Trigger immediately
      const val = this._getDataAtPath();
      const snap = {
        val: () => val,
        key: this.path ? this.path.split('/').pop() : null,
        forEach: (cb) => {
          if (val && typeof val === 'object') {
            Object.keys(val).forEach(k => {
              cb({
                key: k,
                val: () => val[k]
              });
            });
          }
        }
      };
      callback(snap);
      return callback;
    }

    off(eventType, callback) {
      if (eventType !== 'value') return;
      this.db._removeListener(this.path, callback);
    }
  }

  // Mock Database Class
  class MockDatabase {
    constructor() {
      this.listeners = [];
      // Initialize empty mock DB if not present
      if (!localStorage.getItem("cityhut_mock_db")) {
        const initialDb = {
          "cityhut": {
            "cms": {
              "settings": {
                "whatsappNumber": "917880105006",
                "restaurantName": "CityHut Pizza House",
                "openingHours": "11:00 AM – 10:00 PM",
                "ownerPassword": "owner2025",
                "waiterPassword": "waiter2025",
                "tableCodes": ["Pizza", "Burger", "Sandwich", "Garlic Bread", "Beverage", "Dessert"],
                "bill": {
                  "gstEnabled": true,
                  "gstPercentage": 5,
                  "serviceCharge": 0,
                  "headerText": "🍕 CITYHUT PIZZA",
                  "footerText": "Thank you for ordering!\nPlease visit again! 🙏"
                },
                "whatsappTemplates": {
                  "delivery": "Hello {restaurantName}! 🍕\n\n*New Delivery Order*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Name: {customerName}\n- Phone: {customerPhone}\n- Address: {customerAddress}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏",
                  "takeaway": "Hello {restaurantName}! 🍕\n\n*New Takeaway Order #{takeawayNum}*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Phone: {customerPhone}\n- Email: {customerEmail}\n- Takeaway No: {takeawayNum}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏"
                }
              },
              "hero": {
                "headline": "Kawardha ki Sabse Tasty Pizza 🍕",
                "description": "Fresh dough made daily, real premium mozzarella cheese, and rich homemade sauces — delivered steaming hot straight to your door.",
                "bgImage": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
                "badge1": "🚀 Fast Delivery",
                "badge2": "🧑‍🍳 Freshly Made",
                "badge3": "⭐ 256+ Happy Customers"
              },
              "categories": {
                "pizza": { "id": "pizza", "name": "Pizza", "icon": "🍕" },
                "burger": { "id": "burger", "name": "Burgers", "icon": "🍔" },
                "sandwich": { "id": "sandwich", "name": "Sandwiches", "icon": "🥪" },
                "garlic-bread": { "id": "garlic-bread", "name": "Garlic Bread", "icon": "🧄" },
                "beverage": { "id": "beverage", "name": "Beverages", "icon": "☕" }
              },
              "instagram": {
                "headline": "@cityhut_pizza on Instagram",
                "followUrl": "https://www.instagram.com/cityhut_pizza/",
                "posts": [
                  { "imageUrl": "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?q=80&w=400&auto=format&fit=crop", "caption": "Chef tossing fresh pizza dough", "emoji": "🍕" },
                  { "imageUrl": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop", "caption": "Cheese stretch on hot pizza slice", "emoji": "🧀" },
                  { "imageUrl": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop", "caption": "Juicy veg burger with fries", "emoji": "🍔" },
                  { "imageUrl": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop", "caption": "Thick chocolate shake and lemon soda", "emoji": "☕" }
                ]
              },
              "customizations": {
                "pizza": {
                  "crusts": [
                    { "name": "Classic Hand Tossed", "price": 0 },
                    { "name": "Wheat Thin Crust", "price": 30 },
                    { "name": "Fresh Pan Pizza", "price": 40 },
                    { "name": "Cheese Burst", "price": 60 }
                  ],
                  "addons": [
                    { "name": "Extra Cheese", "price": 40 },
                    { "name": "Extra Paneer", "price": 50 },
                    { "name": "Golden Corn", "price": 30 },
                    { "name": "Fresh Mushroom", "price": 30 },
                    { "name": "Capsicum & Onion", "price": 25 }
                  ]
                },
                "burger": {
                  "addons": [
                    { "name": "Extra Cheese Slice", "price": 15 },
                    { "name": "Double Patty", "price": 35 }
                  ]
                },
                "sandwich": {
                  "addons": [
                    { "name": "Extra Cheese", "price": 20 },
                    { "name": "Extra Paneer", "price": 30 }
                  ]
                },
                "garlic-bread": {
                  "addons": [
                    { "name": "Extra Cheese", "price": 30 }
                  ]
                },
                "beverage": {
                  "addons": [
                    { "name": "Ice Cream Scoop", "price": 20 },
                    { "name": "Whipped Cream", "price": 15 }
                  ]
                }
              }
            }
          }
        };
        localStorage.setItem("cityhut_mock_db", JSON.stringify(initialDb));
      } else {
        // Upgrade mock database structure if properties are missing
        let dbData;
        try {
          dbData = JSON.parse(localStorage.getItem("cityhut_mock_db"));
        } catch (e) {
          dbData = null;
        }
        if (dbData && dbData.cityhut && dbData.cityhut.cms) {
          let upgraded = false;
          if (!dbData.cityhut.cms.settings) {
            dbData.cityhut.cms.settings = {};
          }
          if (!dbData.cityhut.cms.settings.whatsappTemplates) {
            dbData.cityhut.cms.settings.whatsappTemplates = {
              delivery: "Hello {restaurantName}! 🍕\n\n*New Delivery Order*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Name: {customerName}\n- Phone: {customerPhone}\n- Address: {customerAddress}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏",
              takeaway: "Hello {restaurantName}! 🍕\n\n*New Takeaway Order #{takeawayNum}*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Phone: {customerPhone}\n- Email: {customerEmail}\n- Takeaway No: {takeawayNum}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏"
            };
            upgraded = true;
          }
          if (!dbData.cityhut.cms.instagram) {
            dbData.cityhut.cms.instagram = {
              headline: "@cityhut_pizza on Instagram",
              followUrl: "https://www.instagram.com/cityhut_pizza/",
              posts: [
                { imageUrl: "https://images.unsplash.com/photo-1594007654729-407ededc4963?q=80&w=400&auto=format&fit=crop", caption: "Chef tossing fresh pizza dough", emoji: "🍕" },
                { imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop", caption: "Cheese stretch on hot pizza slice", emoji: "🧀" },
                { imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop", caption: "Juicy veg burger with fries", emoji: "🍔" },
                { imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop", caption: "Thick chocolate shake and lemon soda", emoji: "☕" }
              ]
            };
            upgraded = true;
          }
          if (!dbData.cityhut.cms.customizations) {
            dbData.cityhut.cms.customizations = {
              pizza: {
                crusts: [
                  { name: "Classic Hand Tossed", price: 0 },
                  { name: "Wheat Thin Crust", price: 30 },
                  { name: "Fresh Pan Pizza", price: 40 },
                  { name: "Cheese Burst", price: 60 }
                ],
                addons: [
                  { name: "Extra Cheese", price: 40 },
                  { name: "Extra Paneer", price: 50 },
                  { name: "Golden Corn", price: 30 },
                  { name: "Fresh Mushroom", price: 30 },
                  { name: "Capsicum & Onion", price: 25 }
                ]
              },
              burger: {
                addons: [
                  { name: "Extra Cheese Slice", price: 15 },
                  { name: "Double Patty", price: 35 }
                ]
              },
              sandwich: {
                addons: [
                  { name: "Extra Cheese", price: 20 },
                  { name: "Extra Paneer", price: 30 }
                ]
              },
              "garlic-bread": {
                addons: [
                  { name: "Extra Cheese", price: 30 }
                ]
              },
              beverage: {
                addons: [
                  { name: "Ice Cream Scoop", price: 20 },
                  { name: "Whipped Cream", price: 15 }
                ]
              }
            };
            upgraded = true;
          }
          if (!dbData.cityhut.cms.categories) {
            dbData.cityhut.cms.categories = {
              pizza: { id: "pizza", name: "Pizza", icon: "🍕" },
              burger: { id: "burger", name: "Burgers", icon: "🍔" },
              sandwich: { id: "sandwich", name: "Sandwiches", icon: "🥪" },
              "garlic-bread": { id: "garlic-bread", name: "Garlic Bread", icon: "🧄" },
              beverage: { id: "beverage", name: "Beverages", icon: "☕" }
            };
            upgraded = true;
          }
          if (!dbData.cityhut.cms.hero) {
            dbData.cityhut.cms.hero = {
              headline: "Kawardha ki Sabse Tasty Pizza 🍕",
              description: "Fresh dough made daily, real premium mozzarella cheese, and rich homemade sauces — delivered steaming hot straight to your door.",
              bgImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
              badge1: "🚀 Fast Delivery",
              badge2: "🧑‍🍳 Freshly Made",
              badge3: "⭐ 256+ Happy Customers"
            };
            upgraded = true;
          }
          const tc = dbData.cityhut.cms.settings.tableCodes || [];
          if (tc.includes("T1") || tc.includes("T2")) {
            dbData.cityhut.cms.settings.tableCodes = ["Pizza", "Burger", "Sandwich", "Garlic Bread", "Beverage", "Dessert"];
            upgraded = true;
          }
          if (upgraded) {
            localStorage.setItem("cityhut_mock_db", JSON.stringify(dbData));
          }
        }
      }
      
      // Synced tabs
      window.addEventListener('storage', (e) => {
        if (e.key === 'cityhut_mock_db') {
          this._notifyAllListeners();
        }
      });
    }

    _getData() {
      try {
        return JSON.parse(localStorage.getItem("cityhut_mock_db")) || {};
      } catch (e) {
        return {};
      }
    }

    _setData(data) {
      localStorage.setItem("cityhut_mock_db", JSON.stringify(data));
    }

    _addListener(path, callback) {
      this.listeners.push({ path, callback });
    }

    _removeListener(path, callback) {
      this.listeners = this.listeners.filter(l => !(l.path === path && l.callback === callback));
    }

    _triggerListeners(changedPath, value) {
      this.listeners.forEach(l => {
        if (this._pathsIntersect(l.path, changedPath)) {
          const ref = new MockDbRef(l.path, this);
          const val = ref._getDataAtPath();
          const snap = {
            val: () => val,
            key: l.path ? l.path.split('/').pop() : null,
            forEach: (cb) => {
              if (val && typeof val === 'object') {
                Object.keys(val).forEach(k => {
                  cb({
                    key: k,
                    val: () => val[k]
                  });
                });
              }
            }
          };
          l.callback(snap);
        }
      });
    }

    _notifyAllListeners() {
      this.listeners.forEach(l => {
        const ref = new MockDbRef(l.path, this);
        const val = ref._getDataAtPath();
        const snap = {
          val: () => val,
          key: l.path ? l.path.split('/').pop() : null,
          forEach: (cb) => {
            if (val && typeof val === 'object') {
              Object.keys(val).forEach(k => {
                cb({
                  key: k,
                  val: () => val[k]
                });
              });
            }
          }
        };
        l.callback(snap);
      });
    }

    _pathsIntersect(path1, path2) {
      if (!path1 || !path2) return true;
      const p1 = path1.split('/').filter(Boolean);
      const p2 = path2.split('/').filter(Boolean);
      const minLen = Math.min(p1.length, p2.length);
      for (let i = 0; i < minLen; i++) {
        if (p1[i] !== p2[i]) return false;
      }
      return true;
    }

    ref(path) {
      return new MockDbRef(path, this);
    }
  }

  db = new MockDatabase();
} else {
  // Initialize real Firebase
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
}
