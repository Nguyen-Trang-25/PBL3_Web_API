// Complete Admin Users Management JavaScript - Fixed Version

document.addEventListener("DOMContentLoaded", function () {
    initializeUsersManagement();
});

// Global variables
let users = [];
let filteredUsers = [];
let currentPage = 1;
let pageSize = 10;
let selectedUsers = new Set();

function initializeUsersManagement() {
    // Initialize all components
    initializeCheckboxes();
    initializeSearch();
    initializeFilters();
    initializeBatchActions();
    initializeUserActions();
    initializeModals();
    initializePagination();
    initializeEditUserModal();
    //initializeAddUserModal();

    // Load user data
    loadUsers();

    // Add notification styles
    addNotificationStyles();
}

// ===== USER DATA MANAGEMENT =====
console.log("loadUser")
async function loadUsers() {
    console.log("show thông tin")
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
            return;
        }
        console.log('Token:', token);

        const response = await fetch('/api/Profile/GetAllUsers', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();

        users = data;
        filteredUsers = [...users];// phan trang chia ra
        renderUsersTable();
        updateStatistics();// update so luong 
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        showNotification('Không thể tải danh sách người dùng', 'error');
    }
}

// ===== CHECKBOX MANAGEMENT =====

function initializeCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const userCheckboxes = document.querySelectorAll('.user-checkbox');
            userCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                if (this.checked) {
                    selectedUsers.add(parseInt(checkbox.value));
                } else {
                    selectedUsers.delete(parseInt(checkbox.value));
                }
            });
            updateBatchActionsVisibility();
            updateSelectedCount();
        });
    }
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked');

    if (!selectAllCheckbox) return;

    if (checkedCheckboxes.length === userCheckboxes.length && userCheckboxes.length > 0) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCheckboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = selectedUsers.size;
    }
}

function updateBatchActionsVisibility() {
    const batchActions = document.getElementById('batchActions');
    if (batchActions) {
        batchActions.style.display = selectedUsers.size > 0 ? 'flex' : 'none';
    }// ẩn hiện thao tác xóa hàng loạt
}

// ===== SEARCH FUNCTIONALITY =====

function initializeSearch() {
    const searchInput = document.getElementById('searchUsers');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 500);
        });
    }
}

function safeString(value) {
    return (value || '').toString();
}

function safeStringLower(value) {
    return (value || '').toString().toLowerCase();
}

// Cập nhật hàm performSearch
function performSearch() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(user => {
            return safeStringLower(user.fullName).includes(searchTerm) ||
                safeStringLower(user.email).includes(searchTerm) ||
                safeString(user.phone).includes(searchTerm) ||
                safeString(user.id).includes(searchTerm);
        });
    }

    currentPage = 1;
    renderUsersTable();
    updatePagination();
}

// ===== FILTER FUNCTIONALITY =====

