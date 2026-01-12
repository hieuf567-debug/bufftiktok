let currentService = 'Views';
let currentQuantity = 100;

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459513490082365494/6sANPpkT-VjNS9vajuGsGiyLyQfa68X-g0TVtY5IFFRUbqB0hcZTu6Zez5IFR9GqU0Ve";
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 phút

document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect();
    checkCooldown();
    initLiveStats();
});

/* ================= LIVE STATS ================= */
function initLiveStats() {
    const todayElement = document.getElementById('today-order-count');
    const totalElement = document.getElementById('live-order-count');
    const onlineElement = document.getElementById('online-users');

    let todayOrders = 1240;
    let totalOrders = 45892;

    if (todayElement) todayElement.innerText = todayOrders.toLocaleString();
    if (totalElement) totalElement.innerText = totalOrders.toLocaleString();

    setInterval(() => {
        const online = Math.floor(Math.random() * 15) + 15;
        if (onlineElement) onlineElement.innerText = online;

        if (Math.random() > 0.7) {
            todayOrders++;
            totalOrders++;
            if (todayElement) todayElement.innerText = todayOrders.toLocaleString();
            if (totalElement) totalElement.innerText = totalOrders.toLocaleString();
        }
    }, 3000);
}

/* ================= MODAL ================= */
function openServiceModal(serviceName, quantity) {
    currentService = serviceName;
    currentQuantity = quantity;

    const serviceNameEl = document.getElementById('modal-service-name');
    const summaryServiceEl = document.getElementById('summary-service');
    const summaryQuantityEl = document.getElementById('summary-quantity');
    const modal = document.getElementById('tiktokModal');

    if (!serviceNameEl || !summaryServiceEl || !summaryQuantityEl || !modal) {
        console.error('❌ Thiếu element trong modal');
        return;
    }

    serviceNameEl.innerText = serviceName;
    summaryServiceEl.innerText = 'TikTok ' + serviceName;
    summaryQuantityEl.innerText = quantity + ' (Miễn phí)';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ================= SUBMIT DISCORD ================= */
async function submitToDiscord() {
    const linkInput = document.getElementById('tiktok-link');
    const btnSubmit = document.getElementById('btnSubmit');
    const loading = document.getElementById('loadingOverlay');

    if (!linkInput || !btnSubmit || !loading) return;

    const link = linkInput.value.trim();
    if (!link) {
        Swal.fire({
            title: 'Lỗi',
            text: 'Vui lòng nhập link TikTok!',
            icon: 'error',
            position: 'top'
        });
        return;
    }

    loading.classList.add('active');

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
                text: 'Vui lòng đợi 5 phút để gửi tiếp.',
                confirmButtonColor: '#FF0050',
                position: 'top'
            });

            linkInput.value = '';
            closeModal('tiktokModal');
            startCooldownTimer(expiryTime);
        }
    } catch (err) {
        Swal.fire({
            title: 'Lỗi',
            text: 'Không thể kết nối Discord!',
            icon: 'error',
            position: 'top'
        });
    } finally {
        loading.classList.remove('active');
    }
}

/* ================= COOLDOWN ================= */
function checkCooldown() {
    const expiryTime = localStorage.getItem('tiktok_cooldown');
    if (expiryTime && Date.now() < expiryTime) {
        startCooldownTimer(parseInt(expiryTime));
    }
}

function startCooldownTimer(expiryTime) {
    const btnSubmit = document.getElementById('btnSubmit');
    if (!btnSubmit) return;

    const update = () => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fas fa-paper-plane"></i> GỬI ĐẾN TIKTOK`;
            localStorage.removeItem('tiktok_cooldown');
            return;
        }

        btnSubmit.disabled = true;
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        btnSubmit.innerText = `Thử lại sau ${m}:${s < 10 ? '0' : ''}${s}`;
        setTimeout(update, 1000);
    };

    update();
}

/* ================= TYPING EFFECT ================= */
function initTypingEffect() {
    const textElement = document.querySelector('.typing-text');
    if (!textElement) return;

    const words = ['Views', 'Tim', 'Follower', 'Favourite'];
    let wordIndex = 0, charIndex = 0, deleting = false;

    function type() {
        const word = words[wordIndex];
        textElement.textContent = deleting
            ? word.substring(0, charIndex--)
            : word.substring(0, charIndex++);

        let speed = deleting ? 80 : 150;

        if (!deleting && charIndex === word.length) {
            speed = 1500;
            deleting = true;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 400;
        }
        setTimeout(type, speed);
    }
    type();
}

/* ================= INFO MODAL ================= */
function showStatusModal(e) {
    e.preventDefault();
    Swal.fire({ title: 'Trạng thái', text: 'Hệ thống hoạt động ổn định ✅', position: 'top' });
}

function showTermsModal(e) {
    e.preventDefault();
    Swal.fire({ title: 'Điều khoản', text: 'Miễn phí – cooldown 5 phút.', position: 'top' });
}