// Splash Screen Management
let appInitialized = false;

// Modified initialization to work with splash screen
function initializeApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    // Initialize Cloudinary config
    initializeCloudinaryConfig();
    
    // Check if we're on homepage
    if (document.getElementById('totalBills')) {
        initializeHomepage();
    }
    
    // ... rest of your existing initializePage() function code
}



// Global variables
let currentBillId = null;
let capturedImageFile = null;
let cloudinaryConfig = null;
let isSubmitting = false;


// Initialize Cloudinary config from Firebase
function initializeCloudinaryConfig() {
    database.ref('keys').once('value', (snapshot) => {
        cloudinaryConfig = snapshot.val();
    });
}

// Navigation functions - UPDATED VERSION
// Updated navigation functions - Persistent navigation
// Updated navigation functions - Persistent navigation with fixed footer
function showHomePage() {
    // Hide all pages except footer
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('billsPage').style.display = 'none';
    document.getElementById('ledgerPage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'none';
    
    // Update header
    document.getElementById('headerTitle').textContent = 'Kambeshwar Agencies';
    
    // Update active nav item
    updateActiveNav('home');
    
    // Ensure footer is visible
    document.querySelector('.footer-nav').style.display = 'flex';
}

async function validateInvoiceNumber(invoiceNo, excludeBillId = null) {
    if (!invoiceNo || !invoiceNo.trim()) {
        return { isValid: false, message: 'Invoice number is required' };
    }
    
    try {
        const snapshot = await database.ref('bills').orderByChild('invoiceNo').equalTo(invoiceNo.trim()).once('value');
        const existingBills = snapshot.val();
        
        if (existingBills) {
            const billIds = Object.keys(existingBills);
            
            // If we're editing and the only match is the current bill, it's valid
            if (excludeBillId && billIds.length === 1 && billIds[0] === excludeBillId) {
                return { isValid: true, message: '' };
            }
            
            // Otherwise, it's a duplicate
            return { 
                isValid: false, 
                message: `Invoice number "${invoiceNo}" already exists` 
            };
        }
        
        return { isValid: true, message: '' };
    } catch (error) {
        console.error('Error validating invoice number:', error);
        return { isValid: false, message: 'Error validating invoice number' };
    }
}

// Show iOS-style validation error
function showValidationError(fieldId, message) {
    // Remove existing error
    clearFieldError(fieldId);
    
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Add error class to field
    field.classList.add('field-error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('data-field', fieldId);
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Add subtle shake animation
    field.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 300);
}

// Clear field error
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('field-error');
    }
    
    // Remove error message
    const errorMessage = document.querySelector(`.validation-error-message[data-field="${fieldId}"]`);
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Clear all validation errors
function clearValidationErrors() {
    document.querySelectorAll('.field-error').forEach(field => {
        field.classList.remove('field-error');
    });
    
    document.querySelectorAll('.validation-error-message').forEach(error => {
        error.remove();
    });
}



