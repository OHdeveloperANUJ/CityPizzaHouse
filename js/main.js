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
    // PIZZA
    { name: "Veg Margherita", category: "pizza", description: "Classic tomato sauce, mozzarella, herbs", isVeg: true, available: true, prices: { small: 149, medium: 199, large: 249 }, imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Tikka Pizza", category: "pizza", description: "Spicy paneer, capsicum, onion", isVeg: true, available: true, prices: { small: 179, medium: 229, large: 289 }, imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600&auto=format&fit=crop" },
    { name: "Garden Fresh Pizza", category: "pizza", description: "Corn, capsicum, onion, tomato, olives", isVeg: true, available: true, prices: { small: 169, medium: 219, large: 279 }, imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=600&auto=format&fit=crop" },
    { name: "Cheese Burst Pizza", category: "pizza", description: "Extra cheese-filled crust, double mozzarella", isVeg: true, available: true, prices: { small: 199, medium: 259, large: 319 }, imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=600&auto=format&fit=crop" },
    { name: "Spicy Veg Pizza", category: "pizza", description: "Jalapeno, red chilli, onion, capsicum", isVeg: true, available: true, prices: { small: 169, medium: 219, large: 279 }, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop" },
    { name: "Farm House Pizza", category: "pizza", description: "Mushroom, paneer, capsicum, sweet corn", isVeg: true, available: true, prices: { small: 179, medium: 239, large: 299 }, imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=600&auto=format&fit=crop" },
    // BURGERS
    { name: "Veg Burger", category: "burger", description: "Crispy veg patty, lettuce, tomato, special sauce", isVeg: true, available: true, prices: { single: 79 }, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Burger", category: "burger", description: "Grilled paneer, onion rings, mayo, mustard", isVeg: true, available: true, prices: { single: 99 }, imageUrl: "https://images.unsplash.com/photo-1547584370-2cc98b8b8dc8?q=80&w=600&auto=format&fit=crop" },
    { name: "Aloo Tikki Burger", category: "burger", description: "Classic aloo tikki with chutney and veggies", isVeg: true, available: true, prices: { single: 69 }, imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600&auto=format&fit=crop" },
    { name: "Cheese Burger", category: "burger", description: "Double cheese slice, crispy patty, pickles", isVeg: true, available: true, prices: { single: 109 }, imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop" },
    { name: "Spicy Crunchy Burger", category: "burger", description: "Extra spicy sauce, crispy veg patty, onion", isVeg: true, available: true, prices: { single: 99 }, imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop" },
    // SANDWICHES
    { name: "Veg Grilled Sandwich", category: "sandwich", description: "Mixed veg, cheese, grilled to perfection", isVeg: true, available: true, prices: { single: 79 }, imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop" },
    { name: "Paneer Grilled Sandwich", category: "sandwich", description: "Spiced paneer, capsicum, cheese", isVeg: true, available: true, prices: { single: 99 }, imageUrl: "https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?q=80&w=600&auto=format&fit=crop" },
    { name: "Club Sandwich", category: "sandwich", description: "3-layer sandwich, mixed veg, cheese, sauces", isVeg: true, available: true, prices: { single: 119 }, imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop" },
    { name: "Cold Sandwich", category: "sandwich", description: "Fresh veggies, mayo, mustard, no grill", isVeg: true, available: true, prices: { single: 69 }, imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=600&auto=format&fit=crop" },
    // GARLIC BREAD
    { name: "Classic Garlic Bread", category: "garlic-bread", description: "Toasted bread with garlic butter, herbs", isVeg: true, available: true, prices: { single: 79 }, imageUrl: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=600&auto=format&fit=crop" },
    { name: "Garlic Cheese Bread", category: "garlic-bread", description: "Classic + melted mozzarella on top", isVeg: true, available: true, prices: { single: 99 }, imageUrl: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=600&auto=format&fit=crop" },
    { name: "Stuffed Garlic Bread", category: "garlic-bread", description: "Filled with cheese and veg stuffing", isVeg: true, available: true, prices: { single: 119 }, imageUrl: "https://images.unsplash.com/photo-1603046891744-1f76eb10aec1?q=80&w=600&auto=format&fit=crop" },
    { name: "Cheesy Dip Garlic Bread", category: "garlic-bread", description: "Served with a side of cheese dip", isVeg: true, available: true, prices: { single: 129 }, imageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop" },
    // BEVERAGES
    { name: "Cold Coffee", category: "beverage", description: "Chilled coffee with cream, sweet", isVeg: true, available: true, prices: { single: 79 }, imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop" },
    { name: "Hot Coffee", category: "beverage", description: "Classic freshly brewed hot coffee", isVeg: true, available: true, prices: { single: 49 }, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop" },
    { name: "Oreo Shake", category: "beverage", description: "Thick Oreo milkshake with whipped cream", isVeg: true, available: true, prices: { single: 99 }, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop" },
    { name: "Chocolate Shake", category: "beverage", description: "Rich chocolate milkshake", isVeg: true, available: true, prices: { single: 89 }, imageUrl: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=600&auto=format&fit=crop" },
    { name: "Lemon Soda", category: "beverage", description: "Fresh lime with soda, sweet or salty", isVeg: true, available: true, prices: { single: 49 }, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop" },
    { name: "Mango Lassi", category: "beverage", description: "Thick mango yoghurt drink", isVeg: true, available: true, prices: { single: 69 }, imageUrl: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600&auto=format&fit=crop" }
  ];

  function seedDatabase() {
    if (typeof db !== "undefined") {
      db.ref("cityhut/cms/categories").once("value", snap => {
        if (!snap.exists()) {
          console.log("Realtime Database empty. Seeding defaults...");
          defaultMenu.forEach(item => {
            db.ref("cityhut/cms/menu").push(item);
          });
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
          db.ref("cityhut/cms/hero").set({
            headline: "Kawardha ki Sabse Tasty Pizza 🍕",
            description: "Fresh dough made daily, real premium mozzarella cheese, and rich homemade sauces — delivered steaming hot straight to your door.",
            bgImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
            badge1: "🚀 Fast Delivery",
            badge2: "🧑‍🍳 Freshly Made",
            badge3: "⭐ 256+ Happy Customers"
          });
          db.ref("cityhut/cms/categories").set({
            pizza: { id: "pizza", name: "Pizza", icon: "🍕" },
            burger: { id: "burger", name: "Burgers", icon: "🍔" },
            sandwich: { id: "sandwich", name: "Sandwiches", icon: "🥪" },
            "garlic-bread": { id: "garlic-bread", name: "Garlic Bread", icon: "🧄" },
            beverage: { id: "beverage", name: "Beverages", icon: "☕" }
          });
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
          db.ref("cityhut/cms/customizations").set({
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
          });
          localStorage.setItem("menuSeeded", "true");
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
      const emojiSpan = el.querySelector('span[aria-hidden="true"]');
      const emoji = emojiSpan ? emojiSpan.textContent : "🍕";
      el.innerHTML = `<span aria-hidden="true">${emoji}</span> ${activeRestaurantName}`;
    });

    // Dynamic Tel links
    const telLinks = document.querySelectorAll('a[href*="tel:"]');
    telLinks.forEach(link => {
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
      window.addEventListener("load", () => {
        setTimeout(() => {
          preloader.classList.add("fade-out");
          sessionStorage.setItem(VISIT_FLAG_KEY, "true");
          setTimeout(() => preloader.remove(), 500);
        }, 1500);
      });
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
          <section id="${cat.id}" class="menu-section" style="margin-bottom: 60px;" aria-labelledby="${cat.id}-heading">
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

        // Render each category grid
        categoriesList.forEach(cat => {
          const items = itemsByCategory[cat.id] || [];
          renderCategoryGrid(cat.id, items);
        });

        bindProductCardEvents();
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

      if (isPizza) {
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
      } else {
        initialPrice = prices.single || 0;
        dataAttrs += ` data-price="${initialPrice}"`;
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
        phone = document.getElementById("client-phone-dt").value.trim();
        email = document.getElementById("client-email-dt").value.trim();
        if (selectedMode === "dinein") {
          tableNo = document.getElementById("client-table-dt").value;
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
            customerName: `${tableNo} Table Guest`,
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
          sessionStorage.setItem("cityhut_dinein_name", `${tableNo} Table Guest`);
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
          let takeawayNum = null;

          if (orderType === "takeaway") {
            try {
              const snap = await db.ref("cityhut/orders").once("value");
              const orders = snap.val() || {};
              let count = 0;
              Object.values(orders).forEach(o => {
                if (o.type === "takeaway") {
                  count++;
                }
              });
              takeawayNum = count + 1;
            } catch (e) {
              takeawayNum = Math.floor(Math.random() * 100) + 1;
            }
          }

          await newOrderRef.set({
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
          });

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

          window.open(whatsappUrl, "_blank");
        } catch (err) {
          console.error("Failed to log order:", err);
          alert("Database connection error. Failed to place order.");
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

    // 1. Pizza Sizes
    if (product.category === "pizza" && product.prices) {
      html += `
        <div class="cust-section">
          <div class="cust-section-title">Select Size</div>
          <div style="display: flex; gap: 8px;">
      `;
      
      const sizes = ["small", "medium", "large"];
      sizes.forEach(sz => {
        if (product.prices[sz]) {
          const capSize = sz.charAt(0).toUpperCase() + sz.slice(1);
          const activeClass = (product.size || "Small").toLowerCase() === sz ? "active" : "";
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
      
      const activeSizePill = overlay.querySelector(".cust-size-pill.active");
      if (activeSizePill) {
        basePrice = parseFloat(activeSizePill.getAttribute("data-price"));
      }
      
      let crustPrice = 0;
      const activeCrustInput = overlay.querySelector('input[name="cust-crust"]:checked');
      if (activeCrustInput) {
        crustPrice = parseFloat(activeCrustInput.getAttribute("data-price"));
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
          crustPrice = parseFloat(activeCrustInput.getAttribute("data-price"));
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
     APPLICATION INITIATION
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    seedDatabase();
    loadSettings();
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
    initDineInFlow();
    initContactPage();
  });
})();
