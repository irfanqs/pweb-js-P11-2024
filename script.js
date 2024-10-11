let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let itemsPerPage = 5; // Default value for items per page
let currentPage = 1;
let totalPages = 1;

// Kategori Tetap
const fixedCategories = ["mens-watches", "womens-watches", "beauty"];

// Kategori Mapping untuk "Beauty"
const beautyCategories = ["skincare", "fragrances"];

// Fungsi untuk mengambil kategori dari API
async function fetchCategories() {
	try {
		const response = await fetch("https://dummyjson.com/products/categories");
		const categories = await response.json();
		populateCategoryFilter(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
	}
}

// Fungsi untuk mengisi select box kategori
function populateCategoryFilter(apiCategories) {
	const categoryFilter = document.getElementById("categoryFilter");

	// Menambahkan kategori dinamis, kecuali yang sudah ada di fixedCategories dan "beauty"
	apiCategories.forEach((category) => {
		if (!fixedCategories.includes(category) && category !== "beauty") {
			const option = document.createElement("option");
			option.value = category;
			// Mengubah format kategori menjadi Title Case (opsional)
			option.textContent = category
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
			categoryFilter.appendChild(option);
		}
	});
}

// Fungsi yang akan menampilkan produknya
function displayProducts(productsToDisplay) {
	const productsContainer = document.getElementById("products");
	productsContainer.innerHTML = "";

	// Hitung indeks mulai dan akhir
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedProducts = productsToDisplay.slice(startIndex, endIndex);

	paginatedProducts.forEach((product) => {
		const productDiv = document.createElement("div");
		productDiv.classList.add("product");

		productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <img src="${product.thumbnail}" alt="${product.title}">
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
		productsContainer.appendChild(productDiv);
	});

	// Hitung total halaman
	totalPages = Math.ceil(productsToDisplay.length / itemsPerPage);
	document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;

	// Atur tombol Previous dan Next
	document.getElementById("prevBtn").disabled = currentPage === 1;
	document.getElementById("nextBtn").disabled = currentPage === totalPages || totalPages === 0;
}

function addToCart(id) {
	const product = products.find((prod) => prod.id === id);
	const cartItem = cart.find((item) => item.id === id);

	if (cartItem) {
		cartItem.quantity++;
	} else {
		cart.push({ ...product, quantity: 1 });
	}

	updateCart();
}

function removeFromCart(id) {
	cart = cart.filter((item) => item.id !== id);
	updateCart();
}

function updateCart() {
	const cartItemsContainer = document.getElementById("cart-items");
	cartItemsContainer.innerHTML = "";

	let totalItems = 0;
	let totalPrice = 0;

	cart.forEach((item) => {
		const cartItemDiv = document.createElement("div");
		cartItemDiv.classList.add("cart-item");

		cartItemDiv.innerHTML = `
            <h4>${item.title}</h4>
            <div class="cart-item-layout">
                <div class="cart-item-text">
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="change-qty-btn">
                    <button onclick="changeQuantity(${item.id}, -1)">-</button>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;

		cartItemsContainer.appendChild(cartItemDiv);

		totalItems += item.quantity;
		totalPrice += item.price * item.quantity;
	});

	document.getElementById("total-items").innerText = totalItems;
	document.getElementById("total-price").innerText = totalPrice.toFixed(2);
	localStorage.setItem("cart", JSON.stringify(cart));
}

function changeQuantity(id, amount) {
	const cartItem = cart.find((item) => item.id === id);
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

// Fungsi untuk Next dan Previous
function nextPage() {
	if (currentPage < totalPages) {
		currentPage++;
		displayProducts(products);
	}
}

function prevPage() {
	if (currentPage > 1) {
		currentPage--;
		displayProducts(products);
	}
}

// Fungsi untuk mengambil produk berdasarkan kategori
async function fetchProducts(category = "all") {
	let url = "https://dummyjson.com/products";
	let fetchedProducts = [];

	if (category === "all") {
		// Fetch all products
		try {
			const response = await fetch(`${url}?limit=100`); // Adjust limit as needed
			const data = await response.json();
			fetchedProducts = data.products;
		} catch (error) {
			console.error("Error fetching products:", error);
			document.getElementById("products").innerHTML = "<p>Failed to load products. Please try again later.</p>";
			return;
		}
	} else if (fixedCategories.includes(category)) {
		if (category === "beauty") {
			// Fetch multiple categories for "Beauty"
			try {
				const fetchPromises = beautyCategories.map((cat) => fetch(`${url}/category/${cat}`).then((res) => res.json()));
				const results = await Promise.all(fetchPromises);
				results.forEach((result) => {
					fetchedProducts = fetchedProducts.concat(result.products);
				});
			} catch (error) {
				console.error("Error fetching beauty products:", error);
				document.getElementById("products").innerHTML = "<p>Failed to load beauty products. Please try again later.</p>";
				return;
			}
		} else {
			// Fetch specific fixed category
			try {
				const response = await fetch(`${url}/category/${category}`);
				const data = await response.json();
				fetchedProducts = data.products;
			} catch (error) {
				console.error(`Error fetching category ${category}:`, error);
				document.getElementById("products").innerHTML = `<p>Failed to load products for category ${category}. Please try again later.</p>`;
				return;
			}
		}
	} else {
		// Fetch other dynamic categories
		try {
			const response = await fetch(`${url}/category/${category}`);
			const data = await response.json();
			fetchedProducts = data.products;
		} catch (error) {
			console.error(`Error fetching category ${category}:`, error);
			document.getElementById("products").innerHTML = `<p>Failed to load products for category ${category}. Please try again later.</p>`;
			return;
		}
	}

	products = fetchedProducts;
	currentPage = 1; // Reset halaman saat produk di-fetch ulang
	displayProducts(products);
}

// Event listeners untuk filter kategori dan items per page
document.getElementById("categoryFilter").addEventListener("change", (e) => {
	const category = e.target.value;
	currentPage = 1; // Reset halaman saat kategori berubah
	fetchProducts(category);
});

document.getElementById("itemsPerPage").addEventListener("change", (e) => {
	itemsPerPage = parseInt(e.target.value);
	currentPage = 1; // Reset halaman saat itemsPerPage berubah
	displayProducts(products);
});

// Inisialisasi saat load
fetchCategories();
fetchProducts();
updateCart();