function showBillsPage() {
    // Hide all pages except footer
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('billsPage').style.display = 'block';
    document.getElementById('ledgerPage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'none';
    
    // Update header
    document.getElementById('headerTitle').textContent = 'Bill Upload';
    
    // Update active nav item
    updateActiveNav('bills');
    
    // Ensure footer is visible
    document.querySelector('.footer-nav').style.display = 'flex';
    
    // Load bills data
    loadBills();
}

function showLedgerPage() {
    // Hide all pages except footer
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('billsPage').style.display = 'none';
    document.getElementById('ledgerPage').style.display = 'block';
    document.getElementById('profilePage').style.display = 'none';
    
    // Update header
    document.getElementById('headerTitle').textContent = 'Ledger';
    
    // Update active nav item
    updateActiveNav('ledger');
    
    // Ensure footer is visible
    document.querySelector('.footer-nav').style.display = 'flex';
    
    // Load ledger data
    loadLedgerParties();
}

function showProfilePage() {
    // Hide all pages except footer
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('billsPage').style.display = 'none';
    document.getElementById('ledgerPage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'block';
    
    // Update header
    document.getElementById('headerTitle').textContent = 'Profile';
    
    // Update active nav item
    updateActiveNav('profile');
    
    // Ensure footer is visible
    document.querySelector('.footer-nav').style.display = 'flex';
    
    // Update profile stats
    if (profileSection) {
        profileSection.updateStatistics();
    }
}

// Helper function to update active nav item
function updateActiveNav(currentPage) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    switch(currentPage) {
        case 'home':
            document.querySelector('.nav-item[onclick="showHomePage()"]').classList.add('active');
            break;
        case 'bills':
            document.querySelector('.nav-item[onclick="showBillsPage()"]').classList.add('active');
            break;
        case 'ledger':
            document.querySelector('.nav-item[onclick="showLedgerPage()"]').classList.add('active');
            break;
        case 'profile':
            document.querySelector('.nav-item[onclick="showProfilePage()"]').classList.add('active');
            break;
    }
}

// Modal functions
function openAddBillModal() {
    const modal = document.getElementById('addBillModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Reset camera related states when closing manual entry modal
    if (modalId === 'manualEntryModal') {
        resetCameraState();
    }
}

function openManualEntryModal() {
    closeModal('addBillModal');
    setTimeout(() => {
        const modal = document.getElementById('manualEntryModal');
        if (modal) {
            modal.classList.add('active');
            resetCameraState();
             resetToBillMode();
        }
    }, 300);
}
function toggleEntryMode() {
    isCreditNoteMode = !isCreditNoteMode;
    updateEntryModeUI();
    
    // Add visual feedback for CN mode
    const modal = document.getElementById('manualEntryModal');
    if (modal) {
        if (isCreditNoteMode) {
            modal.classList.add('cn-mode-active');
            modal.classList.remove('bill-mode-active');
        } else {
            modal.classList.add('bill-mode-active');
            modal.classList.remove('cn-mode-active');
        }
    }
}

function resetToBillMode() {
    isCreditNoteMode = false;
    updateEntryModeUI();
    
    const modal = document.getElementById('manualEntryModal');
    if (modal) {
        modal.classList.add('bill-mode-active');
        modal.classList.remove('cn-mode-active');
    }
}


function updateEntryModeUI() {
    const modal = document.getElementById('manualEntryModal');
    if (!modal) return;

    const toggleBtn = modal.querySelector('#entryModeToggle');
    const invoiceLabel = modal.querySelector('#invoiceLabel');
    const dateLabel = modal.querySelector('#dateLabel');
    const modalHeader = modal.querySelector('.modal-header');
    const submitBtn = modal.querySelector('#submitBtn');

    if (isCreditNoteMode) {
        // CN Mode
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Switch to Bill';
            toggleBtn.className = 'mode-toggle-btn cn-mode';
        }
        if (invoiceLabel) invoiceLabel.textContent = 'CN Number*';
        if (dateLabel) dateLabel.textContent = 'CN Date*';
        if (modalHeader) {
            modalHeader.style.backgroundColor = '#ffebee';
            modalHeader.style.borderColor = '#ef9a9a';
        }
        if (submitBtn) {
            
            submitBtn.textContent = 'Submit Credit Note';
        }
        modal.classList.add('cn-mode-active');
        modal.classList.remove('bill-mode-active');
    } else {
        // Bill Mode
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Switch to CN';
            toggleBtn.className = 'mode-toggle-btn bill-mode';
        }
        if (invoiceLabel) invoiceLabel.textContent = 'Invoice Number*';
        if (dateLabel) dateLabel.textContent = 'Invoice Date*';
        if (modalHeader) {
            modalHeader.style.backgroundColor = '#e3f2fd';
            modalHeader.style.borderColor = '#90caf9';
        }
        if (submitBtn) {
            
            submitBtn.textContent = 'Submit Bill';
        }
        modal.classList.add('bill-mode-active');
        modal.classList.remove('cn-mode-active');
    }
}





// Camera related functions
function resetCameraState() {
    capturedImageFile = null;
    const cameraBtn = document.getElementById('cameraBtn');
    const photoPreview = document.getElementById('photoPreview');
    const retakeBtn = document.getElementById('retakeBtn');
    
    if (cameraBtn) cameraBtn.style.display = 'flex';
    if (photoPreview) photoPreview.style.display = 'none';
    if (retakeBtn) retakeBtn.style.display = 'none';
    
    // Reset preview image
    const previewImg = document.getElementById('previewImg');
    if (previewImg) previewImg.src = '';
    
    updateCameraButtonState();
}

