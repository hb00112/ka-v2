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
            submitBtn.style.backgroundColor = '#d32f2f';
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
            submitBtn.style.backgroundColor = '#1976d2';
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
    const amount = document.getElementById('amount').value.trim();
    
    const allFieldsFilled = invoiceNo && invoiceDate && partyName && amount;
    
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
function loadSummaryData() {
    // Load total bills
    database.ref('bills').once('value', (snapshot) => {
        const bills = snapshot.val();
        const totalBills = bills ? Object.keys(bills).length : 0;
        const totalBillsElement = document.getElementById('totalBills');
        if (totalBillsElement) {
            totalBillsElement.textContent = totalBills;
            totalBillsElement.className = totalBills > 0 ? 'value' : 'value empty';
        }
        
        // Calculate total amount
        if (bills) {
            const totalAmount = Object.values(bills).reduce((sum, bill) => sum + (bill.amount || 0), 0);
            const totalAmountElement = document.getElementById('totalAmount');
            if (totalAmountElement) {
                totalAmountElement.textContent = formatCurrency(totalAmount);
                totalAmountElement.className = 'value';
            }
        } else {
            const totalAmountElement = document.getElementById('totalAmount');
            if (totalAmountElement) {
                totalAmountElement.textContent = '--';
                totalAmountElement.className = 'value empty';
            }
        }
    });

    // Load parties count
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
    loadLatestBills();
    loadRecentLedgers();

    // Set up real-time listeners for updates
    database.ref('bills').on('value', () => {
        loadSummaryData();
        loadLatestBills();
    });
    database.ref('ledgers').on('value', loadRecentLedgers);
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
            const billRow = document.createElement('div');
            billRow.className = 'bill-row';
            billRow.style.cursor = 'pointer';
            billRow.onclick = () => showBillDetails(bill.id);
            billRow.innerHTML = `
                <div class="date">${formatDate(bill.date)}</div>
                <div class="invoice">${bill.invoiceNo}</div>
                <div class="party">${bill.partyName}</div>
                <div class="amount">${formatCurrency(bill.amount)}</div>
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
        document.getElementById('detailAmount').textContent = bill.amount ? formatCurrency(bill.amount) : '₹0';
        
        // Calculate ledger balance (for now, just show the bill amount)
        document.getElementById('detailLedgerBalance').textContent = bill.amount ? formatCurrency(bill.amount) : '₹0';
        
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
        
        // Get form data
        const invoiceNo = document.getElementById('invoiceNo').value.trim();
        const invoiceDate = document.getElementById('invoiceDate').value;
        const partyName = document.getElementById('partyName').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        
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
        
        if (isNaN(amount) || amount <= 0) {
            showValidationError('amount', 'Please enter a valid amount');
            return;
        }
        
        // Prepare bill data
        let finalAmount = amount;
        if (isCreditNoteMode) {
            finalAmount = -Math.abs(amount);
        }
        
        const billData = {
            invoiceNo: invoiceNo,
            date: invoiceDate,
            partyName: partyName,
            amount: finalAmount,
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
        
        const formFields = ['invoiceNo', 'invoiceDate', 'partyName', 'amount'];
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', updateCameraButtonState);
                field.addEventListener('change', updateCameraButtonState);
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
document.addEventListener('DOMContentLoaded', initializePage);
