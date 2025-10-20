// ====================== LOAD PRODUCTS ====================== 
async function loadProducts(allowedOccasionIds = ["O003"]) {
  const container = document.getElementById("gifts");
  const viewMoreBtn = document.getElementById("showMore");

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbxpHQmNVT0Gio4kf05O_EWpVXWgPZWTiO38VE3gSv6fousLqnt51cXBnQcNr4pnrO4c/exec"
    );
    const data = await res.json();

    // Lọc sản phẩm theo occasion_id
    let products = data.data.filter(item => {
      if (!item.occasion_id) return false;
      const ids = item.occasion_id.split(","); // nhiều occasion_id sẽ cách nhau dấu ,
      return ids.some(id => allowedOccasionIds.includes(id.trim()));
    });

    console.log(products)

    let currentIndex = 0; // vị trí hiện tại
    const batchSize = 16; // số sản phẩm mỗi lần load

    function renderBatch() {
      const nextProducts = products.slice(currentIndex, currentIndex + batchSize);

      nextProducts.forEach((item) => {
        const price = Number(item.price) || 0;
        const discount = Math.round((1 - price / (price + 20000)) * 100);

        const card = document.createElement("div");
        card.className =
          "product-card rounded-2xl p-6 card-hover bg-white shadow-md hover:shadow-lg transition";
        card.innerHTML = `
          <div class="relative mb-4">
            <div class="w-full bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center text-6xl">
              <img class="rounded-2xl overflow-hidden" src="../assets/img/${item.gift_id}.webp" alt="${item.gift_name}">
            </div>
            <span class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">-${discount}%</span>
          </div>
          <h4 class="font-semibold text-gray-800 mb-2 line-clamp-2">${item.gift_name}</h4>
          <div class="flex items-center space-x-2 mb-4">
            <span class="text-red-500 font-bold text-lg">${price.toLocaleString()}₫</span>
            <span class="text-gray-400 line-through">${(price + 20000).toLocaleString()}₫</span>
          </div>
          <div class="flex space-x-2">
            <a href="${item.product_url}" target="_blank" 
               class="flex-1 bg-yellow-100 text-yellow-600 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-center">
               🛒Mua ngay
            </a>
            <button class="flex-1 btn-primary bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition">
              💝Tặng ngay
            </button>
          </div>
        `;

        const giftButton = card.querySelector("button");
        giftButton.addEventListener("click", () => {
          addToCart({
            id: item.gift_id,
            name: item.gift_name,
            price,
            img: `./assets/img/${item.gift_id}.webp`,
            quantity: 1,
            type: item.type || "General",
          });
        });

        container.appendChild(card);
      });

      currentIndex += batchSize;
      if (currentIndex >= products.length) {
        viewMoreBtn.style.display = "none";
      }
    }

    // Xóa cũ + render 16 sản phẩm đầu tiên
    container.innerHTML = "";
    renderBatch();

    viewMoreBtn.addEventListener("click", renderBatch);

  } catch (error) {
    container.innerHTML =
      '<p class="col-span-full text-center text-red-500">Không thể tải dữ liệu 😢</p>';
    console.error("Error fetching products:", error);
  }
}

// Sử dụng ví dụ: chỉ show O003
document.addEventListener("DOMContentLoaded", () => loadProducts(["O010"]));

// ====================== CART ======================
function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((p) => p.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(`🎁 Đã thêm "${item.name}" vào giỏ hàng!`);
}

// ====================== TOAST ======================
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("opacity-0");
  toast.classList.add("opacity-100");

  setTimeout(() => {
    toast.classList.add("opacity-0");
    toast.classList.remove("opacity-100");
  }, 2500);
}
