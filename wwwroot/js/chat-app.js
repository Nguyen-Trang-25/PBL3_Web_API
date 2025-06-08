// ===== CHAT APPLICATION JAVASCRIPT - UPDATED VERSION =====
// File: js/chat-app.js

class ChatApplication {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.currentUser = {
            id: localStorage.getItem('userId'),
            name: 'Tôi',
            avatar: 'ME',
            initials: 'ME',
            role: localStorage.getItem('role') // Mặc định, sẽ được cập nhật từ session/localStorage
        };

        console.log(this.currentUser)

        // Elements
        this.elements = {
            conversationsList: document.getElementById('conversationsList'),
            messagesContainer: document.getElementById('messagesContainer'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            searchInput: document.getElementById('searchInput'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            chatSidebar: document.getElementById('chatSidebar'),
            emptyChat: document.getElementById('emptyChat'),
            participantAvatar: document.getElementById('participantAvatar'),
            participantName: document.getElementById('participantName'),
            participantStatus: document.getElementById('participantStatus'),
            backHomeBtn: document.querySelector('.back-home-btn')
        };

        this.init();
    }

    init() {
        if (!this.elements.conversationsList) {
            console.warn('Chat elements not found. Make sure you are on the chat page.');
            return;
        }

        this.bindEvents();
        this.setupMobileMenu();
        this.autoResizeTextarea();
        this.detectUserRole();
        this.setupHomeButton();
        this.loadConversations();
        //this.loadSampleData();

        console.log('Chat Application initialized successfully');
    }

    // ===== PHÁT HIỆN VAI TRÒ NGƯỜI DÙNG =====
    detectUserRole() {
        // Thử lấy từ localStorage hoặc sessionStorage
        const userRole = localStorage.getItem('role') || sessionStorage.getItem('role');

        if (userRole) {
            this.currentUser.role = userRole;
        } else {
            // Nếu không có trong storage, thử phát hiện từ URL hoặc class của body
            const bodyClasses = document.body.className;

            if (bodyClasses.includes('tutor')) {
                this.currentUser.role = 'tutor';
            } else if (bodyClasses.includes('student')) {
                this.currentUser.role = 'student';
            } else if (bodyClasses.includes('parent')) {
                this.currentUser.role = 'parent';
            } else {
                // Mặc định là tutor nếu không xác định được
                this.currentUser.role = 'tutor';
            }
        }

        console.log('Detected user role:', this.currentUser.role);
    }

    // ===== THIẾT LẬP NÚT TRANG CHỦ =====
    setupHomeButton() {
        if (!this.elements.backHomeBtn) return;

        let homeUrl = 'home.html';

        switch (this.currentUser.role) {
            case 'tutor':
                homeUrl = 'home_tutor.html';
                break;
            case 'student':
                homeUrl = 'home_student.html';
                break;
            default:
                homeUrl = 'index.html';
        }

        this.elements.backHomeBtn.href = homeUrl;
        console.log('Home button URL set to:', homeUrl);
    }

    // ===== TÌM CUỘC TRÒ CHUYỆN GẦN NHẤT =====
    findMostRecentConversation() {
        if (this.conversations.length === 0) return null;

        // Sắp xếp theo thời gian của tin nhắn cuối cùng (mới nhất)
        return this.conversations.reduce((mostRecent, current) => {
            const currentLastMessageTime = this.getLastMessageTimestamp(current);
            const mostRecentLastMessageTime = this.getLastMessageTimestamp(mostRecent);

            return currentLastMessageTime > mostRecentLastMessageTime ? current : mostRecent;
        });
    }

    // ===== LẤY TIMESTAMP CỦA TIN NHẮN CUỐI =====
    getLastMessageTimestamp(conversation) {
        if (!conversation.messages || conversation.messages.length === 0) {
            return 0; // Nếu không có tin nhắn, trả về 0
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return lastMessage.timestamp ? lastMessage.timestamp.getTime() : 0;
    }

    // ===== TỰ ĐỘNG CHỌN CUỘC TRÒ CHUYỆN GẦN NHẤT =====
    autoSelectRecentConversation() {
        const recentConversation = this.findMostRecentConversation();

        if (recentConversation) {
            console.log('Auto-selecting most recent conversation:', recentConversation.participant.name);
            this.selectConversation(recentConversation.id);
        } else {
            console.log('No conversations found to auto-select');
        }
    }

    bindEvents() {
        // Send message events
        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (this.elements.messageInput) {
            this.elements.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Search functionality
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }

        // Mobile sidebar toggle
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Attachment buttons
        const attachmentBtns = document.querySelectorAll('.attachment-btn');
        attachmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleAttachment(btn);
            });
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleAction(btn);
            });
        });
    }

    setupMobileMenu() {
        // Close sidebar when window is resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
    }

    autoResizeTextarea() {
        if (!this.elements.messageInput) return;

        this.elements.messageInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    // Get initials from name for avatar display
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Create avatar element with fallback to initials
    createAvatarElement(participant, size = '5rem') {
        const initials = this.getInitials(participant.name);

        return `
            <div class="conversation-avatar" style="width: ${size}; height: ${size}; min-width: ${size};">
                ${initials}
            </div>
        `;
    }

    async loadConversations() {
        try {
            console.log("đang tải chat")
            const response = await fetch(`/api/message/conversations/${this.currentUser.id}`);
            const data = await response.json();
            //console.log(data)

            this.conversations = data.map(item => ({
                id: `conv_${item.partner.id}`,
                participant: {
                    id: item.partner.id,
                    name: item.partner.name,
                    initials: this.getInitials(item.partner.name),
                    status: item.partner.status,
                    role: item.partner.role,
                    lastSeen: item.partner.lastSeen
                },
                lastMessage: item.lastMessage,
                lastTime: this.formatRelativeTime(item.lastTime),
                unreadCount: item.unreadCount,
                messages: [] // chưa tải chi tiết lịch sử
            }));
            console.log(this.conversations)

            this.renderConversations();
            setTimeout(() => this.autoSelectRecentConversation(), 100);

        } catch (error) {
            console.error('Lỗi khi tải danh sách cuộc trò chuyện:', error);
        }
    }

    renderConversations() {
        if (!this.elements.conversationsList) return;

        this.elements.conversationsList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const conversationEl = this.createConversationElement(conversation);
            this.elements.conversationsList.appendChild(conversationEl);
        });
    }

    createConversationElement(conversation) {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.conversationId = conversation.id;

        const onlineIndicator = conversation.participant.status === 'online'
            ? '<div class="online-status"></div>'
            : '';

        const unreadBadge = conversation.unreadCount > 0
            ? `<div class="unread-count">${conversation.unreadCount}</div>`
            : '';

        const avatarHtml = this.createAvatarElement(conversation.participant);

        div.innerHTML = `
            ${avatarHtml}
            <div class="conversation-info">
                <div class="conversation-name">
                    ${conversation.participant.name}
                    ${onlineIndicator}
                </div>
                <div class="conversation-preview">${conversation.lastMessage}</div>
            </div>
        `;

        div.addEventListener('click', () => {
            this.selectConversation(conversation.id);
            if (window.innerWidth <= 768) {
                this.closeMobileSidebar();
            }
        });

        return div;
    }

    async selectConversation(conversationId) {
        try {
            // Remove active class from all conversations
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to selected conversation
            const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
            }

            // Find and set current conversation
            this.currentConversation = this.conversations.find(conv => conv.id === conversationId);
            if (!this.currentConversation) {
                console.warn('Không tìm thấy cuộc trò chuyện với id:', conversationId);
                return;
            }

            // Nếu chưa có messages hoặc rỗng thì tải lịch sử tin nhắn
            if (!this.currentConversation.messages || this.currentConversation.messages.length === 0) {
                try {
                    const response = await fetch(`/api/message/history/${this.currentUser.id}/${this.currentConversation.participant.id}`);
                    const messages = await response.json();
                    console.log(messages)
                    this.currentConversation.messages = messages;
                } catch (error) {
                    console.error("Lỗi khi tải lịch sử tin nhắn:", error);
                }
            }
            this.startMessagePolling();  // sau khi set currentConversation
            this.updateChatHeader();
            this.renderMessages();
            this.enableMessageInput();

            // Mark messages as read
            this.markAsRead(conversationId);

            console.log('Selected conversation:', this.currentConversation.participant.name);

        } catch (error) {
            console.error('Error selecting conversation:', error);
        }
    }

    updateChatHeader() {
        if (!this.currentConversation) return;

        const participant = this.currentConversation.participant;

        if (this.elements.participantAvatar) {
            // Use initials instead of image
            this.elements.participantAvatar.outerHTML = this.createAvatarElement(participant, '4.5rem').replace('conversation-avatar', 'participant-avatar');
            // Re-get the element after replacement
            this.elements.participantAvatar = document.getElementById('participantAvatar') || document.querySelector('.participant-avatar');
        }

        if (this.elements.participantName) {
            this.elements.participantName.textContent = participant.name;
        }

        if (this.elements.participantStatus) {
            const statusText = participant.status === 'online'
                ? 'Đang hoạt động'
                : participant.lastSeen || 'Không hoạt động';
            const statusClass = participant.status === 'online' ? 'online' : 'offline';

            this.elements.participantStatus.innerHTML = `
                <i class="fas fa-circle"></i>
                <span>${statusText}</span>
            `;
            this.elements.participantStatus.className = `participant-status ${statusClass}`;
        }
    }

    startMessagePolling() {
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
        }

        this.messagePollingInterval = setInterval(async () => {
            if (!this.currentConversation) return;

            try {
                const response = await fetch(`/api/message/history/${this.currentUser.id}/${this.currentConversation.participant.id}`);
                const messages = await response.json();

                // Kiểm tra nếu có tin nhắn mới
                if (messages.length > this.currentConversation.messages.length) {
                    this.currentConversation.messages = messages;
                    this.renderMessages();
                }
            } catch (error) {
                console.error('Lỗi khi cập nhật tin nhắn:', error);
            }
        }, 3000); // mỗi 3 giây
    }


    renderMessages() {
        if (!this.elements.messagesContainer || !this.currentConversation) return;

        const emptyChat = this.elements.emptyChat;
        if (emptyChat) {
            emptyChat.style.display = 'none';
        }

        // Clear existing messages
        this.elements.messagesContainer.innerHTML = '';

        // Add date separator
        const today = new Date();
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date-separator';
        dateDiv.innerHTML = `<span class="date-text">${this.formatDate(today)}</span>`;
        this.elements.messagesContainer.appendChild(dateDiv);

        // Render messages
        this.currentConversation.messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            this.elements.messagesContainer.appendChild(messageEl);
        });

        // Add typing indicator
        const typingIndicator = this.createTypingIndicator();
        this.elements.messagesContainer.appendChild(typingIndicator);

        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const isCurrentUser = message.senderId === this.currentUser.id;
        const sender = isCurrentUser ? this.currentUser : this.currentConversation.participant;

        const div = document.createElement('div');
        div.className = `message-bubble ${isCurrentUser ? 'sent' : 'received'}`;

        const statusIcon = this.getStatusIcon(message.status);
        const messageStatus = isCurrentUser ? `
        <div class="message-status">
            <span class="status-icon ${message.status || ''}">${statusIcon}</span>
        </div>
    ` : '';

        const avatarInitials = isCurrentUser ? this.currentUser.initials : sender.initials;
        const avatarElement = `<div class="message-avatar">${avatarInitials}</div>`;

        div.innerHTML = `
        ${avatarElement}
        <div class="message-content">
            <div class="message-text">${this.escapeHtml(message.content || '')}</div>
            <div class="message-time">${this.formatTime(message.sentAt)}</div>
            ${messageStatus}
        </div>
    `;

        return div;
    }

    createTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';

        const avatarInitials = this.currentConversation.participant.initials;

        typingIndicator.innerHTML = `
            <div class="message-avatar">${avatarInitials}</div>
            <div class="typing-dots">
                <div class="typing-animation">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        return typingIndicator;
    }

    getStatusIcon(status) {
        switch (status) {
            case 'sent': return '<i class="fas fa-check"></i>';
            case 'delivered': return '<i class="fas fa-check-double"></i>';
            case 'read': return '<i class="fas fa-check-double"></i>';
            default: return '<i class="fas fa-clock"></i>';
        }
    }

    enableMessageInput() {
        if (this.elements.messageInput) {
            this.elements.messageInput.disabled = false;
            this.elements.messageInput.placeholder = 'Nhập tin nhắn...';
        }

        if (this.elements.sendBtn) {
            this.elements.sendBtn.disabled = false;
        }
    }

    async sendMessage() {
        if (!this.elements.messageInput || !this.currentConversation) return;

        const text = this.elements.messageInput.value.trim();
        if (!text) return;

        try {
            // Tạo đối tượng message theo API server mong muốn
            const messageData = {
                senderId: this.currentUser.id,
                receiverId: this.currentConversation.participant.id,
                content: text
            };

            // Gửi tin nhắn lên server
            const response = await fetch('/api/message/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.statusText}`);
            }

            const savedMessage = await response.json();

            // Chuyển đổi thời gian nếu cần (tùy server trả về gì)
            // Giả sử server trả về message có trường sentAt
            savedMessage.timestamp = new Date(savedMessage.sentAt || Date.now());

            // Thêm tin nhắn mới vào conversation
            this.currentConversation.messages.push({
                senderId: savedMessage.senderId,
                content: savedMessage.content,
                sentAt: savedMessage.sentAt,
                status: 'sent'
            });

            // Cập nhật preview và thời gian
            this.currentConversation.lastMessage = text;
            this.currentConversation.lastTime = 'Vừa xong';

            // Xóa input
            this.elements.messageInput.value = '';
            this.elements.messageInput.style.height = 'auto';

            // Render lại giao diện chat và danh sách cuộc trò chuyện
            this.renderMessages();
            this.renderConversations();

            // Giữ trạng thái active cho conversation đang chọn
            const currentItem = document.querySelector(`[data-conversation-id="${this.currentConversation.id}"]`);
            if (currentItem) {
                currentItem.classList.add('active');
            }

            console.log('Message sent:', text);

            // Nếu bạn có hàm simulateResponse thì vẫn có thể gọi
            // this.simulateResponse();

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Gửi tin nhắn thất bại, vui lòng thử lại.');
        }
    }

    markAsRead(conversationId) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
            conversation.unreadCount = 0;
            this.renderConversations();

            // Re-select current conversation
            if (this.currentConversation && this.currentConversation.id === conversationId) {
                const currentItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
                if (currentItem) {
                    currentItem.classList.add('active');
                }
            }
        }
    }

    searchConversations(query) {
        const items = document.querySelectorAll('.conversation-item');
        const lowercaseQuery = query.toLowerCase();

        items.forEach(item => {
            const nameEl = item.querySelector('.conversation-name');
            const previewEl = item.querySelector('.conversation-preview');

            if (nameEl && previewEl) {
                const name = nameEl.textContent.toLowerCase();
                const preview = previewEl.textContent.toLowerCase();

                if (name.includes(lowercaseQuery) || preview.includes(lowercaseQuery)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    toggleMobileSidebar() {
        if (this.elements.chatSidebar && this.elements.sidebarOverlay) {
            this.elements.chatSidebar.classList.toggle('mobile-open');
            this.elements.sidebarOverlay.classList.toggle('show');
        }
    }

    closeMobileSidebar() {
        if (this.elements.chatSidebar && this.elements.sidebarOverlay) {
            this.elements.chatSidebar.classList.remove('mobile-open');
            this.elements.sidebarOverlay.classList.remove('show');
        }
    }

    handleAttachment(btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-paperclip')) {
            this.showNotification('Tính năng đính kèm file sẽ sớm được cập nhật!', 'info');
        } else if (icon.classList.contains('fa-image')) {
            this.showNotification('Tính năng gửi hình ảnh sẽ sớm được cập nhật!', 'info');
        }
    }

    handleAction(btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-video')) {
            this.showNotification('Tính năng gọi video sẽ sớm được cập nhật!', 'info');
        } else if (icon.classList.contains('fa-phone')) {
            this.showNotification('Tính năng gọi thoại sẽ sớm được cập nhật!', 'info');
        } else if (icon.classList.contains('fa-info-circle')) {
            this.showNotification('Tính năng xem thông tin sẽ sớm được cập nhật!', 'info');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #17a2b8;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInFromRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    scrollToBottom() {
        if (this.elements.messagesContainer) {
            setTimeout(() => {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    formatTime(date) {
        if (!date) return '';
        // Nếu date là chuỗi, chuyển thành Date object
        if (typeof date === 'string') {
            date = new Date(date);
        }
        // Kiểm tra tiếp date có hợp lệ không
        if (isNaN(date.getTime())) {
            return '';
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }


    formatDate(date) {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Public API methods for external integration
    addMessage(conversationId, message) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
            conversation.messages.push(message);
            if (this.currentConversation && this.currentConversation.id === conversationId) {
                this.renderMessages();
            }
            this.renderConversations();
        }
    }

    updateConversationStatus(conversationId, status) {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (conversation) {
            conversation.participant.status = status;
            if (this.currentConversation && this.currentConversation.id === conversationId) {
                this.updateChatHeader();
            }
            this.renderConversations();
        }
    }

    addConversation(conversation) {
        this.conversations.unshift(conversation);
        this.renderConversations();
        // Tự động chọn cuộc trò chuyện mới nếu chưa có cuộc trò chuyện nào được chọn
        if (!this.currentConversation) {
            this.selectConversation(conversation.id);
        }
    }

    // ===== PHƯƠNG THỨC TIỆN ÍCH CHO VIỆC THIẾT LẬP VAI TRÒ =====
    setUserRole(role) {
        this.currentUser.role = role;
        localStorage.setItem('userRole', role);
        this.setupHomeButton();
        console.log('User role updated to:', role);
    }

    getUserRole() {
        return this.currentUser.role;
    }

    formatRelativeTime(dateTimeString) {
        const now = new Date();
        const date = new Date(dateTimeString);
        const diffMs = now - date;

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 1) return "Vừa xong";
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    }
}

// Initialize chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the chat page
    if (document.body.classList.contains('chat-page')) {
        window.chatApp = new ChatApplication();

        // ===== OPTIONAL: THIẾT LẬP VAI TRÒ TỪ BÊN NGOÀI =====
        // Nếu bạn có cách khác để lấy vai trò người dùng, có thể gọi:
        // window.chatApp.setUserRole('student'); // hoặc 'tutor', 'parent'
    }
});

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);