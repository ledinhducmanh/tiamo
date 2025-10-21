document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbxpHQmNVT0Gio4kf05O_EWpVXWgPZWTiO38VE3gSv6fousLqnt51cXBnQcNr4pnrO4c/exec";

  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  const resultsBox = document.getElementById("searchResults");
  const clearBtn = document.getElementById("clearBtn");

  // Ẩn / hiện nút xóa
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      clearBtn?.classList.remove("hidden");
    } else {
      clearBtn?.classList.add("hidden");
    }
  });

  // Khi click xóa
  clearBtn?.addEventListener("click", () => {
    input.value = "";
    clearBtn.classList.add("hidden");
    resultsBox.classList.add("hidden");
  });

  // Click ra ngoài thì ẩn kết quả
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-bar")) {
      resultsBox.classList.add("hidden");
    }
  });

  // =================== CHỨC NĂNG TÌM KIẾM ===================
  btn.addEventListener("click", async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    resultsBox.innerHTML = `<p class="text-gray-500 text-center py-2">Đang tìm kiếm...</p>`;
    resultsBox.classList.remove("hidden");

    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      const products = json.data || [];

      const matched = products.filter((p) =>
        p.gift_name.toLowerCase().includes(query)
      );

      if (matched.length === 0) {
        resultsBox.innerHTML = `<p class="text-center text-gray-500 py-2">Không tìm thấy sản phẩm nào 😢</p>`;
        return;
      }

      // Render kết quả
      resultsBox.innerHTML = matched
        .map(
          (p) => `
          <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition">
            <div onclick="goToProduct('${p.product_url}')" class="flex items-center gap-3 cursor-pointer flex-1">
              <img src="./assets/img/${p.gift_id}.webp" 
                  onerror="this.src='https://via.placeholder.com/60';"
                  class="w-14 h-14 object-cover rounded-lg">
              <h4 class="font-semibold text-left text-gray-800 line-clamp-2">${p.gift_name}</h4>
            </div>
            <button 
                class="addToCart bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition"
                data-id="${p.gift_id}"
                data-name="${p.gift_name}"
                data-price="${p.price}"
                data-type="General"
                data-img="./assets/img/${p.gift_id}.webp">
              💗Tặng
            </button>
          </div>
        `
        )
        .join("");

      // Gắn event cho các nút "Thêm"
      document.querySelectorAll(".addToCart").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation(); // Ngăn click lan sang div
          const item = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: Number(btn.dataset.price),
            type: btn.dataset.type,
            img: btn.dataset.img,
            quantity: 1,
          };
          addToCart(item);
        });
      });
    } catch (err) {
      resultsBox.innerHTML = `<p class="text-center text-red-500 py-2">Lỗi tải dữ liệu!</p>`;
      console.error(err);
    }
  });
});

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
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className =
      "fixed bottom-5 right-5 bg-pink-500 text-white py-3 px-5 rounded-lg shadow-lg opacity-0 transition-opacity duration-500 z-[9999]";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove("opacity-0");
  toast.classList.add("opacity-100");

  setTimeout(() => {
    toast.classList.add("opacity-0");
    toast.classList.remove("opacity-100");
  }, 2500);
}

// ====================== PRODUCT LINK ======================
function goToProduct(url) {
  window.open(url, "_blank"); // Mở Shopee trong tab mới
}
