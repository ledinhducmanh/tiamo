document.addEventListener("DOMContentLoaded", () => {
  const snowContainer = document.createElement("div");
  snowContainer.classList.add("snow-container");
  document.body.appendChild(snowContainer);

  // 👉 Lấy emoji từ thuộc tính data-snow, nếu không có thì mặc định là ❄️
  const emoji = document.body.dataset.snow || "❄️";

  for (let i = 0; i < 20; i++) {
    const snowflake = document.createElement("div");
    snowflake.classList.add("snowflake");
    snowflake.style.left = Math.random() * 100 + "vw";
    snowflake.style.animationDuration = 5 + Math.random() * 10 + "s";
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = 10 + Math.random() * 20 + "px";
    snowflake.textContent = emoji; // ✨ dùng emoji tương ứng
    snowContainer.appendChild(snowflake);
  }
});
