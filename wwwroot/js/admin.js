// Các chức năng riêng cho trang admin

document.addEventListener("DOMContentLoaded", function () {
    // Hàm này sẽ được gọi khi DOM đã tải xong
    initializeAdminFeatures();
});

function initializeAdminFeatures() {
    // Khởi tạo các chart nếu có (giữ nguyên)
    initializeCharts();

    // Chỉ xử lý task list nếu trang có task list
    if (document.querySelector('.task-list')) {
        handleTaskList();
    }

    // Chỉ xử lý chart filters nếu trang có chart filters  
    if (document.querySelector('.chart-filters')) {
        handleChartFilters();
    }

    // Khởi tạo admin home nếu đây là trang admin home
    if (document.querySelector('.admin-dashboard')) {
        console.log('Admin dashboard detected, admin-home.js will handle this page');
    }
}
function initializeCharts() {
    // Kiểm tra xem các canvas có tồn tại không
    const userStatsCanvas = document.getElementById('userStatsChart');
    const userDistributionCanvas = document.getElementById('userDistributionChart');

    if (userStatsCanvas) {
        const userStatsCtx = userStatsCanvas.getContext('2d');
        const userStatsChart = new Chart(userStatsCtx, {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [
                    {
                        label: 'Người dùng mới',
                        data: [12, 19, 15, 25, 22, 30, 35],
                        borderColor: '#0eb582', // Màu xanh lá
                        backgroundColor: 'rgba(14, 181, 130, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Gia sư mới',
                        data: [7, 11, 8, 14, 18, 21, 25],
                        borderColor: '#1b5e20', // Màu xanh lá đậm
                        backgroundColor: 'rgba(27, 94, 32, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (userDistributionCanvas) {
        const userDistributionCtx = userDistributionCanvas.getContext('2d');
        const userDistributionChart = new Chart(userDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Học sinh', 'Gia sư', 'Phụ huynh'],
                datasets: [{
                    data: [55, 30, 15],
                    backgroundColor: ['#0eb582', '#1b5e20', '#8bc34a'], // Các tông màu xanh lá
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

function handleTaskList() {
    // Xử lý các task check
    const taskCheckboxes = document.querySelectorAll('.task-check input[type="checkbox"]');
    if (taskCheckboxes.length > 0) {
        taskCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const taskItem = this.closest('li');
                const taskText = taskItem.querySelector('p');

                if (this.checked) {
                    taskText.style.textDecoration = 'line-through';
                    taskText.style.color = '#858796';
                } else {
                    taskText.style.textDecoration = 'none';
                    taskText.style.color = '#333';
                }
            });
        });
    }

    // Xử lý thêm task mới
    const addTaskForm = document.querySelector('.add-task');
    const taskList = document.querySelector('.task-list');

    if (addTaskForm && taskList) {
        const addTaskInput = addTaskForm.querySelector('input');
        const addTaskButton = addTaskForm.querySelector('button');

        if (addTaskButton) {
            addTaskButton.addEventListener('click', function () {
                addNewTask();
            });
        }

        if (addTaskInput) {
            addTaskInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    addNewTask();
                }
            });
        }

        function addNewTask() {
            const taskText = addTaskInput.value.trim();
            if (taskText) {
                const taskId = 'task' + Math.floor(Math.random() * 1000);
                const newTask = document.createElement('li');
                newTask.innerHTML = `
                    <div class="task-check">
                        <input type="checkbox" id="${taskId}">
                        <label for="${taskId}"></label>
                    </div>
                    <div class="task-content">
                        <p>${taskText}</p>
                        <span class="task-priority medium">Ưu tiên trung bình</span>
                    </div>
                `;
                taskList.appendChild(newTask);
                addTaskInput.value = '';

                // Add event listener to new checkbox
                const newCheckbox = document.getElementById(taskId);
                newCheckbox.addEventListener('change', function () {
                    const taskItem = this.closest('li');
                    const taskText = taskItem.querySelector('p');

                    if (this.checked) {
                        taskText.style.textDecoration = 'line-through';
                        taskText.style.color = '#858796';
                    } else {
                        taskText.style.textDecoration = 'none';
                        taskText.style.color = '#333';
                    }
                });
            }
        }
    }
}

function handleChartFilters() {
    // Xử lý chart filters
    const chartFilters = document.querySelectorAll('.chart-filters button');
    if (chartFilters.length > 0) {
        chartFilters.forEach(button => {
            button.addEventListener('click', function () {
                // Remove active class from all buttons
                chartFilters.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                // Ở đây bạn có thể thêm code để thay đổi dữ liệu biểu đồ dựa trên filter
                // Ví dụ:
                // updateChartData(this.textContent);
            });
        });
    }
}