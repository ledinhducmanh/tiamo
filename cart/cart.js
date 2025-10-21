document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Lấy giỏ hàng từ localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-container");

    console.log(cart)

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
      .map(
        ([id, item], index) => `
        <div class="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:space-x-4 border-b border-gray-100">
        <!-- Ảnh sản phẩm -->
        <div class="coffee-coaster w-full md:w-24 h-48 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src="../assets/img/${item.id}.webp" class="w-full h-full object-cover" alt="${item.name}">
        </div>

        <!-- Nội dung sản phẩm -->
        <div class="flex-1 mt-3 md:mt-0">
          <h3 class="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">${item.name}</h3>
          <div class="flex items-center space-x-2 mt-1">
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${item.type}</span>
          </div>
        </div>

        <!-- Giá, số lượng, tổng tiền, nút xóa -->
        <div class="mt-3 md:mt-0 flex md:flex-nowrap items-center gap-3 md:gap-6">
          <!-- Giá -->
          <p class="font-semibold text-gray-900 whitespace-nowrap">${item.price.toLocaleString("vi-VN")}₫</p>

          <!-- Số lượng -->
          <div class="flex items-center">
            <button data-id="${id}" data-change="-1"
              class="btn-qty w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <span class="text-gray-600">−</span>
            </button>
            <span id="qty-${id}" class="w-8 text-center font-medium">${item.quantity}</span>
            <button data-id="${id}" data-change="1"
              class="btn-qty w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <span class="text-gray-600">+</span>
            </button>
          </div>

          <!-- Tổng tiền -->
          <p id="subtotal-${id}" class="font-bold text-gray-900 whitespace-nowrap">
            ${(item.price * item.quantity).toLocaleString("vi-VN")}₫
          </p>

          <!-- Nút xóa -->
          <button data-id="${id}" class="btn-remove text-red-500 hover:text-red-700 transition-colors flex items-center justify-start">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>


      `
      )
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
    const discount = subtotal * 0.02;
    const shipping = subtotal > 0 ? (subtotal < 500000 ? 50000 : 100000) : 0;
    const feeElement = document.getElementById("fee")
    feeElement.innerText = `${shipping.toLocaleString("vi-VN")}₫`;
    
    const total = subtotal - discount + shipping;

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

// ✅ Xử lý đặt hàng
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  const form = document.getElementById("addressForm");
  if (!form) {
    alert("❌ Không tìm thấy form thông tin giao hàng.");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("🛒 Giỏ hàng của bạn đang trống. Hãy thêm ít nhất một món quà trước khi thanh toán!");
    return;
  }

  // ✅ Lấy dữ liệu form
  const fullName = document.getElementById("fullName").value.trim();
  const gender = document.getElementById("gender").value;
  const address1 = document.getElementById("address1").value.trim();
  const city = document.getElementById("city").value;
  const country = document.getElementById("country").value;
  const phone = document.getElementById("phone").value.trim();

  if (!fullName || !gender || !address1 || !city || !country || !phone) {
    alert("⚠️ Vui lòng nhập đầy đủ các thông tin bắt buộc!");
    return;
  }

  // ✅ Tính tổng tiền (đã fix)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.02;
  const shipping = subtotal > 0 ? (subtotal < 500000 ? 50000 : 100000) : 0;
  
  const total_price = subtotal - discount + shipping;
  

  // ✅ Tạo object khách hàng
  const customer = {
    customer_id: `CUST${Date.now()}`,
    full_name: fullName,
    gender,
    phone,
    address: [address1, document.getElementById("address2").value.trim(), city, country].filter(Boolean).join(", "),
    wish: document.getElementById("message").value.trim(),
  };

  // ✅ Tạo đơn hàng hoàn chỉnh
  const order = {
    ...customer,
    subtotal,
    discount,
    shipping,
    total_price,
    purchase_history: JSON.stringify(cart),
    date_created: new Date().toLocaleString("vi-VN"),
  };
 // Payment
