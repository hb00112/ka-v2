//billlist.js Global variables for bill list functionality
let allBillsData = [];
let currentEditBillId = null;
let editCapturedImageFile = null;
let isCreditNoteMode = false;

// View All Bills Functions
function viewAllBills() {
    // Create and show the all bills modal
    showAllBillsModal();
    loadAllBillsData();
}

function showAllBillsModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('allBillsModal');
    if (!modal) {
        modal = createAllBillsModal();
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
}

function createAllBillsModal() {
    const modal = document.createElement('div');
    modal.id = 'allBillsModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="all-bills-modal">
            <div class="modal-header">
            <button class="close-b" onclick="closeAllBillsModal()">
            <i class="fas fa-chevron-left"></i>
            </button>
                <h2>All Bills</h2>
                
            </div>
          <div class="modal-body">
    <div class="bills-filter-section">
        <div class="filter-controls">

            <!-- Search input with embedded SVG -->
            <div class="search-wrapper">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"/>
                </svg>
                <input type="text" id="billSearchInput" placeholder="Search by Invoice No or Party Name" class="search-input">
            </div>

            <!-- Filter select with embedded SVG -->
<div class="select-wrapper">
    <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M3 4a1 1 0 0 1 .8-.98A1 1 0 0 1 5 3h14a1 1 0 0 1 .8.98 1 1 0 0 1-.2.62l-5.6 7.47V19a1 1 0 0 1-1.6.8l-2-1.5a1 1 0 0 1-.4-.8v-5.6L3.2 4.62A1 1 0 0 1 3 4z"/>
    </svg>
    <select id="billSortOrder" class="sort-select">
        <option value="asc">Invoice No. (A-Z)</option>
        <option value="desc">Invoice No. (Z-A)</option>
        <option value="date-new">Date (Newest First)</option>
        <option value="date-old">Date (Oldest First)</option>
    </select>

        </div>
    </div>
</div>

                <div class="all-bills-container">
                    <div class="all-bills-header">
                        <div>Date</div>
                        <div>I No.</div>
                        <div>Party Name</div>
                        <div>Amount</div>
                        <div>Actions</div>
                    </div>
                    <div id="allBillsList" class="all-bills-list">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading bills...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAllBillsModal();
        }
    });
    
    return modal;
}

