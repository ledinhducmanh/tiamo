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
              <p id="subtotal-${id}" class="font-bold text-gray-900">${(
                item.price * item.quantity
              ).toLocaleString("vi-VN")}₫</p>
              <button data-id="${id}" class="btn-remove mt-2 text-red-500 hover:text-red-700 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
    const discount = subtotal * 0.05;
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
  const discount = subtotal * 0.05;
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
  qrCode.innerHTML = `<img src='https://qr.sepay.vn/img?acc=0862958110&bank=MBBANK&amount=${order.total_price}&des=${customer.customer_id}'/>`
  // Đóng modal
  closeModalBtn.addEventListener('click', function() {
      paymentModal.classList.add('hidden');
      paymentModal.classList.remove('flex');
  });

  // Đóng modal khi click vào backdrop
  paymentModal.addEventListener('click', function(e) {
      if (e.target === paymentModal) {
          paymentModal.classList.add('hidden');
          paymentModal.classList.remove('flex');
      }
  });

  // Xử lý nút lưu QR Code
  saveQrBtn.addEventListener('click', function() {
      const svg = document.querySelector('#paymentModal img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      canvas.width = 180;
      canvas.height = 180;
      
      img.onload = function() {
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = 'qr-thanh-toan.png';
          link.href = canvas.toDataURL();
          link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
  });

  // Xử lý nút chia sẻ
  shareQrBtn.addEventListener('click', function() {
      if (navigator.share) {
          navigator.share({
              title: 'QR Code Thanh Toán',
              text: 'Quét mã QR để thanh toán đơn hàng',
              url: window.location.href
          });
      } else {
          const url = window.location.href;
          navigator.clipboard.writeText(url).then(() => {
              const originalText = shareQrBtn.innerHTML;
              shareQrBtn.innerHTML = '✅ Đã sao chép link!';
              shareQrBtn.classList.add('bg-green-50', 'text-green-600', 'border-green-200');
              shareQrBtn.classList.remove('bg-pink-50', 'text-pink-600', 'border-pink-200');
              
              setTimeout(() => {
                  shareQrBtn.innerHTML = originalText;
                  shareQrBtn.classList.remove('bg-green-50', 'text-green-600', 'border-green-200');
                  shareQrBtn.classList.add('bg-pink-50', 'text-pink-600', 'border-pink-200');
              }, 2000);
          });
      }
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