const paymentModal = document.getElementById('paymentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveQrBtn = document.getElementById('saveQrBtn');
const shareQrBtn = document.getElementById('shareQrBtn');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
const qrCode = document.getElementById("qr-code");
const qrCodePrice = document.getElementById("qr-code-price");

// Mở modal thanh toán
qrCodePrice.innerText = `${order.total_price.toLocaleString("vi-VN")}₫`;
paymentModal.classList.remove('hidden');
paymentModal.classList.add('flex');
const qrImgSrc = `https://qr.sepay.vn/img?acc=0862958110&bank=MBBANK&amount=${order.total_price}&des=${customer.customer_id}`;
qrCode.innerHTML = `<img id="qrImage" src="${qrImgSrc}" alt="QR Code" />`;
document.body.style.overflow = 'hidden';

// Đóng modal
function closePaymentModal() {
  paymentModal.classList.add('hidden');
  paymentModal.classList.remove('flex');
  document.body.style.overflow = '';
}
closeModalBtn.addEventListener('click', closePaymentModal);
paymentModal.addEventListener('click', (e) => {
  if (e.target === paymentModal) closePaymentModal();
});

// =========================
// 🔹 Lưu QR Code (ảnh <img>)
// =========================
saveQrBtn.addEventListener('click', async function() {
  const qrImg = document.getElementById('qrImage');
  const imgURL = qrImg.src;

  try {
    const response = await fetch(imgURL);
    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobURL;
    link.download = 'qr-thanh-toan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobURL);
  } catch (error) {
    console.error('Lỗi khi tải ảnh QR:', error);
    alert('❌ Không thể lưu ảnh QR. Vui lòng thử lại.');
  }
  document.body.style.overflow = 'hidden';

});

// =========================
// 🔹 Chia sẻ QR Code
// =========================
shareQrBtn.addEventListener('click', async function() {
  const qrImg = document.getElementById('qrImage');
  const imgURL = qrImg.src;

  try {
    const response = await fetch(imgURL);
    const blob = await response.blob();

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'qr-thanh-toan.png', { type: blob.type })] })) {
      await navigator.share({
        title: 'QR Code Thanh Toán',
        text: 'Quét mã QR để thanh toán đơn hàng của bạn.',
        files: [new File([blob], 'qr-thanh-toan.png', { type: blob.type })]
      });
    } else {
      // fallback nếu trình duyệt không hỗ trợ chia sẻ file
      await navigator.clipboard.writeText(imgURL);
      const originalText = shareQrBtn.innerHTML;
      shareQrBtn.innerHTML = '✅ Đã sao chép link QR!';
      shareQrBtn.classList.add('bg-green-50', 'text-green-600', 'border-green-200');
      shareQrBtn.classList.remove('bg-pink-50', 'text-pink-600', 'border-pink-200');
      setTimeout(() => {
        shareQrBtn.innerHTML = originalText;
        shareQrBtn.classList.remove('bg-green-50', 'text-green-600', 'border-green-200');
        shareQrBtn.classList.add('bg-pink-50', 'text-pink-600', 'border-pink-200');
      }, 2000);
    }
  } catch (error) {
    console.error('Lỗi khi chia sẻ ảnh QR:', error);
    alert('❌ Không thể chia sẻ ảnh QR.');
  }
  document.body.style.overflow = 'hidden';

});


  // Xử lý xác nhận thanh toán
  confirmPaymentBtn.addEventListener('click', function() {
      const originalText = confirmPaymentBtn.innerHTML;
      confirmPaymentBtn.innerHTML = '⏳ Đang xử lý...';
      confirmPaymentBtn.disabled = true;
      
      setTimeout(() => {
          confirmPaymentBtn.innerHTML = '✅ Thanh toán thành công!';
          confirmPaymentBtn.classList.remove('pink-gradient');
          confirmPaymentBtn.classList.add('bg-green-500');
          
          setTimeout(() => {
              paymentModal.classList.add('hidden');
              paymentModal.classList.remove('flex');
              confirmPaymentBtn.innerHTML = originalText;
              confirmPaymentBtn.classList.add('pink-gradient');
              confirmPaymentBtn.classList.remove('bg-green-500');
              confirmPaymentBtn.disabled = false;
          }, 2000);
      }, 1500);
      document.body.style.overflow = 'hidden';

  });
  // ✅ Gửi dữ liệu đến Google Sheet
  fetch("https://script.google.com/macros/s/AKfycbzlnw9uEsqWhaJitRhnSY08NiqHa-aEOYSY3s5ewI0V9E5jSNG-GT0p15H0ErKVzewD/exec", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(order),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.text())
    .then(() => {
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.removeItem("cart");

      alert("🎉 Đặt hàng thành công! Cảm ơn bạn đã chọn Tiamo 💝");
      console.log("✅ Order sent:", order);
    })
    .catch((err) => {
      console.error("❌ Lỗi khi gửi dữ liệu:", err);
      alert("⚠️ Gửi dữ liệu thất bại, vui lòng thử lại sau!");
    });
});

