/**
 * Admin System Info Management JavaScript
 * Quản lý thông tin hệ thống admin
 */

class AdminSystemInfo {
    constructor() {
        this.autoRefreshInterval = null;
        this.autoRefreshTime = 30000; // 30 seconds
        this.isAutoRefreshEnabled = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeProgressBars();
        this.startAutoRefresh();
        this.updateLastRefreshTime();

        // Hiển thị thông báo chào mừng
        this.showNotification('Thông tin hệ thống đã được tải', 'success');
    }

    bindEvents() {
        // Refresh system info button
        const refreshBtn = document.getElementById('refreshSystemInfo');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshSystemInfo());
        }

        // Download system report button
        const downloadBtn = document.getElementById('downloadSystemReport');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadSystemReport());
        }


        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Refresh System Information
     */
    async refreshSystemInfo() {
        const refreshBtn = document.getElementById('refreshSystemInfo');

        try {
            // Show loading state
            this.showLoading();
            this.setButtonLoading(refreshBtn, true);

            // Simulate API call
            await this.simulateSystemInfoUpdate();

            // Update UI with new data
            this.updateSystemInfo();

            // Update last refresh time
            this.updateLastRefreshTime();

            // Show success notification
            this.showNotification('Thông tin hệ thống đã được cập nhật thành công', 'success');

        } catch (error) {
            console.error('Error refreshing system info:', error);
            this.showNotification('Có lỗi xảy ra khi cập nhật thông tin hệ thống', 'error');
        } finally {
            this.hideLoading();
            this.setButtonLoading(refreshBtn, false);
        }
    }

    /**
     * Simulate system info update (replace with real API call)
     */
    async simulateSystemInfoUpdate() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate random system data
                this.systemData = {
                    cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
                    memory: {
                        used: (Math.random() * 12 + 6).toFixed(1), // 6-18 GB
                        total: 32,
                        percentage: null
                    },
                    disk: {
                        used: Math.floor(Math.random() * 200) + 600, // 600-800 GB
                        total: 1000,
                        percentage: null
                    },
                    bandwidth: (Math.random() * 2 + 0.5).toFixed(1), // 0.5-2.5 Mbps
                    connections: Math.floor(Math.random() * 10) + 5, // 5-15 connections
                    uptime: this.generateUptime()
                };

                // Calculate percentages
                this.systemData.memory.percentage = Math.round((this.systemData.memory.used / this.systemData.memory.total) * 100);
                this.systemData.disk.percentage = Math.round((this.systemData.disk.used / this.systemData.disk.total) * 100);

                resolve();
            }, 2000);
        });
    }

    /**
     * Update system information in UI
     */
    updateSystemInfo() {
        // Update CPU usage
        this.updateResourceItem('CPU sử dụng:', `${this.systemData.cpu}%`, this.systemData.cpu);

        // Update Memory usage
        this.updateResourceItem(
            'RAM sử dụng:',
            `${this.systemData.memory.used} GB / ${this.systemData.memory.total} GB (${this.systemData.memory.percentage}%)`,
            this.systemData.memory.percentage
        );

        // Update Disk usage
        this.updateResourceItem(
            'Ổ cứng sử dụng:',
            `${this.systemData.disk.used} GB / ${this.systemData.disk.total} GB (${this.systemData.disk.percentage}%)`,
            this.systemData.disk.percentage
        );

        // Update Bandwidth
        this.updateResourceItem('Băng thông:', `${this.systemData.bandwidth} Mbps`, parseFloat(this.systemData.bandwidth) * 10);

        // Update database connections
        const connectionsElement = document.querySelector('.info-item:has(.info-label:contains("Kết nối active")) .info-value');
        if (connectionsElement) {
            connectionsElement.textContent = `${this.systemData.connections} connections`;
        }

        // Update uptime
        const uptimeElement = document.querySelector('.info-item:has(.info-label:contains("Uptime")) .info-value');
        if (uptimeElement) {
            uptimeElement.textContent = this.systemData.uptime;
        }

        // Add update animation
        this.addUpdateAnimation();
    }

    /**
     * Update resource item with progress bar
     */
    updateResourceItem(label, value, percentage) {
        const resourceItems = document.querySelectorAll('.resource-item');

        resourceItems.forEach(item => {
            const labelElement = item.querySelector('.resource-label');
            if (labelElement && labelElement.textContent.includes(label.split(':')[0])) {
                const valueElement = item.querySelector('.resource-value');
                const progressFill = item.querySelector('.progress-fill');

                if (valueElement) {
                    valueElement.textContent = value;
                }

                if (progressFill) {
                    // Animate progress bar
                    progressFill.style.width = '0%';

                    setTimeout(() => {
                        progressFill.style.width = `${Math.min(percentage, 100)}%`;

                        // Update color based on percentage
                        if (percentage < 30) {
                            progressFill.style.background = '#28a745';
                        } else if (percentage < 70) {
                            progressFill.style.background = '#ffc107';
                        } else {
                            progressFill.style.background = '#dc3545';
                        }
                    }, 100);
                }
            }
        });
    }

    /**
     * Generate random uptime
     */
    generateUptime() {
        const days = Math.floor(Math.random() * 50) + 10;
        const hours = Math.floor(Math.random() * 24);
        return `${days} ngày ${hours} giờ`;
    }

    /**
     * Download System Report
     */
    async downloadSystemReport() {
        const downloadBtn = document.getElementById('downloadSystemReport');

        try {
            this.setButtonLoading(downloadBtn, true);

            // Generate report data
            const reportData = this.generateSystemReport();

            // Create and download file
            await this.createAndDownloadReport(reportData);

            this.showNotification('Báo cáo hệ thống đã được tải xuống thành công', 'success');

        } catch (error) {
            console.error('Error downloading system report:', error);
            this.showNotification('Có lỗi xảy ra khi tải báo cáo', 'error');
        } finally {
            this.setButtonLoading(downloadBtn, false);
        }
    }

    /**
     * Generate system report data
     */
    generateSystemReport() {
        const now = new Date();
        const reportData = {
            title: 'TutorFinder - Báo cáo hệ thống',
            generatedAt: now.toLocaleString('vi-VN'),
            systemInfo: {
                os: 'Ubuntu 22.04 LTS',
                cpu: 'Intel Xeon E5-2680 v4',
                ram: '32 GB',
                storage: '1 TB SSD',
                ip: '192.168.1.100'
            },
            applicationInfo: {
                version: 'TutorFinder v2.1.0',
                framework: 'Laravel 10.x',
                phpVersion: 'PHP 8.2.15',
                database: 'MySQL 8.0.35',
                lastUpdate: '15/12/2024'
            },
            currentUsage: this.systemData || {
                cpu: 15,
                memory: { used: 8.2, total: 32, percentage: 26 },
                disk: { used: 650, total: 1000, percentage: 65 },
                bandwidth: 1.2,
                connections: 8,
                uptime: '25 ngày 14 giờ'
            },
            security: {
                ssl: 'Hợp lệ đến 15/06/2025',
                firewall: 'Đang hoạt động',
                antivirus: 'Cập nhật mới nhất',
                nextMaintenance: 'Chủ nhật - 02:00'
            }
        };

        return reportData;
    }

    /**
     * Create and download report file
     */
    async createAndDownloadReport(reportData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reportContent = this.formatReportContent(reportData);
                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `system-report-${new Date().toISOString().split('T')[0]}.txt`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
                resolve();
            }, 1500);
        });
    }

    /**
     * Format report content
     */
    formatReportContent(data) {
        return `
========================================
${data.title}
========================================
Ngày tạo: ${data.generatedAt}

THÔNG TIN HỆ THỐNG:
- Hệ điều hành: ${data.systemInfo.os}
- CPU: ${data.systemInfo.cpu}
- RAM: ${data.systemInfo.ram}
- Ổ cứng: ${data.systemInfo.storage}
- IP Address: ${data.systemInfo.ip}

THÔNG TIN ỨNG DỤNG:
- Phiên bản: ${data.applicationInfo.version}
- Framework: ${data.applicationInfo.framework}
- PHP Version: ${data.applicationInfo.phpVersion}
- Database: ${data.applicationInfo.database}
- Cập nhật lần cuối: ${data.applicationInfo.lastUpdate}

TÌNH TRẠNG SỬ DỤNG:
- CPU: ${data.currentUsage.cpu}%
- RAM: ${data.currentUsage.memory.used}/${data.currentUsage.memory.total} GB (${data.currentUsage.memory.percentage}%)
- Ổ cứng: ${data.currentUsage.disk.used}/${data.currentUsage.disk.total} GB (${data.currentUsage.disk.percentage}%)
- Băng thông: ${data.currentUsage.bandwidth} Mbps
- Kết nối DB: ${data.currentUsage.connections} connections
- Uptime: ${data.currentUsage.uptime}

BẢO MẬT & BẢO TRÌ:
- SSL Certificate: ${data.security.ssl}
- Firewall: ${data.security.firewall}
- Antivirus: ${data.security.antivirus}
- Bảo trì tiếp theo: ${data.security.nextMaintenance}

========================================
Báo cáo được tạo tự động bởi TutorFinder Admin Panel
========================================
        `;
    }

    /**
     * Initialize Progress Bars with Animation
     */
    initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');

        progressBars.forEach((bar, index) => {
            const currentWidth = bar.style.width;
            bar.style.width = '0%';

            setTimeout(() => {
                bar.style.width = currentWidth;
            }, index * 200 + 500);
        });
    }

    /**
     * Auto Refresh System
     */
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        this.autoRefreshInterval = setInterval(() => {
            if (this.isAutoRefreshEnabled) {
                this.refreshSystemInfo();
            }
        }, this.autoRefreshTime);

        this.isAutoRefreshEnabled = true;
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        this.isAutoRefreshEnabled = false;
    }

    /**
     * Update last refresh time
     */
    updateLastRefreshTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN');

        // Create or update last refresh indicator
        let indicator = document.querySelector('.last-refresh-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'last-refresh-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(14, 181, 130, 0.9);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                z-index: 1000;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(10px);
            `;
            document.body.appendChild(indicator);
        }

        indicator.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            Cập nhật lúc: ${timeString}
        `;

        // Show indicator
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';

        // Hide after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(10px)';
        }, 3000);
    }

    /**
     * Add update animation to cards
     */
    addUpdateAnimation() {
        const cards = document.querySelectorAll('.info-card');

        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 12px 40px rgba(14, 181, 130, 0.15)';

                setTimeout(() => {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                }, 200);
            }, index * 100);
        });
    }

    /**
     * Show Loading Overlay
     */
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    /**
     * Hide Loading Overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.style.position = 'relative';
            button.style.color = 'transparent';

            if (!button.querySelector('.loading-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                `;
                button.appendChild(spinner);
            }
        } else {
            button.disabled = false;
            button.style.color = '';

            const spinner = button.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    /**
     * Show Notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto hide
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    /**
     * Hide Notification
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    /**
     * Close Modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * Close All Modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    }
}

// Initialize Admin System Info when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminSystemInfo = new AdminSystemInfo();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminSystemInfo;
}