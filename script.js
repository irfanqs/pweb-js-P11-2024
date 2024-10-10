let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let itemsPerPage = 5; // Default value for items per page

// Mengambil data dari dummyjson.com dengan awal katagori semuanya 
async function fetchProducts(category = "all") {
    let url = 'https://dummyjson.com/products';
    if (category !== "all") {
        url += `/category/${category}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        products = data.products;
        displayProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById('products').innerHTML = "<p>Failed to load products. Please try again later.</p>";
    }
}

// Fungsi yang akan menampilkan produknya 
function displayProducts(products) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = "";

    const limitedProducts = products.slice(0, itemsPerPage);

    limitedProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.thumbnail}" alt="${product.title}">
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsContainer.appendChild(productDiv);
    });
}

function addToCart(id) {
    const product = products.find(prod => prod.id === id);
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = "";

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');

        cartItemDiv.innerHTML = `
            <h4>${item.title}</h4>
            <p>Quantity: <button onclick="changeQuantity(${item.id}, -1)">-</button> ${item.quantity} <button onclick="changeQuantity(${item.id}, 1)">+</button></p>
            <p>Price: $${item.price * item.quantity}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;

        cartItemsContainer.appendChild(cartItemDiv);

        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    document.getElementById('total-items').innerText = totalItems;
    document.getElementById('total-price').innerText = totalPrice.toFixed(2);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function changeQuantity(id, amount) {
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity += amount;
        if (cartItem.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
        }
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("Keranjangmu masih kosong, silahkan belanja terlebih dahulu🛒");
    } else {
        alert("Terima kasih sudah membeli produk kami🙏");
        cart = [];
        updateCart();
    }
}

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const category = e.target.value;
    fetchProducts(category);
});

document.getElementById('itemsPerPage').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    displayProducts(products);
});

fetchProducts();
updateCart();
