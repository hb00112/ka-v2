// profile.js - Simplified Implementation

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile section
    initProfilePage();
});

function initProfilePage() {
    // Get the profile page element
    const profilePage = document.getElementById('profilePage');
    
    // If profile page doesn't exist, create it
    if (!profilePage) {
        console.error('Profile page element not found');
        return;
    }
    
    // Set the profile page content
    profilePage.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="company-logo">
                    <i class="fas fa-building"></i>
                </div>
                <h1 class="company-name">Kambeshwar Agencies</h1>
                <p class="company-tagline">Professional Business Solutions</p>
            </div>

            <div class="profile-content">
                <!-- Company Information -->
                <div class="profile-section">
                    <h2 class="section-title">
                        <i class="fas fa-info-circle"></i>
                        Company Information
                    </h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="info-content">
                                <div class="info-label">Business Name</div>
                                <div class="info-value">Kambeshwar Agencies</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="info-content">
                                <div class="info-label">Address</div>
                                <div class="info-value">Mapusa, Goa, India</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="profile-section">
                    <h2 class="section-title">
                        <i class="fas fa-address-book"></i>
                        Contact & Support
                    </h2>
                    <div class="info-grid">
                        <div class="info-item" onclick="callAdmin()">
                            <div class="info-icon">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="info-content">
                                <div class="info-label">Admin Contact</div>
                                <div class="info-value">Hemant - +91 9284494154</div>
                            </div>
                        </div>
                        <div class="info-item" onclick="sendEmail()">
                            <div class="info-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="info-content">
                                <div class="info-label">Email Support</div>
                                <div class="info-value">support@kambeshwar.com</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- App Info -->
                <div class="profile-section">
                    <h2 class="section-title">
                        <i class="fas fa-mobile-alt"></i>
                        App Information
                    </h2>
                    <div class="app-info">
                        <p>Version: 2.1.0</p>
                        <p>Developed for Kambeshwar Agencies</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add basic styles
    addProfileStyles();
}

function addProfileStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Profile Page Styles */
        #profilePage {
            background: #f5f7fa;
            min-height: calc(100vh - 60px);
            padding-bottom: 80px;
        }
        
        .profile-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px 30px;
            text-align: center;
            color: white;
        }
        
        .company-logo {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
        }
        
        .company-logo i {
            font-size: 36px;
        }
        
        .company-name {
            font-size: 24px;
            margin: 0 0 5px;
        }
        
        .company-tagline {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
        }
        
        .profile-content {
            padding: 20px;
        }
        
        .profile-section {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .section-title {
            font-size: 18px;
            margin: 0 0 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title i {
            color: #667eea;
        }
        
        .info-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
        }
        
        .info-content {
            flex: 1;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 15px;
            font-weight: 500;
        }
        
        .app-info {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }
        
        .app-info p {
            margin: 5px 0;
        }
    `;
    document.head.appendChild(style);
}

// Contact functions
function callAdmin() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|webOS|BlackBerry|Windows Phone)/)) {
        window.location.href = 'tel:+919284494154';
    } else {
        copyToClipboard('+91 9284494154');
        showToast('Phone number copied to clipboard!');
    }
}

function sendEmail() {
    const subject = encodeURIComponent('Kambeshwar Agencies App Support');
    const body = encodeURIComponent('Hello,\n\nI need assistance with the Kambeshwar Agencies app.\n\nDetails:\n\n\nThank you!');
    window.location.href = `mailto:support@kambeshwar.com?subject=${subject}&body=${body}`;
}

// Utility functions
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show profile page function
function showProfilePage() {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show profile page
    const profilePage = document.getElementById('profilePage');
    if (profilePage) {
        profilePage.style.display = 'block';
    }
    
    // Update header
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
        headerTitle.textContent = 'Profile';
    }
    
    // Hide back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.style.display = 'none';
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const profileNav = document.querySelector('.nav-item[onclick="showProfilePage()"]');
    if (profileNav) {
        profileNav.classList.add('active');
    }
}