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
            <img class="rounded-2xl overflow-hidden" src="./assets/img/${item.gift_id}.webp" alt="${item.gift_name}">
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
