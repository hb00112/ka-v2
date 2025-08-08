// Ledger.js - Classic Premium iOS Themed Ledger Section with Financial Year Filters and Targets

// Global variables for ledger
let currentPartyData = null;
let currentPartyBills = [];
let currentFilterType = 'yearly';
let currentFilterValue = getCurrentFinancialYear();

// Party targets configuration (Financial Year Based)
const partyTargets = {
    'POSHAK RETAIL': {
        quarterly: {
            Q1: 405000, // 4.05 Lakh (Apr-Jun)
            Q2: 330000, // 3.30 Lakh (Jul-Sep)
            Q3: 345000, // 3.45 Lakh (Oct-Dec)
            Q4: 420000  // 4.20 Lakh (Jan-Mar)
        },
        yearly: 1500000 // 15 Lakh (Apr-Mar)
    },
    'MAHABALESHWAR S DANGUI & CO.': {
        yearly: 600000 // 6 Lakh (Apr-Mar)
    }
};

// Financial Year Utility Functions
function getCurrentFinancialYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based (0 = January)
    
    // If current month is April (3) to December (11), FY starts with current year
    // If current month is January (0) to March (2), FY started with previous year
    if (currentMonth >= 3) { // April to December
        return `${currentYear}-${(currentYear + 1).toString().substr(-2)}`;
    } else { // January to March
        return `${currentYear - 1}-${currentYear.toString().substr(-2)}`;
    }
}

function getCurrentFinancialQuarter() {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial quarters: Q1(Apr-Jun), Q2(Jul-Sep), Q3(Oct-Dec), Q4(Jan-Mar)
    if (currentMonth >= 3 && currentMonth <= 5) { // April to June
        return 'Q1';
    } else if (currentMonth >= 6 && currentMonth <= 8) { // July to September
        return 'Q2';
    } else if (currentMonth >= 9 && currentMonth <= 11) { // October to December
        return 'Q3';
    } else { // January to March
        return 'Q4';
    }
}

function getFinancialYearFromDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    
    if (month >= 3) { // April to December
        return `${year}-${(year + 1).toString().substr(-2)}`;
    } else { // January to March
        return `${year - 1}-${year.toString().substr(-2)}`;
    }
}

function getFinancialQuarterFromDate(date) {
    const d = new Date(date);
    const month = d.getMonth();
    
    if (month >= 3 && month <= 5) return 'Q1'; // April to June
    if (month >= 6 && month <= 8) return 'Q2'; // July to September
    if (month >= 9 && month <= 11) return 'Q3'; // October to December
    return 'Q4'; // January to March
}

function parseFinancialYear(fyString) {
    // fyString format: "2024-25"
    const [startYear] = fyString.split('-');
    return {
        startYear: parseInt(startYear),
        endYear: parseInt(startYear) + 1
    };
}

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
    padding: 1.5rem;
    padding-bottom: 0;
    background: #FFFFFF;
   padding-top: 1.2rem;
}

.ledger-title {
    font-size: 15px;
    margin: 0 0 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    color: #1d1d1f;
    letter-spacing: -0.2rem;
}

/* Parties Grid */
.parties-grid {
    padding: 8px 23px 100px;
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
    padding: 10px 16px 5px;
}

.party-name {
    font-size: 14.5px;
    font-weight: 600;
    color: #1C1C1E;
    margin: 0;
    letter-spacing: -0.2px;
}

.party-amount {
    font-size: 15px;
    font-weight: 600;
    color: #0051D5;
    letter-spacing: 0.3px;
}

.party-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 15px;
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
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(1px);
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
    max-height: 95%;
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
}

.party-modal-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
}

.party-modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 0;
}