function updateCameraButtonState() {
    const cameraBtn = document.getElementById('cameraBtn');
    if (!cameraBtn) return;
    
    const invoiceNo = document.getElementById('invoiceNo').value.trim();
    const invoiceDate = document.getElementById('invoiceDate').value;
    const partyName = document.getElementById('partyName').value;
    const taxableAmount = parseFloat(document.getElementById('taxableAmount').value) || 0;
    const taxAmount = parseFloat(document.getElementById('taxAmount').value) || 0;
    
    // Check if all required fields are filled (discount can be zero)
    const allFieldsFilled = invoiceNo && invoiceDate && partyName && taxableAmount > 0 && taxAmount > 0;
    
    if (allFieldsFilled) {
        cameraBtn.disabled = false;
        cameraBtn.classList.remove('disabled');
    } else {
        cameraBtn.disabled = true;
        cameraBtn.classList.add('disabled');
    }
}

function openCamera() {
    const cameraInput = document.getElementById('cameraInput');
    if (cameraInput) {
        cameraInput.click();
    }
}

function handleImageCapture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    capturedImageFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImg');
        const cameraBtn = document.getElementById('cameraBtn');
        const photoPreview = document.getElementById('photoPreview');
        const retakeBtn = document.getElementById('retakeBtn');
        
        if (previewImg) previewImg.src = e.target.result;
        if (cameraBtn) cameraBtn.style.display = 'none';
        if (photoPreview) photoPreview.style.display = 'block';
        if (retakeBtn) retakeBtn.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function retakePhoto() {
    resetCameraState();
    // Clear the file input
    const cameraInput = document.getElementById('cameraInput');
    if (cameraInput) cameraInput.value = '';
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(imageFile) {
    if (!cloudinaryConfig || !imageFile) {
        return null;
    }
    
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

function viewAllBills() {
    alert('View All Bills feature coming soon!');
}

function generateReport() {
    alert('Generate Report feature coming soon!');
}

function exportData() {
    alert('Export Data feature coming soon!');
}

function goBack() {
    showHomePage();
}

function viewLedger() {
    alert('View Ledger feature coming soon!');
}

// Homepage Functions
// Homepage Functions - Updated for Financial Year
function loadSummaryData() {
    // Get current financial year (April 1 to March 31)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const financialYear = currentMonth >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    const financialYearStart = new Date(financialYear, 3, 1); // April 1
    const financialYearEnd = new Date(financialYear + 1, 2, 31); // March 31 next year

    // Load total bills for current financial year
    database.ref('bills').once('value', (snapshot) => {
        const bills = snapshot.val();
        let totalBills = 0;
        let totalAmount = 0;
        
        if (bills) {
            Object.values(bills).forEach(bill => {
                const billDate = new Date(bill.date);
                if (billDate >= financialYearStart && billDate <= financialYearEnd) {
                    totalBills++;
                    totalAmount += bill.amount || 0;
                }
            });
        }
        
        // Update UI
        const totalBillsElement = document.getElementById('totalBills');
        if (totalBillsElement) {
            totalBillsElement.textContent = totalBills;
            totalBillsElement.className = totalBills > 0 ? 'value' : 'value empty';
        }
        
        const totalAmountElement = document.getElementById('totalAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = formatCurrency(totalAmount);
            totalAmountElement.className = totalAmount > 0 ? 'value' : 'value empty';
        }
    });

    // Load parties count (all time, not filtered by year)
    database.ref('parties').once('value', (snapshot) => {
        const parties = snapshot.val();
        const partiesCount = parties ? Object.keys(parties).length : 0;
        const partiesElement = document.getElementById('partiesRegistered');
        if (partiesElement) {
            partiesElement.textContent = partiesCount;
            partiesElement.className = partiesCount > 0 ? 'value' : 'value empty';
        }
    });
}

// New function to load target analytics
// New function to load target analytics - FIXED FINANCIAL QUARTER CALCULATION
// New function to load target analytics - FIXED FINANCIAL QUARTER CALCULATION
function loadTargetAnalytics() {
    const analyticsContainer = document.getElementById('analyticsContainer');
    if (!analyticsContainer) return;

    // Clear existing content
    analyticsContainer.innerHTML = '<h2 class="section-header"><i class="fas fa-chart-line"></i> Target Analytics</h2>';

    // Get current financial year (April 1 to March 31)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    
    // Debug logging
    console.log('Current Date:', today);
    console.log('Current Month:', currentMonth);
    
    const financialYear = currentMonth >= 4 ? today.getFullYear() : today.getFullYear() - 1;
    const financialYearStart = new Date(financialYear, 3, 1); // April 1
    const financialYearEnd = new Date(financialYear + 1, 2, 31); // March 31 next year

    // Calculate current financial quarter - FIXED with explicit logic
    let currentQuarter;
    if (currentMonth === 4 || currentMonth === 5 || currentMonth === 6) {
        currentQuarter = 1; // Q1: Apr-Jun
    } else if (currentMonth === 7 || currentMonth === 8 || currentMonth === 9) {
        currentQuarter = 2; // Q2: Jul-Sep
    } else if (currentMonth === 10 || currentMonth === 11 || currentMonth === 12) {
        currentQuarter = 3; // Q3: Oct-Dec
    } else if (currentMonth === 1 || currentMonth === 2 || currentMonth === 3) {
        currentQuarter = 4; // Q4: Jan-Mar
    }
    
    // Debug logging
    console.log('Financial Year:', financialYear);
    console.log('Current Financial Quarter:', currentQuarter);
    
    const quarterKey = `Q${currentQuarter}`;
    
    // Calculate days remaining in quarter - FIXED
    let quarterEndDate;
    switch(currentQuarter) {
        case 1: quarterEndDate = new Date(financialYear, 5, 30); break; // June 30
        case 2: quarterEndDate = new Date(financialYear, 8, 30); break; // September 30
        case 3: quarterEndDate = new Date(financialYear, 11, 31); break; // December 31
        case 4: quarterEndDate = new Date(financialYear + 1, 2, 31); break; // March 31
    }
    const daysRemainingQuarter = Math.max(0, Math.ceil((quarterEndDate - today) / (1000 * 60 * 60 * 24)));
    
    // Calculate days remaining in year
    const daysRemainingYear = Math.max(0, Math.ceil((financialYearEnd - today) / (1000 * 60 * 60 * 24)));

    // Process each party with targets
    Object.entries(partyTargets).forEach(([partyName, targets]) => {
        // Get all bills for this party in current financial year
        database.ref('bills').orderByChild('partyName').equalTo(partyName).once('value', (snapshot) => {
            const bills = snapshot.val();
            const billsArray = bills ? Object.values(bills) : [];
            
            // Filter bills for current quarter and financial year
            const quarterBills = billsArray.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= getQuarterStartDate(financialYear, currentQuarter) && 
                       billDate <= quarterEndDate;
            });
            
            const yearBills = billsArray.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= financialYearStart && billDate <= financialYearEnd;
            });
            
            const quarterTotal = quarterBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
            const yearTotal = yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
            
            // Get targets
            const quarterTarget = targets.quarterly ? targets.quarterly[quarterKey] : 0;
            const yearTarget = targets.yearly || 0;
            
            // Create analytics card
            const card = createPartyTargetCard({
                partyName,
                quarterTotal,
                quarterTarget,
                yearTotal,
                yearTarget,
                daysRemainingQuarter,
                daysRemainingYear,
                financialYear,
                currentQuarter // Pass current quarter for display
            });
            
            analyticsContainer.appendChild(card);
        });
    });
}