function initializeFilters() {
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

function applyFilters() {
    const userTypeFilter = document.getElementById('userTypeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;// ngày đăng kí 

    filteredUsers = users.filter(user => {
        let passesFilters = true;// duyệt qua từng user check thõa k 

        // User type filter
        if (userTypeFilter !== 'all' && user.userType !== userTypeFilter) {
            passesFilters = false;
        }

        // Date filter
        if (dateFilter !== 'all') {
            const userDate = new Date(user.joinDate);
            const today = new Date();

            switch (dateFilter) {
                case 'today':
                    if (userDate.toDateString() !== today.toDateString()) {
                        passesFilters = false;
                    }
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (userDate < weekAgo) {
                        passesFilters = false;
                    }
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (userDate < monthAgo) {
                        passesFilters = false;
                    }
                    break;
            }
        }

        return passesFilters;
    });

    currentPage = 1;
    renderUsersTable();
    updatePagination();
    showNotification('Đã áp dụng bộ lọc', 'success');
}

function resetFilters() {
    document.getElementById('userTypeFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('searchUsers').value = '';

    filteredUsers = [...users];
    currentPage = 1;
    renderUsersTable();
    updatePagination();
    showNotification('Đã đặt lại bộ lọc', 'info');
}
    // trở lại danh sách ban đầu

    // ===== BATCH ACTIONS =====

    function initializeBatchActions() {
        const batchDelete = document.getElementById('batchDelete');

        if (batchDelete) {
            batchDelete.addEventListener('click', () => performBatchAction('delete'));
        }
    }// xóa hàng loạt

    function performBatchAction(action) {
        if (selectedUsers.size === 0) {
            showNotification('Vui lòng chọn ít nhất một người dùng', 'warning');
            return;
        }

        let actionText = 'xóa';
        let confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedUsers.size} người dùng đã chọn? Hành động này không thể hoàn tác.`;

        showConfirmModal(
            `Xác nhận ${actionText} hàng loạt`,
            confirmMessage,
            () => executeBatchAction(action),
            'danger'
        );
    }// xóa nhiều ng cùng lúc

async function executeBatchAction(action) {
    console.log("test")
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
    }
    console.log('Token:', token);
        if (action !== 'delete') {
            showNotification('Hành động không hợp lệ', 'error');
            return;
        }

        showNotification('Đang xử lý...', 'info');

        try {
            const userIdsToDelete = [...selectedUsers].map(id => id.toString().padStart(10, '0'));


            console.log("userIdsAsStrings:", userIdsToDelete);
            // Gửi danh sách userId đã chọn lên backend để đánh dấu xóa
            const response = await fetch('/api/Profile/DeleteBatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // nếu cần token
                },
                body: JSON.stringify(userIdsToDelete) // dùng mảng string // chuyển Set thành mảng
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi xóa người dùng');
            }

            const result = await response.json();

            // Cập nhật UI sau khi backend trả về thành công
            users = users.filter(u => !userIdsToDelete.includes(u.id.toString().padStart(10, '0')));
            filteredUsers = filteredUsers.filter(u => !userIdsToDelete.includes(u.id.toString().padStart(10, '0')));

            console.log("filteredUsers sau khi xóa:", filteredUsers);

            selectedUsers.clear();
            document.getElementById('selectAll').checked = false;
            updateBatchActionsVisibility();
            updateSelectedCount();

            renderUsersTable();
            updateStatistics();
            updatePagination();

            showNotification(result.message || 'Đã xóa thành công', 'success');

        } catch (error) {
            showNotification(error.message, 'error');
            console.error('Lỗi khi xóa hàng loạt:', error);
        }
    }


    // ===== USER ACTIONS =====

    function initializeUserActions() {
        document.addEventListener('click', function (e) {// xử lí sự kiện click 
            const actionBtn = e.target.closest('.action-btn');
            if (!actionBtn) return;

            const userId = parseInt(actionBtn.dataset.userId);

            if (actionBtn.classList.contains('view')) {
                showUserDetail(userId);
            } else if (actionBtn.classList.contains('edit')) {
                editUser(userId);
            } else if (actionBtn.classList.contains('delete')) {
                deleteUser(userId);
            }
        });

        document.addEventListener('change', function (e) {// xử lí sự kiện change
            if (e.target.classList.contains('user-checkbox')) {
                const userId = parseInt(e.target.value);
                if (e.target.checked) {
                    selectedUsers.add(userId);
                } else {
                    selectedUsers.delete(userId);
                }
                updateSelectAllState();
                updateBatchActionsVisibility();
                updateSelectedCount();
            }
        });
    }
function padUserId(id) {
    return id.toString().padStart(10, '0');
}

async function showUserDetail(userId) {
    console.log("test")
    console.log('User ID:', userId);

    const paddedUserId = padUserId(userId);

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
    }
    console.log('Token:', token);
    try {
        const response = await fetch(`/api/Profile/${paddedUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // nếu dùng JWT
            }
        });
        console.log("Response:", response);

        if (!response.ok) {
            const error = await response.json();
            showNotification(error.message || 'Không thể tải thông tin người dùng', 'error');
            return;
        }

        const user = await response.json();
        
        console.log('User detail from API:', user)
       // console.log('ngày sinh', DateOfBirth)

        // Populate modal with user data
        document.getElementById('modalUserName').textContent = user.fullName;
        document.getElementById('modalUserEmail').textContent = user.email;
        document.getElementById('modalUserPhone').textContent = user.phone;
        document.getElementById('modalUserDate').textContent = formatDate(user.joinDate);

        // Update user type badge
        const modalUserType = document.getElementById('modalUserType');
        modalUserType.textContent = getUserTypeText(user.userType);
        modalUserType.className = `user-type ${user.userType}`;

        // Update status badge
        const modalUserStatus = document.getElementById('modalUserStatus');
        modalUserStatus.textContent = getStatusText(user.status);
        modalUserStatus.className = `status ${user.status}`;

        // Avatar (nếu có)
        const avatarImg = document.getElementById('modalUserAvatar');
        const avatarPlaceholder = document.getElementById('modalAvatarPlaceholder');

        if (user.avatar) {
            avatarImg.src = user.avatar;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            avatarImg.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
            avatarPlaceholder.textContent = getInitials(user.fullName);
        }

        // Update thêm thông tin
        updateUserDetailInfo(user);

        // Gán userId vào modal để xử lý sau này
        document.getElementById('userDetailModal').dataset.userId = userId;

        // Hiện modal
        showModal('userDetailModal');

    } catch (err) {
        console.error('Error fetching user detail:', err);
        showNotification('Đã xảy ra lỗi khi tải thông tin người dùng', 'error');
    }
}

    function updateUserDetailInfo(user) {
        const infoGrid = document.querySelector('#info .info-grid');
        if (infoGrid) {
            let infoHTML = `
            <div class="info-item">
                <label>Địa chỉ:</label>
                <span>${user.address || 'Chưa cập nhật'}</span>
            </div>
             <div class="info-item">
                <label>Email:</label>
                <span>${user.email || 'Chưa cập nhật'}</span>
            </div>
            <div class="info-item">
                <label>Ngày sinh:</label>
                <span>${ user.dateOfBirth
                    ? formatDate(user.dateOfBirth) : 'Chưa cập nhật'}</span>
            </div>
            <div class="info-item">
                <label>Giới tính:</label>   
          <span>${user.gender === true ? 'Nam' : user.gender === false ? 'Nữ' : 'Chưa cập nhật'}</span>
          </div>
        `;

            if (user.userType === 'tutor') {
                infoHTML += `
                <div class="info-item">
                    <label>Trình độ:</label>
                    <span>${user.education || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                    <label>Kinh nghiệm:</label>
                    <span>${user.experience || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                    <label>Chuyên môn:</label>
                    <span>${user.subjects || 'Chưa cập nhật'}</span>
                </div>
               
            `;
            } else if (user.userType === 'student') {
                infoHTML += `
                <div class="info-item">
                    <label>Lớp:</label>
                    <span>${user.grade || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                    <label>Trường:</label>
                    <span>${user.school || 'Chưa cập nhật'}</span>
                </div>
            `;
            } else if (user.userType === 'admin') {
                infoHTML += `
                <div class="info-item">
                    <label>Phòng ban:</label>
                    <span>${user.department || 'Chưa cập nhật'}</span>
                </div>
                <div class="info-item">
                    <label>Vai trò:</label>
                    <span>${user.role || 'Chưa cập nhật'}</span>
                </div>
            `;
            }

            infoGrid.innerHTML = infoHTML;
        }
    }