.close-party-modal-btn {
    background: transparent;
    font-weight: bold;
    border: none;
    background-color: transparent;
    color: #f86962ff;
    font-size: 13px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.close-party-modal-btn:hover {
    color: #ff3b30;
}

/* Filters Section */
.party-filters {
    margin-bottom: 20px;
}

.filter-tabs {
    display: flex;
    background: #F2F2F7;
    border-radius: 8px;
    padding: 2px;
    margin-bottom: 12px;
}

.filter-tab {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #8E8E93;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-tab.active {
    background: #FFFFFF;
    color: #007AFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.filter-dropdown {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(174, 174, 178, 0.3);
    border-radius: 8px;
    background: #FFFFFF;
    font-size: 14px;
    color: #1C1C1E;
}

.filter-nav-btn {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(174, 174, 178, 0.3);
    border-radius: 6px;
    background: #FFFFFF;
    color: #007AFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s ease;
}

.filter-nav-btn:hover {
    background: #F2F2F7;
}

.filter-nav-btn:disabled {
    color: #C7C7CC;
    cursor: not-allowed;
}

/* Target Progress */
.target-progress {
    background: #F2F2F7;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
}

.target-title {
    font-size: 13px;
    font-weight: 600;
    color: #1C1C1E;
    margin-bottom: 8px;
}

.target-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.target-achieved {
    font-size: 16px;
    font-weight: 600;
    color: #34C759;
}

.target-total {
    font-size: 14px;
    color: #8E8E93;
}

.target-bar {
    height: 6px;
    background: rgba(174, 174, 178, 0.2);
    border-radius: 3px;
    overflow: hidden;
}

.target-fill {
    height: 100%;
    background: linear-gradient(90deg, #34C759 0%, #30D158 100%);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.target-fill.over-target {
    background: linear-gradient(90deg, #FF9500 0%, #FF6B35 100%);
}

.target-percentage {
    font-size: 12px;
    color: #8E8E93;
    text-align: center;
    margin-top: 4px;
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
    color: #048058;
    letter-spacing: -0.2px;
}

.party-modal-footer {
    padding: 20px;
    background: #FFFFFF;
    margin-bottom: 70px;
    align-items: center;
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

/* Responsive Design */
@media (max-width: 768px) {
    .ledger-title {
        font-size: 18px;
        margin: 0 0 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #1d1d1f;
    }
    
    .party-modal {
        max-height: 85%;
        z-index: 2000;
        height: 100%;
    }
    
    .party-modal-summary {
        flex-direction: column;
        gap: 12px;
    }
    
    .filter-tabs {
        flex-wrap: wrap;
    }
    
    .filter-tab {
        min-width: 60px;
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
    
    .target-bar {
        border: 1px solid #8E8E93;
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
                    <div class="party-modal-title-row">
                        <h2 class="party-modal-title" id="partyModalTitle">Party Name</h2>
                        <button class="close-party-modal-btn" onclick="closePartyModal()">Close</button>
                    </div>
                    
                    <!-- Filters Section -->
                    <div class="party-filters">
                        <div class="filter-tabs">
                            <button class="filter-tab active" onclick="setFilterType('yearly')">FY Yearly</button>
                            <button class="filter-tab" onclick="setFilterType('quarterly')">FY Quarterly</button>
                            <button class="filter-tab" onclick="setFilterType('monthly')">Monthly</button>
                        </div>
                        <div class="filter-selector" id="filterSelector">
                            <!-- Filter controls will be inserted here -->
                        </div>
                    </div>

                    <!-- Target Progress (if applicable) -->
                    <div class="target-progress" id="targetProgress" style="display: none;">
                        <div class="target-title" id="targetTitle">Target Progress</div>
                        <div class="target-amount">
                            <span class="target-achieved" id="targetAchieved">₹0</span>
                            <span class="target-total">of <span id="targetTotal">₹0</span></span>
                        </div>
                        <div class="target-bar">
                            <div class="target-fill" id="targetFill" style="width: 0%"></div>
                        </div>
                        <div class="target-percentage" id="targetPercentage">0% achieved</div>
                    </div>
                    
                    <div class="party-modal-summary">
                        <div class="summary-item">
                            <div class="summary-value count" id="partyBillsCount">0</div>
                            <div class="summary-label">Bills</div>
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
                <div class="party-modal-footer"></div>
            </div>
        </div>
    `;
    
    // Insert ledger page after bills page
    const billsPage = document.getElementById('billsPage');
    if (billsPage) {
        billsPage.insertAdjacentHTML('afterend', ledgerPageHTML);
    }
}

// Show ledger page
function showLedgerPage() {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show ledger page
    const ledgerPage = document.getElementById('ledgerPage');
    if (ledgerPage) {
        ledgerPage.style.display = 'block';
        loadLedgerParties();
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.nav-item:nth-child(3)').classList.add('active');
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

// Set filter type
function setFilterType(type) {
    currentFilterType = type;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update filter controls
    updateFilterControls();
    
    // Update display
    updatePartyDisplay();
}

// Update filter controls based on type
function updateFilterControls() {
    const filterSelector = document.getElementById('filterSelector');
    if (!filterSelector) return;
    
    if (currentFilterType === 'yearly') {
        // Reset to current financial year
        currentFilterValue = getCurrentFinancialYear();
        
        filterSelector.innerHTML = `
            <select class="filter-dropdown" onchange="updateFilterValue(this.value)">
                ${generateFinancialYearOptions()}
            </select>
        `;
    } else if (currentFilterType === 'quarterly') {
        // Reset to current financial quarter
        const currentFY = getCurrentFinancialYear();
        const currentQuarter = getCurrentFinancialQuarter();
        currentFilterValue = `${currentFY}-${currentQuarter}`;
        
        filterSelector.innerHTML = `
            <select class="filter-dropdown" onchange="updateFilterValue(this.value)">
                ${generateFinancialQuarterOptions()}
            </select>
        `;
    } else if (currentFilterType === 'monthly') {
        // Reset to current month (keep this normal)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        currentFilterValue = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
        
        filterSelector.innerHTML = `
            <select class="filter-dropdown" onchange="updateFilterValue(this.value)">
                ${generateMonthOptions()}
            </select>
        `;
    }
}

// Generate financial year options
function generateFinancialYearOptions() {
    const currentFY = getCurrentFinancialYear();
    const currentStartYear = parseInt(currentFY.split('-')[0]);
    let options = '';
    
    // Generate options for current FY and 4 previous FYs
    for (let year = currentStartYear; year >= currentStartYear - 4; year--) {
        const fyString = `${year}-${(year + 1).toString().substr(-2)}`;
        const selected = fyString === currentFilterValue ? 'selected' : '';
        options += `<option value="${fyString}" ${selected}>FY ${fyString}</option>`;
    }
    
    return options;
}

// Generate financial quarter options
function generateFinancialQuarterOptions() {
    const currentFY = getCurrentFinancialYear();
    const currentStartYear = parseInt(currentFY.split('-')[0]);
    let options = '';
    
    // Generate options for current FY and 2 previous FYs
    for (let year = currentStartYear; year >= currentStartYear - 2; year--) {
        const fyString = `${year}-${(year + 1).toString().substr(-2)}`;
        
        // Add quarters in reverse order (Q4, Q3, Q2, Q1)
        for (let quarter = 4; quarter >= 1; quarter--) {
            const value = `${fyString}-Q${quarter}`;
            const selected = value === currentFilterValue ? 'selected' : '';
            
            // Quarter display with months
            const quarterMonths = {
                1: 'Apr-Jun',
                2: 'Jul-Sep', 
                3: 'Oct-Dec',
                4: 'Jan-Mar'
            };
            
            options += `<option value="${value}" ${selected}>FY ${fyString} Q${quarter} (${quarterMonths[quarter]})</option>`;
        }
    }
    
    return options;
}

// Generate month options (keep normal)
function generateMonthOptions() {
    const currentYear = new Date().getFullYear();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let options = '';
    
    for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let month = 11; month >= 0; month--) {
            const value = `${year}-${(month + 1).toString().padStart(2, '0')}`;
            const selected = value === currentFilterValue ? 'selected' : '';
            options += `<option value="${value}" ${selected}>${months[month]} ${year}</option>`;
        }
    }
    
    return options;
}

// Update filter value from dropdown
function updateFilterValue(value) {
    currentFilterValue = value;
    updatePartyDisplay();
}

// Filter bills based on current filter (Financial Year based)
function filterBillsByPeriod(bills) {
    if (currentFilterType === 'yearly') {
        // Financial year filtering (Apr 1 to Mar 31)
        const { startYear, endYear } = parseFinancialYear(currentFilterValue);
        
        return bills.filter(bill => {
            const billDate = new Date(bill.date);
            const billFY = getFinancialYearFromDate(bill.date);
            return billFY === currentFilterValue;
        });
    } else if (currentFilterType === 'quarterly') {
        // Financial quarter filtering
        const [fyPart, quarter] = currentFilterValue.split('-Q');
        const quarterNum = parseInt(quarter);
        
        return bills.filter(bill => {
            const billFY = getFinancialYearFromDate(bill.date);
            const billQuarter = getFinancialQuarterFromDate(bill.date);
            
            return billFY === fyPart && billQuarter === `Q${quarterNum}`;
        });
    } else if (currentFilterType === 'monthly') {
        // Normal monthly filtering (unchanged)
        const [year, month] = currentFilterValue.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        
        return bills.filter(bill => {
            const billDate = new Date(bill.date);
            return billDate.getFullYear() === yearNum && 
                   billDate.getMonth() + 1 === monthNum;
        });
    }
    
    return bills;
}

// Update party display based on current filter
function updatePartyDisplay() {
    if (!currentPartyData) return;
    
    // Filter bills for current period
    const filteredBills = filterBillsByPeriod(currentPartyData.bills);
    const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    // Update summary
    document.getElementById('partyBillsCount').textContent = filteredBills.length;
    document.getElementById('partyTotalAmount').textContent = formatCurrency(totalAmount);
    
    // Update target progress
    updateTargetProgress(totalAmount);
    
    // Update bills list
    const billsList = document.getElementById('partyBillsList');
    billsList.innerHTML = '';
    
    const sortedBills = filteredBills.sort((a, b) => 
        new Date(b.date || 0) - new Date(a.date || 0)
    );
    
    if (sortedBills.length === 0) {
        billsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #8E8E93;">
                <i class="fas fa-calendar-times" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
                <p>No bills found for this period</p>
            </div>
        `;
        return;
    }
    
    sortedBills.forEach(bill => {
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
}

// Update target progress (Financial Year based)
function updateTargetProgress(currentAmount) {
    const partyName = currentPartyData.name;
    const targetSection = document.getElementById('targetProgress');
    
    // Check if party has targets
    if (!partyTargets[partyName]) {
        targetSection.style.display = 'none';
        return;
    }
    
    const targets = partyTargets[partyName];
    let targetAmount = 0;
    let targetTitle = '';
    
    // Determine target based on filter type
    if (currentFilterType === 'yearly') {
        if (targets.yearly) {
            targetAmount = targets.yearly;
            targetTitle = `FY ${currentFilterValue} Target`;
        }
    } else if (currentFilterType === 'quarterly' && targets.quarterly) {
        const quarter = currentFilterValue.split('-Q')[1];
        const quarterKey = `Q${quarter}`;
        if (targets.quarterly[quarterKey]) {
            targetAmount = targets.quarterly[quarterKey];
            const fyPart = currentFilterValue.split('-Q')[0];
            targetTitle = `FY ${fyPart} Q${quarter} Target`;
        }
    }
    
    // Show/hide target section
    if (targetAmount === 0) {
        targetSection.style.display = 'none';
        return;
    }
    
    targetSection.style.display = 'block';
    
    // Calculate progress
    const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
    const isOverTarget = currentAmount > targetAmount;
    
    // Update target display
    document.getElementById('targetTitle').textContent = targetTitle;
    document.getElementById('targetAchieved').textContent = formatCurrency(currentAmount);
    document.getElementById('targetTotal').textContent = formatCurrency(targetAmount);
    
    const targetFill = document.getElementById('targetFill');
    targetFill.style.width = `${percentage}%`;
    
    if (isOverTarget) {
        targetFill.classList.add('over-target');
        document.getElementById('targetPercentage').textContent = 
            `${Math.round((currentAmount / targetAmount) * 100)}% achieved (Target exceeded!)`;
        document.getElementById('targetPercentage').style.color = '#FF9500';
    } else {
        targetFill.classList.remove('over-target');
        document.getElementById('targetPercentage').textContent = 
            `${Math.round(percentage)}% achieved`;
        document.getElementById('targetPercentage').style.color = '#8E8E93';
    }
}

// Open party modal with bills
function openPartyModal(partyData) {
    currentPartyData = partyData;
    currentPartyBills = partyData.bills.sort((a, b) => 
        new Date(b.date || 0) - new Date(a.date || 0)
    );
    
    // Reset to financial yearly view
    currentFilterType = 'yearly';
    currentFilterValue = getCurrentFinancialYear();
    
    // Update modal header
    document.getElementById('partyModalTitle').textContent = partyData.name;
    
    // Reset filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.filter-tab').classList.add('active');
    
    // Update filter controls
    updateFilterControls();
    
    // Update display
    updatePartyDisplay();
    
    // Hide navigation buttons
    document.querySelector('.footer-nav').style.display = 'none';
    
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
    
    // Show navigation buttons again
    document.querySelector('.footer-nav').style.display = 'flex';
    
    // Remove body scroll lock
    document.body.style.overflow = '';
    
    // Reset data
    currentPartyData = null;
    currentPartyBills = [];
    currentFilterType = 'yearly';
    currentFilterValue = getCurrentFinancialYear();
}

// Show bill details from ledger (reuse existing function)
function showBillDetailsFromLedger(billId) {
    closePartyModal();
    setTimeout(() => {
        showBillDetails(billId);
    }, 300);
}

// Initialize ledger section
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
window.setFilterType = setFilterType;
window.updateFilterValue = updateFilterValue;