// Helper function to get quarter start date - FIXED
function getQuarterStartDate(year, quarter) {
    switch(quarter) {
        case 1: return new Date(year, 3, 1); // April 1
        case 2: return new Date(year, 6, 1); // July 1  
        case 3: return new Date(year, 9, 1); // October 1
        case 4: return new Date(year, 0, 1); // January 1 (next year)
    }
}

// Create a target analytics card for a party - UPDATED to show correct quarter
function createPartyTargetCard(data) {
    const card = document.createElement('div');
    card.className = 'target-analytics-card';
    card.onclick = () => openPartyModalFromHome(data.partyName);
    
    // Calculate metrics
    const quarterRemaining = Math.max(0, data.quarterTarget - data.quarterTotal);
    const yearRemaining = Math.max(0, data.yearTarget - data.yearTotal);
    
    const quarterPercentage = data.quarterTarget > 0 ? 
        Math.min(100, (data.quarterTotal / data.quarterTarget) * 100) : 0;
    const yearPercentage = data.yearTarget > 0 ? 
        Math.min(100, (data.yearTotal / data.yearTarget) * 100) : 0;
    
    card.innerHTML = `
        <div class="party-target-header">
            <h3>${data.partyName}</h3>
            <span class="financial-year">FY ${data.financialYear}-${data.financialYear + 1}</span>
        </div>
        
        <div class="target-section">
            <h4><i class="fas fa-calendar-alt"></i> Current Quarter (Q${data.currentQuarter})</h4>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${quarterPercentage}%"></div>
                </div>
                <div class="progress-text">
                    ${formatCurrency(data.quarterTotal)} / ${formatCurrency(data.quarterTarget)} (${quarterPercentage.toFixed(1)}%)
                </div>
            </div>
            <div class="target-metrics">
                <div class="metric">
                    <span class="metric-label">Remaining:</span>
                    <span class="metric-value">${formatCurrency(quarterRemaining)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Days Left:</span>
                    <span class="metric-value">${data.daysRemainingQuarter}</span>
                </div>
            </div>
        </div>
        
        <div class="target-section">
            <h4><i class="fas fa-calendar"></i> Annual Target</h4>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${yearPercentage}%"></div>
                </div>
                <div class="progress-text">
                    ${formatCurrency(data.yearTotal)} / ${formatCurrency(data.yearTarget)} (${yearPercentage.toFixed(1)}%)
                </div>
            </div>
            <div class="target-metrics">
                <div class="metric">
                    <span class="metric-label">Remaining:</span>
                    <span class="metric-value">${formatCurrency(yearRemaining)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Days Left:</span>
                    <span class="metric-value">${data.daysRemainingYear}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}
// Open party modal from homepage click
function openPartyModalFromHome(partyName) {
    database.ref('bills').orderByChild('partyName').equalTo(partyName).once('value', (snapshot) => {
        const bills = snapshot.val();
        const billsArray = bills ? Object.values(bills) : [];
        
        openPartyModal({
            name: partyName,
            bills: billsArray,
            totalAmount: billsArray.reduce((sum, bill) => sum + (bill.amount || 0), 0),
            lastTransactionDate: billsArray.length > 0 ? 
                billsArray[billsArray.length - 1].date : null
        });
    });
}

// Initialize homepage with both summary and analytics

function loadLatestBills() {
    database.ref('bills').orderByChild('timestamp').limitToLast(5).once('value', (snapshot) => {
        const bills = snapshot.val();
        const billsContainer = document.getElementById('billsContainer');
        
        if (!bills || !billsContainer) {
            if (billsContainer) {
                billsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <h3>No Bills Yet</h3>
                        <p>Bills will appear here once uploaded</p>
                    </div>
                `;
            }
            return;
        }

        const billsArray = Object.entries(bills).map(([key, value]) => ({
            id: key,
            ...value
        })).reverse(); // Show newest first

        billsContainer.innerHTML = '';
        
        billsArray.forEach(bill => {
            const billElement = document.createElement('div');
            billElement.className = 'bill-item';
            billElement.style.cursor = 'pointer';
            billElement.onclick = () => showBillDetails(bill.id);
            billElement.innerHTML = `
                <div class="bill-info">
                    <div class="bill-invoice">${bill.invoiceNo || 'INV-' + bill.id.substr(-6).toUpperCase()}</div>
                    <div class="bill-party">${bill.partyName || 'Party Name'}</div>
                    <div class="bill-date">${bill.date ? formatDateLong(bill.date) : 'Date'}</div>
                </div>
                <div class="bill-amount">${bill.amount ? formatCurrency(bill.amount) : '₹0'}</div>
            `;
            billsContainer.appendChild(billElement);
        });
    });
}

