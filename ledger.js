// Ledger.js - Classic Premium iOS Themed Ledger Section

// Global variables for ledger
let currentPartyData = null;
let currentPartyBills = [];

// Inject CSS styles for ledger section
function injectLedgerStyles() {
    const styles = `
        <style id="ledger-styles">
        /* Ledger Page Styles - Classic Premium iOS Theme */

/* Main Ledger Container */
.ledger-page {
    background: #FFFFFF;
    min-height: 100vh;
}

.ledger-container {
    background: #FFFFFF;
    min-height: 100vh;
}

.ledger-header {
    padding: 20px 20px 16px;
    background: #FFFFFF;
    border-bottom: 0.33px solid rgba(60, 60, 67, 0.08);
}

.ledger-title {
    font-size: 32px;
    font-weight: 700;
    color: #1C1C1E;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
}

.ledger-subtitle {
    font-size: 16px;
    font-weight: 400;
    color: #8E8E93;
    margin: 0;
}

/* Parties Grid */
.parties-grid {
    padding: 8px 16px 100px;
    background: #FFFFFF;
}

.party-card {
    background: #FFFFFF;
    border: 0.33px solid rgba(174, 174, 178, 0.2);
    border-radius: 10px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.party-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.party-card:active {
    transform: translateY(0);
    background: rgba(0, 0, 0, 0.02);
}

.party-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 8px;
}

.party-name {
    font-size: 17px;
    font-weight: 600;
    color: #1C1C1E;
    margin: 0;
    letter-spacing: -0.2px;
}

.party-amount {
    font-size: 17px;
    font-weight: 600;
    color: #1C1C1E;
    letter-spacing: -0.2px;
}

.party-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 16px;
}

.party-bills-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #8E8E93;
    font-weight: 400;
}

.party-bills-count i {
    font-size: 12px;
    color: #8E8E93;
}

.party-last-transaction {
    font-size: 14px;
    color: #8E8E93;
    font-weight: 400;
}

/* Loading State */
.loading-party-card {
    background: #FFFFFF;
    border: 0.33px solid rgba(174, 174, 178, 0.2);
    border-radius: 10px;
    margin-bottom: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.loading-skeleton {
    background: linear-gradient(90deg, #F2F2F7 25%, #E5E5EA 50%, #F2F2F7 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
    margin-bottom: 8px;
}

.loading-party-name {
    height: 20px;
    width: 60%;
}

.loading-party-amount {
    height: 20px;
    width: 30%;
    margin-left: auto;
    margin-bottom: 12px;
}

.loading-party-details {
    height: 16px;
    width: 40%;
    margin-bottom: 0;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Empty State */
.empty-ledger-state {
    text-align: center;
    padding: 80px 20px;
    color: #8E8E93;
    background: #FFFFFF;
}

.empty-ledger-state i {
    font-size: 48px;
    color: rgba(174, 174, 178, 0.5);
    margin-bottom: 20px;
}

.empty-ledger-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1C1C1E;
    margin: 0 0 8px 0;
    letter-spacing: -0.3px;
}

.empty-ledger-state p {
    font-size: 16px;
    color: #8E8E93;
    margin: 0;
    line-height: 1.4;
}

/* Party Modal */
.party-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.party-modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.party-modal {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    border-radius: 13px 13px 0 0;
    max-height: 85vh;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
}

.party-modal-overlay.active .party-modal {
    transform: translateY(0);
}

.party-modal-handle {
    padding: 8px 0 12px;
    text-align: center;
    background: #FFFFFF;
    border-radius: 13px 13px 0 0;
}

.modal-handle-bar {
    width: 36px;
    height: 5px;
    background: rgba(174, 174, 178, 0.4);
    border-radius: 3px;
    margin: 0 auto;
}

.party-modal-header {
    padding: 0 20px 20px;
    background: #FFFFFF;
    border-bottom: 0.33px solid rgba(60, 60, 67, 0.08);
}

.party-modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #1C1C1E;
    margin: 0 0 16px 0;
    letter-spacing: -0.4px;
}

.party-modal-summary {
    display: flex;
    gap: 24px;
}

.summary-item {
    text-align: left;
}

.summary-value {
    font-size: 20px;
    font-weight: 600;
    color: #1C1C1E;
    margin-bottom: 2px;
    letter-spacing: -0.3px;
}

.summary-value.count {
    color: #1C1C1E;
}

.summary-value.amount {
    color: #1C1C1E;
}

.summary-label {
    font-size: 13px;
    color: #8E8E93;
    font-weight: 400;
}

.party-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 20px 0;
    background: #FFFFFF;
}

.party-bills-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 100px;
}

.party-bill-item {
    background: #FFFFFF;
    border: 0.33px solid rgba(174, 174, 178, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.party-bill-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.party-bill-item:active {
    transform: translateY(0);
    background: rgba(0, 0, 0, 0.02);
}

.bill-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(0, 122, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bill-icon i {
    font-size: 16px;
    color: #007AFF;
}

.bill-info {
    flex: 1;
    min-width: 0;
}

.bill-invoice-no {
    font-size: 14px;
    font-weight: 600;
    color: #1C1C1E;
    margin-bottom: 2px;
    letter-spacing: -0.2px;
}

.bill-date {
    font-size: 12px;
    color: #484849ff;
    font-weight: 400;
    padding-bottom: 7px;
}

.bill-amount {
    font-size: 14px;
    font-weight: 600;
    color: #048058
    letter-spacing: -0.2px;
    padding-right: 3px;
}

.party-modal-footer {
    padding: 20px;
    background: #FFFFFF;
    border-top: 0.33px solid rgba(60, 60, 67, 0.08);
}

.close-party-modal-btn {
    width: 100%;
    height: 50px;
    background: #007AFF;
    border: none;
    border-radius: 10px;
    color: #FFFFFF;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.close-party-modal-btn:hover {
    background: #0056CC;
    transform: translateY(-1px);
}

.close-party-modal-btn:active {
    background: #004999;
    transform: translateY(0);
}

/* Page Content */
.page-content {
    background: #FFFFFF;
    min-height: 100vh;
}

/* Refined Typography */
* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* iOS Style System Font Stack */
body, input, button, textarea {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* Responsive Design */
@media (max-width: 768px) {
    .ledger-title {
        font-size: 28px;
    }
    
    .party-modal {
        max-height: 90vh;
    }
    
    .party-modal-summary {
        flex-direction: column;
        gap: 12px;
    }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .party-card {
        border: 1px solid #8E8E93;
    }
    
    .party-bill-item {
        border: 1px solid #8E8E93;
    }
}

/* Dark Mode Support (Optional) */
@media (prefers-color-scheme: dark) {
    .ledger-page,
    .ledger-container,
    .ledger-header,
    .parties-grid,
    .page-content,
    .party-modal,
    .party-modal-handle,
    .party-modal-header,
    .party-modal-content,
    .party-modal-footer {
        background: #000000;
    }
    
    .party-card,
    .party-bill-item,
    .loading-party-card {
        background: #1C1C1E;
        border-color: rgba(84, 84, 88, 0.3);
    }
    
    .ledger-title,
    .party-name,
    .party-amount,
    .party-modal-title,
    .summary-value,
    .bill-invoice-no,
    .bill-amount,
    .empty-ledger-state h3 {
        color: #FFFFFF;
    }
    
    .ledger-subtitle,
    .party-bills-count,
    .party-last-transaction,
    .summary-label,
    .bill-date,
    .empty-ledger-state p {
        color: #98989D;
    }
    
    .party-bills-count i {
        color: #98989D;
    }
    
    .bill-icon {
        background: rgba(0, 122, 255, 0.15);
    }
    
    .party-modal-overlay {
        background: rgba(0, 0, 0, 0.6);
    }
    
    .modal-handle-bar {
        background: rgba(84, 84, 88, 0.6);
    }
    
    .loading-skeleton {
        background: linear-gradient(90deg, #1C1C1E 25%, #2C2C2E 50%, #1C1C1E 75%);
        background-size: 200% 100%;
    }
}
        </style>
    `;
    
    // Remove existing ledger styles
    const existingStyles = document.getElementById('ledger-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    // Inject new styles
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Create ledger page HTML structure
function createLedgerPage() {
    const ledgerPageHTML = `
        <div id="ledgerPage" class="page-content" style="display: none;">
            <div class="ledger-container">
                <div class="ledger-header">
                    <h1 class="ledger-title">Ledger</h1>
                    <p class="ledger-subtitle">Party-wise Bill Summary</p>
                </div>
                <div class="parties-grid" id="partiesGrid">
                    <!-- Loading state will be inserted here -->
                </div>
            </div>
        </div>
        
        <!-- Party Details Modal -->
        <div class="party-modal-overlay" id="partyModal">
            <div class="party-modal">
                <div class="party-modal-handle">
                    <div class="modal-handle-bar"></div>
                </div>
                <div class="party-modal-header">
                    <h2 class="party-modal-title" id="partyModalTitle">Party Name</h2>
                    <div class="party-modal-summary">
                        <div class="summary-item">
                            <div class="summary-value count" id="partyBillsCount">0</div>
                            <div class="summary-label">Total Bills</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value amount" id="partyTotalAmount">₹0</div>
                            <div class="summary-label">Total Amount</div>
                        </div>
                    </div>
                </div>
                <div class="party-modal-content">
                    <div class="party-bills-list" id="partyBillsList">
                        <!-- Bills will be inserted here -->
                    </div>
                </div>
                <div class="party-modal-footer">
                    <button class="close-party-modal-btn" onclick="closePartyModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Insert ledger page after bills page
    const billsPage = document.getElementById('billsPage');
    if (billsPage) {
        billsPage.insertAdjacentHTML('afterend', ledgerPageHTML);
    }
}

// Show loading skeleton
function showLoadingSkeleton() {
    const partiesGrid = document.getElementById('partiesGrid');
    if (!partiesGrid) return;
    
    const skeletonHTML = Array.from({length: 5}, () => `
        <div class="loading-party-card">
            <div class="loading-skeleton loading-party-name"></div>
            <div class="loading-skeleton loading-party-amount"></div>
            <div class="loading-skeleton loading-party-details"></div>
        </div>
    `).join('');
    
    partiesGrid.innerHTML = skeletonHTML;
}

// Load all parties from Firebase
function loadLedgerParties() {
    const partiesGrid = document.getElementById('partiesGrid');
    if (!partiesGrid) return;
    
    showLoadingSkeleton();
    
    // Get all bills grouped by party
    database.ref('bills').once('value', (snapshot) => {
        const bills = snapshot.val();
        
        if (!bills) {
            partiesGrid.innerHTML = `
                <div class="empty-ledger-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Ledger Entries</h3>
                    <p>Add some bills to see party ledgers here</p>
                </div>
            `;
            return;
        }
        
        // Group bills by party
        const partiesData = {};
        Object.entries(bills).forEach(([billId, bill]) => {
            const partyName = bill.partyName;
            if (!partyName || partyName === 'CASH') return;
            
            if (!partiesData[partyName]) {
                partiesData[partyName] = {
                    name: partyName,
                    bills: [],
                    totalAmount: 0,
                    lastTransactionDate: null
                };
            }
            
            partiesData[partyName].bills.push({
                id: billId,
                ...bill
            });
            
            partiesData[partyName].totalAmount += bill.amount || 0;
            
            // Update last transaction date
            const billDate = new Date(bill.date);
            if (!partiesData[partyName].lastTransactionDate || 
                billDate > new Date(partiesData[partyName].lastTransactionDate)) {
                partiesData[partyName].lastTransactionDate = bill.date;
            }
        });
        
        // Sort parties by total amount (descending)
        const sortedParties = Object.values(partiesData)
            .sort((a, b) => b.totalAmount - a.totalAmount);
        
        if (sortedParties.length === 0) {
            partiesGrid.innerHTML = `
                <div class="empty-ledger-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Party Ledgers</h3>
                    <p>All transactions are cash transactions</p>
                </div>
            `;
            return;
        }
        
        // Render parties
        partiesGrid.innerHTML = '';
        sortedParties.forEach(party => {
            const partyCard = document.createElement('div');
            partyCard.className = 'party-card';
            partyCard.onclick = () => openPartyModal(party);
            
            partyCard.innerHTML = `
                <div class="party-header">
                    <h3 class="party-name">${party.name}</h3>
                    <div class="party-amount">${formatCurrency(party.totalAmount)}</div>
                </div>
                <div class="party-details">
                    <div class="party-bills-count">
                        <i class="fas fa-file-invoice"></i>
                        <span>${party.bills.length} bills</span>
                    </div>
                    <div class="party-last-transaction">
                        ${party.lastTransactionDate ? formatDate(party.lastTransactionDate) : 'No date'}
                    </div>
                </div>
            `;
            
            partiesGrid.appendChild(partyCard);
        });
    });
}

// Open party modal with bills
function openPartyModal(partyData) {
    currentPartyData = partyData;
    currentPartyBills = partyData.bills.sort((a, b) => 
        new Date(b.date || 0) - new Date(a.date || 0)
    );
    
    // Update modal header
    document.getElementById('partyModalTitle').textContent = partyData.name;
    document.getElementById('partyBillsCount').textContent = partyData.bills.length;
    document.getElementById('partyTotalAmount').textContent = formatCurrency(partyData.totalAmount);
    
    // Render bills list
    const billsList = document.getElementById('partyBillsList');
    billsList.innerHTML = '';
    
    currentPartyBills.forEach(bill => {
        const billItem = document.createElement('div');
        billItem.className = 'party-bill-item';
        billItem.onclick = () => showBillDetailsFromLedger(bill.id);
        
        billItem.innerHTML = `
            <div class="bill-icon">
                <i class="fas fa-file-invoice"></i>
            </div>
            <div class="bill-info">
                <div class="bill-invoice-no">${bill.invoiceNo || 'INV-' + bill.id.substr(-6).toUpperCase()}</div>
                <div class="bill-date">${bill.date ? formatDateLong(bill.date) : 'No date'}</div>
            </div>
            <div class="bill-amount">${formatCurrency(bill.amount || 0)}</div>
        `;
        
        billsList.appendChild(billItem);
    });
    
    // Show modal
    const modal = document.getElementById('partyModal');
    modal.classList.add('active');
    
    // Add body scroll lock
    document.body.style.overflow = 'hidden';
}

// Close party modal
function closePartyModal() {
    const modal = document.getElementById('partyModal');
    modal.classList.remove('active');
    
    // Remove body scroll lock
    document.body.style.overflow = '';
    
    // Reset data
    currentPartyData = null;
    currentPartyBills = [];
}

// Show bill details from ledger (reuse existing function)
function showBillDetailsFromLedger(billId) {
    closePartyModal();
    setTimeout(() => {
        showBillDetails(billId);
    }, 300);
}

// Show ledger page


// Initialize ledger section
// Remove the updateBackButtonBehavior function completely as we don't need it anymore

// Update the initializeLedger function to remove back button references:
function initializeLedger() {
    // Inject CSS styles
    injectLedgerStyles();
    
    // Create ledger page structure
    createLedgerPage();
    
    // Update navigation to include ledger
    const ledgerNavItem = document.querySelector('.nav-item:nth-child(3)');
    if (ledgerNavItem) {
        ledgerNavItem.onclick = showLedgerPage;
    }
    
    // Add modal event listeners
    const partyModal = document.getElementById('partyModal');
    if (partyModal) {
        // Close modal when clicking overlay
        partyModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closePartyModal();
            }
        });
        
        // Prevent modal close when clicking inside modal
        const modalContent = partyModal.querySelector('.party-modal');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // Listen for data changes
    database.ref('bills').on('value', () => {
        // Only reload if ledger page is visible
        const ledgerPage = document.getElementById('ledgerPage');
        if (ledgerPage && ledgerPage.style.display !== 'none') {
            loadLedgerParties();
        }
    });
}

// Updated navigation function to handle back button from ledger


// Utility function to format currency (if not already defined)
if (typeof formatCurrency === 'undefined') {
    function formatCurrency(amount) {
        return '₹' + (amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }
}

// Utility function to format date (if not already defined)
if (typeof formatDate === 'undefined') {
    function formatDate(dateString) {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Utility function to format date long (if not already defined)
if (typeof formatDateLong === 'undefined') {
    function formatDateLong(dateString) {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize ledger when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        initializeLedger();
       
    }, 100);
});

// Export functions for global access
window.showLedgerPage = showLedgerPage;
window.closePartyModal = closePartyModal;
