// admin-reviews.js - Phiên bản đơn giản (không có batch actions)

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadInitialData();
});

// Thiết lập các event listener
function setupEventListeners() {
    // User dropdown
    const userIcon = document.getElementById('user-icon');
    const userDropdown = document.getElementById('user-dropdown');

    if (userIcon && userDropdown) {
        userIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDropdown(userDropdown);
        });

        document.addEventListener('click', function () {
            userDropdown.style.display = 'none';
        });
    }

    // Search
    const searchBtn = document.getElementById('searchReviewBtn');
    const searchInput = document.getElementById('searchReview');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filter buttons
    const applyFilterBtn = document.getElementById('applyReviewFilter');
    const clearFilterBtn = document.getElementById('clearReviewFilter');

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearFilters);
    }

    // Export và refresh buttons
    const exportBtn = document.getElementById('exportReviewsBtn');
    const refreshBtn = document.getElementById('refreshTableBtn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportReviews);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshTable);
    }

    // Modal close buttons
    setupModalCloseButtons();

    // Character counter for edit form
    setupCharacterCounter();
}

// Toggle dropdown
function toggleDropdown(dropdown) {
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}

// Load dữ liệu ban đầu
function loadInitialData() {
    console.log('Đã load dữ liệu ban đầu');
}

// Tìm kiếm
function performSearch() {
    const keyword = document.getElementById('searchReview').value.toLowerCase().trim();
    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');

    let foundCount = 0;

    rows.forEach(function (row) {
        const userName = row.querySelector('.reviewer-name')?.textContent.toLowerCase() || '';
        const tutorName = row.querySelector('.tutor-name')?.textContent.toLowerCase() || '';
        const reviewText = row.querySelector('.review-text')?.textContent.toLowerCase() || '';

        const isMatch = userName.includes(keyword) ||
            tutorName.includes(keyword) ||
            reviewText.includes(keyword);

        if (isMatch) {
            row.style.display = '';
            foundCount++;
        } else {
            row.style.display = 'none';
        }
    });

    showMessage(`Tìm thấy ${foundCount} kết quả`, 'info');
}

// Áp dụng bộ lọc
function applyFilters() {
    const ratingFilter = document.getElementById('ratingFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;

    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');

    let visibleCount = 0;

    rows.forEach(function (row) {
        let shouldShow = true;

        // Lọc theo rating
        if (ratingFilter) {
            const ratingText = row.querySelector('.rating-score')?.textContent || '';
            const rating = parseInt(ratingText.split('.')[0]);
            if (rating !== parseInt(ratingFilter)) {
                shouldShow = false;
            }
        }

        // Lọc theo loại đánh giá
        if (typeFilter) {
            const typeElement = row.querySelector('.review-type');
            if (!typeElement || !typeElement.classList.contains(typeFilter)) {
                shouldShow = false;
            }
        }

        // Lọc theo thời gian (có thể implement logic phức tạp hơn)
        if (timeFilter) {
            // Logic lọc theo thời gian có thể được thêm vào đây
            const dateText = row.querySelector('.review-date')?.textContent || '';
            // Có thể parse date và so sánh với filter
        }

        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    showMessage(`Đã lọc và hiển thị ${visibleCount} đánh giá`, 'success');
}

// Xóa bộ lọc
function clearFilters() {
    // Reset form
    document.getElementById('ratingFilter').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('searchReview').value = '';

    // Hiển thị tất cả rows
    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(function (row) {
        row.style.display = '';
    });

    showMessage('Đã xóa tất cả bộ lọc', 'info');
}

// Setup modal close buttons
function setupModalCloseButtons() {
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal when clicking outside
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });
}

// Setup character counter
function setupCharacterCounter() {
    // Add event listener when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            const textarea = document.getElementById('editReviewContent');
            if (textarea) {
                textarea.addEventListener('input', updateCharCount);
            }
        }, 100);
    });

    // Also set up when modal is opened
    document.addEventListener('click', function (e) {
        if (e.target.closest('.action-btn.edit')) {
            setTimeout(function () {
                const textarea = document.getElementById('editReviewContent');
                if (textarea) {
                    textarea.addEventListener('input', updateCharCount);
                }
            }, 600);
        }
    });
}

