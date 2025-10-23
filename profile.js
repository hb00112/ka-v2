// profile.js - Optimized for Mobile and Desktop

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile section
    initProfilePage();
    
    // Load saved user data if available
    loadUserData();
    
    // Setup responsive layout
    setupResponsiveLayout();
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
                <div class="user-avatar-container">
                    <div class="user-avatar" id="userAvatar">
                        <i class="fas fa-user" id="defaultAvatarIcon"></i>
                        <img id="userAvatarImage" style="display: none;">
                    </div>
                    <label for="avatarUpload" class="avatar-upload-label">
                        <i class="fas fa-camera"></i>
                        <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                    </label>
                </div>
                <div class="user-name" id="userNameDisplay">Guest User</div>
                <div class="edit-name" id="editNameBtn">
                    <i class="fas fa-edit"></i>
                </div>
            </div>

            <div class="profile-content">
                <!-- User Information Edit Section -->
                <div class="profile-section" id="nameEditSection" style="display: none;">
                    <h2 class="section-title">
                        <i class="fas fa-user-edit"></i>
                        Edit Your Profile
                    </h2>
                    <div class="edit-form">
                        <div class="form-group">
                            <label for="userNameInput">Your Name</label>
                            <input type="text" id="userNameInput" placeholder="Enter your name">
                        </div>
                        <div class="form-buttons">
                        <button class="btn-save" id="saveNameBtn">Save</button>
                            <button class="btn-cancel" id="cancelEditBtn">Cancel</button>
                            
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
                                <div class="info-value">Himanshu - +91 9216153546</div>
                            </div>
                        </div>
                        <div class="info-item" onclick="sendEmail()">
                            <div class="info-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="info-content">
                                <div class="info-label">Email Support</div>
                                <div class="info-value">kambeshwar.enamor@gmail.com</div>
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
                        <p>Version: 3.1 New</p>
                        <p>© 2025 Kambeshwar Agencies All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for the new functionality
    setupUserProfileFeatures();
    
    // Add responsive styles
    addProfileStyles();
}

function setupResponsiveLayout() {
    // Set viewport meta tag if not already present
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
        metaViewport = document.createElement('meta');
        metaViewport.name = 'viewport';
        metaViewport.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(metaViewport);
    }
    
    // Ensure the body has proper layout for fixed navbar
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = 'auto';
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.overflowX = 'hidden'; // Prevent horizontal scroll
    document.body.style.overflowY = 'auto';

}
    
    // Style the profile page container
    const profilePage = document.getElementById('profilePage');
    if (profilePage) {
        profilePage.style.flex = '1';
        profilePage.style.overflowY = 'auto';
        profilePage.style.paddingBottom = '60px'; // Space for navbar
        profilePage.style.width = '100%';
        profilePage.style.maxWidth = '600px'; // Optimal width for desktop
        profilePage.style.margin = '0 auto'; // Center on desktop
    }
    
    // Style the navbar if it exists
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.position = 'fixed';
        navbar.style.bottom = '0';
        navbar.style.left = '0';
        navbar.style.right = '0';
        navbar.style.background = 'white';
        navbar.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
        navbar.style.zIndex = '1000';
        navbar.style.height = '60px';
        navbar.style.display = 'flex';
        navbar.style.justifyContent = 'space-around';
        navbar.style.alignItems = 'center';
    }
    


