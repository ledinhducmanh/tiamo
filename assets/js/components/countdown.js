// Countdown timer for flash sale
function updateCountdown() {
    const now = new Date().getTime();
    const endTime = now + (2 * 60 * 60 * 1000) + (45 * 60 * 1000) + (30 * 1000); // 2h 45m 30s from now
    
    setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').innerHTML = 
            String(hours).padStart(2, '0') + ':' + 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
        
        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "Đã kết thúc";
        }
    }, 1000);
}
// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize countdown
updateCountdown();