async function loadFlashSaleProducts() {
  const container = document.getElementById("flash-sale-products");
  try {
    const res = await fetch(
      "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgQV0z6MIfQCmjh_bugs5dhBSUhHirWIccSL7wbLpZUmqVmQ8kxeLymdnMEv1wbnW76eGUdEGWGdMPKYco5v8y0eB7Ym6S9Sz5QgxC04zAG0ylpQK7Xxp7G-DDcqu0awKwkEc6rjZ-wUir6DFkchix-1DrGvclP8LeXppFKjTlcL94QqwgKjx7w7QbKuFlKc6V0ylWIvAtrF0iPgh_dgxSA_4RYnLEm8BEqtpxdZNeXki4x4GVcv52FZPRdjrVH68xE_PGHBm8ZeIX7nhQlQorXROagGw&lib=M9RGpGYbJj7gakkO831gGC_26MWEnK4vG"
    );
    const data = await res.json();

    const products = data.data;
    container.innerHTML = ""; // Xóa loading

    // Render từng sản phẩm
    products.forEach((item) => {
      const discount = Math.round((1 - item.new_price / item.price) * 100);

      const card = document.createElement("div");
      card.className =
        "product-card rounded-2xl p-6 card-hover bg-white shadow-md hover:shadow-lg transition";
      card.innerHTML = `
        <div class="relative mb-4">
          <div class="w-full bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center text-6xl">
            <img class="rounded-2xl overflow-hidden" src="../assets/img/${item.gift_id}.webp" alt="${item.gift_name}">
          </div>
          <span class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">-${discount}%</span>
        </div>
        <h4 class="font-semibold text-gray-800 mb-2 line-clamp-2">${item.gift_name}</h4>
        <div class="flex items-center space-x-2 mb-4">
          <span class="text-pink-500 font-bold text-lg">${item.new_price.toLocaleString()}₫</span>
          <span class="text-gray-400 line-through">${item.price.toLocaleString()}₫</span>
        </div>
        <div class="flex space-x-2">
          <a href="${item.product_url}" target="_blank" 
             class="flex-1 bg-pink-100 text-pink-600 py-2 rounded-lg hover:bg-pink-200 transition-colors text-center">
             🛒 Mua ngay
          </a>
          <button class="flex-1 btn-primary bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition">
            💝 Tặng ngay
          </button>
        </div>
      `;

      // Gắn sự kiện cho nút "Tặng ngay"
      const giftButton = card.querySelector("button");
      giftButton.addEventListener("click", () => {
        addToCart({
          id: item.gift_id,
          name: item.gift_name,
          price: item.new_price,
          img: `./assets/img/${item.gift_id}.webp`,
          quantity: 1,
          type: item.type || "General",
        });
      });

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML =
      '<p class="col-span-full text-center text-red-500">Không thể tải dữ liệu 😢</p>';
    console.error("Error fetching products:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadFlashSaleProducts);

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