function loadAllBillsData() {
    database.ref('bills').once('value', (snapshot) => {
        const bills = snapshot.val();
        const billsList = document.getElementById('allBillsList');
        
        if (!bills || !billsList) {
            if (billsList) {
                billsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <h3>No Bills Found</h3>
                        <p>No bills have been uploaded yet</p>
                    </div>
                `;
            }
            return;
        }
        
        // Convert to array and store globally
        allBillsData = Object.entries(bills).map(([key, value]) => ({
            id: key,
            ...value
        }));
        
        // Sort by invoice number (ascending) by default
        sortBillsData('asc');
        renderAllBills(allBillsData);
        
        // Add event listeners for search and sort
        setupBillFilters();
    });
}

function sortBillsData(sortOrder) {
    switch(sortOrder) {
        case 'asc':
            allBillsData.sort((a, b) => {
                const aInvoice = a.invoiceNo || '';
                const bInvoice = b.invoiceNo || '';
                return aInvoice.localeCompare(bInvoice, undefined, { numeric: true });
            });
            break;
        case 'desc':
            allBillsData.sort((a, b) => {
                const aInvoice = a.invoiceNo || '';
                const bInvoice = b.invoiceNo || '';
                return bInvoice.localeCompare(aInvoice, undefined, { numeric: true });
            });
            break;
        case 'date-new':
            allBillsData.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            break;
        case 'date-old':
            allBillsData.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            break;
    }
}

function renderAllBills(billsToRender) {
    const billsList = document.getElementById('allBillsList');
    if (!billsList) return;
    
    if (billsToRender.length === 0) {
        billsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Bills Found</h3>
                <p>No bills match your search criteria</p>
            </div>
        `;
        return;
    }
    
    billsList.innerHTML = '';
    
    billsToRender.forEach(bill => {
        const isCreditNote = bill.type === 'credit_note' || bill.amount < 0;
        const amountClass = bill.amount < 0 ? 'negative-amount' : '';
        const billRow = document.createElement('div');
        billRow.className = 'all-bills-row';
        billRow.innerHTML = `
            <div class="bill-date">${formatDate(bill.date)}</div>
            <div class="bill-invoice">
                ${bill.invoiceNo || 'N/A'}
                ${isCreditNote ? '<span class="cn-badge">CN</span>' : ''}
            </div>
            <div class="bill-party">${bill.partyName || 'N/A'}</div>
            <div class="bill-amount ${amountClass}">
                ${formatCurrency(bill.amount || 0)}
            </div>
            <div class="bill-actions">
                <button class="action-btn view-btn" onclick="showBillDetailsFromList('${bill.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="openEditBillModal('${bill.id}')" title="Edit Bill">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteBillFromList('${bill.id}')" title="Delete Bill">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        billsList.appendChild(billRow);
    });
}


function setupBillFilters() {
    const searchInput = document.getElementById('billSearchInput');
    const sortSelect = document.getElementById('billSortOrder');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterBills);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortBillsData(this.value);
            filterBills(); // Apply current filter after sorting
        });
    }
}

function filterBills() {
    const searchTerm = document.getElementById('billSearchInput')?.value.toLowerCase() || '';
    
    let filteredBills = allBillsData;
    
    if (searchTerm) {
        filteredBills = allBillsData.filter(bill => {
            const invoiceNo = (bill.invoiceNo || '').toLowerCase();
            const partyName = (bill.partyName || '').toLowerCase();
            return invoiceNo.includes(searchTerm) || partyName.includes(searchTerm);
        });
    }
    
    renderAllBills(filteredBills);
}

function closeAllBillsModal() {
    const modal = document.getElementById('allBillsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Updated function to show new professional bill details modal
function showBillDetailsFromList(billId) {
    currentBillId = billId;
    
    database.ref('bills/' + billId).once('value', (snapshot) => {
        const bill = snapshot.val();
        
        if (!bill) {
            alert('Bill not found');
            return;
        }
        
        // Show bill details modal
        showBillDetailModalNew(bill);
        
        // Keep the all bills modal open in the background
        const allBillsModal = document.getElementById('allBillsModal');
        if (allBillsModal) {
            allBillsModal.style.zIndex = '1000'; // Lower z-index
        }
    });
}

function showBillDetailModalNew(billData) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('billDetailModalNew');
    if (!modal) {
        modal = createBillDetailModalNew();
        document.body.appendChild(modal);
        
        // Wait for the next tick to ensure DOM is ready
        setTimeout(() => {
            populateBillDetailModalNew(billData);
            modal.style.zIndex = '10001';
            modal.classList.add('active');
        }, 10);
    } else {
        // Modal exists, populate immediately
        populateBillDetailModalNew(billData);
        modal.style.zIndex = '10001';
        modal.classList.add('active');
    }
}


 
function createBillDetailModalNew() {
    const modal = document.createElement('div');
    modal.id = 'billDetailModalNew';
    modal.className = 'modal-overlay bill-detail-modal-overlay';
    modal.innerHTML = `
        <div class="bill-detail-modal-new">
            <div class="bill-detail-header">
                <h2>Bill Details</h2>
                <button class="bill-detail-close-btn" onclick="closeBillDetailModalNew()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="bill-detail-content"> 
                <div class="bill-info-list">
                    <!-- Changed IDs to be more specific and consistent -->
                    <div class="bill-info-row">
                        <span class="bill-label">Invoice Number</span>
                        <span class="bill-value" id="billDetailInvoiceNo">-</span>
                    </div>
                    
                    <div class="bill-info-row">
                        <span class="bill-label">Invoice Date</span>
                        <span class="bill-value" id="billDetailInvoiceDate">-</span>
                    </div>
                    
                    <div class="bill-info-row">
                        <span class="bill-label">Party Name</span>
                        <span class="bill-value" id="billDetailPartyName">-</span>
                    </div>
                    
                    <div class="bill-info-row">
                        <span class="bill-label">Amount</span>
                        <span class="bill-value bill-amount" id="billDetailAmount">-</span>
                    </div>
                </div>
                
                <div class="bill-image-section" id="billDetailImageSection" style="display: none;">
                    <div class="bill-image-header">
                        <span>Bill Preview</span>
                        <button class="image-expand-btn" onclick="openImageFullscreen()" title="View Fullscreen">
                            <i class="fas fa-expand-alt"></i>
                        </button>
                    </div>
                    <div class="bill-image-container">
                        <img id="billDetailImage" src="" alt="Bill Image" onclick="openImageFullscreen()">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeBillDetailModalNew();
        }
    });
    
    return modal;
}
function populateBillDetailModalNew(billData) {
    // Debug: Verify we're getting the right data
    console.log('Raw bill data:', billData);
    console.log('Invoice No:', billData.invoiceNo);
    console.log('Party Name:', billData.partyName);
    console.log('Amount:', billData.amount);

    // Check if it's a credit note
    const isCreditNote = billData.type === 'credit_note' || billData.amount < 0;
    
    // Set values with new IDs
    const invoiceNoElement = document.getElementById('billDetailInvoiceNo');
    invoiceNoElement.textContent = billData.invoiceNo || 'N/A';
    if (isCreditNote) {
        invoiceNoElement.innerHTML += ' <span class="cn-badge">CN</span>';
    }

    document.getElementById('billDetailInvoiceDate').textContent = billData.date ? formatDate(billData.date) : 'N/A';
    document.getElementById('billDetailPartyName').textContent = billData.partyName || 'N/A';

    // Handle amount with color based on value
    const amountElement = document.getElementById('billDetailAmount');
    amountElement.textContent = billData.amount ? formatCurrency(billData.amount) : '₹0.00';
    if (isCreditNote) {
        amountElement.classList.add('negative-amount');
    } else {
        amountElement.classList.remove('negative-amount');
    }

    // Handle image with new ID
    const imageSection = document.getElementById('billDetailImageSection');
    const billImage = document.getElementById('billDetailImage');
    
    if (billData.imageUrl) {
        billImage.src = billData.imageUrl;
        imageSection.style.display = 'block';
    } else {
        imageSection.style.display = 'none';
    }
}

function closeBillDetailModalNew() {
    const modal = document.getElementById('billDetailModalNew');
    if (modal) {
        modal.classList.remove('active');
        // Don't remove the modal from DOM, just hide it
        // The all bills modal should still be visible behind it
    }
}

function openImageFullscreen() {
    const billImage = document.getElementById('detailBillImage');
    if (billImage && billImage.src) {
        // Create fullscreen overlay
        const fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.className = 'fullscreen-image-overlay';
        fullscreenOverlay.innerHTML = `
            <div class="fullscreen-image-container">
                <button class="fullscreen-close-btn" onclick="closeImageFullscreen()">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${billImage.src}" alt="Bill Image Fullscreen">
            </div>
        `;
        
        fullscreenOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImageFullscreen();
            }
        });
        
        document.body.appendChild(fullscreenOverlay);
        setTimeout(() => fullscreenOverlay.classList.add('active'), 10);
    }
}