function setupUserProfileFeatures() {
    // Avatar upload functionality
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const userAvatarImage = document.getElementById('userAvatarImage');
                    const defaultAvatarIcon = document.getElementById('defaultAvatarIcon');
                    
                    userAvatarImage.src = event.target.result;
                    userAvatarImage.style.display = 'block';
                    defaultAvatarIcon.style.display = 'none';
                    
                    // Save to localStorage
                    localStorage.setItem('userAvatar', event.target.result);
                    
                    showToast('Profile photo updated!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Name edit functionality
    const editNameBtn = document.getElementById('editNameBtn');
    const nameEditSection = document.getElementById('nameEditSection');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const userNameInput = document.getElementById('userNameInput');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (editNameBtn && nameEditSection) {
        editNameBtn.addEventListener('click', function() {
            nameEditSection.style.display = 'block';
            userNameInput.value = userNameDisplay.textContent;
            // Scroll to the edit section for better UX
            nameEditSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            nameEditSection.style.display = 'none';
        });
    }
    
    if (saveNameBtn && userNameInput && userNameDisplay) {
        saveNameBtn.addEventListener('click', function() {
            const newName = userNameInput.value.trim();
            if (newName) {
                userNameDisplay.textContent = newName;
                nameEditSection.style.display = 'none';
                
                // Save to localStorage
                localStorage.setItem('userName', newName);
                
                showToast('Name updated successfully!');
            } else {
                showToast('Please enter a valid name');
            }
        });
    }
}

function loadUserData() {
    // Load user name
    const savedName = localStorage.getItem('userName');
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (savedName && userNameDisplay) {
        userNameDisplay.textContent = savedName;
    }
    
    // Load user avatar
    const savedAvatar = localStorage.getItem('userAvatar');
    const userAvatarImage = document.getElementById('userAvatarImage');
    const defaultAvatarIcon = document.getElementById('defaultAvatarIcon');
    
    if (savedAvatar && userAvatarImage && defaultAvatarIcon) {
        userAvatarImage.src = savedAvatar;
        userAvatarImage.style.display = 'block';
        defaultAvatarIcon.style.display = 'none';
    }
}

function addProfileStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Base Styles */
        * {
            box-sizing: border-box;
        }
        
        /* Profile Container */
        .profile-container {
            width: 100%;
            
            margin: 0 auto;
            padding: 0 15px;
        }
        
        /* Profile Header */
        .profile-header {
            padding: 30px 20px 20px;
            text-align: center;
            position: relative;
            background: #fff;
            color: white;
            margin-bottom: 20px;
        }
        
        /* User Avatar */
        .user-avatar-container {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 15px;
        }
        
        .user-avatar {
            width: 100px;
            height: 100px;
            background: rgba(70, 69, 69, 1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin: 0 auto;
        }
        
        .user-avatar i {
            font-size: 40px;
        }
        
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .avatar-upload-label {
            position: absolute;
            bottom: 0;
            right: 0;
            background: #4CAF50;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 2px solid white;
        }
        
        .avatar-upload-label i {
            font-size: 14px;
            color: white;
        }
        
        /* User Name */
        .user-name {
            font-size: 22px;
            font-weight: 600;
            margin: 10px 0;
            display: inline-block;
            color: #000;
        }
        
        .edit-name {
            display: inline-block;
            margin-left: 10px;
            cursor: pointer;
            color: rgba(48, 48, 48, 0.8);
            transition: all 0.3s;
        }
        
        .edit-name:hover {
            color: #000;
            transform: scale(1.1);
        }
        
        /* Profile Content */
        .profile-content {
            padding: 0 10px 20px;
        }
        
        .profile-section {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .section-title {
           
            margin: 0 0 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #1d1d1f;
        }
        
        .section-title i {
            color: #667eea;
        }

        .userNameInput:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

        
        /* Info Grid */
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
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .info-item:hover {
            background-color: #f9f9f9;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-icon {
            width: 40px;
            height: 40px;
            background: #016fe4b0;
            border-radius: 15px;
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
            font-size: 14.5px;
            font-weight: 450;
        }
        
        /* App Info */
        .app-info {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }
        
        .app-info p {
            margin: 5px 0;
        }
        
        /* Edit Form */
        .edit-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .form-group label {
            font-size: 14px;
            color: #666;
        }
        
        .form-group input {
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            width: 100%;
        }

       /* Remove parent padding influence */
.form-buttons {
    display: flex;
    margin: -11px -13px; /* negative margin to counter parent padding */
    border-top: 1px solid #cecece;
}

.btn-save, .btn-cancel {
    flex: 1;
    padding: 12px 0;
    border: none;
    font-weight: 500;
    cursor: pointer;
    background: white;
    transition: background 0.3s;
}

/* Divider between Save and Cancel */
.btn-save {
    color: #007aff; /* iOS blue */
    border-right: 1px solid #cecece;
    font-weight: 600;
}

.btn-save:hover {
    background: #f8f8f8;
}

.btn-cancel {
    color: #666;
}

.btn-cancel:hover {
    background: #f8f8f8;
}

        
        /* Toast Notification */
        .toast {
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(195, 221, 252, 0.7);
            color: #252525ff;
            padding: 12px 24px;
            border-radius: 10px;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s;
            max-width: 90%;
            text-align: center;
            word-break: break-word;
        }
        
        .toast.show {
            opacity: 1;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 480px) {
            .profile-header {
                padding: 20px 15px;
            }
            
            .user-avatar-container {
                width: 80px;
                height: 80px;
            }
            
            .user-avatar {
                width: 80px;
                height: 80px;
            }
            
            .user-name {
                font-size: 20px;
            }
            
            .profile-content {
                padding: 0 5px 20px;
            }
            
            .profile-section {
                padding: 12px;
            }
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
    window.location.href = `mailto:kambeshwar.enamor@gmail.com?subject=${subject}&body=${body}`;
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
    
    // Load user data when showing the profile page
    loadUserData();
}
