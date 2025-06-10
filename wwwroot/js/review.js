// review.js - Chat Integration for Tutor Profile

class TutorReviewChat {
    constructor() {
        this.currentUser = null;
        this.tutorData = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            // Lấy thông tin user hiện tại
            await this.getCurrentUser();

            // Lấy thông tin gia sư từ URL hoặc trang
            await this.getTutorInfo();

            // Bind events
            this.bindEvents();

            this.isInitialized = true;
            console.log('TutorReviewChat initialized successfully');

        } catch (error) {
            console.error('Error initializing TutorReviewChat:', error);
        }
    }

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }

        try {
            // Decode JWT token để lấy user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.currentUser = {
                id: payload.nameid || payload.sub || payload.userId,
                name: payload.name || payload.unique_name,
                role: payload.role || 'student'
            };

            console.log('Current user:', this.currentUser);
        } catch (error) {
            throw new Error('Invalid token format');
        }
    }

    async getTutorInfo() {
        // Lấy tutorId từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const tutorId = urlParams.get('id');

        if (!tutorId) {
            throw new Error('Tutor ID not found in URL');
        }

        try {
            // Gọi API để lấy thông tin gia sư
            const response = await fetch(`http://localhost:7128/api/review/tutor/${tutorId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch tutor info');
            }

            this.tutorData = await response.json();
            console.log('Tutor data:', this.tutorData);

        } catch (error) {
            throw new Error('Error fetching tutor information');
        }
    }

    bindEvents() {
        // Bind click event cho nút "Nhắn tin"
        const messageBtn = document.getElementById('messageBtn');
        if (messageBtn) {
            messageBtn.addEventListener('click', () => this.handleChatClick());
        }

        // Bind click event cho bất kỳ element nào có class 'chat-btn'
        const chatBtns = document.querySelectorAll('.chat-btn, .message-btn, .contact-btn');
        chatBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleChatClick());
        });
    }

    async handleChatClick() {
        try {
            // Kiểm tra đăng nhập
            if (!this.currentUser) {
                this.showNotification('Vui lòng đăng nhập để nhắn tin với gia sư', 'warning');
                return;
            }

            // Kiểm tra thông tin gia sư
            if (!this.tutorData) {
                this.showNotification('Không tìm thấy thông tin gia sư', 'error');
                return;
            }

            // Kiểm tra không chat với chính mình
            if (this.currentUser.id === this.tutorData.userId) {
                this.showNotification('Không thể nhắn tin với chính mình', 'warning');
                return;
            }

            // Disable button và show loading
            this.setButtonLoading(true);

            // Kiểm tra cuộc hội thoại hiện có
            const hasExistingConversation = await this.checkExistingConversation();

            // Tạo hoặc mở cuộc hội thoại
            await this.startConversation(hasExistingConversation);

        } catch (error) {
            console.error('Error handling chat click:', error);
            this.showNotification('Có lỗi xảy ra khi mở chat. Vui lòng thử lại', 'error');
        } finally {
            this.setButtonLoading(false);
        }
    }

    async checkExistingConversation() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7128/api/message/conversations/${this.currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const conversations = await response.json();

                // Tìm cuộc hội thoại với gia sư này
                const existingConversation = conversations.find(conv =>
                    conv.partner && conv.partner.id === this.tutorData.userId
                );

                if (existingConversation) {
                    console.log('Found existing conversation:', existingConversation);
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error('Error checking existing conversation:', error);
            return false;
        }
    }

    async startConversation(hasExisting = false) {
        // Tạo URL chat với parameters
        const chatParams = new URLSearchParams({
            partnerId: this.tutorData.userId,
            partnerName: this.tutorData.name || 'Gia sư',
            partnerRole: 'tutor',
            currentUserId: this.currentUser.id,
            hasExisting: hasExisting.toString()
        });

        const chatUrl = `http://localhost:7128/chat.html?${chatParams.toString()}`;

        // Tùy chọn cách mở chat
        const openMethod = this.getChatOpenMethod();

        switch (openMethod) {
            case 'newTab':
                window.open(chatUrl, '_blank');
                break;
            case 'popup':
                this.openChatPopup(chatUrl);
                break;
            case 'redirect':
            default:
                window.location.href = chatUrl;
                break;
        }

        // Ghi log hoạt động
        this.logChatActivity();
    }

    getChatOpenMethod() {
        // Có thể cấu hình theo preference user hoặc device
        const isMobile = window.innerWidth <= 768;
        return isMobile ? 'redirect' : 'newTab';
    }

    openChatPopup(chatUrl) {
        const popup = window.open(
            chatUrl,
            'chatWindow',
            'width=800,height=600,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no'
        );

        if (!popup) {
            // Nếu popup bị chặn, fallback về new tab
            window.open(chatUrl, '_blank');
        }
    }

    setButtonLoading(isLoading) {
        const messageBtn = document.getElementById('messageBtn');
        if (!messageBtn) return;

        if (isLoading) {
            messageBtn.disabled = true;
            messageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang mở chat...';
        } else {
            messageBtn.disabled = false;
            messageBtn.innerHTML = '<i class="fas fa-comments"></i> Nhắn tin';
        }
    }

    async logChatActivity() {
        try {
            // Log activity để tracking (optional)
            const activityData = {
                action: 'start_chat',
                tutorId: this.tutorData.tutorId,
                tutorName: this.tutorData.name,
                timestamp: new Date().toISOString()
            };

            console.log('Chat activity logged:', activityData);

            // Có thể gửi lên server để tracking
            // await this.sendActivityLog(activityData);

        } catch (error) {
            console.error('Error logging chat activity:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.chat-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `chat-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInFromRight 0.3s ease;
            max-width: 400px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
}

// Quick Chat Function (có thể gọi từ bất kỳ đâu)
window.quickChatWithTutor = async function (tutorId, tutorName = 'Gia sư') {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để nhắn tin');
            return;
        }

        // Get current user
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = payload.nameid || payload.sub || payload.userId;

        // Create chat URL
        const chatParams = new URLSearchParams({
            partnerId: tutorId,
            partnerName: tutorName,
            partnerRole: 'tutor',
            currentUserId: currentUserId
        });

        const chatUrl = `http://localhost:7128/chat.html?${chatParams.toString()}`;
        window.open(chatUrl, '_blank');

    } catch (error) {
        console.error('Error in quick chat:', error);
        alert('Có lỗi xảy ra khi mở chat');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Chỉ khởi tạo trên trang tutor profile
    if (document.body.classList.contains('tutor-profile-page') ||
        window.location.pathname.includes('tutor_profile')) {

        window.tutorReviewChat = new TutorReviewChat();
    }
});

// CSS cho notifications (inject vào head)
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .chat-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
        margin-left: auto;
    }

    .notification-close:hover {
        opacity: 1;
        background: rgba(255,255,255,0.2);
    }

    @media (max-width: 768px) {
        .chat-notification {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;

document.head.appendChild(notificationStyles);