// Các hàm action cho từng đánh giá
function viewReviewDetail(id) {
    showModal('reviewDetailModal');
    showMessage('Đang tải chi tiết đánh giá...', 'info');

    // Load chi tiết đánh giá theo ID
    loadReviewDetail(id);
}

function loadReviewDetail(id) {
    // Giả lập load data
    setTimeout(function () {
        const modalBody = document.querySelector('#reviewDetailModal .review-detail-content');
        modalBody.innerHTML = `
            <div class="review-participants">
                <div class="participant-group">
                    <h4>Người đánh giá</h4>
                    <div class="participant-card">
                        <div class="participant-info">
                            <div class="participant-name">Nguyễn Thị Lan</div>
                            <div class="participant-role">Học sinh lớp 12</div>
                            <div class="participant-contact">Email: lan.nguyen@email.com</div>
                        </div>
                    </div>
                </div>
                
                <div class="participant-group">
                    <h4>Gia sư được đánh giá</h4>
                    <div class="participant-card">
                        <div class="participant-info">
                            <div class="participant-name">Trần Văn Nam</div>
                            <div class="participant-role">Gia sư Toán học</div>
                            <div class="participant-contact">Email: nam.tran@email.com</div>
                            <div class="participant-rating">
                                <div class="stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                                <span class="rating-text">5.0/5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="review-content-detail">
                <h4>Nội dung đánh giá</h4>
                <div class="review-full-text">
                    "Thầy dạy rất tận tình và dễ hiểu. Em đã tiến bộ rất nhiều sau 2 tháng học với thầy. Phương pháp giảng dạy của thầy rất hay và phù hợp với em. Thầy luôn kiên nhẫn giải đáp mọi thắc mắc của em và tạo môi trường học tập thoải mái."
                </div>
                <div class="review-metadata">
                    <div class="metadata-item">
                        <label>Đánh giá:</label>
                        <span>5/5 sao</span>
                    </div>
                    <div class="metadata-item">
                        <label>Loại:</label>
                        <span>Đánh giá tích cực</span>
                    </div>
                    <div class="metadata-item">
                        <label>Thời gian:</label>
                        <span>15/12/2024 - 14:30</span>
                    </div>
                </div>
            </div>
        `;
    }, 500);
}

function approveReview(id) {
    if (confirm('Bạn có chắc chắn muốn phê duyệt đánh giá này?')) {
        showMessage('Đã phê duyệt đánh giá thành công', 'success');
        // Có thể reload row hoặc update trạng thái ở đây
    }
}

function rejectReview(id) {
    if (confirm('Bạn có chắc chắn muốn từ chối đánh giá này?')) {
        showMessage('Đã từ chối đánh giá', 'warning');
    }
}

function hideReview(id) {
    if (confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) {
        showMessage('Đã ẩn đánh giá', 'info');
    }
}

function deleteReview(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) {
        showMessage('Đã xóa đánh giá thành công', 'success');
        // Có thể remove row khỏi table ở đây
        removeReviewRow(id);
    }
}

function removeReviewRow(id) {
    // Remove row from table
    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(function (row) {
        const actionButtons = row.querySelector('.action-buttons');
        if (actionButtons) {
            const deleteBtn = actionButtons.querySelector('.action-btn.delete');
            if (deleteBtn && deleteBtn.getAttribute('onclick').includes(id)) {
                row.remove();
            }
        }
    });
}

function editReview(id) {
    showModal('editReviewModal');
    loadReviewForEdit(id);
}