function loadRecentLedgers() {
    database.ref('ledgers').orderByChild('lastTransactionDate').limitToLast(5).once('value', (snapshot) => {
        const ledgers = snapshot.val();
        const ledgersContainer = document.getElementById('ledgersContainer');
        
        if (!ledgers || !ledgersContainer) {
            if (ledgersContainer) {
                ledgersContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>No Ledgers Yet</h3>
                        <p>Ledger entries will appear here once created</p>
                    </div>
                `;
            }
            return;
        }

        const ledgersArray = Object.entries(ledgers).map(([key, value]) => ({
            id: key,
            ...value
        })).reverse(); // Show newest first

        ledgersContainer.innerHTML = '';
        
        ledgersArray.forEach(ledger => {
            const ledgerElement = document.createElement('div');
            ledgerElement.className = 'ledger-item';
            ledgerElement.innerHTML = `
                <div class="ledger-info">
                    <div class="ledger-party">${ledger.partyName || 'Party Name'}</div>
                    <div class="ledger-date">${ledger.lastTransactionDate ? formatDateLong(ledger.lastTransactionDate) : 'Last Transaction'}</div>
                </div>
                <div class="ledger-amount">${ledger.totalAmount ? formatCurrency(ledger.totalAmount) : '₹0'}</div>
            `;
            ledgersContainer.appendChild(ledgerElement);
        });
    });
}

function initializeHomepage() {
    loadSummaryData();
    loadTargetAnalytics();

    // Set up real-time listeners for updates
    database.ref('bills').on('value', () => {
        loadSummaryData();
        loadTargetAnalytics();
    });
    database.ref('parties').on('value', loadSummaryData);
}

// Bill Upload Functions
function loadBills() {
    const billsTableBody = document.getElementById('billsTableBody');
    
    if (!billsTableBody) return;
    
    database.ref('bills').orderByChild('timestamp').limitToLast(10).once('value', (snapshot) => {
        const bills = snapshot.val();
        
        if (!bills) {
            billsTableBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h3>No Bills Uploaded</h3>
                    <p>Upload your first bill to get started</p>
                </div>
            `;
            return;
        }
        
        const billsArray = Object.entries(bills).map(([key, value]) => ({
            id: key,
            ...value
        })).reverse(); // Show newest first
        
        billsTableBody.innerHTML = '';
        
        billsArray.forEach(bill => {
            const isNegative = bill.amount < 0;
            const billRow = document.createElement('div');
            billRow.className = 'bill-row';
            billRow.style.cursor = 'pointer';
            billRow.onclick = () => showBillDetails(bill.id);
            billRow.innerHTML = `
                <div class="date">${formatDate(bill.date)}</div>
                <div class="invoice">${bill.invoiceNo}</div>
                <div class="party">${bill.partyName}</div>
                <div class="amount ${isNegative ? 'negative-amount' : ''}">
                    ${formatCurrency(bill.amount)}
                    ${bill.type === 'credit_note' ? '<span class="cn-badge">CN</span>' : ''}
                </div>
            `;
            billsTableBody.appendChild(billRow);
        });
    });
}

// Bill Details Functions
function showBillDetails(billId) {
    currentBillId = billId;
    
    database.ref('bills/' + billId).once('value', (snapshot) => {
        const bill = snapshot.val();
        
        if (!bill) {
            alert('Bill not found');
            return;
        }
        
        // Update modal content
        document.getElementById('detailPartyName').textContent = bill.partyName || '--';
        document.getElementById('detailInvoiceNo').textContent = bill.invoiceNo || '--';
        document.getElementById('detailDate').textContent = bill.date ? formatDateLong(bill.date) : '--';
        
        // Handle amount styling
        const amountElement = document.getElementById('detailAmount');
        amountElement.textContent = bill.amount ? formatCurrency(bill.amount) : '₹0';
        if (bill.amount < 0) {
            amountElement.classList.add('negative-amount');
        } else {
            amountElement.classList.remove('negative-amount');
        }
        
        // Show amount breakdown if available
        const amountBreakdownContainer = document.getElementById('amountBreakdownContainer');
        if (amountBreakdownContainer) {
            if (bill.taxableAmount !== undefined && bill.taxAmount !== undefined) {
                amountBreakdownContainer.innerHTML = `
                    <div class="amount-breakdown-section">
                        <h4>Amount Breakdown</h4>
                        <div class="breakdown-row">
                            <span class="breakdown-label">Taxable Amount:</span>
                            <span class="breakdown-value">${formatCurrency(bill.taxableAmount || 0)}</span>
                        </div>
                        <div class="breakdown-row">
                            <span class="breakdown-label">Tax Amount:</span>
                            <span class="breakdown-value">${formatCurrency(bill.taxAmount || 0)}</span>
                        </div>
                        <div class="breakdown-row">
                            <span class="breakdown-label">Discount:</span>
                            <span class="breakdown-value">${formatCurrency(bill.discount || 0)}</span>
                        </div>
                        <div class="breakdown-row breakdown-total">
                            <span class="breakdown-label">Final Amount:</span>
                            <span class="breakdown-value">${formatCurrency(bill.amount || 0)}</span>
                        </div>
                    </div>
                `;
            } else {
                amountBreakdownContainer.innerHTML = '';
            }
        }
        
        // Calculate ledger balance (for now, just show the bill amount)
        const balanceElement = document.getElementById('detailLedgerBalance');
        balanceElement.textContent = bill.amount ? formatCurrency(bill.amount) : '₹0';
        if (bill.amount < 0) {
            balanceElement.classList.add('negative-amount');
        } else {
            balanceElement.classList.remove('negative-amount');
        }
        
        // Show bill image if exists
        const billImageContainer = document.getElementById('billImageContainer');
        if (bill.imageUrl && billImageContainer) {
            billImageContainer.innerHTML = `
                <div class="bill-image-section">
                    <h4>Bill Image</h4>
                    <img src="${bill.imageUrl}" alt="Bill Image" class="bill-image" onclick="openImageModal('${bill.imageUrl}')">
                </div>
            `;
        } else if (billImageContainer) {
            billImageContainer.innerHTML = '';
        }
        
        // Show modal
        document.getElementById('billDetailsModal').classList.add('active');
    });
}


function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'image-modal-overlay';
    modal.innerHTML = `
        <div class="image-modal">
            <button class="image-close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            <img src="${imageUrl}" alt="Bill Image" class="full-image">
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDeleteBill() {
    closeModal('billDetailsModal');
    setTimeout(() => {
        document.getElementById('deleteConfirmModal').classList.add('active');
    }, 300);
}

function deleteBill() {
    if (!currentBillId) {
        alert('No bill selected');
        return;
    }
    
    // Get bill data before deletion for ledger updates
    database.ref('bills/' + currentBillId).once('value', (snapshot) => {
        const billData = snapshot.val();
        
        if (!billData) {
            alert('Bill not found');
            closeModal('deleteConfirmModal');
            return;
        }
        
        // Delete the bill from Firebase
        database.ref('bills/' + currentBillId).remove()
            .then(() => {
                // Update ledger if exists
                const partyName = billData.partyName;
                if (partyName && partyName !== 'CASH') {
                    database.ref('ledgers').orderByChild('partyName').equalTo(partyName).once('value', (ledgerSnapshot) => {
                        const ledgers = ledgerSnapshot.val();
                        if (ledgers) {
                            const ledgerKey = Object.keys(ledgers)[0];
                            const ledger = ledgers[ledgerKey];
                            
                            // Subtract the bill amount from ledger
                            const updatedAmount = (ledger.totalAmount || 0) - billData.amount;
                            
                            database.ref('ledgers/' + ledgerKey).update({
                                totalAmount: updatedAmount
                            });
                        }
                    });
                }
                
                // Close modals
                closeModal('deleteConfirmModal');
                
                // Refresh data
                loadBills();
                loadSummaryData();
                loadLatestBills();
                
                // Reset current bill ID
                currentBillId = null;
                
                alert('Bill deleted successfully');
            })
            .catch((error) => {
                console.error('Error deleting bill:', error);
                alert('Error deleting bill. Please try again.');
            });
    });
}

async function submitBillForm(e) {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Clear previous errors
    clearValidationErrors();
    
    try {
        isSubmitting = true;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span>Validating...';
        submitBtn.disabled = true;
        
        // Get form data - UPDATED to use new fields
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const invoiceDate = document.getElementById('invoiceDate').value;
        const partyName = document.getElementById('partyName').value.trim();
        const taxableAmount = parseFloat(document.getElementById('taxableAmount').value) || 0;
        const taxAmount = parseFloat(document.getElementById('taxAmount').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        
        // Validate invoice number
        const validation = await validateInvoiceNumber(invoiceNo);
        if (!validation.isValid) {
            showValidationError('invoiceNo', validation.message);
            return;
        }
        
        // Validate other required fields
        if (!invoiceDate) {
            showValidationError('invoiceDate', 'Date is required');
            return;
        }
        
        if (!partyName) {
            showValidationError('partyName', 'Party name is required');
            return;
        }
        
        // Validate new amount fields
        if (taxableAmount <= 0) {
            showValidationError('taxableAmount', 'Taxable amount must be greater than 0');
            return;
        }
        
        if (taxAmount <= 0) {
            showValidationError('taxAmount', 'Tax amount must be greater than 0');
            return;
        }
        
        // Discount validation (can be zero, but cannot be negative)
        if (discount < 0) {
            showValidationError('discount', 'Discount cannot be negative');
            return;
        }
        
        // Calculate final amount
        const finalAmount = taxableAmount + taxAmount - discount;
        
        // Validate final amount
        if (finalAmount <= 0) {
            showValidationError('discount', 'Final amount must be greater than 0 (discount is too high)');
            return;
        }
        
        // Prepare bill data with calculated amount
        let amount = finalAmount;
        if (isCreditNoteMode) {
            amount = -Math.abs(finalAmount);
        }
        
        const billData = {
            invoiceNo: invoiceNo,
            date: invoiceDate,
            partyName: partyName,
            amount: amount, // This is the calculated final amount
            taxableAmount: taxableAmount, // Store taxable amount
            taxAmount: taxAmount, // Store tax amount
            discount: discount, // Store discount
            timestamp: Date.now(),
            type: isCreditNoteMode ? 'credit_note' : 'bill'
        };
        
        // Upload image if captured
        if (capturedImageFile) {
            try {
                submitBtn.innerHTML = '<span class="loading"></span>Uploading Image...';
                const imageUrl = await uploadImageToCloudinary(capturedImageFile);
                billData.imageUrl = imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                if (!confirm('Error uploading image, but bill will be saved without image. Continue?')) {
                    return;
                }
            }
        }
        
        submitBtn.innerHTML = '<span class="loading"></span>Saving...';
        
        // Save to Firebase
        await database.ref('bills').push(billData);
        
        // Update or create ledger entry
        const partyName_clean = billData.partyName;
        if (partyName_clean && partyName_clean.toUpperCase() !== 'CASH') {
            const ledgerSnapshot = await database.ref('ledgers').orderByChild('partyName').equalTo(partyName_clean).once('value');
            const ledgers = ledgerSnapshot.val();
            
            if (ledgers) {
                // Update existing ledger
                const ledgerKey = Object.keys(ledgers)[0];
                const existingLedger = ledgers[ledgerKey];
                
                await database.ref('ledgers/' + ledgerKey).update({
                    totalAmount: (existingLedger.totalAmount || 0) + billData.amount,
                    lastTransactionDate: billData.date
                });
            } else {
                // Create new ledger
                await database.ref('ledgers').push({
                    partyName: partyName_clean,
                    totalAmount: billData.amount,
                    lastTransactionDate: billData.date,
                    createdDate: billData.date
                });
            }
            
            // Add party if not exists
            const partySnapshot = await database.ref('parties').orderByChild('name').equalTo(partyName_clean).once('value');
            if (!partySnapshot.exists()) {
                await database.ref('parties').push({
                    name: partyName_clean,
                    createdDate: billData.date
                });
            }
        }
        
        // Reset form and states
        document.getElementById('billForm').reset();
        
        // Reset final amount display
        const finalAmountDisplay = document.getElementById('finalAmountDisplay');
        if (finalAmountDisplay) {
            finalAmountDisplay.style.display = 'none';
        }
        
        resetCameraState();
        resetToBillMode();
        closeModal('manualEntryModal');
        
        // Show success message
        alert(isCreditNoteMode ? 'Credit Note added successfully!' : 'Bill added successfully!');
        
        // Refresh data
        loadBills();
        loadSummaryData();
        loadLatestBills();
        
    } catch (error) {
        console.error('Error adding bill:', error);
        alert('Error adding bill. Please try again.');
    } finally {
        // Reset states
        isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}




function calculateFinalAmount() {
    const taxableAmount = parseFloat(document.getElementById('taxableAmount').value) || 0;
    const taxAmount = parseFloat(document.getElementById('taxAmount').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    // Calculate final amount: taxable + tax - discount
    const finalAmount = taxableAmount + taxAmount - discount;
    
    // Display the calculated amount
    const finalAmountDisplay = document.getElementById('finalAmountDisplay');
    if (finalAmountDisplay) {
        finalAmountDisplay.textContent = formatCurrency(finalAmount);
        finalAmountDisplay.style.display = 'block';
    }
    
    // Update camera button state
    updateCameraButtonState();
    
    return finalAmount;
}




// Initialize functions based on current page
function initializePage() {
    initializeCloudinaryConfig();
    injectValidationStyles();
    
    if (document.getElementById('totalBills')) {
        initializeHomepage();
    }
    
    if (document.getElementById('billsTableBody')) {
        loadBills();
        
        const invoiceDateField = document.getElementById('invoiceDate');
        if (invoiceDateField) {
            invoiceDateField.valueAsDate = new Date();
        }
        
        const billForm = document.getElementById('billForm');
        if (billForm) {
            billForm.addEventListener('submit', submitBillForm);
        }
        
        setupInvoiceValidation();
        
        // Updated form fields to include new amount fields
        const formFields = ['invoiceNo', 'invoiceDate', 'partyName', 'taxableAmount', 'taxAmount', 'discount'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', updateCameraButtonState);
                field.addEventListener('change', updateCameraButtonState);
                
                // Add calculation listener for amount fields
                if (fieldId === 'taxableAmount' || fieldId === 'taxAmount' || fieldId === 'discount') {
                    field.addEventListener('input', calculateFinalAmount);
                    field.addEventListener('change', calculateFinalAmount);
                }
            }
        });
        
        const cameraInput = document.getElementById('cameraInput');
        if (cameraInput) {
            cameraInput.addEventListener('change', handleImageCapture);
        }
        
        database.ref('bills').on('value', loadBills);
    }
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for splash screen to finish before initializing
    setTimeout(() => {
        initializeApp();
    }, 4100); // Slightly after splash screen ends
});