async function editUser(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Bạn cần đăng nhập lại', 'error');
        return;
    }

    const paddedId = padUserId(userId);
    try {

        const response = await fetch(`/api/Profile/${paddedId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Không thể lấy thông tin người dùng');

        const user = await response.json();
        console.log("sẽ populate được")
        console.log(user.DateOfBirth)

        populateEditForm(user);
        showModal('editUserModal');
    } catch (error) {
        console.error(error);
        showNotification('Lỗi khi lấy thông tin người dùng', 'error');
    }
}


function deleteUser(userId) {
    console.log("xóa")
    const paddedUserId = padUserId(userId);

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Không tìm thấy token, vui lòng đăng nhập lại.');
        return;
    }
    const user = users.find(u => u.id === paddedUserId);
    if (!user) return;

    showConfirmModal(
        'Xác nhận xóa người dùng',
        `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`,
        () => {
            fetch('/api/Profile/Delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                    
                },
                body: JSON.stringify(paddedUserId) // Gửi userId dưới dạng chuỗi JSON đơn
            })
                .then(response => {
                    if (!response.ok) throw new Error("Xóa thất bại");
                    return response.json();
                })
                .then(data => {
                    // Cập nhật giao diện sau khi backend xác nhận đã xóa
                    users = users.filter(u => u.id !== paddedUserId);
                    filteredUsers = filteredUsers.filter(u => u.id !== paddedUserId);
                    selectedUsers.delete(paddedUserId);

                    renderUsersTable();
                    updateStatistics();
                    updatePagination();
                    updateSelectAllState();
                    updateBatchActionsVisibility();
                    updateSelectedCount();

                    showNotification(data.message || 'Đã xóa người dùng thành công', 'success');
                })
                .catch(error => {
                    showNotification(error.message || 'Có lỗi xảy ra khi xóa người dùng', 'danger');
                });
        },
        'danger'
    );
}

    // ===== EDIT USER FUNCTIONALITY =====

    function initializeEditUserModal() {
        const editUserModal = document.getElementById('editUserModal');
        const closeEditUser = document.getElementById('closeEditUser');
        const cancelEditUser = document.getElementById('cancelEditUser');
        const editUserForm = document.getElementById('editUserForm');
        const editUserType = document.getElementById('editUserType');

        if (closeEditUser) {
            closeEditUser.addEventListener('click', () => hideModal('editUserModal'));
        }

        if (cancelEditUser) {
            cancelEditUser.addEventListener('click', () => hideModal('editUserModal'));
        }

        if (editUserType) {
            editUserType.addEventListener('change', function () {
                toggleRoleSpecificSections(this.value);
            });
        }

        if (editUserForm) {
            editUserForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleEditUserSubmission();// khi nhấn submit sẽ gọi backend
            });
        }

        if (editUserModal) {
            editUserModal.addEventListener('click', function (e) {
                if (e.target === this) {
                    hideModal('editUserModal');
                }
            });
        }
    }

    function populateEditForm(user) {// lấy dữ liệu có sẵn trong fe để điền sẵn thông tin hiện trên form 
        document.getElementById('editUserId').value = user.id || '';
        document.getElementById('editFullName').value = user.fullName || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editUserType').value = user.userType || '';
        document.getElementById('editAddress').value = user.address || '';

        // Add additional fields dynamically
        addAdditionalEditFields(user);
        toggleRoleSpecificSections(user.userType);
}
function formatDateISO(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10); // yyyy-MM-dd
}


    function addAdditionalEditFields(user) {
        const formContent = document.querySelector('.edit-user-form .form-content');
        const existingAdditional = formContent.querySelectorAll('.additional-field');
        existingAdditional.forEach(field => field.remove());

        const personalInfoRow = document.createElement('div');
        personalInfoRow.className = 'form-row additional-field';
        personalInfoRow.innerHTML = `
        <div class="form-group">
            <label for="editDateOfBirth">Ngày sinh</label>
           <input type="date" id="editDateOfBirth" name="DateOfBirth" value="${formatDateISO(user.dateOfBirth)}">

        </div>
        <div class="form-group">
            <label for="editGender">Giới tính</label>
            <select id="editGender" name="gender">
             <option value="">Chọn giới tính</option>
             <option value="true" ${user.gender === true ? 'selected' : ''}>Nam</option>
             <option value="false" ${user.gender === false ? 'selected' : ''}>Nữ</option>
            </select>
        </div>
    `;

        formContent.appendChild(personalInfoRow);
        addRoleSpecificEditSections(user);// phân role phù hợp 
    }

    function addRoleSpecificEditSections(user) {
        const formSections = document.querySelector('.form-sections');
        const existingRoleSections = formSections.querySelectorAll('.role-specific-section');
        existingRoleSections.forEach(section => section.remove());

        // Tutor section
        const tutorSection = document.createElement('div');
        tutorSection.className = 'form-section role-specific-section';
        tutorSection.id = 'editTutorInfo';
        tutorSection.innerHTML = `
        <h3><i class="fas fa-chalkboard-teacher"></i> Thông tin gia sư</h3>
        <div class="form-content">
            <div class="form-row">
                <div class="form-group">
                    <label for="editEducation">Trình độ học vấn</label>
                    <input type="text" id="editEducation" name="education" value="${user.education || ''}" placeholder="VD: Đại học Bách Khoa TP.HCM">
                </div>
                <div class="form-group">
                    <label for="editExperience">Kinh nghiệm</label>
                    <input type="text" id="editExperience" name="experience" value="${user.experience || ''}" placeholder="VD: 3 năm">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editSubjects">Chuyên môn</label>
                    <input type="text" id="editSubjects" name="subjects" value="${user.subjects || ''}" placeholder="VD: Toán, Lý, Hóa">
                </div>
            </div>
        </div>
    `;

        // Student section
        const studentSection = document.createElement('div');
        studentSection.className = 'form-section role-specific-section';
        studentSection.id = 'editStudentInfo';
        studentSection.innerHTML = `
        <h3><i class="fas fa-graduation-cap"></i> Thông tin học viên</h3>
        <div class="form-content">
            <div class="form-row">
                <div class="form-group">
                    <label for="editGrade">Lớp</label>
                    <input type="text" id="editGrade" name="grade" value="${user.grade || ''}" placeholder="VD: Lớp 12">
                </div>
                <div class="form-group">
                    <label for="editSchool">Trường</label>
                    <input type="text" id="editSchool" name="school" value="${user.school || ''}" placeholder="VD: THPT Nguyễn Thái Học">
                </div>
            </div>
        </div>
    `;

        // Admin section
        const adminSection = document.createElement('div');
        adminSection.className = 'form-section role-specific-section';
        adminSection.id = 'editAdminInfo';
        adminSection.innerHTML = `
        <h3><i class="fas fa-user-shield"></i> Thông tin admin</h3>
        <div class="form-content">
            <div class="form-row">
                <div class="form-group">
                    <label for="editDepartment">Phòng ban</label>
                    <input type="text" id="editDepartment" name="department" value="${user.department || ''}" placeholder="VD: Quản trị hệ thống">
                </div>
                <div class="form-group">
                    <label for="editRole">Vai trò</label>
                    <input type="text" id="editRole" name="role" value="${user.role || ''}" placeholder="VD: Super Admin">
                </div>
            </div>
        </div>
    `;

        formSections.appendChild(tutorSection);
        formSections.appendChild(studentSection);
        formSections.appendChild(adminSection);
    }

    function toggleRoleSpecificSections(userType) {
        const tutorInfo = document.getElementById('editTutorInfo');
        const studentInfo = document.getElementById('editStudentInfo');
        const adminInfo = document.getElementById('editAdminInfo');

        if (tutorInfo) tutorInfo.style.display = 'none';
        if (studentInfo) studentInfo.style.display = 'none';
        if (adminInfo) adminInfo.style.display = 'none';

        switch (userType) {
            case 'tutor':
                if (tutorInfo) tutorInfo.style.display = 'block';
                break;
            case 'student':
                if (studentInfo) studentInfo.style.display = 'block';
                break;
            case 'admin':
                if (adminInfo) adminInfo.style.display = 'block';
                break;
        }
    }

async function handleEditUserSubmission() {
    console.log("fix nè")
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries()); //trả về một iterator gồm các cặp[key, value] từ FormData

    if (!validateEditForm(userData)) {
        return;
    }

    const saveButton = document.getElementById('saveEditUser');
    const originalHTML = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    saveButton.disabled = true;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Không tìm thấy token. Vui lòng đăng nhập lại.', 'error');
            return;
        }

        const response = await fetch('/api/Profile/Edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                Id: userData.userId,
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                userType: userData.userType,
                dateOfBirth: userData.DateOfBirth || null,
                gender: userData.gender !== "" ? (userData.gender === "true") : null,
                education: userData.education || null,
                experience: userData.experience || null,
                subjects: userData.subjects || null,
                grade: userData.grade || null,
                school: userData.school || null,
                role: userData.role || null
            })
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || 'Lỗi khi cập nhật người dùng.');
        }

        showNotification('Đã cập nhật thông tin người dùng thành công', 'success');
        hideModal('editUserModal');

        // Cập nhật lại danh sách người dùng từ server (tùy chọn)
        await loadUsers();
        await renderUsersTable()

    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        showNotification(`Cập nhật thất bại: ${error.message}`, 'error');
    } finally {
        saveButton.innerHTML = originalHTML;
        saveButton.disabled = false;
    }
}

    function validateEditForm(userData) {
        const errors = [];

        if (!userData.fullName || userData.fullName.trim() === '') {
            errors.push('Họ và tên không được để trống');
            markFieldAsError('editFullName');
        } else {
            markFieldAsValid('editFullName');
        }

        if (!userData.email || userData.email.trim() === '') {
            errors.push('Email không được để trống');
            markFieldAsError('editEmail');
        } else if (!isValidEmail(userData.email)) {
            errors.push('Email không hợp lệ');
            markFieldAsError('editEmail');
        } else {
            markFieldAsValid('editEmail');
        }

        if (!userData.phone || userData.phone.trim() === '') {
            errors.push('Số điện thoại không được để trống');
            markFieldAsError('editPhone');
        } else if (!isValidPhone(userData.phone)) {
            errors.push('Số điện thoại không hợp lệ');
            markFieldAsError('editPhone');
        } else {
            markFieldAsValid('editPhone');
        }

        if (!userData.userType || userData.userType === '') {
            errors.push('Vui lòng chọn loại tài khoản');
            markFieldAsError('editUserType');
        } else {
            markFieldAsValid('editUserType');
        }

        if (errors.length > 0) {
            showNotification(errors[0], 'error');
            return false;
        }

        return true;
    }

    function markFieldAsError(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
        }
    }

    function markFieldAsValid(fieldId) {
        const field = document.getElementById(fieldId);
        const formGroup = field?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
        }
    }

    // ===== ADD USER FUNCTIONALITY =====

    //function initializeAddUserModal() {
    //    const addUserBtn = document.getElementById('addUserBtn');

    //    if (addUserBtn) {
    //        addUserBtn.addEventListener('click', function () {
    //            showAddUserModal();
    //        });
    //    }

    //    createAddUserModal();
    //}

    
    

    // ===== TABLE RENDERING =====

    function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (paginatedUsers.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="no-data">
                        <i class="fas fa-users"></i>
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                </td>
            </tr>
        `;
            return;
        }

        paginatedUsers.forEach(user => {
            const row = createUserRow(user);
            tbody.appendChild(row);
        });

        updateCheckboxListeners();
    }

    function createUserRow(user) {
        const row = document.createElement('tr');
        row.dataset.userId = user.id;

        const isSelected = selectedUsers.has(user.id);

        row.innerHTML = `
        <td>
            <input type="checkbox" class="user-checkbox" value="${user.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    ${user.avatar ?
                `<img src="${user.avatar}" alt="Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                ''
            }
                    <div class="avatar-placeholder" style="${user.avatar ? 'display: none;' : 'display: flex;'}">${getInitials(user.fullName)}</div>
                </div>
                <div class="user-details">
                    <div class="user-name">${user.fullName}</div>
                    <div class="user-id">#${user.id.toString().padStart(3, '0')}</div>
                </div>
            </div>
        </td>
        <td>
            <span class="user-type ${user.userType}">
                <i class="${getUserTypeIcon(user.userType)}"></i>
                ${getUserTypeText(user.userType)}
            </span>
        </td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${formatDate(user.joinDate)}</td>
        <td>
            <div class="action-buttons">
                <button class="action-btn view" title="Xem chi tiết" data-user-id="${user.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" title="Chỉnh sửa" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Xóa" data-user-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

        return row;
    }

    function updateCheckboxListeners() {
        const userCheckboxes = document.querySelectorAll('.user-checkbox');
        userCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const userId = parseInt(this.value);
                if (this.checked) {
                    selectedUsers.add(userId);
                } else {
                    selectedUsers.delete(userId);
                }
                updateSelectAllState();
                updateBatchActionsVisibility();
                updateSelectedCount();
            });
        });
    }

    // ===== STATISTICS =====

    function updateStatistics() {// thống kê số lượng user
        const totalUsers = users.length;
        const admins = users.filter(u => u.userType === 'admin').length;
        const tutors = users.filter(u => u.userType === 'tutor').length;
        const students = users.filter(u => u.userType === 'student').length;

        const statCards = document.querySelectorAll('.stat-card .stat-number');
        if (statCards[0]) statCards[0].textContent = totalUsers.toLocaleString();
        if (statCards[1]) statCards[1].textContent = admins.toLocaleString();
        if (statCards[2]) statCards[2].textContent = tutors.toLocaleString();
        if (statCards[3]) statCards[3].textContent = students.toLocaleString();
    }

    // ===== PAGINATION =====

    function initializePagination() {
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageButtons = document.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
        const pageSizeSelect = document.getElementById('pageSize');

        if (prevPage) {
            prevPage.addEventListener('click', () => changePage(-1));
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => changePage(1));
        }

        pageButtons.forEach(button => {
            if (!isNaN(button.textContent)) {
                button.addEventListener('click', () => goToPage(parseInt(button.textContent)));
            }
        });

        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', () => changePageSize());
        }

        updatePagination();
    }

    function changePage(direction) {
        const totalPages = Math.ceil(filteredUsers.length / pageSize);
        const newPage = currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            renderUsersTable();
            updatePagination();
        }
    }

    function goToPage(pageNum) {
        const totalPages = Math.ceil(filteredUsers.length / pageSize);

        if (pageNum >= 1 && pageNum <= totalPages) {
            currentPage = pageNum;
            renderUsersTable();
            updatePagination();
        }
    }

    function changePageSize() {
        const newPageSize = parseInt(document.getElementById('pageSize').value);
        pageSize = newPageSize;
        currentPage = 1;
        renderUsersTable();
        updatePagination();
        showNotification(`Đã thay đổi hiển thị thành ${pageSize} mục mỗi trang`, 'info');
    }

    function updatePagination() {
        const totalItems = filteredUsers.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
        const endItem = Math.min(currentPage * pageSize, totalItems);

        const showingStart = document.getElementById('showingStart');
        const showingEnd = document.getElementById('showingEnd');
        const totalUsersElement = document.getElementById('totalUsers');

        if (showingStart) showingStart.textContent = startItem;
        if (showingEnd) showingEnd.textContent = endItem;
        if (totalUsersElement) totalUsersElement.textContent = totalItems.toLocaleString();

        updatePageButtons(totalPages);

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    function updatePageButtons(totalPages) {
        const paginationControls = document.querySelector('.pagination-controls');
        if (!paginationControls) return;

        const existingPageBtns = paginationControls.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
        existingPageBtns.forEach(btn => btn.remove());

        const existingDots = paginationControls.querySelectorAll('.page-dots');
        existingDots.forEach(dots => dots.remove());

        if (totalPages <= 1) return;

        const nextBtn = document.getElementById('nextPage');
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            const firstPageBtn = createPageButton(1);
            paginationControls.insertBefore(firstPageBtn, nextBtn);

            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.textContent = '...';
                paginationControls.insertBefore(dots, nextBtn);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i);
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            paginationControls.insertBefore(pageBtn, nextBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.textContent = '...';
                paginationControls.insertBefore(dots, nextBtn);
            }

            const lastPageBtn = createPageButton(totalPages);
            paginationControls.insertBefore(lastPageBtn, nextBtn);
        }
    }

    function createPageButton(pageNum) {
        const button = document.createElement('button');
        button.className = 'page-btn';
        button.textContent = pageNum;
        button.addEventListener('click', () => goToPage(pageNum));
        return button;
    }

    // ===== MODAL MANAGEMENT =====

    function initializeModals() {
        const userDetailModal = document.getElementById('userDetailModal');
        const closeUserDetail = document.getElementById('closeUserDetail');

        if (closeUserDetail) {
            closeUserDetail.addEventListener('click', () => hideModal('userDetailModal'));
        }

        const confirmModal = document.getElementById('confirmModal');
        const closeConfirm = document.getElementById('closeConfirm');
        const cancelAction = document.getElementById('cancelAction');

        if (closeConfirm) {
            closeConfirm.addEventListener('click', () => hideModal('confirmModal'));
        }

        if (cancelAction) {
            cancelAction.addEventListener('click', () => hideModal('confirmModal'));
        }

        const editUserFromModal = document.getElementById('editUserFromModal');

        if (editUserFromModal) {
            editUserFromModal.addEventListener('click', function () {
                const userId = parseInt(document.getElementById('userDetailModal').dataset.userId);
                hideModal('userDetailModal');
                editUser(userId);
            });
        }

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('modal-overlay')) {
                const activeModal = e.target;
                hideModal(activeModal.id);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-overlay.active');
                activeModals.forEach(modal => {
                    hideModal(modal.id);
                });
            }
        });

        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const tabId = this.dataset.tab;
                const tabContainer = this.closest('.user-tabs');

                tabContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                tabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                this.classList.add('active');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        const exportUsersBtn = document.getElementById('exportUsersBtn');
        if (exportUsersBtn) {
            exportUsersBtn.addEventListener('click', function () {
                showConfirmModal(
                    'Xuất danh sách người dùng',
                    'Bạn có muốn xuất danh sách tất cả người dùng ra file Excel?',
                    () => {
                        exportUsers();
                    }
                );
            });
        }

        const refreshTable = document.getElementById('refreshTable');
        if (refreshTable) {
            refreshTable.addEventListener('click', function () {
                showNotification('Đang làm mới dữ liệu...', 'info');

                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
                this.disabled = true;

                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.disabled = false;

                    loadUsers();
                    showNotification('Đã làm mới dữ liệu thành công', 'success');
                }, 1500);
            });
        }
    }

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';

            if (modalId === 'userDetailModal') {
                delete modal.dataset.userId;
            }
        }
    }

    function showConfirmModal(title, message, onConfirm, type = 'primary') {
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmButton = document.getElementById('confirmAction');

        if (!confirmTitle || !confirmMessage || !confirmButton) {
            console.error('Confirm modal elements not found');
            return;
        }

        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmButton.className = `btn btn-${type}`;

        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

        newConfirmButton.addEventListener('click', function () {
            try {
                onConfirm();
            } catch (error) {
                console.error('Error in confirm action:', error);
                showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
            }
            hideModal('confirmModal');
        });

        showModal('confirmModal');
    }

    // ===== EXPORT FUNCTIONALITY =====

    function exportUsers() {
        showNotification('Đang xuất dữ liệu...', 'info');

        setTimeout(() => {
            try {
                const headers = ['ID', 'Họ và tên', 'Email', 'Số điện thoại', 'Loại tài khoản', 'Ngày đăng ký'];
                const csvContent = [
                    headers.join(','),
                    ...users.map(user => [
                        user.id,
                        `"${user.fullName}"`,
                        user.email,
                        user.phone,
                        getUserTypeText(user.userType),
                        formatDate(user.joinDate)
                    ].join(','))
                ].join('\n');

                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);

                link.setAttribute('href', url);
                link.setAttribute('download', `danh-sach-nguoi-dung-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showNotification('Đã xuất danh sách người dùng thành công', 'success');

            } catch (error) {
                console.error('Export error:', error);
                showNotification('Có lỗi xảy ra khi xuất dữ liệu', 'error');
            }
        }, 1000);
    }

    // ===== UTILITY FUNCTIONS =====

    function getUserTypeText(userType) {
        switch (userType) {
            case 'tutor': return 'Gia sư';
            case 'student': return 'Học viên';
            case 'admin': return 'Admin';
            default: return 'Không xác định';
        }
    }

    function getUserTypeIcon(userType) {
        switch (userType) {
            case 'tutor': return 'fas fa-chalkboard-teacher';
            case 'student': return 'fas fa-graduation-cap';
            case 'admin': return 'fas fa-user-shield';
            default: return 'fas fa-user';
        }
    }

    function getStatusText(status) {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'pending': return 'Chờ duyệt';
            case 'blocked': return 'Bị khóa';
            case 'inactive': return 'Không hoạt động';
            default: return 'Không xác định';
        }
    }

    function getInitials(name) {
        if (!name) return ''; // nếu name null, undefined hoặc rỗng thì trả về chuỗi rỗng
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    function formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    }

    function isValidEmail(email) {
        if (!email) return true;  // cho phép email rỗng hoặc null, undefined
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    // ===== NOTIFICATION SYSTEM =====

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            hideNotification(notification);
        }, 4000);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            hideNotification(notification);
        });
    }

    function hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'danger': return 'fa-exclamation-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }

    function addNotificationStyles() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
            #notificationContainer {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                pointer-events: none;
            }
            
            .notification {
                background: #fff;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(400px);
                transition: transform 0.3s ease;
                min-width: 300px;
                max-width: 400px;
                pointer-events: auto;
                position: relative;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left: 4px solid #28a745;
            }
            
            .notification.warning {
                border-left: 4px solid #ffc107;
            }
            
            .notification.danger, .notification.error {
                border-left: 4px solid #dc3545;
            }
            
            .notification.info {
                border-left: 4px solid #17a2b8;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding-right: 30px;
            }
            
            .notification-content i {
                font-size: 18px;
            }
            
            .notification.success .notification-content i {
                color: #28a745;
            }
            
            .notification.warning .notification-content i {
                color: #ffc107;
            }
            
            .notification.danger .notification-content i,
            .notification.error .notification-content i {
                color: #dc3545;
            }
            
            .notification.info .notification-content i {
                color: #17a2b8;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 14px;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.1);
                color: #333;
            }
            
            .no-data {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }
            
            .no-data i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #ccc;
            }
            
            .no-data p {
                margin: 0;
                font-size: 16px;
            }
            
            .form-group.error input,
            .form-group.error select,
            .form-group.error textarea {
                border-color: #dc3545;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .form-group.success input,
            .form-group.success select,
            .form-group.success textarea {
                border-color: #28a745;
                box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
            }
            
            .required {
                color: #dc3545;
            }
            
            .form-row.single-column {
                grid-template-columns: 1fr;
            }
            
            .role-specific-section {
                margin-top: 20px;
            }
            
            .text-center {
                text-align: center;
            }
        `;
            document.head.appendChild(style);
        }
    }

