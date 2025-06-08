// ===== ADMIN HOME PAGE JAVASCRIPT =====
// JavaScript đơn giản cho người mới học

// Khởi tạo khi trang web đã tải xong
document.addEventListener("DOMContentLoaded", function () {
    initializeAdminHome();
});

// Hàm khởi tạo chính
function initializeAdminHome() {
    // Gắn sự kiện cho nút refresh
    setupRefreshButton();

    // Gắn sự kiện cho notification
    setupNotificationClose();

    // Log để debug
    console.log('Admin Home đã được khởi tạo');
}

// ===== XỬ LÝ NÚT REFRESH STATUS =====
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-status');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            refreshSystemStatus();
        });
    }
}

// Hàm refresh trạng thái hệ thống
function refreshSystemStatus() {
    const refreshBtn = document.getElementById('refresh-status');

    if (!refreshBtn) return;

    // Hiển thị trạng thái loading
    showLoadingState(refreshBtn);

    // Giả lập API call (thay bằng API thực tế)
    setTimeout(function () {
        // Cập nhật trạng thái hệ thống
        updateSystemStatus();

        // Ẩn trạng thái loading
        hideLoadingState(refreshBtn);

        // Hiển thị thông báo thành công
        showNotification('Đã cập nhật trạng thái hệ thống', 'success');
    }, 2000); // 2 giây để mô phỏng API call
}

// Hiển thị trạng thái loading cho button
function showLoadingState(button) {
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner"></i> Đang cập nhật...';
}

// Ẩn trạng thái loading cho button
function hideLoadingState(button) {
    button.classList.remove('loading');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-sync-alt"></i> Làm mới trạng thái';
}

// ===== CẬP NHẬT TRẠNG THÁI HỆ THỐNG =====
function updateSystemStatus() {
    // Danh sách các status elements
    const statusElements = {
        'db-status': { icon: 'fas fa-circle', text: 'Hoạt động', class: 'online' },
        'email-status': { icon: 'fas fa-circle', text: 'Hoạt động', class: 'online' },
        'security-status': { icon: 'fas fa-circle', text: 'An toàn', class: 'online' },
        'storage-status': { icon: 'fas fa-circle', text: getRandomStorageStatus(), class: getStorageStatusClass() }
    };

    // Cập nhật từng status
    for (const [elementId, statusInfo] of Object.entries(statusElements)) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = `status ${statusInfo.class}`;
            element.innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.text}`;
        }
    }

    // Cập nhật status chính trong stats overview
    updateMainSystemStatus();
}

// Tạo random storage status để mô phỏng
function getRandomStorageStatus() {
    const usage = Math.floor(Math.random() * 30) + 50; // 50-80%
    return `${usage}% đã sử dụng`;
}

// Lấy class cho storage status
function getStorageStatusClass() {
    const usage = Math.floor(Math.random() * 30) + 50; // 50-80%
    return usage > 75 ? 'warning' : 'online';
}

// Cập nhật status chính trong phần stats overview
function updateMainSystemStatus() {
    const mainStatusElement = document.querySelector('.stat-status.online');
    if (mainStatusElement) {
        mainStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Hoạt động';
    }
}

// ===== XỬ LÝ NOTIFICATION =====
function setupNotificationClose() {
    const closeBtn = document.querySelector('.notification-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            hideNotification();
        });
    }
}

// Hiển thị notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon');

    if (!notification || !messageElement || !iconElement) return;

    // Cập nhật nội dung
    messageElement.textContent = message;

    // Cập nhật icon và class dựa trên type
    const notificationConfig = getNotificationConfig(type);
    iconElement.className = `notification-icon ${notificationConfig.icon}`;
    notification.className = `notification ${type}`;

    // Hiển thị notification
    notification.classList.remove('hidden');

    // Thêm class show để animation
    setTimeout(function () {
        notification.classList.add('show');
    }, 100);

    // Tự động ẩn sau 4 giây
    setTimeout(function () {
        hideNotification();
    }, 4000);
}

// Ẩn notification
function hideNotification() {
    const notification = document.getElementById('notification');

    if (notification) {
        notification.classList.remove('show');

        // Ẩn hoàn toàn sau animation
        setTimeout(function () {
            notification.classList.add('hidden');
        }, 300);
    }
}

// Lấy config cho notification
function getNotificationConfig(type) {
    const configs = {
        success: { icon: 'fas fa-check-circle' },
        warning: { icon: 'fas fa-exclamation-triangle' },
        error: { icon: 'fas fa-exclamation-circle' },
        info: { icon: 'fas fa-info-circle' }
    };

    return configs[type] || configs.info;
}

// ===== UTILITY FUNCTIONS =====

// Format số cho hiển thị (nếu cần)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Kiểm tra thiết bị mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// ===== EVENT LISTENERS KHÁC =====

// Xử lý hover effects cho action cards (optional)
function setupHoverEffects() {
    const actionCards = document.querySelectorAll('.action-card');

    actionCards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            // Thêm hiệu ứng hover nếu cần
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function () {
            // Reset hiệu ứng hover
            this.style.transform = 'translateY(0)';
        });
    });
}

// ===== API FUNCTIONS (MẪU) =====
// Các hàm này có thể được thay thế bằng API thực tế

// Lấy dữ liệu thống kê từ server
async function fetchDashboardStats() {
    try {
        // Thay thế bằng API call thực tế
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();

        // Dữ liệu mẫu
        const mockData = {
            users: 1245,
            courses: 78,
            reviews: 324,
            systemStatus: 'online'
        };

        return mockData;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
        showNotification('Không thể lấy dữ liệu thống kê', 'error');
        return null;
    }
}

// Lấy trạng thái hệ thống từ server
async function fetchSystemStatus() {
    try {
        // Thay thế bằng API call thực tế
        // const response = await fetch('/api/admin/system-status');
        // const data = await response.json();

        // Dữ liệu mẫu
        const mockData = {
            database: 'online',
            email: 'online',
            security: 'online',
            storage: Math.random() > 0.3 ? 'online' : 'warning'
        };

        return mockData;
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái hệ thống:', error);
        showNotification('Không thể lấy trạng thái hệ thống', 'error');
        return null;
    }
}

// ===== XUẤT CÁC FUNCTION ĐỂ SỬ DỤNG NGOÀI =====
// Tạo object global để các file khác có thể sử dụng
window.AdminHome = {
    showNotification: showNotification,
    hideNotification: hideNotification,
    refreshSystemStatus: refreshSystemStatus,
    updateSystemStatus: updateSystemStatus
};

// ===== DEBUG HELPERS =====
// Các hàm hỗ trợ debug cho developer

function debugLog(message, data = null) {
    if (console && console.log) {
        console.log(`[Admin Home] ${message}`, data || '');
    }
}

// Test notification (có thể gọi từ console)
function testNotification() {
    showNotification('Đây là thông báo test', 'success');
}

// Test refresh system (có thể gọi từ console)
function testRefresh() {
    refreshSystemStatus();
}

// Export test functions cho console
window.AdminHomeDebug = {
    testNotification: testNotification,
    testRefresh: testRefresh,
    debugLog: debugLog
};