// Global State
let cart = [];
let allProducts = [];

// API URLs
const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";
const ALL_PRODUCTS_URL = "https://fakestoreapi.com/products";

// DOM Elements
const categoryContainer = document.getElementById("category-container");
const productContainer = document.getElementById("product-container");
const loadingSpinner = document.getElementById("loading-spinner");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");

// Global Routing Function
window.navigate = function(sectionId) {
  // 1. Hide all page sections
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });

  // 2. Show target section
  const targetSection = document.getElementById(`${sectionId}-section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts(ALL_PRODUCTS_URL);
});

// Helper Function: Toggle Loading Spinner
const toggleSpinner = (isLoading) => {
    if (!loadingSpinner || !productContainer) return;
    if (isLoading) {
        loadingSpinner.classList.remove("hidden");
        productContainer.classList.add("hidden");
    } else {
        loadingSpinner.classList.add("hidden");
        productContainer.classList.remove("hidden");
    }
};

// 1. Fetch & Display Categories
const loadCategories = async () => {
    try {
        const res = await fetch(CATEGORIES_URL);
        const categories = await res.json();
        
        // Add "All" option alongside fetched categories
        const allCategories = ["all", ...categories];
        displayCategories(allCategories);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
};

const displayCategories = (categories) => {
    if (!categoryContainer) return;
    categoryContainer.innerHTML = "";

    categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm btn-outline capitalize category-btn ${category === 'all' ? 'btn-primary active' : ''}`;
        btn.innerText = category;
        btn.onclick = (e) => filterByCategory(category, e);
        categoryContainer.appendChild(btn);
    });
};

// 2. Fetch & Display Products
const loadProducts = async (url) => {
    toggleSpinner(true);
    try {
        const res = await fetch(url);
        const data = await res.json();
        allProducts = data;
        displayProducts(data);
    } catch (error) {
        console.error("Error loading products:", error);
        if (productContainer) {
            productContainer.innerHTML = `<p class="text-center text-error col-span-full">Failed to load products!</p>`;
        }
    } finally {
        toggleSpinner(false);
    }
};

const displayProducts = (products) => {
    if (!productContainer) return;
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">No products found!</p>`;
        return;
    }

    products.forEach((product) => {
        const { id, title, price, category, image, rating } = product;
        
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow-xl border border-gray-100 flex flex-col justify-between";

        card.innerHTML = `
            <figure class="px-4 pt-4 bg-white h-48 flex items-center justify-center">
                <img src="${image}" alt="${title}" class="max-h-full object-contain" />
            </figure>
            <div class="card-body p-5 flex flex-col justify-between flex-grow">
                <div>
                    <span class="badge badge-secondary badge-sm mb-2 capitalize">${category}</span>
                    <h2 class="card-title text-base font-semibold line-clamp-1" title="${title}">${title}</h2>
                    <p class="text-xl font-bold text-primary my-2">$${price.toFixed(2)}</p>
                    <div class="flex items-center gap-1 text-yellow-500 text-sm mb-4">
                        <i class="fa-solid fa-star"></i>
                        <span class="font-bold text-gray-700">${rating?.rate || 0}</span>
                        <span class="text-gray-400">(${rating?.count || 0})</span>
                    </div>
                </div>
                <div class="card-actions grid grid-cols-2 gap-2 mt-auto">
                    <button onclick="openProductDetails(${id})" class="btn btn-outline btn-sm btn-primary w-full">Details</button>
                    <button onclick="addToCart(${id})" class="btn btn-primary btn-sm w-full text-white">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        productContainer.appendChild(card);
    });
};

// 3. Category Filter Handler
const filterByCategory = (category, event) => {
    document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("btn-primary", "active"));
    event.target.classList.add("btn-primary", "active");

    if (category === "all") {
        loadProducts(ALL_PRODUCTS_URL);
    } else {
        loadProducts(`https://fakestoreapi.com/products/category/${category}`);
    }
};

// 4. Single Product Modal Details
const openProductDetails = async (id) => {
    const modalContent = document.getElementById("modal-content");
    if (!modalContent) return;
    modalContent.innerHTML = `<span class="loading loading-spinner loading-lg text-primary mx-auto"></span>`;
    document.getElementById("product_modal").showModal();

    try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();

        modalContent.innerHTML = `
            <div class="w-full md:w-1/2 flex justify-center items-center p-4 bg-white rounded-lg">
                <img src="${product.image}" alt="${product.title}" class="max-h-60 object-contain" />
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                    <span class="badge badge-outline badge-primary capitalize mb-2">${product.category}</span>
                    <h3 class="font-bold text-xl mb-2">${product.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-2xl font-bold text-primary">$${product.price.toFixed(2)}</span>
                        <div class="badge badge-ghost gap-1">
                            <i class="fa-solid fa-star text-yellow-500"></i> ${product.rating?.rate}
                        </div>
                    </div>
                </div>
                <button onclick="addToCart(${product.id}); document.getElementById('product_modal').close();" class="btn btn-primary text-white w-full">Add to Cart</button>
            </div>
        `;
    } catch (error) {
        modalContent.innerHTML = `<p class="text-error">Failed to load product details.</p>`;
    }
};

// 5. Cart Management
const addToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
    }
};

const removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

const updateCartUI = () => {
    if (cartCount) cartCount.innerText = cart.length;
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-center text-gray-500 py-4">Your cart is empty!</p>`;
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const itemRow = document.createElement("div");
            itemRow.className = "flex justify-between items-center py-3";
            itemRow.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${item.title}" class="w-10 h-10 object-contain" />
                    <div>
                        <h4 class="font-semibold text-sm line-clamp-1 max-w-[180px]">${item.title}</h4>
                        <p class="text-xs text-gray-500">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="btn btn-ghost btn-xs text-error">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemRow);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = `$${total.toFixed(2)}`;
};

window.openCartModal = () => {
    const modal = document.getElementById("cart_modal");
    if (modal) modal.showModal();
};