function closeImageFullscreen() {
    const overlay = document.querySelector('.fullscreen-image-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function deleteBillFromList(billId) {
    currentBillId = billId;
    
    // Close bill detail modal if open
    const detailModal = document.getElementById('billDetailModalNew');
    if (detailModal && detailModal.classList.contains('active')) {
        closeBillDetailModalNew();
    }
    
    // Close all bills modal
    closeAllBillsModal();
    
    setTimeout(() => {
        confirmDeleteBill();
    }, 300);
}

// Edit Bill Functions
function openEditBillModal(billId) {
    currentEditBillId = billId;
    editCapturedImageFile = null;
    
    database.ref('bills/' + billId).once('value', (snapshot) => {
        const bill = snapshot.val();
        
        if (!bill) {
            alert('Bill not found');
            return;
        }
        
        // Create and show edit modal
        showEditBillModal(bill);
    });
}

function showEditBillModal(billData) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('editBillModal');
    if (!modal) {
        modal = createEditBillModal();
        document.body.appendChild(modal);
    }
    
    // Populate form with existing data
    document.getElementById('editInvoiceNo').value = billData.invoiceNo || '';
    document.getElementById('editInvoiceDate').value = billData.date || '';
    document.getElementById('editPartyName').value = billData.partyName || '';
    document.getElementById('editAmount').value = billData.amount || '';
    
    // Handle existing image
    const editPhotoPreview = document.getElementById('editPhotoPreview');
    const editPreviewImg = document.getElementById('editPreviewImg');
    const editCameraBtn = document.getElementById('editCameraBtn');
    const editRetakeBtn = document.getElementById('editRetakeBtn');
    
    if (billData.imageUrl) {
        editPreviewImg.src = billData.imageUrl;
        editPhotoPreview.style.display = 'block';
        editCameraBtn.style.display = 'none';
        editRetakeBtn.style.display = 'flex';
    } else {
        editPhotoPreview.style.display = 'none';
        editCameraBtn.style.display = 'flex';
        editRetakeBtn.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function createEditBillModal() {
    const modal = document.createElement('div');
    modal.id = 'editBillModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="edit-bill-modal">
            <div class="modal-header">
                <h2>Edit Bill</h2>
                <button class="close-btn" onclick="closeEditBillModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="editBillForm" onsubmit="submitEditBillForm(event)">
                    <div class="form-group">
                        <label for="editInvoiceNo">Invoice Number*</label>
                        <input type="text" id="editInvoiceNo" name="editInvoiceNo" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editInvoiceDate">Invoice Date*</label>
                        <input type="date" id="editInvoiceDate" name="editInvoiceDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editPartyName">Party Name*</label>
                        <input type="text" id="editPartyName" name="editPartyName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editAmount">Amount*</label>
                        <input type="number" id="editAmount" name="editAmount" step="0.01" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Bill Photo</label>
                        <div class="camera-section">
                            <button type="button" id="editCameraBtn" class="camera-btn" onclick="openEditCamera()">
                                <i class="fas fa-camera"></i>
                                <span>Take Photo</span>
                            </button>
                            
                            <div id="editPhotoPreview" class="photo-preview" style="display: none;">
                                <img id="editPreviewImg" src="" alt="Bill Preview">
                            </div>
                            
                            <button type="button" id="editRetakeBtn" class="retake-btn" onclick="retakeEditPhoto()" style="display: none;">
                                <i class="fas fa-redo"></i>
                                <span>Retake Photo</span>
                            </button>
                            
                            <input type="file" id="editCameraInput" accept="image/*" capture="environment" style="display: none;">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" onclick="closeEditBillModal()">Cancel</button>
                        <button type="submit" id="editSubmitBtn" class="submit-btn">
                            <i class="fas fa-save"></i>
                            Update Bill
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditBillModal();
        }
    });
    
    // Add camera input event listener
    const editCameraInput = modal.querySelector('#editCameraInput');
    editCameraInput.addEventListener('change', handleEditImageCapture);
    
    return modal;
}

