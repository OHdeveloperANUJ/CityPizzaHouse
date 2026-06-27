(function () {
  "use strict";

  // State & Cache Keys
  const CART_STORAGE_KEY = "cityhut_cart_session";
  const BANNER_DISMISS_KEY = "cityhut_banner_dismissed";
  const VISIT_FLAG_KEY = "cityhut_loaded_before";

  // Default Fallbacks
  let activeWhatsAppNumber = "917880105006";
  let activeRestaurantName = "CityHut Pizza House";
  let activeOpeningHours = "11:00 AM – 10:00 PM";
  let activeTableCodes = ["Pizza", "Burger", "Sandwich", "Garlic Bread", "Beverage", "Dessert"];
  
  let activeBillSettings = {
    gstEnabled: true,
    gstPercentage: 5,
    serviceCharge: 0,
    headerText: "🍕 CITYHUT PIZZA",
    footerText: "Thank you for ordering!\nPlease visit again! 🙏"
  };
  
  let activeScrollHandler = null;

  let activeWhatsAppTemplates = {
    delivery: "Hello {restaurantName}! 🍕\n\n*New Delivery Order*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Name: {customerName}\n- Phone: {customerPhone}\n- Address: {customerAddress}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏",
    takeaway: "Hello {restaurantName}! 🍕\n\n*New Takeaway Order #{takeawayNum}*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Phone: {customerPhone}\n- Email: {customerEmail}\n- Takeaway No: {takeawayNum}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏"
  };

  // Global State
  let cart = [];

  // Customization Options Config
  let customizationOptions = {};

  // DOM Elements
  const headerWrapper = document.querySelector(".header-wrapper");
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navOverlay = document.querySelector(".navbar-overlay");
  const preloader = document.getElementById("preloader");
  const announcementBanner = document.getElementById("announcement-banner");
  const dismissBannerBtn = document.getElementById("dismiss-banner");
  const backToTopBtn = document.getElementById("back-to-top");
  const cartToggleBtn = document.getElementById("cart-toggle");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartCloseBtn = document.getElementById("cart-close");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCountBadges = document.querySelectorAll(".cart-count-badge");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const clearCartLink = document.getElementById("clear-cart");
  const cartEmptyState = document.getElementById("cart-empty-state");
  const cartCheckoutFooter = document.getElementById("cart-checkout-footer");

  // Form Fields
  const orderForm = document.getElementById("order-form");
  const clientNameInput = document.getElementById("client-name");
  const clientAddressInput = document.getElementById("client-address");
  const clientInstructionsInput = document.getElementById("client-instructions");

  // Contact Page Form
  const contactForm = document.getElementById("contact-form");

  /* ==========================================================================
     1. FIREBASE INITIAL DATABASE SEEDING
     ========================================================================== */
  const defaultMenu = [
    // === PIZZAS (pizza) ===
    { name: "Cloud 9 Pizza", category: "pizza", description: "Paneer, Jalapeno, Onion, Capsicum, R.Paprika, Roll Cheese Corner", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
    { name: "Volcano Pizza", category: "pizza", description: "Paneer, Jalapeno, Onion, Capsicum, R.Paprika, Volcano Cheese", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600&auto=format&fit=crop" },
    { name: "Veggie House Pizza", category: "pizza", description: "Onion, Capsicum, Sweet Corn, P.Tomato, Olive", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=600&auto=format&fit=crop" },
    { name: "Farmhouse Pizza", category: "pizza", description: "Jalapeno, R.Paprika, Mushroom, Onion, Capsicum, Olive", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery2 Fries Pizza", category: "pizza", description: "Pery Fries, R.Paprika, B.Olive", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Tikka Pizza", category: "pizza", description: "Paneer, Capsicum, Red Paprika", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery Pery Paneer Pizza", category: "pizza", description: "Pery2 Paneer, Onion, Capsicum", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop" },
    { name: "Butter Paneer Pizza", category: "pizza", description: "Butter Paneer, Onion, Capsicum", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery Pery Mushroom Pizza", category: "pizza", description: "Pery2 Mushroom, Onion, Capsicum", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" },
    { name: "Butter Mushroom Pizza", category: "pizza", description: "Butter Mushroom, Onion, Capsicum", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600&auto=format&fit=crop" },
    { name: "Chinese Babycorn Pizza", category: "pizza", description: "Chinese Babycorn, Onion, Capsicum", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1594007654729-407ededc4963?q=80&w=600&auto=format&fit=crop" },
    { name: "Corn Deluxe Pizza", category: "pizza", description: "Crispy Corn, Onion", isVeg: true, available: true, prices: { small: 200, medium: 300, large: 400 }, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop" },
    
    { name: "Cheese N Corn Pizza", category: "pizza", description: "Press American Corn, Onion (Optional)", isVeg: true, available: true, prices: { small: 150, medium: 240, large: 310 }, imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop" },
    { name: "Fresh Paneer Pizza", category: "pizza", description: "Paneer, Onion, Capsicum", isVeg: true, available: true, prices: { small: 150, medium: 240, large: 310 }, imageUrl: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=600&auto=format&fit=crop" },
    { name: "Fresh Mushroom Pizza", category: "pizza", description: "Mushroom, Onion, Capsicum", isVeg: true, available: true, prices: { small: 150, medium: 240, large: 310 }, imageUrl: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?q=80&w=600&auto=format&fit=crop" },
    
    { name: "Plain Cheese Pizza", category: "pizza", description: "Classic melted cheese single size", isVeg: true, available: true, prices: { regular: 90 }, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
    { name: "Onion Capsicum Pizza", category: "pizza", description: "Onion, Capsicum single size", isVeg: true, available: true, prices: { regular: 100 }, imageUrl: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600&auto=format&fit=crop" },
    { name: "Tomato Pizza", category: "pizza", description: "Juicy Tomato single size", isVeg: true, available: true, prices: { regular: 100 }, imageUrl: "https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?q=80&w=600&auto=format&fit=crop" },
    { name: "Achari Do Pyaza Pizza", category: "pizza", description: "Achari Do Pyaza single size", isVeg: true, available: true, prices: { regular: 100 }, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop" },

    // === SNACKS (snakes) ===
    { name: "Normal Fries", category: "snakes", description: "Classic salted crispy potato fries", isVeg: true, available: true, prices: { single: 90 }, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop" },
    { name: "Masala Fries", category: "snakes", description: "Spicy masala coated crispy fries", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery Pery Fries", category: "snakes", description: "Spicy Peri-Peri seasoning fries", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop" },
    { name: "4 Cheese Fries", category: "snakes", description: "Fries loaded with four delicious cheeses", isVeg: true, available: true, prices: { single: 200 }, imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop" },
    { name: "Normal Chips", category: "snakes", description: "Crispy potato chips", isVeg: true, available: true, prices: { single: 90 }, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d20?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery Pery Chips", category: "snakes", description: "Chips with spicy Peri-Peri seasoning", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1613967193442-19cfb7eb0515?q=80&w=600&auto=format&fit=crop" },

    { name: "Plain Cheese Sandwich", category: "snakes", description: "Simple bread and melted cheese", isVeg: true, available: true, prices: { single: 90 }, imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop" },
    { name: "Corn Cheese Sandwich", category: "snakes", description: "Sweet corn and rich melted cheese", isVeg: true, available: true, prices: { single: 90 }, imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?q=80&w=600&auto=format&fit=crop" },
    { name: "Bombay Masala Sandwich", category: "snakes", description: "Classic spicy potato masala, veggies, herbs", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Cheese Sandwich", category: "snakes", description: "Fresh veggies and cheese grilled", isVeg: true, available: true, prices: { single: 90 }, imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=600&auto=format&fit=crop" },
    { name: "Mexican Sandwich", category: "snakes", description: "Spicy Mexican style beans, jalapenos, cheese", isVeg: true, available: true, prices: { single: 120 }, imageUrl: "https://images.unsplash.com/photo-1540713434306-53f2c211b504?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Cheese Sandwich", category: "snakes", description: "Spiced paneer cubes, veggies, loaded cheese", isVeg: true, available: true, prices: { single: 180 }, imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop" },
    { name: "Full Choco Grill Sandwich", category: "snakes", description: "Bread filled with chocolate spread, grilled", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d3b?q=80&w=600&auto=format&fit=crop" },
    { name: "Club Grill Sandwich", category: "snakes", description: "Triple layer sandwich, mixed veggies, cheese", isVeg: true, available: true, prices: { single: 180 }, imageUrl: "https://images.unsplash.com/photo-1554433607-66b5eed9d304?q=80&w=600&auto=format&fit=crop" },

    { name: "Tikki Burger", category: "snakes", description: "Crispy aloo tikki patty with sauces", isVeg: true, available: true, prices: { single: 80 }, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Burger", category: "snakes", description: "Classic mix veg patty, lettuce, tomato", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Burger", category: "snakes", description: "Crispy paneer block patty, spicy mayo", isVeg: true, available: true, prices: { single: 120 }, imageUrl: "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?q=80&w=600&auto=format&fit=crop" },
    { name: "Maharaja Burger", category: "snakes", description: "Double decker veg burger with extra cheese", isVeg: true, available: true, prices: { single: 150 }, imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop" },
    { name: "Italian Veg Burger", category: "snakes", description: "Herbed patty, Italian sauces, mozzarella", isVeg: true, available: true, prices: { single: 150 }, imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600&auto=format&fit=crop" },
    { name: "3 Cheese Burger", category: "snakes", description: "Patty loaded with three different cheeses", isVeg: true, available: true, prices: { single: 200 }, imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=600&auto=format&fit=crop" },

    { name: "Choco Lava", category: "snakes", description: "Warm chocolate cake with molten center", isVeg: true, available: true, prices: { single: 50 }, imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop" },
    { name: "Choco Volcano", category: "snakes", description: "Huge molten chocolate dessert cake", isVeg: true, available: true, prices: { single: 120 }, imageUrl: "https://images.unsplash.com/photo-1624353322073-b7af1181886e?q=80&w=600&auto=format&fit=crop" },

    { name: "Stuffed Cheese Garlic Bread", category: "snakes", description: "Freshly baked bread stuffed with cheese and corn", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1603046891744-1f76eb10aec1?q=80&w=600&auto=format&fit=crop" },
    { name: "Cheese Petro", category: "snakes", description: "Crispy baked cheese snacks roll", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Cheese Petro", category: "snakes", description: "Cheese petro with spicy paneer stuffing", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Cheese Boll", category: "snakes", description: "Fried cheese balls with mixed vegetables", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1548340748-6d2b7d7db87d?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Cheese Boll", category: "snakes", description: "Cheese balls with spiced paneer stuffing", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=600&auto=format&fit=crop" },

    { name: "White Sauce Pasta", category: "snakes", description: "Pasta in creamy herbed white sauce", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop" },
    { name: "Red Sauce Pasta", category: "snakes", description: "Pasta in tangy tomato basil sauce", isVeg: true, available: true, prices: { single: 120 }, imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop" },

    // === CHINESE SOUP (snakes) ===
    { name: "Manchow Soup", category: "snakes", description: "Spicy and sour soup served with fried noodles", isVeg: true, available: true, prices: { single: 80 }, imageUrl: "https://images.unsplash.com/photo-1547592165-e1d17f8e05cc?q=80&w=600&auto=format&fit=crop" },
    { name: "Tomato Soup", category: "snakes", description: "Creamy tomato soup with herbed croutons", isVeg: true, available: true, prices: { single: 80 }, imageUrl: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=600&auto=format&fit=crop" },
    { name: "Lemon Coriander Soup", category: "snakes", description: "Light refreshing soup with lemon and coriander", isVeg: true, available: true, prices: { single: 80 }, imageUrl: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=600&auto=format&fit=crop" },

    // === CORN (snakes) ===
    { name: "Masala Sweet Corn", category: "snakes", description: "Sweet corn tossed with spices and butter", isVeg: true, available: true, prices: { single: 50 }, imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6e994a52c?q=80&w=600&auto=format&fit=crop" },
    { name: "Pery Pery Corn", category: "snakes", description: "Sweet corn tossed with Peri-Peri spices", isVeg: true, available: true, prices: { single: 50 }, imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=600&auto=format&fit=crop" },
    { name: "Fresh Sweet Corn", category: "snakes", description: "Steamed sweet corn with butter", isVeg: true, available: true, prices: { single: 40 }, imageUrl: "https://images.unsplash.com/photo-1470490314415-775d1f7e108f?q=80&w=600&auto=format&fit=crop" },
    { name: "Mix Veg N Corn", category: "snakes", description: "Steamed corn mixed with fresh chopped vegetables", isVeg: true, available: true, prices: { single: 60 }, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" },

    // === CHINESE CHILLS (chinase) ===
    { name: "Paneer Chilli", category: "chinase", description: "Stir-fried paneer cubes in spicy soy-chilli sauce", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop" },
    { name: "Manchurian", category: "chinase", description: "Veg dumplings in savory Manchurian sauce", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop" },
    { name: "Mushroom Chilli", category: "chinase", description: "Crispy fried mushrooms in chilli garlic sauce", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?q=80&w=600&auto=format&fit=crop" },
    { name: "Babycorn Chilli", category: "chinase", description: "Babycorn in hot spicy Chinese gravy", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600&auto=format&fit=crop" },
    { name: "Potato Chilli", category: "chinase", description: "Crispy chilli potatoes in soy sauce", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop" },
    { name: "Gobhi Chilli", category: "chinase", description: "Crispy fried cauliflower in hot chilli sauce", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop" },
    { name: "Soya Chilli", category: "chinase", description: "Soya chunks in spicy soy-chilli gravy", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop" },

    // === BASMATI SPECIAL (chinase) ===
    { name: "Veg Biryani", category: "chinase", description: "Aromatic Basmati rice cooked with mixed veggies (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Pulao", category: "chinase", description: "Mildly spiced fragrant Basmati rice (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Rice", category: "chinase", description: "Basmati rice cooked with paneer chunks (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Fried Rice", category: "chinase", description: "Stir-fried Basmati rice with fresh vegetables (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600&auto=format&fit=crop" },
    { name: "Schezwan Rice", category: "chinase", description: "Spicy Schezwan sauce stir-fried rice (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=600&auto=format&fit=crop" },
    { name: "Manchurian Rice", category: "chinase", description: "Basmati fried rice served with Manchurian gravy (Incl. Salad, Papad & Raita)", isVeg: true, available: true, prices: { single: 180 }, imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop" },

    // === PREMIUM NOODLES (chinase) ===
    { name: "Veg Noodles", category: "chinase", description: "Classic stir-fried Chinese noodles with veggies", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop" },
    { name: "Hakka Noodles", category: "chinase", description: "Mildly seasoned Hakka style stir-fried noodles", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1612966608967-312ba599102e?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Noodles", category: "chinase", description: "Stir-fried noodles with paneer blocks", isVeg: true, available: true, prices: { single: 200 }, imageUrl: "https://images.unsplash.com/photo-1612966608900-b2d499732d84?q=80&w=600&auto=format&fit=crop" },
    { name: "Schezwan Noodles", category: "chinase", description: "Spicy Schezwan sauce stir-fried noodles", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=600&auto=format&fit=crop" },
    { name: "Singapori Noodles", category: "chinase", description: "Curry seasoned spicy Singapore style noodles", isVeg: true, available: true, prices: { single: 160 }, imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop" },
    { name: "Chinese White Noodles", category: "chinase", description: "Noodles stir-fried in light white sauce", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=600&auto=format&fit=crop" },

    // === SPRING ROLLS (snakes) ===
    { name: "Veg Spring Roll", category: "snakes", description: "Crispy rolls stuffed with mixed vegetables", isVeg: true, available: true, prices: { single: 140 }, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Spring Roll", category: "snakes", description: "Crispy rolls stuffed with paneer and veggies", isVeg: true, available: true, prices: { single: 180 }, imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop" },

    // === CRISPY SPECIAL (snakes) ===
    { name: "Corn Crispy", category: "snakes", description: "Crispy fried sweet corn with peppers", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop" },
    { name: "Veg Crispy", category: "snakes", description: "Crispy batter fried assorted vegetables", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Crispy", category: "snakes", description: "Crispy fried batter-coated paneer strips", isVeg: true, available: true, prices: { single: 240 }, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop" },
    { name: "Mushroom Crispy", category: "snakes", description: "Batter-fried crispy mushrooms", isVeg: true, available: true, prices: { single: 240 }, imageUrl: "https://images.unsplash.com/photo-1568254183919-78a4e43a2877?q=80&w=600&auto=format&fit=crop" },

    // === DRINKS (drink) ===
    { name: "Cold Coffee", category: "drink", description: "Chilled milk, coffee, sweet creamy froth", isVeg: true, available: true, prices: { normal: 100, special: 120 }, imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" },
    { name: "Chocolate Milk Shake", category: "drink", description: "Rich chocolate milkshake with syrup", isVeg: true, available: true, prices: { normal: 120, special: 170 }, imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop" },
    { name: "Oreo Milk Shake", category: "drink", description: "Vanilla shake blended with crunchy Oreo cookies", isVeg: true, available: true, prices: { normal: 120, special: 170 }, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop" },
    { name: "Butterscotch Shake", category: "drink", description: "Butterscotch ice cream shake with caramel crunch", isVeg: true, available: true, prices: { normal: 120, special: 170 }, imageUrl: "https://images.unsplash.com/photo-1553788210-e22070f6120e?q=80&w=600&auto=format&fit=crop" },
    { name: "Vanilla Milk Shake", category: "drink", description: "Classic creamy vanilla ice cream shake", isVeg: true, available: true, prices: { normal: 90, special: 140 }, imageUrl: "https://images.unsplash.com/photo-1549853796-f18616597c2a?q=80&w=600&auto=format&fit=crop" },
    { name: "Strawberry Milk Shake", category: "drink", description: "Sweet strawberry ice cream shake", isVeg: true, available: true, prices: { normal: 90, special: 140 }, imageUrl: "https://images.unsplash.com/photo-1586935724902-7c63d536718b?q=80&w=600&auto=format&fit=crop" },
    { name: "Pista Milk Shake", category: "drink", description: "Pistachio ice cream milkshake", isVeg: true, available: true, prices: { normal: 90, special: 140 }, imageUrl: "https://images.unsplash.com/photo-1563844528129-067e06a638e5?q=80&w=600&auto=format&fit=crop" },
    { name: "Blue Lagoon Mocktail", category: "drink", description: "Refreshing blue curaçao, soda, lemon", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop" },
    { name: "Virgin Mojito", category: "drink", description: "Fresh mint, lime slices, crushed ice, soda", isVeg: true, available: true, prices: { single: 100 }, imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=600&auto=format&fit=crop" },
    
    { name: "Hot Coffee", category: "drink", description: "Freshly brewed hot milk coffee", isVeg: true, available: true, prices: { single: 30 }, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop" },
    { name: "Hot Tea", category: "drink", description: "Traditional hot Indian milk tea (chai)", isVeg: true, available: true, prices: { single: 30 }, imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop" },
    { name: "Black Coffee", category: "drink", description: "Fresh hot black coffee without milk", isVeg: true, available: true, prices: { single: 25 }, imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop" },
    { name: "Black/Lemon Tea", category: "drink", description: "Fresh hot black or lemon tea", isVeg: true, available: true, prices: { single: 25 }, imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop" }
  ];

  function seedDatabase() {
    if (typeof db !== "undefined") {
      db.ref("cityhut/cms/menu").once("value", menuSnap => {
        const menuVal = menuSnap.val() || {};
        const menuItemsList = Object.values(menuVal);
        const hasNewCategories = menuItemsList.length > 0 && menuItemsList.some(item => item.category === "snakes" || item.category === "chinase");

        if (!hasNewCategories) {
          console.log("Old menu or empty database detected. Seeding defaults...");
          db.ref("cityhut/cms/menu").set(null);
          db.ref("cityhut/cms/categories").set(null);
          db.ref("cityhut/cms/customizations").set(null);

          defaultMenu.forEach(item => {
            db.ref("cityhut/cms/menu").push(item);
          });

          const newCategories = {
            pizza: { id: "pizza", name: "Pizza", icon: "🍕" },
            snakes: { id: "snakes", name: "Snacks", icon: "🍟" },
            chinase: { id: "chinase", name: "Chinese", icon: "🍜" },
            drink: { id: "drink", name: "Drinks", icon: "🍹" }
          };
          db.ref("cityhut/cms/categories").set(newCategories);

          const newCustomizations = {
            pizza: {
              crusts: [
                { name: "Classic Hand Tossed", price: 0 },
                { name: "Wheat Thin Crust", price: 30 },
                { name: "Fresh Pan Pizza", price: 40 },
                { name: "Cheese Burst", price: 100 }
              ],
              addons: [
                { name: "Extra Cheese", price: 40 },
                { name: "Extra Paneer", price: 50 },
                { name: "Golden Corn", price: 30 },
                { name: "Fresh Mushroom", price: 30 },
                { name: "Capsicum & Onion", price: 25 }
              ]
            },
            snakes: {
              addons: [
                { name: "Extra Cheese", price: 20 },
                { name: "Extra Paneer", price: 30 },
                { name: "Extra Cheese Slice", price: 15 },
                { name: "Double Patty", price: 35 }
              ]
            },
            drink: {
              addons: [
                { name: "Ice Cream Scoop", price: 20 },
                { name: "Whipped Cream", price: 15 }
              ]
            }
          };
          db.ref("cityhut/cms/customizations").set(newCustomizations);

          db.ref("cityhut/cms/settings").once("value", settingsSnap => {
            if (!settingsSnap.exists()) {
              db.ref("cityhut/cms/settings").set({
                whatsappNumber: "917880105006",
                restaurantName: "CityHut Pizza House",
                openingHours: "11:00 AM – 10:00 PM",
                ownerPassword: "owner2025",
                waiterPassword: "waiter2025",
                tableCodes: ["Pizza", "Burger", "Sandwich", "Garlic Bread", "Beverage", "Dessert"],
                bill: {
                  gstEnabled: true,
                  gstPercentage: 5,
                  serviceCharge: 0,
                  headerText: "🍕 CITYHUT PIZZA",
                  footerText: "Thank you for ordering!\nPlease visit again! 🙏"
                },
                whatsappTemplates: {
                  delivery: "Hello {restaurantName}! 🍕\n\n*New Delivery Order*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Name: {customerName}\n- Phone: {customerPhone}\n- Address: {customerAddress}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏",
                  takeaway: "Hello {restaurantName}! 🍕\n\n*New Takeaway Order #{takeawayNum}*\n\n*Items Ordered:*\n{itemsList}\n\n{totalBreakdown}\n\n*Customer Details:*\n- Phone: {customerPhone}\n- Email: {customerEmail}\n- Takeaway No: {takeawayNum}\n\n*Special Instructions:*\n{instructions}\n\nThank you! 🙏"
                }
              });
            }
          });

          db.ref("cityhut/cms/hero").once("value", heroSnap => {
            if (!heroSnap.exists()) {
              db.ref("cityhut/cms/hero").set({
                headline: "Kawardha ki Sabse Tasty Pizza 🍕",
                description: "Fresh dough made daily, real premium mozzarella cheese, and rich homemade sauces — delivered steaming hot straight to your door.",
                bgImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
                badge1: "🚀 Fast Delivery",
                badge2: "🧑‍🍳 Freshly Made",
                badge3: "⭐ 256+ Happy Customers"
              });
            }
          });

          db.ref("cityhut/cms/instagram").once("value", instaSnap => {
            if (!instaSnap.exists()) {
              db.ref("cityhut/cms/instagram").set({
                headline: "@cityhut_pizza on Instagram",
                followUrl: "https://www.instagram.com/cityhut_pizza/",
                posts: [
                  { imageUrl: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?q=80&w=400&auto=format&fit=crop", caption: "Chef tossing fresh pizza dough", emoji: "🍕" },
                  { imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=400&auto=format&fit=crop", caption: "Cheese stretch on hot pizza slice", emoji: "🧀" },
                  { imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop", caption: "Juicy veg burger with fries", emoji: "🍔" },
                  { imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop", caption: "Thick chocolate shake and lemon soda", emoji: "☕" }
                ]
              });
            }
          });
        }
      });
    }
  }

  /* ==========================================================================
     2. DYNAMIC SETTINGS LOADER & UI BINDING
     ========================================================================== */
  function loadSettings() {
    if (typeof db === "undefined") return;

    db.ref("cityhut/cms/settings").on("value", snap => {
      const settings = snap.val();
      if (settings) {
        activeWhatsAppNumber = settings.whatsappNumber || activeWhatsAppNumber;
        activeRestaurantName = settings.restaurantName || activeRestaurantName;
        activeOpeningHours = settings.openingHours || activeOpeningHours;
        activeTableCodes = settings.tableCodes || activeTableCodes;
        if (settings.bill) {
          activeBillSettings = { ...activeBillSettings, ...settings.bill };
        }
        if (settings.whatsappTemplates) {
          activeWhatsAppTemplates = { ...activeWhatsAppTemplates, ...settings.whatsappTemplates };
        }

        updateSettingsUI();
        updateCartUI();
      }
    });

    db.ref("cityhut/cms/customizations").on("value", snap => {
      customizationOptions = snap.val() || {};
    });

    db.ref("cityhut/cms/instagram").on("value", snap => {
      const insta = snap.val();
      if (insta) {
        // Update all instagram links on the page
        const instaLinks = document.querySelectorAll('a[href*="instagram.com"]');
        instaLinks.forEach(link => {
          if (link.closest('.bottom-bar')) return; // Ignore the Praxis promotional bottom bar links
          link.href = insta.followUrl || "https://www.instagram.com/cityhut_pizza/";
        });
        
        // If we are on index.html, update the grid and heading
        const heading = document.getElementById("insta-heading");
        const grid = document.querySelector(".instagram-grid");
        if (heading && insta.headline) {
          heading.textContent = insta.headline;
        }
        if (grid && insta.posts) {
          grid.innerHTML = insta.posts.map(post => {
            return `
              <div class="instagram-box">
                <img src="${escapeHTML(post.imageUrl)}" alt="${escapeHTML(post.caption)}" loading="lazy">
                <div class="instagram-overlay">${escapeHTML(post.emoji || '📸')}</div>
              </div>
            `;
          }).join('');
        }
      }
    });
  }

  function updateSettingsUI() {
    // Dynamic WhatsApp URLs
    const waLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
    waLinks.forEach(link => {
      const url = new URL(link.href);
      const textParam = url.searchParams.get("text") || "";
      link.href = `https://api.whatsapp.com/send?phone=${activeWhatsAppNumber}${textParam ? `&text=${encodeURIComponent(textParam)}` : ""}`;
    });

    // Dynamic Brand Name/Logos
    const logoEls = document.querySelectorAll(".logo, .footer-logo, .loader-text, .nav-brand");
    logoEls.forEach(el => {
      if (el.classList.contains("loader-text")) {
        el.textContent = activeRestaurantName.toUpperCase();
        return;
      }
      if (el.classList.contains("logo") && !el.classList.contains("footer-logo")) {
        el.innerHTML = `<img src="images/logo-rect.jpg" alt="${activeRestaurantName}" style="height: 48px; width: auto; object-fit: contain; vertical-align: middle; max-width: 100%;">`;
        return;
      }
      if (el.classList.contains("footer-logo")) {
        el.innerHTML = `<img src="images/logo-circle.jpg" alt="${activeRestaurantName}" style="height: 70px; width: 70px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-bottom: 8px;">`;
        return;
      }
      const emojiSpan = el.querySelector('span[aria-hidden="true"]');
      const emoji = emojiSpan ? emojiSpan.textContent : "🍕";
      el.innerHTML = `<span aria-hidden="true">${emoji}</span> ${activeRestaurantName}`;
    });

    // Dynamic Tel links
    const telLinks = document.querySelectorAll('a[href*="tel:"]');
    telLinks.forEach(link => {
      if (link.closest('.bottom-bar')) return; // Ignore the Praxis promotional bottom bar links
      link.href = `tel:+${activeWhatsAppNumber}`;
      if (link.textContent.includes("+91") || link.textContent.trim().startsWith("78801")) {
        link.textContent = `+${activeWhatsAppNumber.slice(0, 2)} ${activeWhatsAppNumber.slice(2, 7)} ${activeWhatsAppNumber.slice(7)}`;
      }
    });

    // Dynamic Opening Hours
    const hoursLists = document.querySelectorAll(".footer-hours-list li");
    hoursLists.forEach(el => {
      if (el.textContent.includes("11:00 AM") || el.textContent.includes("10:00 PM") || el.textContent.includes("Mon – Sun")) {
        el.textContent = `Mon – Sun: ${activeOpeningHours}`;
      }
    });

    const contactHours = document.querySelector(".contact-info-card:nth-child(3) p:last-child");
    if (contactHours) {
      contactHours.textContent = activeOpeningHours;
    }

    // Dynamic Document Title
    if (document.title.includes("CityHut Pizza")) {
      document.title = document.title.replace(/CityHut Pizza House|CityHut Pizza/g, activeRestaurantName);
    }
  }

  /* ==========================================================================
     3. PRELOADER & INITIALIZATION
     ========================================================================== */
  function initPreloader() {
    if (!preloader) return;

    const loadedBefore = sessionStorage.getItem(VISIT_FLAG_KEY);
    if (loadedBefore) {
      preloader.style.display = "none";
      preloader.remove();
    } else {
      // Fast dismiss after a short delay so the user doesn't wait for all heavy images
      setTimeout(() => {
        preloader.classList.add("fade-out");
        sessionStorage.setItem(VISIT_FLAG_KEY, "true");
        setTimeout(() => preloader.remove(), 500);
      }, 400);
    }
  }

  /* ==========================================================================
     4. NAVIGATION & STICKY HEADER
     ========================================================================== */
  function initNavigation() {
    if (!hamburger) return;

    const toggleMenu = () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("open");
      if (navOverlay) navOverlay.classList.toggle("open");
      document.body.classList.toggle("no-scroll");
    };

    hamburger.addEventListener("click", toggleMenu);
    if (navOverlay) navOverlay.addEventListener("click", toggleMenu);

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("open")) {
          toggleMenu();
        }
      });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        headerWrapper.classList.add("scrolled");
      } else {
        headerWrapper.classList.remove("scrolled");
      }
    });
  }

  /* ==========================================================================
     5. ANNOUNCEMENT BANNER
     ========================================================================== */
  function initAnnouncementBanner() {
    if (!announcementBanner) return;

    const isDismissed = sessionStorage.getItem(BANNER_DISMISS_KEY);
    if (isDismissed) {
      announcementBanner.classList.add("hidden");
    } else if (dismissBannerBtn) {
      dismissBannerBtn.addEventListener("click", () => {
        announcementBanner.classList.add("hidden");
        sessionStorage.setItem(BANNER_DISMISS_KEY, "true");
      });
    }
  }

  /* ==========================================================================
     6. BACK TO TOP BUTTON
     ========================================================================== */
  function initBackToTop() {
    if (!backToTopBtn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==========================================================================
     7. CART STATE MANAGEMENT
     ========================================================================== */
  function loadCart() {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
      cart = [];
    }
    updateCartUI();
  }

  function saveCart() {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(item) {
    if (!item.cartLineKey) {
      item.cartLineKey = item.id + '_' + (item.size || 'single') + '_' + (item.crust || 'none') + '_' + (item.addons || []).map(a => a.name).sort().join('-');
    }
    const existingIndex = cart.findIndex(
      cartItem => cartItem.cartLineKey === item.cartLineKey
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(item);
    }
    saveCart();
  }

  function updateQuantity(cartLineKey, delta) {
    const itemIndex = cart.findIndex(
      item => item.cartLineKey === cartLineKey
    );

    if (itemIndex > -1) {
      cart[itemIndex].quantity += delta;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
      saveCart();
    }
  }

  function removeItem(cartLineKey) {
    cart = cart.filter(item => item.cartLineKey !== cartLineKey);
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function getCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  /* ==========================================================================
     8. CART UI RENDERING & BEHAVIORS
     ========================================================================== */
  function updateCartUI() {
    const totalCount = getCartItemCount();
    const subtotal = getCartSubtotal();

    cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? "flex" : "none";
    });

    syncMenuCardCounters();

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartEmptyState.style.display = "flex";
      cartCheckoutFooter.style.display = "none";
      if (orderForm) orderForm.style.display = "none";
      cartItemsContainer.innerHTML = "";
    } else {
      cartEmptyState.style.display = "none";
      cartCheckoutFooter.style.display = "block";
      if (orderForm) orderForm.style.display = "flex";

      cartItemsContainer.innerHTML = cart
        .map(item => {
          const itemSizeLabel = item.size ? ` (${item.size})` : "";
          
          let customizationHtml = "";
          if (item.crust) {
            customizationHtml += `<div class="cart-item-size" style="color: var(--accent); font-weight: 600; margin-top: 2px;">↳ Crust: ${escapeHTML(item.crust)}</div>`;
          }
          if (item.addons && item.addons.length > 0) {
            const addonNames = item.addons.map(a => a.name).join(", ");
            customizationHtml += `<div class="cart-item-size" style="color: var(--veg); font-weight: 600; margin-top: 2px;">↳ Addons: ${escapeHTML(addonNames)}</div>`;
          }

          return `
            <div class="cart-item">
              <div class="cart-item-details">
                <div class="cart-item-name">${escapeHTML(item.name)}${itemSizeLabel}</div>
                ${customizationHtml}
                <div class="cart-item-price">₹${item.price}</div>
              </div>
              <div class="cart-item-actions">
                <div class="qty-counter">
                  <button class="qty-btn dec-qty-btn" aria-label="Decrease quantity" data-key="${item.cartLineKey}">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn inc-qty-btn" aria-label="Increase quantity" data-key="${item.cartLineKey}">+</button>
                </div>
                <button class="cart-item-remove" aria-label="Remove item" data-key="${item.cartLineKey}">
                  🗑️
                </button>
              </div>
            </div>
          `;
        })
        .join("");

      bindCartDrawerEvents();
    }

    const cartSummaryContainer = document.getElementById("cart-summary-container");
    if (cartSummaryContainer) {
      let breakdownHtml = `
        <div class="cart-summary-row" style="font-size: 13px; color: var(--text-muted); margin-bottom: 2px; display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>₹${subtotal}</span>
        </div>
      `;
      let grandTotal = subtotal;

      if (activeBillSettings.gstEnabled) {
        const cgst = Math.round(subtotal * (activeBillSettings.gstPercentage / 2) / 100 * 100) / 100;
        const sgst = Math.round(subtotal * (activeBillSettings.gstPercentage / 2) / 100 * 100) / 100;
        grandTotal += cgst + sgst;
        breakdownHtml += `
          <div class="cart-summary-row" style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px; display: flex; justify-content: space-between;">
            <span>CGST (${(activeBillSettings.gstPercentage / 2)}%):</span>
            <span>₹${cgst.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row" style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px; display: flex; justify-content: space-between;">
            <span>SGST (${(activeBillSettings.gstPercentage / 2)}%):</span>
            <span>₹${sgst.toFixed(2)}</span>
          </div>
        `;
      }

      if (activeBillSettings.serviceCharge > 0) {
        grandTotal += activeBillSettings.serviceCharge;
        breakdownHtml += `
          <div class="cart-summary-row" style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>Service/Pkg Charge:</span>
            <span>+₹${activeBillSettings.serviceCharge}</span>
          </div>
        `;
      }

      breakdownHtml += `
        <div class="cart-summary-row" style="font-weight: 700; font-size: 16px; color: var(--dark); border-top: 1px dashed var(--border); padding-top: 6px; display: flex; justify-content: space-between;">
          <span>Grand Total:</span>
          <span>₹${grandTotal.toFixed(2)}</span>
        </div>
      `;
      cartSummaryContainer.innerHTML = breakdownHtml;
    } else if (cartSubtotalEl) {
      cartSubtotalEl.textContent = `₹${subtotal}`;
    }
  }

  function bindCartDrawerEvents() {
    cartItemsContainer.querySelectorAll(".inc-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        updateQuantity(key, 1);
      });
    });

    cartItemsContainer.querySelectorAll(".dec-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        updateQuantity(key, -1);
      });
    });

    cartItemsContainer.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        removeItem(key);
      });
    });
  }

  function initCartDrawer() {
    if (!cartToggleBtn || !cartDrawer) return;

    const openDrawer = () => {
      cartDrawer.classList.add("open");
      if (cartOverlay) cartOverlay.classList.add("open");
      document.body.classList.add("no-scroll");
    };

    const closeDrawer = () => {
      cartDrawer.classList.remove("open");
      if (cartOverlay) cartOverlay.classList.remove("open");
      document.body.classList.remove("no-scroll");
    };

    cartToggleBtn.addEventListener("click", openDrawer);
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeDrawer);
    if (cartOverlay) cartOverlay.addEventListener("click", closeDrawer);

    if (clearCartLink) {
      clearCartLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearCart();
      });
    }

    const browseMenuBtn = document.getElementById("browse-menu-btn");
    if (browseMenuBtn) {
      browseMenuBtn.addEventListener("click", () => {
        closeDrawer();
        window.location.href = "menu.html";
      });
    }
  }

  /* ==========================================================================
     9. DYNAMIC MENU LOGIC (FIREBASE SYNC)
     ========================================================================== */
  function loadDynamicMenu() {
    if (typeof db === "undefined") return;

    db.ref("cityhut/cms/categories").on("value", categoriesSnap => {
      const categoriesData = categoriesSnap.val() || {};
      const categoriesList = Object.keys(categoriesData).map(k => ({
        key: k,
        ...categoriesData[k]
      }));

      // Render category filter bar
      const filterBar = document.getElementById("menu-filter-bar");
      if (filterBar) {
        filterBar.innerHTML = categoriesList.map((cat, index) => {
          const activeClass = index === 0 ? "active" : "";
          const selected = index === 0 ? "true" : "false";
          return `
            <a href="#${cat.id}" class="filter-pill ${activeClass}" role="tab" aria-selected="${selected}" aria-controls="${cat.id}">
              ${escapeHTML(cat.icon)} ${escapeHTML(cat.name)}
            </a>
          `;
        }).join("");
      }

      // Render section containers
      const sectionsContainer = document.getElementById("menu-sections-container");
      if (sectionsContainer) {
        sectionsContainer.innerHTML = categoriesList.map(cat => `
          <section id="${cat.id}" class="menu-section" role="tabpanel" style="margin-bottom: 60px;" aria-labelledby="${cat.id}-heading">
            <div class="section-header" style="text-align: left; margin-bottom: 30px;">
              <h2 id="${cat.id}-heading" style="font-size: 28px;">${escapeHTML(cat.icon)} ${escapeHTML(cat.name)}</h2>
              <div style="width: 100%; height: 2px; background-color: var(--border); margin-top: 10px;"></div>
            </div>
            <div class="products-grid"></div>
          </section>
        `).join("");
      }

      // Load and render menu items
      db.ref("cityhut/cms/menu").once("value", menuSnap => {
        const menuData = menuSnap.val() || {};
        
        // Group items by category key
        const itemsByCategory = {};
        categoriesList.forEach(cat => {
          itemsByCategory[cat.id] = [];
        });

        Object.keys(menuData).forEach(key => {
          const item = menuData[key];
          item.key = key;

          // Normalize category key
          let cat = item.category;
          if (cat === "beverages") cat = "beverage";
          if (cat === "burgers") cat = "burger";
          if (cat === "sandwiches") cat = "sandwich";

          if (itemsByCategory[cat]) {
            itemsByCategory[cat].push(item);
          } else {
            if (!itemsByCategory[item.category]) {
              itemsByCategory[item.category] = [];
            }
            itemsByCategory[item.category].push(item);
          }
        });

        // Helper to render a category section with animations
        const triggerRenderCategory = (catId) => {
          const section = document.getElementById(catId);
          if (!section) return;
          const grid = section.querySelector(".products-grid");
          if (grid && grid.children.length === 0) {
            const items = itemsByCategory[catId] || [];
            renderCategoryGrid(catId, items);
            bindProductCardEvents(); // Re-bind card click event handlers
            
            // Stagger fade-in + slide-up motion animation
            const cards = grid.querySelectorAll(".product-card");
            cards.forEach((card, idx) => {
              card.style.opacity = "0";
              card.style.transform = "translateY(25px)";
              card.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
              setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
              }, idx * 45);
            });
          }
        };

        // Lazy load categories using IntersectionObserver
        if ('IntersectionObserver' in window) {
          const observerOptions = {
            rootMargin: "250px 0px 250px 0px", // pre-render 250px before entering viewport
            threshold: 0.01
          };

          const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const catId = entry.target.id;
                triggerRenderCategory(catId);
                obs.unobserve(entry.target);
              }
            });
          }, observerOptions);

          categoriesList.forEach(cat => {
            const sec = document.getElementById(cat.id);
            if (sec) observer.observe(sec);
          });
        } else {
          // Fallback: render all immediately
          categoriesList.forEach(cat => {
            renderCategoryGrid(cat.id, itemsByCategory[cat.id] || []);
          });
          bindProductCardEvents();
        }

        // Handle immediate rendering when filter pill is clicked
        const filterBar = document.getElementById("menu-filter-bar");
        if (filterBar) {
          // Since they are rendered as <a> filter-pills in loadDynamicMenu
          filterBar.addEventListener("click", (e) => {
            const pill = e.target.closest(".filter-pill");
            if (pill) {
              const href = pill.getAttribute("href");
              if (href && href.startsWith("#")) {
                const catId = href.substring(1);
                triggerRenderCategory(catId);
              }
            }
          });
        }

        initCategoryFilterScrolling();
      });
    });
  }

  function renderCategoryGrid(containerId, items) {
    const section = document.getElementById(containerId);
    if (!section) return;
    const grid = section.querySelector(".products-grid");
    if (!grid) return;

    const activeItems = items.filter(item => item.available === true);

    grid.innerHTML = activeItems.map(item => {
      const isPizza = item.category === "pizza";
      const prices = item.prices || {};

      let sizeSelectorHtml = "";
      let initialPrice = 0;
      let dataAttrs = `data-id="${item.key}" data-name="${escapeHTML(item.name)}" data-category="${item.category}"`;

      if (prices.small || prices.medium || prices.large) {
        initialPrice = prices.small || 0;
        sizeSelectorHtml = `
          <div class="size-selector">
            <label id="pizza-${item.key}-size">Select Size:</label>
            <div class="size-select-pills" role="radiogroup" aria-labelledby="pizza-${item.key}-size">
              <button type="button" class="size-pill active" role="radio" aria-checked="true" data-size="Small" data-price="${prices.small || 0}">S (₹${prices.small || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Medium" data-price="${prices.medium || 0}">M (₹${prices.medium || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Large" data-price="${prices.large || 0}">L (₹${prices.large || 0})</button>
            </div>
          </div>
        `;
      } else if (prices.normal || prices.special) {
        initialPrice = prices.normal || 0;
        sizeSelectorHtml = `
          <div class="size-selector">
            <label id="beverage-${item.key}-size">Select Type:</label>
            <div class="size-select-pills" role="radiogroup" aria-labelledby="beverage-${item.key}-size">
              <button type="button" class="size-pill active" role="radio" aria-checked="true" data-size="Normal" data-price="${prices.normal || 0}">Normal (₹${prices.normal || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Special" data-price="${prices.special || 0}">Special (₹${prices.special || 0})</button>
            </div>
          </div>
        `;
      } else {
        initialPrice = prices.single || prices.regular || 0;
        dataAttrs += ` data-price="${initialPrice}"`;
        if (prices.regular) {
          dataAttrs += ` data-size="Regular"`;
        }
      }

      return `
        <div class="product-card" ${dataAttrs} role="article">
          <div class="product-img-wrapper">
            <img class="product-img" src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" loading="lazy">
            <div class="product-veg-type" aria-label="Vegetarian option">
              <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}"></span>
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-title">${escapeHTML(item.name)}</h3>
            <p class="product-desc">${escapeHTML(item.description || "")}</p>
            ${sizeSelectorHtml}
            <div class="product-meta">
              <span class="product-price">₹${initialPrice}</span>
              <div class="qty-counter">
                <button type="button" class="qty-btn menu-dec-btn" aria-label="Decrease quantity">-</button>
                <span class="qty-val qty-val-display">0</span>
                <button type="button" class="qty-btn menu-inc-btn" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="btn btn-primary add-to-cart-btn btn-block" style="margin-top: 12px;">Add to Cart</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function bindProductCardEvents() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(card => {
      const sizePills = card.querySelectorAll(".size-pill");
      const priceDisplay = card.querySelector(".product-price");

      sizePills.forEach(pill => {
        pill.addEventListener("click", () => {
          sizePills.forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          const selectedPrice = pill.getAttribute("data-price");
          if (priceDisplay && selectedPrice) {
            priceDisplay.textContent = `₹${selectedPrice}`;
          }
          syncCardCounter(card);
        });
      });

      const addBtn = card.querySelector(".add-to-cart-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const id = card.getAttribute("data-id");
          const name = card.getAttribute("data-name");
          const category = card.getAttribute("data-category");

          let size = null;
          let price = parseFloat(card.getAttribute("data-price"));

          const activePill = card.querySelector(".size-pill.active");
          if (activePill) {
            size = activePill.getAttribute("data-size");
            price = parseFloat(activePill.getAttribute("data-price"));
          }

          if (customizationOptions[category]) {
            const prices = getProductPrices(card);
            openCustomizeModal({
              id: id,
              name: name,
              size: size,
              price: price,
              prices: prices,
              category: category
            });
            return;
          }

          addToCart({
            id: id,
            name: name,
            size: size,
            price: price,
            quantity: 1,
            category: category
          });

          addBtn.classList.add("btn-added");
          addBtn.innerHTML = "Added ✓";
          addBtn.disabled = true;

          setTimeout(() => {
            addBtn.classList.remove("btn-added");
            addBtn.innerHTML = "Add to Cart";
            addBtn.disabled = false;
          }, 1200);
        });
      }

      const decBtn = card.querySelector(".menu-dec-btn");
      const incBtn = card.querySelector(".menu-inc-btn");
      if (decBtn && incBtn) {
        decBtn.addEventListener("click", () => {
          const id = card.getAttribute("data-id");
          let size = null;
          const activePill = card.querySelector(".size-pill.active");
          if (activePill) {
            size = activePill.getAttribute("data-size");
          }
          const cartItem = cart.find(item => item.id === id && item.size === size);
          if (cartItem) {
            updateQuantity(cartItem.cartLineKey, -1);
          }
        });

        incBtn.addEventListener("click", () => {
          const id = card.getAttribute("data-id");
          const name = card.getAttribute("data-name");
          const category = card.getAttribute("data-category");
          let size = null;
          let price = parseFloat(card.getAttribute("data-price"));
          const activePill = card.querySelector(".size-pill.active");
          if (activePill) {
            size = activePill.getAttribute("data-size");
            price = parseFloat(activePill.getAttribute("data-price"));
          }
          addToCart({
            id: id,
            name: name,
            size: size,
            price: price,
            quantity: 1,
            category: category
          });
        });
      }
    });

    syncMenuCardCounters();
  }

  function syncCardCounter(card) {
    const id = card.getAttribute("data-id");
    const activePill = card.querySelector(".size-pill.active");
    const size = activePill ? activePill.getAttribute("data-size") : null;

    const cartItem = cart.find(item => item.id === id && item.size === size);
    const qty = cartItem ? cartItem.quantity : 0;

    const qtyValEl = card.querySelector(".qty-val-display");
    if (qtyValEl) {
      qtyValEl.textContent = qty;
    }
  }

  function syncMenuCardCounters() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(card => syncCardCounter(card));
  }

  function initMenuPage() {
    if (!document.querySelector(".category-filter-bar")) return;

    loadDynamicMenu();
    initCategoryFilterScrolling();
  }

  function initCategoryFilterScrolling() {
    const filterBar = document.querySelector(".category-filter-bar");
    if (!filterBar) return;

    const pills = filterBar.querySelectorAll(".filter-pill");
    const sections = Array.from(pills)
      .map(pill => {
        const targetId = pill.getAttribute("href");
        if (targetId && targetId.startsWith("#")) {
          return document.getElementById(targetId.substring(1));
        }
        return null;
      })
      .filter(section => section !== null);

    pills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = pill.getAttribute("href");
        const section = document.getElementById(targetId.substring(1));

        if (section) {
          const offsetTop = section.offsetTop - 120;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
          });

          pills.forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
        }
      });
    });

    let lastActiveId = "";
    if (activeScrollHandler) {
      window.removeEventListener("scroll", activeScrollHandler);
    }

    activeScrollHandler = () => {
      const scrollPos = window.scrollY + 150;
      
      let currentSection = null;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollPos) {
          currentSection = sections[i];
        } else {
          break;
        }
      }

      if (currentSection) {
        const id = currentSection.id;
        if (id !== lastActiveId) {
          lastActiveId = id;
          pills.forEach(pill => {
            pill.classList.remove("active");
            if (pill.getAttribute("href") === `#${id}`) {
              pill.classList.add("active");
              pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
          });
        }
      } else if (pills.length > 0) {
        pills.forEach(pill => pill.classList.remove("active"));
        pills[0].classList.add("active");
      }
    };

    window.addEventListener("scroll", activeScrollHandler);

    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash;
        const section = document.getElementById(targetId.substring(1));
        if (section) {
          const offsetTop = section.offsetTop - 120;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }, 500);
    }
  }


  /* ==========================================================================
     10. DINE-IN SYSTEM FLOW & LIFECYCLE
     ========================================================================== */
  let activeOrderListener = null;

  function initDineInFlow() {
    const urlParams = new URLSearchParams(window.location.search);
    let mode = urlParams.get("mode");
    let table = urlParams.get("table");

    if (mode) {
      sessionStorage.setItem("cityhut_order_mode", mode);
    }
    if (table) {
      sessionStorage.setItem("cityhut_dinein_table", table);
    }

    const currentOrderId = sessionStorage.getItem("cityhut_current_order_id");
    if (currentOrderId) {
      setupOrderStatusListener(currentOrderId);
    }

    // Set navbar table badge if dinein and active table is stored
    const storedMode = sessionStorage.getItem("cityhut_order_mode") || "delivery";
    const storedTable = sessionStorage.getItem("cityhut_dinein_table");
    const navActions = document.querySelector(".nav-actions");
    if (navActions && storedMode === "dinein" && storedTable) {
      navActions.innerHTML = `<span class="role-badge waiter" style="background-color: var(--accent); margin-right: 10px;">🍽️ ${storedTable} Table</span>`;
    }
  }

  function setupOrderStatusListener(orderId) {
    if (typeof db === "undefined") return;

    if (activeOrderListener) {
      db.ref(`cityhut/orders/${orderId}/status`).off("value", activeOrderListener);
    }

    activeOrderListener = db.ref(`cityhut/orders/${orderId}/status`).on("value", snap => {
      const status = snap.val();
      if (status === "completed") {
        const successModal = document.getElementById("success-modal-overlay");
        const rTable = document.getElementById("receipt-table-code");
        const rName = document.getElementById("receipt-customer-name");
        const rId = document.getElementById("receipt-order-id");

        if (rTable) rTable.textContent = (sessionStorage.getItem("cityhut_dinein_table") || "Pizza") + " Table";
        if (rName) rName.textContent = sessionStorage.getItem("cityhut_dinein_name") || "Customer";
        if (rId) rId.textContent = `...${orderId.slice(-6)}`;

        if (successModal) {
          successModal.classList.add("open");
          document.body.classList.add("no-scroll");
        }

        const closeBtn = document.getElementById("close-success-btn");
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            sessionStorage.removeItem("cityhut_table_session_active");
            sessionStorage.removeItem("cityhut_current_order_id");
            sessionStorage.removeItem("cityhut_dinein_table");
            sessionStorage.removeItem("cityhut_dinein_name");
            sessionStorage.removeItem("cityhut_dinein_phone");
            sessionStorage.removeItem("cityhut_dinein_email");
            window.location.href = "index.html";
          });
        }
      }
    });
  }

  function initCartModeSelector() {
    const orderForm = document.getElementById("order-form");
    if (!orderForm) return;

    const deliveryGroup = document.getElementById("delivery-fields-group");
    const dtGroup = document.getElementById("dinein-takeaway-fields-group");
    const checkoutBtn = document.getElementById("checkout-btn");
    const tableSelect = document.getElementById("client-table-dt");

    const modeLabels = orderForm.querySelectorAll(".mode-pill");

    // Populate table select dropdown
    if (tableSelect && typeof db !== "undefined") {
      db.ref("cityhut/cms/settings/tableCodes").once("value", snap => {
        const codes = snap.val() || ["Pizza", "Burger", "Sandwich", "Garlic Bread", "Beverage", "Dessert"];
        const codesList = Array.isArray(codes) ? codes : Object.values(codes);
        tableSelect.innerHTML = codesList.map(code => `<option value="${code}">${code} Table</option>`).join("");
        
        // After loading tables, check if there is a session table to pre-select
        const activeTable = sessionStorage.getItem("cityhut_dinein_table");
        if (activeTable) {
          tableSelect.value = activeTable;
        }
      });
    }

    function updateFields(mode) {
      sessionStorage.setItem("cityhut_order_mode", mode);
      const tableGroup = document.getElementById("table-number-group");

      if (mode === "delivery") {
        if (deliveryGroup) deliveryGroup.style.display = "block";
        if (dtGroup) dtGroup.style.display = "none";
        if (checkoutBtn) {
          checkoutBtn.innerHTML = "<span>📱</span> Place Order on WhatsApp";
          checkoutBtn.className = "btn btn-whatsapp btn-block";
        }
      } else {
        if (deliveryGroup) deliveryGroup.style.display = "none";
        if (dtGroup) dtGroup.style.display = "block";
        if (mode === "dinein") {
          if (tableGroup) tableGroup.style.display = "block";
          if (checkoutBtn) {
            checkoutBtn.innerHTML = "<span>🍽️</span> Send Order to Waiter";
            checkoutBtn.className = "btn btn-primary btn-block";
          }
        } else {
          // Takeaway
          if (tableGroup) tableGroup.style.display = "none";
          if (checkoutBtn) {
            checkoutBtn.innerHTML = "<span>📱</span> Place Order on WhatsApp";
            checkoutBtn.className = "btn btn-whatsapp btn-block";
          }
        }
      }
    }

    const radios = orderForm.querySelectorAll('input[name="order-mode"]');
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        modeLabels.forEach(l => l.classList.remove("active"));
        radio.closest(".mode-pill").classList.add("active");
        updateFields(radio.value);
      });
    });

    // Make the pills themselves clickable (clicking the label checks the radio automatically, but let's make sure it fires change)
    modeLabels.forEach(label => {
      label.addEventListener("click", (e) => {
        const radio = label.querySelector('input[type="radio"]');
        if (e.target !== radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change"));
        }
      });
    });

    // Handle initial state or URL override
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get("mode");
    const sessionMode = sessionStorage.getItem("cityhut_order_mode");
    const activeMode = urlMode || sessionMode || "delivery";

    const targetLabel = orderForm.querySelector(`.mode-pill input[value="${activeMode}"]`);
    if (targetLabel) {
      targetLabel.closest(".mode-pill").click();
    } else {
      updateFields("delivery");
    }
  }

  /* ==========================================================================
     11. CHECKOUT LOGIC & ORDER FORWARDING
     ========================================================================== */
  function initCheckoutForm() {
    if (!orderForm) return;

    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      const selectedMode = orderForm.querySelector('input[name="order-mode"]:checked').value;
      const subtotal = getCartSubtotal();
      
      let isValid = true;
      orderForm.querySelectorAll(".form-error").forEach(err => err.style.display = "none");

      let name = "";
      let phone = "";
      let address = "";
      let email = "";
      let tableNo = "";
      let instructions = "None";

      if (selectedMode === "delivery") {
        name = document.getElementById("client-name").value.trim();
        phone = document.getElementById("client-phone-delivery").value.trim();
        address = document.getElementById("client-address").value.trim();
        instructions = document.getElementById("client-instructions").value.trim() || "None";

        if (!name) {
          document.getElementById("client-name").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
        if (!phone) {
          document.getElementById("client-phone-delivery").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
        if (!address) {
          document.getElementById("client-address").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
      } else {
        // Takeaway or Dine In
        name = document.getElementById("client-name-dt").value.trim();
        phone = document.getElementById("client-phone-dt").value.trim();
        email = document.getElementById("client-email-dt").value.trim();
        if (selectedMode === "dinein") {
          tableNo = document.getElementById("client-table-dt").value;
        }

        if (!name) {
          document.getElementById("client-name-dt").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
        if (!phone) {
          document.getElementById("client-phone-dt").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
        if (!email) {
          document.getElementById("client-email-dt").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
        if (selectedMode === "dinein" && !tableNo) {
          document.getElementById("client-table-dt").parentNode.querySelector(".form-error").style.display = "block";
          isValid = false;
        }
      }

      if (!isValid) return;

      if (selectedMode === "dinein") {
        try {
          const newOrderRef = db.ref("cityhut/orders").push();
          const dbItems = {};
          cart.forEach((item, index) => {
            dbItems[`item_${index}`] = {
              name: item.name,
              size: item.size || null,
              price: item.price,
              qty: item.quantity,
              crust: item.crust || null,
              addons: item.addons || null,
              addedAt: Date.now()
            };
          });

          await newOrderRef.set({
            customerName: name || `${tableNo} Table Guest`,
            phone: phone,
            email: email,
            tableCode: tableNo,
            type: "dine-in",
            status: "active",
            createdAt: Date.now(),
            items: dbItems
          });

          // Save active session
          sessionStorage.setItem("cityhut_current_order_id", newOrderRef.key);
          sessionStorage.setItem("cityhut_dinein_table", tableNo);
          sessionStorage.setItem("cityhut_dinein_name", name || `${tableNo} Table Guest`);
          sessionStorage.setItem("cityhut_table_session_active", "true");

          // Update navbar table badge if dinein and active table is stored
          const navActions = document.querySelector(".nav-actions");
          if (navActions) {
            navActions.innerHTML = `<span class="role-badge waiter" style="background-color: var(--accent); margin-right: 10px;">🍽️ ${tableNo} Table</span>`;
          }

          // Start listener for this order
          setupOrderStatusListener(newOrderRef.key);

          clearCart();
          if (cartCloseBtn) cartCloseBtn.click();
          alert(`Order sent to waiter for ${tableNo} Table! They will serve you shortly. You can add more items if you want!`);
        } catch (err) {
          console.error("Order submit failed:", err);
          alert("Database connection error. Failed to send order.");
        }
      } else {
        // Delivery or Takeaway (WhatsApp Checkout)
        try {
          const newOrderRef = db.ref("cityhut/orders").push();
          const dbItems = {};
          cart.forEach((item, index) => {
            dbItems[`item_${index}`] = {
              name: item.name,
              size: item.size || null,
              price: item.price,
              qty: item.quantity,
              crust: item.crust || null,
              addons: item.addons || null,
              addedAt: Date.now()
            };
          });

          const orderType = selectedMode; // 'delivery' or 'takeaway'
          
          // Generate unique takeaway number synchronously (avoiding async network delay)
          const takeawayNum = orderType === "takeaway" ? Math.floor(1000 + Math.random() * 9000) : null;

          // Asynchronous non-blocking Firebase write
          db.ref("cityhut/orders/" + newOrderRef.key).set({
            customerName: name || `Takeaway Guest`,
            phone: phone,
            email: email || null,
            address: address || "Takeaway Order",
            tableCode: null,
            takeawayNum: takeawayNum,
            instructions: instructions,
            type: orderType,
            status: "active",
            createdAt: Date.now(),
            items: dbItems
          }).catch(err => console.error("Firebase log failed:", err));

          let totalBreakdownText = `*Subtotal:* ₹${subtotal}`;
          let grandTotal = subtotal;
          if (activeBillSettings.gstEnabled) {
            const cgst = Math.round(subtotal * (activeBillSettings.gstPercentage / 2) / 100 * 100) / 100;
            const sgst = Math.round(subtotal * (activeBillSettings.gstPercentage / 2) / 100 * 100) / 100;
            grandTotal += cgst + sgst;
            totalBreakdownText += `\n*CGST (${activeBillSettings.gstPercentage / 2}%):* +₹${cgst.toFixed(2)}`;
            totalBreakdownText += `\n*SGST (${activeBillSettings.gstPercentage / 2}%):* +₹${sgst.toFixed(2)}`;
          }
          if (activeBillSettings.serviceCharge > 0) {
            grandTotal += activeBillSettings.serviceCharge;
            totalBreakdownText += `\n*Service/Pkg Charge:* +₹${activeBillSettings.serviceCharge}`;
          }
          totalBreakdownText += `\n*Grand Total: ₹${grandTotal.toFixed(2)}*`;

          const itemsListText = cart
            .map(item => {
              const sizeLabel = item.size ? ` (${item.size})` : "";
              const subtotalVal = item.price * item.quantity;
              let line = `• ${item.quantity}x ${item.name}${sizeLabel} — ₹${subtotalVal}`;
              if (item.crust) {
                line += `\n    ↳ Crust: ${item.crust}`;
              }
              if (item.addons && item.addons.length > 0) {
                const addonNames = item.addons.map(a => a.name).join(", ");
                line += `\n    ↳ Addons: ${addonNames}`;
              }
              return line;
            })
            .join("\n");

          let message = "";
          const template = orderType === "takeaway" ? activeWhatsAppTemplates.takeaway : activeWhatsAppTemplates.delivery;
          message = template
            .replace(/{restaurantName}/g, activeRestaurantName || "")
            .replace(/{itemsList}/g, itemsListText || "")
            .replace(/{totalBreakdown}/g, totalBreakdownText || "")
            .replace(/{customerName}/g, name || "Guest")
            .replace(/{customerPhone}/g, phone || "")
            .replace(/{customerAddress}/g, address || "")
            .replace(/{takeawayNum}/g, takeawayNum || "")
            .replace(/{customerEmail}/g, email || "")
            .replace(/{instructions}/g, instructions || "None");

          const encodedMsg = encodeURIComponent(message);
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${activeWhatsAppNumber}&text=${encodedMsg}`;

          clearCart();
          if (cartCloseBtn) cartCloseBtn.click();

          // Immediately redirect the browser tab directly to WhatsApp (perfect for mobile web browsers!)
          window.location.href = whatsappUrl;
        } catch (err) {
          console.error("Failed to process order:", err);
          alert("Error placing order. Please try again.");
        }
      }
    });
  }

  /* ==========================================================================
     12. CONTACT PAGE ENQUIRY BINDING
     ========================================================================== */
  function initContactPage() {
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      let isValid = true;
      document.querySelectorAll(".form-error").forEach(err => err.style.display = "none");

      if (!name) {
        document.getElementById("contact-name").parentNode.querySelector(".form-error").style.display = "block";
        isValid = false;
      }
      if (!phone) {
        document.getElementById("contact-phone").parentNode.querySelector(".form-error").style.display = "block";
        isValid = false;
      }
      if (!message) {
        document.getElementById("contact-message").parentNode.querySelector(".form-error").style.display = "block";
        isValid = false;
      }

      if (!isValid) return;

      const formattedMsg = `Hello ${activeRestaurantName}! I'm ${name} (${phone}). ${message}`;
      const encodedMsg = encodeURIComponent(formattedMsg);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${activeWhatsAppNumber}&text=${encodedMsg}`;

      window.open(whatsappUrl, "_blank");
    });
  }

  /* ==========================================================================
     13. CUSTOMIZER MODAL CONTROLS & CALCULATIONS
     ========================================================================== */
  let activeCustomizerProduct = null;

  function getProductPrices(card) {
    const pills = card.querySelectorAll(".size-pill");
    if (pills.length === 0) return null;
    const prices = {};
    pills.forEach(p => {
      const sz = p.getAttribute("data-size");
      const pr = parseFloat(p.getAttribute("data-price"));
      if (sz && !isNaN(pr)) {
        prices[sz.toLowerCase()] = pr;
      }
    });
    return prices;
  }

  function openCustomizeModal(product) {
    activeCustomizerProduct = product;
    const overlay = document.getElementById("customize-modal-overlay");
    const title = document.getElementById("customize-title");
    const content = document.getElementById("customize-content");

    if (!overlay || !content) return;

    title.textContent = `🍕 Customize ${product.name}`;
    
    const config = customizationOptions[product.category] || {};
    let html = "";

    // 1. Sizing
    if (product.prices) {
      const isPizzaSizes = product.prices.small || product.prices.medium || product.prices.large;
      const isShakeSizes = product.prices.normal || product.prices.special;
      
      if (isPizzaSizes || isShakeSizes) {
        const titleText = isPizzaSizes ? "Select Size" : "Select Type";
        html += `
          <div class="cust-section">
            <div class="cust-section-title">${titleText}</div>
            <div style="display: flex; gap: 8px;">
        `;
        
        const sizesToCheck = isPizzaSizes ? ["small", "medium", "large"] : ["normal", "special"];
        sizesToCheck.forEach(sz => {
          if (product.prices[sz]) {
            const capSize = sz.charAt(0).toUpperCase() + sz.slice(1);
            const defaultSize = isPizzaSizes ? "Small" : "Normal";
            const activeClass = (product.size || defaultSize).toLowerCase() === sz ? "active" : "";
            html += `
              <button type="button" class="size-pill cust-size-pill ${activeClass}" data-size="${capSize}" data-price="${product.prices[sz]}" style="flex: 1; padding: 10px 4px; border-radius: var(--radius); font-weight: 600; cursor: pointer; text-align: center;">
                ${capSize} (₹${product.prices[sz]})
              </button>
            `;
          }
        });
        html += `
            </div>
          </div>
        `;
      }
    }

    // 2. Crust Selection
    if (product.category === "pizza" && config.crusts) {
      html += `
        <div class="cust-section">
          <div class="cust-section-title">Select Crust</div>
          <div class="cust-options-list">
      `;
      
      config.crusts.forEach((crust, idx) => {
        const activeClass = idx === 0 ? "active" : "";
        const checkedAttr = idx === 0 ? "checked" : "";
        html += `
          <label class="cust-option-card cust-crust-card ${activeClass}">
            <div class="cust-option-left">
              <input type="radio" name="cust-crust" value="${crust.name}" data-price="${crust.price}" ${checkedAttr} class="cust-option-input">
              <span>${crust.name}</span>
            </div>
            <div class="cust-option-price">${crust.price > 0 ? `+₹${crust.price}` : "Free"}</div>
          </label>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }

    // 3. Toppings / Addons Selection
    if (config.addons && config.addons.length > 0) {
      html += `
        <div class="cust-section">
          <div class="cust-section-title">${product.category === "pizza" ? "Extra Toppings" : "Add-ons"}</div>
          <div class="cust-options-list">
      `;
      
      config.addons.forEach(addon => {
        html += `
          <label class="cust-option-card cust-addon-card">
            <div class="cust-option-left">
              <input type="checkbox" name="cust-addon" value="${addon.name}" data-price="${addon.price}" class="cust-option-input">
              <span>${addon.name}</span>
            </div>
            <div class="cust-option-price">+₹${addon.price}</div>
          </label>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }

    content.innerHTML = html;
    overlay.classList.add("open");
    document.body.classList.add("no-scroll");

    bindCustomizerRealtimeUpdates(product);
  }

  function bindCustomizerRealtimeUpdates(product) {
    const overlay = document.getElementById("customize-modal-overlay");
    const totalPriceEl = document.getElementById("customize-total-price");
    if (!overlay || !totalPriceEl) return;
    
    const sizePills = overlay.querySelectorAll(".cust-size-pill");
    const crustCards = overlay.querySelectorAll(".cust-crust-card");
    
    function calculateTotal() {
      let basePrice = product.price;
      let selectedSizeLabel = "Small";
      
      const activeSizePill = overlay.querySelector(".cust-size-pill.active");
      if (activeSizePill) {
        basePrice = parseFloat(activeSizePill.getAttribute("data-price"));
        selectedSizeLabel = activeSizePill.getAttribute("data-size") || "Small";
      }

      overlay.querySelectorAll('.cust-crust-card').forEach(card => {
        const input = card.querySelector('input[name="cust-crust"]');
        const priceDiv = card.querySelector('.cust-option-price');
        if (!input || !priceDiv) return;
        
        let price = parseFloat(input.getAttribute('data-price'));
        if (input.value === "Cheese Burst") {
          if (selectedSizeLabel === "Medium") price = 160;
          else if (selectedSizeLabel === "Large") price = 200;
          else price = 100;
        }
        priceDiv.textContent = price > 0 ? `+₹${price}` : "Free";
      });
      
      let crustPrice = 0;
      const activeCrustInput = overlay.querySelector('input[name="cust-crust"]:checked');
      if (activeCrustInput) {
        if (activeCrustInput.value === "Cheese Burst") {
          if (selectedSizeLabel === "Medium") crustPrice = 160;
          else if (selectedSizeLabel === "Large") crustPrice = 200;
          else crustPrice = 100;
        } else {
          crustPrice = parseFloat(activeCrustInput.getAttribute("data-price"));
        }
      }
      
      let addonsPrice = 0;
      overlay.querySelectorAll('input[name="cust-addon"]:checked').forEach(chk => {
        addonsPrice += parseFloat(chk.getAttribute("data-price"));
      });
      
      const total = basePrice + crustPrice + addonsPrice;
      totalPriceEl.textContent = `₹${total}`;
    }

    sizePills.forEach(pill => {
      pill.addEventListener("click", () => {
        sizePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        calculateTotal();
      });
    });

    overlay.querySelectorAll('input[name="cust-crust"]').forEach(input => {
      input.addEventListener("change", () => {
        crustCards.forEach(c => c.classList.remove("active"));
        const parentLabel = input.closest(".cust-option-card");
        if (parentLabel) parentLabel.classList.add("active");
        calculateTotal();
      });
    });

    overlay.querySelectorAll('input[name="cust-addon"]').forEach(input => {
      input.addEventListener("change", () => {
        const parentLabel = input.closest(".cust-option-card");
        if (parentLabel) {
          if (input.checked) {
            parentLabel.classList.add("active");
          } else {
            parentLabel.classList.remove("active");
          }
        }
        calculateTotal();
      });
    });

    calculateTotal();
  }

  function initCustomizerModal() {
    const overlay = document.getElementById("customize-modal-overlay");
    const closeBtn = document.getElementById("customize-close");
    const addBtn = document.getElementById("customize-add-btn");
    
    if (!overlay) return;
    
    const closeModal = () => {
      overlay.classList.remove("open");
      document.body.classList.remove("no-scroll");
      activeCustomizerProduct = null;
    };
    
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (!activeCustomizerProduct) return;
        
        let size = null;
        let basePrice = activeCustomizerProduct.price;
        
        const activeSizePill = overlay.querySelector(".cust-size-pill.active");
        if (activeSizePill) {
          size = activeSizePill.getAttribute("data-size");
          basePrice = parseFloat(activeSizePill.getAttribute("data-price"));
        }
        
        let crust = null;
        let crustPrice = 0;
        const activeCrustInput = overlay.querySelector('input[name="cust-crust"]:checked');
        if (activeCrustInput) {
          crust = activeCrustInput.value;
          if (crust === "Cheese Burst") {
            if (size === "Medium") crustPrice = 160;
            else if (size === "Large") crustPrice = 200;
            else crustPrice = 100;
          } else {
            crustPrice = parseFloat(activeCrustInput.getAttribute("data-price"));
          }
        }
        
        const addons = [];
        let addonsPrice = 0;
        overlay.querySelectorAll('input[name="cust-addon"]:checked').forEach(chk => {
          addons.push({
            name: chk.value,
            price: parseFloat(chk.getAttribute("data-price"))
          });
          addonsPrice += parseFloat(chk.getAttribute("data-price"));
        });
        
        const finalPrice = basePrice + crustPrice + addonsPrice;
        
        addToCart({
          id: activeCustomizerProduct.id,
          name: activeCustomizerProduct.name,
          size: size,
          crust: crust,
          addons: addons,
          price: finalPrice,
          quantity: 1,
          category: activeCustomizerProduct.category
        });
        
        closeModal();
      });
    }
  }

  /* ==========================================================================
     14. SECURE HTML ESCAPE UTILITY
     ========================================================================== */
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[match];
    });
  }

  /* ==========================================================================
     13. DARK MODE THEME TOGGLER
     ========================================================================== */
  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const updateToggleIcon = () => {
      const isDark = document.body.classList.contains("dark-mode");
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
    };

    updateToggleIcon();

    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateToggleIcon();
    });
  }

  function renderFanFavourites(items) {
    const grid = document.getElementById("fan-favourites-grid");
    if (!grid) return;

    grid.innerHTML = items.map(item => {
      const prices = item.prices || {};

      let sizeSelectorHtml = "";
      let initialPrice = 0;
      let dataAttrs = `data-id="${item.key}" data-name="${escapeHTML(item.name)}" data-category="${item.category}"`;

      if (prices.small || prices.medium || prices.large) {
        initialPrice = prices.small || 0;
        sizeSelectorHtml = `
          <div class="size-selector">
            <label id="pizza-${item.key}-size">Select Size:</label>
            <div class="size-select-pills" role="radiogroup" aria-labelledby="pizza-${item.key}-size">
              <button type="button" class="size-pill active" role="radio" aria-checked="true" data-size="Small" data-price="${prices.small || 0}">S (₹${prices.small || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Medium" data-price="${prices.medium || 0}">M (₹${prices.medium || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Large" data-price="${prices.large || 0}">L (₹${prices.large || 0})</button>
            </div>
          </div>
        `;
      } else if (prices.normal || prices.special) {
        initialPrice = prices.normal || 0;
        sizeSelectorHtml = `
          <div class="size-selector">
            <label id="beverage-${item.key}-size">Select Type:</label>
            <div class="size-select-pills" role="radiogroup" aria-labelledby="beverage-${item.key}-size">
              <button type="button" class="size-pill active" role="radio" aria-checked="true" data-size="Normal" data-price="${prices.normal || 0}">Normal (₹${prices.normal || 0})</button>
              <button type="button" class="size-pill" role="radio" aria-checked="false" data-size="Special" data-price="${prices.special || 0}">Special (₹${prices.special || 0})</button>
            </div>
          </div>
        `;
      } else {
        initialPrice = prices.single || prices.regular || 0;
        dataAttrs += ` data-price="${initialPrice}"`;
        if (prices.regular) {
          dataAttrs += ` data-size="Regular"`;
        }
      }

      return `
        <div class="product-card" ${dataAttrs} role="article">
          <div class="product-img-wrapper">
            <img class="product-img" src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" loading="lazy">
            <div class="product-veg-type" aria-label="Vegetarian option">
              <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}"></span>
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-title">${escapeHTML(item.name)}</h3>
            <p class="product-desc">${escapeHTML(item.description || "")}</p>
            ${sizeSelectorHtml}
            <div class="product-meta">
              <span class="product-price">₹${initialPrice}</span>
              <div class="qty-counter">
                <button type="button" class="qty-btn menu-dec-btn" aria-label="Decrease quantity">-</button>
                <span class="qty-val qty-val-display">0</span>
                <button type="button" class="qty-btn menu-inc-btn" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="btn btn-primary add-to-cart-btn btn-block" style="margin-top: 12px;">Add to Cart</button>
          </div>
        </div>
      `;
    }).join("");
  }

  async function initHomePage() {
    const grid = document.getElementById("fan-favourites-grid");
    if (!grid) return;

    try {
      const snap = await db.ref("cityhut/cms/menu").once("value");
      const menuData = snap.val() || {};
      
      const allItems = Object.keys(menuData).map(k => ({ key: k, ...menuData[k] }));
      
      let favorites = allItems.filter(item => item.isFanFavourite === true && item.available !== false);
      
      if (favorites.length === 0) {
        const defaultFavKeys = ["cloud-9-pizza", "volcano-pizza", "cold-coffee"];
        favorites = allItems.filter(item => defaultFavKeys.includes(item.key) && item.available !== false);
        if (favorites.length === 0) {
          favorites = allItems.filter(item => item.available !== false).slice(0, 4);
        }
      }

      renderFanFavourites(favorites);
      bindProductCardEvents();
      syncMenuCardCounters();
    } catch (err) {
      console.error("Error loading home page fan favorites:", err);
    }
  }

  /* ==========================================================================
     18. GLOBAL SCROLL REVEAL ANIMATIONS
     ========================================================================== */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -50px 0px", // Trigger reveal slightly before it's fully on screen
      threshold: 0.05
    });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => {
      revealObserver.observe(el);
    });
  }

  /* ==========================================================================
     APPLICATION INITIATION
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    seedDatabase();
    loadSettings();
    initThemeToggle();
    initPreloader();
    initNavigation();
    initAnnouncementBanner();
    initBackToTop();
    loadCart();
    initCartDrawer();
    initCustomizerModal();
    initCheckoutForm();
    initCartModeSelector();
    bindProductCardEvents();
    initMenuPage();
    initHomePage();
    initDineInFlow();
    initContactPage();
    initScrollAnimations();
  });
})();