function investigateReview(id) {
    showModal('moderateModal');
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Export/Refresh functions
function exportReviews() {
    showMessage('Đang xuất dữ liệu...', 'info');

    // Giả lập export
    setTimeout(function () {
        showMessage('Đã xuất dữ liệu thành công', 'success');
    }, 2000);
}

function refreshTable() {
    showMessage('Đang làm mới dữ liệu...', 'info');

    // Giả lập refresh
    setTimeout(function () {
        showMessage('Đã làm mới dữ liệu', 'success');
        // Clear filters
        clearFilters();
    }, 1000);
}

// Submit moderation
function submitModeration() {
    const action = document.getElementById('moderateAction')?.value;
    const reason = document.getElementById('moderateReason')?.value;

    if (!action) {
        showMessage('Vui lòng chọn hành động', 'warning');
        return;
    }

    closeModal('moderateModal');
    showMessage('Đã gửi quyết định kiểm duyệt', 'success');

    // Reset form
    document.getElementById('moderateAction').value = '';
    document.getElementById('moderateReason').value = '';
}

// Hiển thị thông báo
function showMessage(message, type) {
    // Xóa thông báo cũ nếu có
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = getIconForType(type);

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto remove sau 4 giây
    setTimeout(function () {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);

    // Animate in
    setTimeout(function () {
        notification.classList.add('show');
    }, 10);
}

// Get icon cho notification
function getIconForType(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        case 'info':
        default: return 'info-circle';
    }
}

// Utility functions for stats cards
function showPendingReviews() {
    // Có thể lọc theo loại hoặc các tiêu chí khác
    showMessage('Hiển thị đánh giá cần xử lý', 'info');
}

function showFlaggedReviews() {
    // Lọc hiển thị các đánh giá có flag
    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(function (row) {
        const hasFlag = row.querySelector('.review-flag');
        if (hasFlag) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    showMessage(`Hiển thị ${visibleCount} đánh giá bị báo cáo`, 'warning');
}

// Edit Review Functions
let currentEditingReviewId = null;

function loadReviewForEdit(id) {
    currentEditingReviewId = id;
    showMessage('Đang tải dữ liệu đánh giá...', 'info');

    // Simulate loading review data
    setTimeout(function () {
        // Find the review row data
        const tableBody = document.getElementById('reviewTableBody');
        const rows = tableBody.querySelectorAll('tr');
        let reviewData = null;

        rows.forEach(function (row) {
            const actionButtons = row.querySelector('.action-buttons');
            if (actionButtons) {
                const editBtn = actionButtons.querySelector('.action-btn.edit');
                if (editBtn && editBtn.getAttribute('onclick').includes(id)) {
                    reviewData = extractReviewDataFromRow(row);
                }
            }
        });

        if (reviewData) {
            populateEditForm(reviewData);
            showMessage('Đã tải dữ liệu đánh giá', 'success');
        } else {
            showMessage('Không tìm thấy dữ liệu đánh giá', 'error');
        }
    }, 500);
}

function extractReviewDataFromRow(row) {
    return {
        reviewerName: row.querySelector('.reviewer-name')?.textContent || 'N/A',
        tutorName: row.querySelector('.tutor-name')?.textContent || 'N/A',
        reviewDate: row.querySelector('.review-date')?.textContent || 'N/A',
        rating: row.querySelector('.rating-score')?.textContent || '0',
        content: row.querySelector('.review-text')?.textContent || '',
        type: getReviewTypeFromRow(row)
    };
}

function getReviewTypeFromRow(row) {
    const typeElement = row.querySelector('.review-type');
    if (typeElement) {
        if (typeElement.classList.contains('positive')) return 'positive';
        if (typeElement.classList.contains('negative')) return 'negative';
        if (typeElement.classList.contains('neutral')) return 'neutral';
    }
    return 'positive';
}

function populateEditForm(data) {
    // Populate info section
    document.getElementById('editReviewerName').textContent = data.reviewerName;
    document.getElementById('editTutorName').textContent = data.tutorName;
    document.getElementById('editReviewDate').textContent = data.reviewDate;
    document.getElementById('editOriginalRating').textContent = data.rating;

    // Populate form fields
    const rating = Math.floor(parseFloat(data.rating));
    document.getElementById('editRating').value = rating;
    document.getElementById('editReviewContent').value = data.content.replace(/"/g, '');
    document.getElementById('editReviewType').value = data.type;
    document.getElementById('editReason').value = '';

    // Update character count
    updateCharCount();
}

function updateCharCount() {
    const textarea = document.getElementById('editReviewContent');
    const charCount = document.getElementById('charCount');

    if (textarea && charCount) {
        const count = textarea.value.length;
        charCount.textContent = count;

        // Change color based on character count
        if (count > 450) {
            charCount.style.color = '#dc3545';
        } else if (count > 400) {
            charCount.style.color = '#ffc107';
        } else {
            charCount.style.color = '#28a745';
        }
    }
}

function saveReviewEdit() {
    // Validate form
    const rating = document.getElementById('editRating').value;
    const content = document.getElementById('editReviewContent').value.trim();
    const reason = document.getElementById('editReason').value.trim();

    if (!rating) {
        showMessage('Vui lòng chọn số sao đánh giá', 'warning');
        return;
    }

    if (!content) {
        showMessage('Vui lòng nhập nội dung đánh giá', 'warning');
        return;
    }

    if (content.length > 500) {
        showMessage('Nội dung đánh giá không được vượt quá 500 ký tự', 'warning');
        return;
    }

    if (!reason) {
        showMessage('Vui lòng nhập lý do chỉnh sửa', 'warning');
        return;
    }

    // Show loading
    const saveBtn = document.getElementById('saveReviewEdit');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    saveBtn.disabled = true;

    // Simulate API call
    setTimeout(function () {
        // Update the review row with new data
        updateReviewRow(currentEditingReviewId, {
            rating: rating,
            content: content,
            type: document.getElementById('editReviewType').value
        });

        // Reset button
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;

        // Close modal and show success
        closeModal('editReviewModal');
        showMessage('Đã cập nhật đánh giá thành công', 'success');

        // Reset current editing ID
        currentEditingReviewId = null;
    }, 1500);
}

function updateReviewRow(id, newData) {
    const tableBody = document.getElementById('reviewTableBody');
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(function (row) {
        const actionButtons = row.querySelector('.action-buttons');
        if (actionButtons) {
            const editBtn = actionButtons.querySelector('.action-btn.edit');
            if (editBtn && editBtn.getAttribute('onclick').includes(id)) {
                // Update rating
                const ratingScore = row.querySelector('.rating-score');
                if (ratingScore) {
                    ratingScore.textContent = newData.rating + '.0';
                }

                // Update stars
                const stars = row.querySelectorAll('.stars i');
                stars.forEach(function (star, index) {
                    if (index < parseInt(newData.rating)) {
                        star.className = 'fas fa-star';
                    } else {
                        star.className = 'far fa-star';
                    }
                });

                // Update content
                const reviewText = row.querySelector('.review-text');
                if (reviewText) {
                    reviewText.textContent = '"' + newData.content + '"';
                }

                // Update type
                const reviewType = row.querySelector('.review-type');
                if (reviewType) {
                    reviewType.className = 'review-type ' + newData.type;

                    let icon = 'fas fa-thumbs-up';
                    let text = 'Đánh giá tích cực';

                    if (newData.type === 'negative') {
                        icon = 'fas fa-thumbs-down';
                        text = 'Đánh giá tiêu cực';
                    } else if (newData.type === 'neutral') {
                        icon = 'fas fa-meh';
                        text = 'Đánh giá trung tính';
                    }

                    reviewType.innerHTML = `<i class="${icon}"></i> ${text}`;
                }

                // Add visual effect to show row was updated
                row.style.background = 'rgba(40, 167, 69, 0.1)';
                setTimeout(function () {
                    row.style.background = '';
                }, 2000);
            }
        }
    });
}

// CSS cho notification (thêm vào head nếu chưa có)
if (!document.querySelector('#notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success { background: #28a745; }
        .notification.warning { background: #ffc107; color: #212529; }
        .notification.error { background: #dc3545; }
        .notification.info { background: #17a2b8; }
        
        .notification .notification-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .notification .notification-close:hover {
            opacity: 1;
            background: rgba(255,255,255,0.2);
        }
        
        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                width: auto;
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
}