function closeEditBillModal() {
    const modal = document.getElementById('editBillModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditBillId = null;
    editCapturedImageFile = null;
}

function openEditCamera() {
    const editCameraInput = document.getElementById('editCameraInput');
    if (editCameraInput) {
        editCameraInput.click();
    }
}

function handleEditImageCapture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    editCapturedImageFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const editPreviewImg = document.getElementById('editPreviewImg');
        const editCameraBtn = document.getElementById('editCameraBtn');
        const editPhotoPreview = document.getElementById('editPhotoPreview');
        const editRetakeBtn = document.getElementById('editRetakeBtn');
        
        if (editPreviewImg) editPreviewImg.src = e.target.result;
        if (editCameraBtn) editCameraBtn.style.display = 'none';
        if (editPhotoPreview) editPhotoPreview.style.display = 'block';
        if (editRetakeBtn) editRetakeBtn.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function retakeEditPhoto() {
    editCapturedImageFile = null;
    const editCameraBtn = document.getElementById('editCameraBtn');
    const editPhotoPreview = document.getElementById('editPhotoPreview');
    const editRetakeBtn = document.getElementById('editRetakeBtn');
    const editCameraInput = document.getElementById('editCameraInput');
    
    if (editCameraBtn) editCameraBtn.style.display = 'flex';
    if (editPhotoPreview) editPhotoPreview.style.display = 'none';
    if (editRetakeBtn) editRetakeBtn.style.display = 'none';
    if (editCameraInput) editCameraInput.value = '';
    
    // Reset preview image
    const editPreviewImg = document.getElementById('editPreviewImg');
    if (editPreviewImg) editPreviewImg.src = '';
}

async function submitEditBillForm(e) {
    e.preventDefault();
    
    if (!currentEditBillId) {
        alert('No bill selected for editing');
        return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
        return;
    }
    
    const submitBtn = document.getElementById('editSubmitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Clear previous errors
    clearValidationErrors();
    
    try {
        isSubmitting = true;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span>Validating...';
        submitBtn.disabled = true;
        
        // Get form data
        const invoiceNo = document.getElementById('editInvoiceNo').value.trim();
        const invoiceDate = document.getElementById('editInvoiceDate').value;
        const partyName = document.getElementById('editPartyName').value.trim();
        const amount = parseFloat(document.getElementById('editAmount').value);
        
        // Validate invoice number (excluding current bill)
        const validation = await validateInvoiceNumber(invoiceNo, currentEditBillId);
        if (!validation.isValid) {
            showValidationError('editInvoiceNo', validation.message);
            return;
        }
        
        // Validate other required fields
        if (!invoiceDate) {
            showValidationError('editInvoiceDate', 'Date is required');
            return;
        }
        
        if (!partyName) {
            showValidationError('editPartyName', 'Party name is required');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            showValidationError('editAmount', 'Please enter a valid amount');
            return;
        }
        
        // Get current bill data first
        const currentBillSnapshot = await database.ref('bills/' + currentEditBillId).once('value');
        const currentBillData = currentBillSnapshot.val();
        
        if (!currentBillData) {
            throw new Error('Bill not found');
        }
        
        // Prepare updated bill data
        const updatedBillData = {
            invoiceNo: invoiceNo,
            date: invoiceDate,
            partyName: partyName,
            amount: amount,
            timestamp: currentBillData.timestamp,
            type: currentBillData.type || 'bill',
            imageUrl: currentBillData.imageUrl
        };
        
        // Upload new image if captured
        if (editCapturedImageFile) {
            try {
                submitBtn.innerHTML = '<span class="loading"></span>Uploading Image...';
                const imageUrl = await uploadImageToCloudinary(editCapturedImageFile);
                updatedBillData.imageUrl = imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                if (!confirm('Error uploading image, but bill will be saved without new image. Continue?')) {
                    throw error;
                }
            }
        }
        
        submitBtn.innerHTML = '<span class="loading"></span>Updating...';
        
        // Update bill in Firebase
        await database.ref('bills/' + currentEditBillId).update(updatedBillData);
        
        // Update ledger logic (same as before)
        const oldPartyName = currentBillData.partyName;
        const newPartyName = updatedBillData.partyName;
        const oldAmount = currentBillData.amount || 0;
        const newAmount = updatedBillData.amount || 0;
        
        if (oldPartyName !== newPartyName || oldAmount !== newAmount) {
            // Remove from old ledger
            if (oldPartyName && oldPartyName.toUpperCase() !== 'CASH') {
                const oldLedgerSnapshot = await database.ref('ledgers').orderByChild('partyName').equalTo(oldPartyName).once('value');
                const oldLedgers = oldLedgerSnapshot.val();
                if (oldLedgers) {
                    const oldLedgerKey = Object.keys(oldLedgers)[0];
                    const oldLedger = oldLedgers[oldLedgerKey];
                    const updatedOldAmount = (oldLedger.totalAmount || 0) - oldAmount;
                    await database.ref('ledgers/' + oldLedgerKey).update({
                        totalAmount: updatedOldAmount
                    });
                }
            }
            
            // Add to new ledger
            if (newPartyName && newPartyName.toUpperCase() !== 'CASH') {
                const newLedgerSnapshot = await database.ref('ledgers').orderByChild('partyName').equalTo(newPartyName).once('value');
                const newLedgers = newLedgerSnapshot.val();
                
                if (newLedgers) {
                    const newLedgerKey = Object.keys(newLedgers)[0];
                    const newLedger = newLedgers[newLedgerKey];
                    await database.ref('ledgers/' + newLedgerKey).update({
                        totalAmount: (newLedger.totalAmount || 0) + newAmount,
                        lastTransactionDate: updatedBillData.date
                    });
                } else {
                    await database.ref('ledgers').push({
                        partyName: newPartyName,
                        totalAmount: newAmount,
                        lastTransactionDate: updatedBillData.date,
                        createdDate: updatedBillData.date
                    });
                }
                
                // Add party if not exists
                const partySnapshot = await database.ref('parties').orderByChild('name').equalTo(newPartyName).once('value');
                if (!partySnapshot.exists()) {
                    await database.ref('parties').push({
                        name: newPartyName,
                        createdDate: updatedBillData.date
                    });
                }
            }
        }
        
        // Close modal and refresh data
        closeEditBillModal();
        alert('Bill updated successfully!');
        
        loadBills();
        loadSummaryData();
        loadLatestBills();
        
        if (document.getElementById('allBillsModal')?.classList.contains('active')) {
            loadAllBillsData();
        }
        
    } catch (error) {
        console.error('Error updating bill:', error);
        alert('Error updating bill. Please try again.');
    } finally {
        isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Add real-time invoice validation on input
function setupInvoiceValidation() {
    const invoiceField = document.getElementById('invoiceNo');
    const editInvoiceField = document.getElementById('editInvoiceNo');
    
    if (invoiceField) {
        let validationTimeout;
        invoiceField.addEventListener('input', function() {
            clearTimeout(validationTimeout);
            clearFieldError('invoiceNo');
            
            const value = this.value.trim();
            if (value) {
                validationTimeout = setTimeout(async () => {
                    const validation = await validateInvoiceNumber(value);
                    if (!validation.isValid) {
                        showValidationError('invoiceNo', validation.message);
                    }
                }, 500); // Debounce for 500ms
            }
        });
    }
    
    if (editInvoiceField) {
        let editValidationTimeout;
        editInvoiceField.addEventListener('input', function() {
            clearTimeout(editValidationTimeout);
            clearFieldError('editInvoiceNo');
            
            const value = this.value.trim();
            if (value) {
                editValidationTimeout = setTimeout(async () => {
                    const validation = await validateInvoiceNumber(value, currentEditBillId);
                    if (!validation.isValid) {
                        showValidationError('editInvoiceNo', validation.message);
                    }
                }, 500);
            }
        });
    }
}

// CSS for validation styles (add to your stylesheet)
const validationStyles = `
.field-error {
    border-color: #ff3b30 !important;
    background-color: rgba(255, 59, 48, 0.05) !important;
}

.validation-error-message {
    color: #ff3b30;
    font-size: 12px;
    margin-top: 4px;
    margin-bottom: 8px;
    padding: 4px 8px;
    background-color: rgba(255, 59, 48, 0.1);
    border-radius: 6px;
    border-left: 3px solid #ff3b30;
    animation: slideIn 0.2s ease-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.loading {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;

// Inject validation styles
function injectValidationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = validationStyles;
    document.head.appendChild(styleSheet);
}

