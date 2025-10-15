document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Lấy giỏ hàng từ localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-container");

  if (!cartContainer) {
    console.error("❌ Không tìm thấy #cart-container trong DOM");
    return;
  }

  // 🔹 Tạo object tham chiếu
  let cartItems = cart.reduce((acc, item, index) => {
    acc[`item${index + 1}`] = item;
    return acc;
  }, {});

  // 🔹 Render danh sách sản phẩm
  function renderCart() {
    if (Object.keys(cartItems).length === 0) {
      cartContainer.innerHTML = `<p class="text-center text-gray-500 py-10">🛒 Giỏ hàng của bạn đang trống.</p>`;
      updateCartSummary();
      return;
    }

    const html = Object.entries(cartItems)
      .map(([id, item], index) => `
        <div class="p-6 flex items-center space-x-4 border-b border-gray-100">
          <div class="coffee-coaster w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="../assets/img/${item.id}.webp" class="w-full h-full object-cover" alt="${item.name}">
          </div>
          <div class="flex-1">
              <h3 class="font-semibold text-gray-900">${item.name}</h3>
              <div class="flex items-center space-x-2 mt-1">
                  <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${item.type}</span>
              </div>
          </div>
          <div class="text-right">
              <p class="font-semibold text-gray-900">${item.price.toLocaleString("vi-VN")}₫</p>
              <div class="flex items-center space-x-2 mt-2">
                  <button data-id="${id}" data-change="-1" class="btn-qty w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                      <span class="text-gray-600">−</span>
                  </button>
                  <span id="qty-${id}" class="w-8 text-center font-medium">${item.quantity}</span>
                  <button data-id="${id}" data-change="1" class="btn-qty w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                      <span class="text-gray-600">+</span>
                  </button>
              </div>
          </div>
          <div class="text-right ml-4">
              <p id="subtotal-${id}" class="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString("vi-VN")}₫</p>
              <button data-id="${id}" class="btn-remove mt-2 text-red-500 hover:text-red-700 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
              </button>
          </div>
        </div>
      `)
      .join("");

    cartContainer.innerHTML = html;
    attachEvents(); // Gắn lại sự kiện sau mỗi lần render
    updateCartSummary();
  }

  // 🔹 Gắn sự kiện + / - và xóa
  function attachEvents() {
    document.querySelectorAll(".btn-qty").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const change = parseInt(e.currentTarget.dataset.change);
        updateQuantity(id, change);
      });
    });

    document.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        removeItem(id);
      });
    });
  }

  // ✅ Cập nhật số lượng
  function updateQuantity(id, change) {
    const item = cartItems[id];
    if (!item) return;

    item.quantity = Math.max(1, item.quantity + change);
    document.getElementById(`qty-${id}`).textContent = item.quantity;

    const subtotal = item.price * item.quantity;
    document.getElementById(`subtotal-${id}`).textContent = `${subtotal.toLocaleString("vi-VN")}₫`;

    saveCart();
  }

  // ✅ Xóa sản phẩm
  function removeItem(id) {
    delete cartItems[id];
    saveCart();
    renderCart();
  }

  // ✅ Tính lại tổng giỏ hàng
  function updateCartSummary() {
    const totalItems = Object.values(cartItems).reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = Object.values(cartItems).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = subtotal * 0.05;
    const shipping = subtotal > 0 ? 15000 : 0;
    const total = subtotal - discount + shipping;

    // Nếu HTML chưa có sẵn thì tránh lỗi
    const get = (id) => document.getElementById(id);
    if (!get("final-total")) return;

    get("total-items").textContent = totalItems;
    get("items-subtotal").textContent = `${subtotal.toLocaleString("vi-VN")}₫`;
    get("items-discount").textContent = `-${discount.toLocaleString("vi-VN")}₫`;
    get("final-total").textContent = `${total.toLocaleString("vi-VN")}₫`;
  }

  // ✅ Lưu lại LocalStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(Object.values(cartItems)));
    updateCartSummary();
  }

  // 🔹 Khởi tạo
  renderCart();
});
