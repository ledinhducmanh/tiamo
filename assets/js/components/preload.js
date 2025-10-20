// ADD HTML
/* <div id="preload">
    <img src="./assets/img/preload.gif" alt="Loading..." class="loading-gif">
</div> */

// Preload
const preLoadingPage = document.getElementById('preload');

window.addEventListener('load', () => {
    // 👇 Thêm delay 1000ms để chờ object hoặc hình ảnh khác
    setTimeout(() => {
    preLoadingPage.style.opacity = '0';
    preLoadingPage.style.visibility = 'hidden';

    setTimeout(() => {
        preLoadingPage.remove();
    }, 600); // khớp với CSS transition
    }, 3000); // 👈 delay 1 giây
});