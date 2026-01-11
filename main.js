// main.js
let currentService = 'Views';
let currentQuantity = 100;
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459513490082365494/6sANPpkT-VjNS9vajuGsGiyLyQfa68X-g0TVtY5IFFRUbqB0hcZTu6Zez5IFR9GqU0Ve";
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 phút

document.addEventListener('DOMContentLoaded', function() {
    initTypingEffect();
    checkCooldown();
    initLiveStats(); // Khởi tạo các con số thống kê ảo
});

// Hàm tạo số ảo nhảy liên tục cho sinh động
function initLiveStats() {
    const todayElement = document.getElementById('today-order-count');
    const totalElement = document.getElementById('live-order-count');
    const onlineElement = document.getElementById('online-users');

    // Thiết lập giá trị ban đầu lớn như bạn muốn
    let todayOrders = 1240;
    let totalOrders = 45892;
    
    if(todayElement) todayElement.innerText = todayOrders.toLocaleString();
    if(totalElement) totalElement.innerText = totalOrders.toLocaleString();

    // Cập nhật người dùng online và đơn hàng ảo mỗi vài giây
    setInterval(() => {
        // Người dùng online nhảy từ 15-30
        const online = Math.floor(Math.random() * 15) + 15;
        if(onlineElement) onlineElement.innerText = online;

        // Thỉnh thoảng tăng số đơn hàng lên cho giống thật
        if(Math.random() > 0.7) {
            todayOrders++;
            totalOrders++;
            if(todayElement) todayElement.innerText = todayOrders.toLocaleString();
            if(totalElement) totalElement.innerText = totalOrders.toLocaleString();
        }
    }, 3000);
}

function openServiceModal(serviceName, quantity) {
    currentService = serviceName;
    currentQuantity = quantity;
    
    document.getElementById('modal-service-name').innerText = serviceName;
    document.getElementById('summary-service').innerText = 'TikTok ' + serviceName;
    document.getElementById('summary-quantity').innerText = quantity + " (Miễn phí)";
    
    const modal = document.getElementById('tiktokModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

async function submitToDiscord() {
    const linkInput = document.getElementById('tiktok-link');
    const btnSubmit = document.getElementById('btnSubmit');
    const link = linkInput.value.trim();
    
    if (!link) {
        Swal.fire({ title: 'Lỗi', text: 'Vui lòng nhập đường link TikTok!', icon: 'error', position: 'top' });
        return;
    }
    
    document.getElementById('loadingOverlay').classList.add('active');

    const payload = {
        content: "🚀 **ĐƠN HÀNG MỚI TỪ VIRAL TIKTOK**",
        embeds: [{
            title: "Thông tin chi tiết",
            color: 16711760,
            fields: [
                { name: "Dịch vụ", value: currentService, inline: true },
                { name: "Số lượng", value: currentQuantity.toString(), inline: true },
                { name: "Liên kết", value: link }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const expiryTime = Date.now() + COOLDOWN_TIME;
            localStorage.setItem('tiktok_cooldown', expiryTime);
            
            Swal.fire({
                icon: 'success',
                title: 'Gửi thành công!',
                text: `Yêu cầu đã gửi tới hệ thống. Vui lòng đợi 5 phút để tiếp tục.`,
                confirmButtonColor: '#FF0050',
                position: 'top'
            });

            linkInput.value = '';
            closeModal('tiktokModal');
            startCooldownTimer(expiryTime);
        }
    } catch (error) {
        Swal.fire({ title: 'Lỗi', text: 'Không thể kết nối máy chủ!', icon: 'error', position: 'top' });
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

function checkCooldown() {
    const expiryTime = localStorage.getItem('tiktok_cooldown');
    if (expiryTime && Date.now() < expiryTime) {
        startCooldownTimer(parseInt(expiryTime));
    }
}

function startCooldownTimer(expiryTime) {
    const btnSubmit = document.getElementById('btnSubmit');
    
    const updateTimer = () => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fas fa-paper-plane"></i> GỬI ĐẾN TIKTOK`;
            localStorage.removeItem('tiktok_cooldown');
            return;
        }

        btnSubmit.disabled = true;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        btnSubmit.innerText = `Thử lại sau ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        setTimeout(updateTimer, 1000);
    };

    updateTimer();
}

function initTypingEffect() {
    const textElement = document.querySelector('.typing-text');
    const words = ['Views', 'Hearts', 'Followers', 'Shares'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        if(!textElement) return;
        const currentWord = words[wordIndex];
        textElement.textContent = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

        let speed = isDeleting ? 100 : 200;
        if (!isDeleting && charIndex === currentWord.length) { speed = 2000; isDeleting = true; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; speed = 500; }
        setTimeout(type, speed);
    }
    type();
}

function showStatusModal(e) { e.preventDefault(); Swal.fire({title: 'Trạng thái', text: 'Hệ thống ổn định ✅', position: 'top'}); }
function showTermsModal(e) { e.preventDefault(); Swal.fire({title: 'Điều khoản', text: 'Sử dụng miễn phí, cooldown 5 phút để tránh spam.', position: 'top'}); }