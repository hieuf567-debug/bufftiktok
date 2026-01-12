let currentService = 'Views';
let currentQuantity = 100;

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459513490082365494/6sANPpkT-VjNS9vajuGsGiyLyQfa68X-g0TVtY5IFFRUbqB0hcZTu6Zez5IFR9GqU0Ve";
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 phút

document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect();
    initLiveStats();
});

/* ================= ANTI ABUSE CORE ================= */
function fingerprint() {
    return btoa(
        navigator.userAgent +
        navigator.language +
        screen.width +
        screen.height +
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );
}

function setCookie(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))?.split('=')[1];
}

function getCooldownKey(link) {
    return 'cd_' + btoa(link) + '_' + fingerprint();
}

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
            todayElement.innerText = todayOrders.toLocaleString();
            totalElement.innerText = totalOrders.toLocaleString();
        }
    }, 3000);
}

/* ================= MODAL ================= */
function openServiceModal(serviceName, quantity) {
    currentService = serviceName;
    currentQuantity = quantity;

    document.getElementById('modal-service-name').innerText = serviceName;
    document.getElementById('summary-service').innerText = 'TikTok ' + serviceName;
    document.getElementById('summary-quantity').innerText = quantity + ' (Miễn phí)';

    document.getElementById('tiktokModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

/* ================= SUBMIT DISCORD (ANTI LẠM DỤNG) ================= */
async function submitToDiscord() {
    const linkInput = document.getElementById('tiktok-link');
    const loading = document.getElementById('loadingOverlay');
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

    const key = getCooldownKey(link);
    const now = Date.now();

    const lsTime = localStorage.getItem(key);
    const ckTime = getCookie(key);
    const expiryTime = Math.max(lsTime || 0, ckTime || 0);

    if (expiryTime && now < expiryTime) {
        const remain = expiryTime - now;
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);

        Swal.fire({
            icon: 'warning',
            title: 'Bị giới hạn!',
            text: `Link này đang cooldown ${m}:${s < 10 ? '0' : ''}${s}`,
            position: 'top'
        });
        return;
    }

    loading.classList.add('active');

    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
            })
        });

        const expireAt = now + COOLDOWN_TIME;
        localStorage.setItem(key, expireAt);
        setCookie(key, expireAt, 5);

        Swal.fire({
            icon: 'success',
            title: 'Gửi thành công!',
            text: 'Link này đã bị khoá 5 phút trên thiết bị.',
            confirmButtonColor: '#FF0050',
            position: 'top'
        });

        linkInput.value = '';
        closeModal('tiktokModal');

    } catch {
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

/* ================= INFO ================= */
function showStatusModal(e) {
    e.preventDefault();
    Swal.fire({ title: 'Trạng thái', text: 'Hệ thống hoạt động ổn định ✅', position: 'top' });
}

function showTermsModal(e) {
    e.preventDefault();
    Swal.fire({ title: 'Điều khoản', text: 'Mỗi link / thiết bị cooldown 5 phút.', position: 'top' });
}