// report.js - Professional Report Generation Module

// Global variables for report generation
let currentReportType = '';
let currentReportData = null;
let currentReportPeriod = '';

// Initialize report module
function initializeReports() {
    // Inject report styles
    injectReportStyles();
    
    // Create report modal structure
    createReportModal();
    
    // Load required libraries
    loadReportLibraries();
}

// Inject report styles with professional iOS theme
function injectReportStyles() {
    const styles = `
        <style id="report-styles">
        @font-face {
    font-family: 'SF Pro Text';
    src: url('SF-Pro-Text-Regular.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

        
        /* Report Modal Styles - Professional iOS Theme */
        .report-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .report-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .report-modal {
            background: #ffffff;
           
            border-radius: 20px;
            width: 80%;
            max-width: 500px;
            max-height: 90vh;
            overflow: hidden;
         
            transform: translateY(30px) scale(0.95);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            
        }
        
        .report-modal-overlay.active .report-modal {
            transform: translateY(0) scale(1);
        }
        
        .report-modal-header {
            padding: 15px 25px 2px;
            background: #fff;
            border-bottom: none;
            color: #fff;
            position: relative;
            overflow: hidden;
        }
        
        .report-modal-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .report-modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        
        }
        
        .report-modal-title i {
            font-size: 22px;
        }
        
        .report-modal-body {
            padding: 25px;
            max-height: 60vh;
            overflow-y: auto;
            background: #ffffff;
        }
        
        .report-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .report-option {
            padding: 20px;
            border: 2px solid rgba(226, 232, 240, 0.8);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
        }
        
        .report-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
            transition: left 0.6s ease;
        }
        
        .report-option:hover::before {
            left: 100%;
        }
        
        .report-option:hover {
            background: rgba(255, 255, 255, 1);
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        }
        
        .report-option.selected {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
        }
        
        .report-option-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .report-option-icon {
            font-size: 24px;
            opacity: 0.8;
        }
        
        .report-option.selected .report-option-icon {
            opacity: 1;
            color: white;
        }
        
        .report-option-title {
            font-weight: 600;
            font-size: 16px;
            color: #1e293b;
            margin: 0;
        }
        
        .report-option.selected .report-option-title {
            color: white;
        }
        
        .report-option-description {
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
            margin: 0;
        }
        
        .report-option.selected .report-option-description {
            color: rgba(255, 255, 255, 0.9);
        }
        
        .report-period-selector {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            border: 2px solid rgba(226, 232, 240, 0.8);
        }
        
        .report-period-label {
            display: block;
            margin-bottom: 12px;
            font-weight: 600;
            color: #334155;
            font-size: 15px;
        }
        
        .report-period-select {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid rgba(226, 232, 240, 0.8);
            border-radius: 12px;
            font-size: 15px;
            background: rgba(255, 255, 255, 0.9);
            color: #334155;
            transition: all 0.3s ease;
            font-family: 'SF Pro Text';
            backdrop-filter: blur(10px);
        }
        
        .report-period-select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .report-action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 25px;
            flex-wrap: wrap;
        }
        
        .report-action-btn {
            flex: 1;
            min-width: 120px;
            padding: 14px 20px;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'SF Pro Text';
            text-transform: none;
            letter-spacing: 0.5px;
        }
        
        .report-action-btn i {
            font-size: 16px;
        }
        
        .report-action-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .report-action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .report-action-btn.secondary {
            background: rgba(100, 116, 139, 0.1);
            color: #64748b;
            border: 2px solid rgba(100, 116, 139, 0.2);
        }
        
        .report-action-btn.secondary:hover {
            background: rgba(100, 116, 139, 0.15);
            transform: translateY(-1px);
        }
        
        .report-export-modal {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            padding: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }
        
        .report-export-title {
            margin: 0 0 25px;
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .report-export-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .report-export-btn {
            padding: 16px 24px;
            border: none;
            border-radius: 14px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-width: 120px;
            font-family: 'SF Pro Text';
        }
        
        .report-export-btn i {
            font-size: 18px;
        }
        
        .report-export-btn.pdf {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .report-export-btn.pdf:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }
        
        .report-export-btn.excel {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .report-export-btn.excel:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        
        /* Loading indicator */
        .report-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: rgba(248, 250, 252, 0.8);
        }
        
        .report-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(102, 126, 234, 0.2);
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .report-loading-text {
            color: #64748b;
            font-size: 16px;
            font-weight: 500;
        }
        
        /* Global loading overlay */
        .report-global-loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'SF Pro Text';
        }
        
        .report-global-loading .report-loading-spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            width: 56px;
            height: 56px;
        }
        
        .report-global-loading .report-loading-text {
            color: white;
            font-size: 18px;
            margin-top: 20px;
        }
        
        /* Close button */
        .report-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .report-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .report-close-btn i {
            font-size: 14px;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .report-modal {
                width: 80%;
                margin: 20px;
            }
            
            .report-modal-body {
                padding: 20px;
            }
            
            .report-action-buttons {
                flex-direction: column;
            }
            
            .report-action-btn {
                flex: none;
            }
            
            .report-export-buttons {
                flex-direction: column;
            }
        }
        </style>
    `;
    
    // Remove existing report styles if any
    const existingStyles = document.getElementById('report-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    // Inject new styles
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Create report modal structure
function createReportModal() {
    const modalHTML = `
        <div class="report-modal-overlay" id="reportModal">
            <div class="report-modal">
                <div class="report-modal-header">
                    <h3 class="report-modal-title">
                     
                        Generate Report
                    </h3>
                    <button class="report-close-btn" onclick="closeReportModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="report-modal-body" id="reportModalBody">
                    <!-- Content will be injected here -->
                </div>
            </div>
        </div>
        
        <div class="report-modal-overlay" id="reportExportModal">
            <div class="report-export-modal">
                <h3 class="report-export-title">
                    <i class="fas fa-download"></i>
                    Export Report As
                </h3>
                <div class="report-export-buttons">
                    <button class="report-export-btn pdf" onclick="exportReport('pdf')">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="report-export-btn excel" onclick="exportReport('excel')">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insert modals into the DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add click outside to close functionality
    document.getElementById('reportModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReportModal();
        }
    });
    
    document.getElementById('reportExportModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeExportModal();
        }
    });
}

// Load required libraries
function loadReportLibraries() {
    const libraries = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
    ];
    
    let loadedCount = 0;
    
    libraries.forEach(src => {
        loadScript(src, () => {
            loadedCount++;
            if (loadedCount === libraries.length) {
                console.log('All report libraries loaded successfully');
            }
        });
    });
}

// Helper function to load scripts
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => console.error(`Failed to load: ${src}`);
    document.head.appendChild(script);
}

// Show report generation modal
function generateReport() {
    // Hide navigation buttons
    const footerNav = document.querySelector('.footer-nav');
    if (footerNav) {
        footerNav.style.display = 'none';
    }
    
    // Show report modal
    const modal = document.getElementById('reportModal');
    modal.classList.add('active');
    
    // Set initial content
    document.getElementById('reportModalBody').innerHTML = `
        <div class="report-options">
            <div class="report-option" onclick="selectReportType('financialYear')">
                <div class="report-option-header">
                    <i class="fas fa-calendar-alt report-option-icon"></i>
                    <div>
                        <div class="report-option-title">Financial Year Report</div>
                        <div class="report-option-description">Generate report for a financial year (Apr-Mar)</div>
                    </div>
                </div>
            </div>
            <div class="report-option" onclick="selectReportType('quarterly')">
                <div class="report-option-header">
                    <i class="fas fa-chart-pie report-option-icon"></i>
                    <div>
                        <div class="report-option-title">Quarterly Report</div>
                        <div class="report-option-description">Generate report for a financial quarter</div>
                    </div>
                </div>
            </div>
            <div class="report-option" onclick="selectReportType('monthly')">
                <div class="report-option-header">
                    <i class="fas fa-calendar-day report-option-icon"></i>
                    <div>
                        <div class="report-option-title">Monthly Report</div>
                        <div class="report-option-description">Generate report for a specific month</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add body scroll lock
    document.body.style.overflow = 'hidden';
}

// Select report type
// With this corrected version:
// Updated generateReportData function with proper period selection handling
function generateReportData(reportDetailType) {
    // Get selected period FIRST before showing loading state
    const periodSelect = document.getElementById('reportPeriodSelect');
    if (periodSelect && periodSelect.value) {
        currentReportPeriod = periodSelect.value;
        console.log('Period selected from dropdown:', currentReportPeriod);
    } else {
        console.warn('No period selected, using fallback');
        // Fallback to current periods if selection fails
        if (currentReportType === 'financialYear') {
            currentReportPeriod = getCurrentFinancialYear();
        } else if (currentReportType === 'quarterly') {
            const currentFY = getCurrentFinancialYear();
            const currentQuarter = getCurrentFinancialQuarter();
            currentReportPeriod = `${currentFY}-Q${currentQuarter}`;
        } else if (currentReportType === 'monthly') {
            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            currentReportPeriod = `${now.getFullYear()}-${month}`;
        }
    }
    
    console.log('Final report period before generation:', currentReportPeriod);
    console.log('Report type:', currentReportType);
    console.log('Report detail type:', reportDetailType);
    
    // Show loading state AFTER getting the period
    document.getElementById('reportModalBody').innerHTML = `
        <div class="report-loading">
            <div class="report-loading-spinner"></div>
            <div class="report-loading-text">Generating report data...</div>
        </div>
    `;
    
    // Check if Firebase database is available
    if (typeof database === 'undefined' || !database) {
        alert('Database connection not available. Please check your Firebase configuration.');
        closeReportModal();
        return;
    }
    
    // Fetch bills data
    database.ref('bills').once('value', (snapshot) => {
        const allBills = snapshot.val();
        
        console.log('Raw bills data:', allBills);
        
        if (!allBills) {
            alert('No bill data available to generate report');
            closeReportModal();
            return;
        }
        
        // Convert to array and add some debug info
        const billsArray = Object.entries(allBills).map(([id, bill]) => ({ id, ...bill }));
        console.log('Bills array length:', billsArray.length);
        console.log('Sample bill dates:', billsArray.slice(0, 3).map(b => b.date));
        
        // Filter by period using the correctly set currentReportPeriod
        const filteredBills = filterBillsByReportPeriod(billsArray);
        
        console.log('Filtered bills length:', filteredBills.length);
        console.log('Used period for filtering:', currentReportPeriod);
        
        if (filteredBills.length === 0) {
            let periodText = getPeriodText();
            alert(`No bills found for the selected period: ${periodText}`);
            closeReportModal();
            return;
        }
        
        // Process data based on report detail type
        if (reportDetailType === 'summarized') {
            currentReportData = generateSummarizedReportData(filteredBills);
        } else {
            currentReportData = generateDetailedReportData(filteredBills);
        }
        
        console.log('Generated report data:', currentReportData);
        
        // Close report modal and show export options
        closeReportModal();
        showExportModal();
    }).catch(error => {
        console.error('Error fetching bills data:', error);
        alert('Error fetching data. Please try again.');
        closeReportModal();
    });
}

// Updated selectReportType function with better period handling
function selectReportType(type) {
    currentReportType = type;
    
    // Highlight selected option
    document.querySelectorAll('.report-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.report-option').classList.add('selected');
    
    // Update modal content based on report type
    let periodSelectorHTML = '';
    let defaultPeriod = '';
    
    if (type === 'financialYear') {
        defaultPeriod = getCurrentFinancialYear();
        periodSelectorHTML = `
            <div class="report-period-selector">
                <label class="report-period-label">
                    <i class="fas fa-calendar-alt"></i> Select Financial Year:
                </label>
                <select class="report-period-select" id="reportPeriodSelect" onchange="updateSelectedPeriod()">
                    ${generateFinancialYearOptions()}
                </select>
            </div>
        `;
    } else if (type === 'quarterly') {
        const currentFY = getCurrentFinancialYear();
        const currentQuarter = getCurrentFinancialQuarter();
        defaultPeriod = `${currentFY}-Q${currentQuarter}`;
        
        console.log('Quarterly Debug:');
        console.log('- currentFY:', currentFY);
        console.log('- currentQuarter:', currentQuarter, typeof currentQuarter);
        console.log('- defaultPeriod:', defaultPeriod);
        
        periodSelectorHTML = `
            <div class="report-period-selector">
                <label class="report-period-label">
                    <i class="fas fa-chart-pie"></i> Select Financial Quarter:
                </label>
                <select class="report-period-select" id="reportPeriodSelect" onchange="updateSelectedPeriod()">
                    ${generateFinancialQuarterOptions()}
                </select>
            </div>
        `;
    } else if (type === 'monthly') {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        defaultPeriod = `${currentDate.getFullYear()}-${currentMonth.toString().padStart(2, '0')}`;
        periodSelectorHTML = `
            <div class="report-period-selector">
                <label class="report-period-label">
                    <i class="fas fa-calendar-day"></i> Select Month:
                </label>
                <select class="report-period-select" id="reportPeriodSelect" onchange="updateSelectedPeriod()">
                    ${generateMonthOptions()}
                </select>
            </div>
        `;
    }
    
    // Set the current report period to default
    currentReportPeriod = defaultPeriod;
    console.log('Set default period:', currentReportPeriod);
    
    const reportTitles = {
        'financialYear': 'Financial Year Report',
        'quarterly': 'Quarterly Report',
        'monthly': 'Monthly Report'
    };
    
    const reportDescriptions = {
        'financialYear': 'Generate report for a financial year (Apr-Mar)',
        'quarterly': 'Generate report for a financial quarter',
        'monthly': 'Generate report for a specific month'
    };
    
    const reportIcons = {
        'financialYear': 'fas fa-calendar-alt',
        'quarterly': 'fas fa-chart-pie',
        'monthly': 'fas fa-calendar-day'
    };
    
    document.getElementById('reportModalBody').innerHTML = `
        <div class="report-options">
            <div class="report-option selected">
                <div class="report-option-header">
                    <i class="${reportIcons[type]} report-option-icon"></i>
                    <div>
                        <div class="report-option-title">${reportTitles[type]}</div>
                        <div class="report-option-description">${reportDescriptions[type]}</div>
                    </div>
                </div>
            </div>
            ${periodSelectorHTML}
            <div class="report-action-buttons">
                <button class="report-action-btn secondary" onclick="generateReport()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button class="report-action-btn primary" onclick="generateReportData('summarized')">
                    <i class="fas fa-chart-bar"></i> Summarized
                </button>
                <button class="report-action-btn primary" onclick="generateReportData('detailed')">
                    <i class="fas fa-list-ul"></i> Detailed
                </button>
            </div>
        </div>
    `;
    
    // Set the current period in the select after DOM is updated
    setTimeout(() => {
        const periodSelect = document.getElementById('reportPeriodSelect');
        if (periodSelect && defaultPeriod) {
            console.log('Setting period select to:', defaultPeriod);
            periodSelect.value = defaultPeriod;
            console.log('Period select value after setting:', periodSelect.value);
            // Update the currentReportPeriod to match the selected value
            currentReportPeriod = periodSelect.value;
        }
    }, 100);
}

// New function to handle period selection changes
function updateSelectedPeriod() {
    const periodSelect = document.getElementById('reportPeriodSelect');
    if (periodSelect) {
        currentReportPeriod = periodSelect.value;
        console.log('Period updated to:', currentReportPeriod);
    }
}




// Updated generateReportData function with better error handling
function generateReportData(reportDetailType) {
    // Get selected period FIRST before showing loading state
    const periodSelect = document.getElementById('reportPeriodSelect');
    if (periodSelect && periodSelect.value) {
        currentReportPeriod = periodSelect.value;
        console.log('Period selected from dropdown:', currentReportPeriod);
    } else {
        console.warn('No period selected, using fallback');
        // Fallback to current periods if selection fails
        if (currentReportType === 'financialYear') {
            currentReportPeriod = getCurrentFinancialYear();
        } else if (currentReportType === 'quarterly') {
            const currentFY = getCurrentFinancialYear();
            const currentQuarter = getCurrentFinancialQuarter();
            currentReportPeriod = `${currentFY}-Q${currentQuarter}`;
        } else if (currentReportType === 'monthly') {
            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            currentReportPeriod = `${now.getFullYear()}-${month}`;
        }
    }
    
    console.log('Final report period before generation:', currentReportPeriod);
    console.log('Report type:', currentReportType);
    console.log('Report detail type:', reportDetailType);
    
    // Show loading state AFTER getting the period
    document.getElementById('reportModalBody').innerHTML = `
        <div class="report-loading">
            <div class="report-loading-spinner"></div>
            <div class="report-loading-text">Generating report data...</div>
        </div>
    `;
    
    // Check if Firebase database is available
    if (typeof database === 'undefined' || !database) {
        alert('Database connection not available. Please check your Firebase configuration.');
        closeReportModal();
        return;
    }
    
    // Fetch bills data
    database.ref('bills').once('value', (snapshot) => {
        const allBills = snapshot.val();
        
        console.log('Raw bills data:', allBills);
        
        if (!allBills) {
            alert('No bill data available to generate report');
            closeReportModal();
            return;
        }
        
        // Convert to array and add some debug info
        const billsArray = Object.entries(allBills).map(([id, bill]) => ({ id, ...bill }));
        console.log('Bills array length:', billsArray.length);
        console.log('Sample bill dates:', billsArray.slice(0, 3).map(b => b.date));
        
        // Filter by period using the correctly set currentReportPeriod
        const filteredBills = filterBillsByReportPeriod(billsArray);
        
        console.log('Filtered bills length:', filteredBills.length);
        console.log('Used period for filtering:', currentReportPeriod);
        
        if (filteredBills.length === 0) {
            let periodText = getPeriodText();
            alert(`No bills found for the selected period: ${periodText}`);
            closeReportModal();
            return;
        }
        
        // Process data based on report detail type
        if (reportDetailType === 'summarized') {
            currentReportData = generateSummarizedReportData(filteredBills);
        } else {
            currentReportData = generateDetailedReportData(filteredBills);
        }
        
        console.log('Generated report data:', currentReportData);
        
        // Close report modal and show export options
        closeReportModal();
        showExportModal();
    }).catch(error => {
        console.error('Error fetching bills data:', error);
        alert('Error fetching data. Please try again.');
        closeReportModal();
    });
}


// Filter bills by report period
function filterBillsByReportPeriod(bills) {
    console.log('=== FILTERING BILLS ===');
    console.log('Total bills to filter:', bills.length);
    console.log('Report type:', currentReportType);
    console.log('Report period:', currentReportPeriod);
    
    if (currentReportType === 'financialYear') {
        console.log('Filtering by Financial Year:', currentReportPeriod);
        
        const filtered = bills.filter(bill => {
            const billFY = getFinancialYearFromDate(bill.date);
            const match = billFY === currentReportPeriod;
            if (match) {
                console.log(`Bill ${bill.id}: Date=${bill.date}, FY=${billFY}, MATCH`);
            }
            return match;
        });
        
        console.log('Financial Year filtered bills:', filtered.length);
        if (filtered.length === 0) {
            console.log('No bills found for FY:', currentReportPeriod);
            console.log('Sample bill FYs:', bills.slice(0, 5).map(b => ({
                date: b.date,
                fy: getFinancialYearFromDate(b.date)
            })));
        }
        return filtered;
        
    } else if (currentReportType === 'quarterly') {
        console.log('Filtering by Quarter:', currentReportPeriod);
        
        // Validate period format
        if (!currentReportPeriod || !currentReportPeriod.includes('-Q')) {
            console.error('Invalid quarterly period format:', currentReportPeriod);
            alert('Invalid quarterly period format. Please select a valid quarter.');
            return [];
        }
        
        const [fyPart, quarterPart] = currentReportPeriod.split('-Q');
        const targetQuarter = parseInt(quarterPart);
        
        console.log('Quarterly filter details:');
        console.log('- Target FY:', fyPart);
        console.log('- Target Quarter:', targetQuarter);
        
        if (isNaN(targetQuarter) || targetQuarter < 1 || targetQuarter > 4) {
            console.error('Invalid quarter number:', quarterPart);
            alert('Invalid quarter number. Please select a valid quarter.');
            return [];
        }
        
        const filtered = bills.filter(bill => {
            if (!bill.date || bill.date === 'N/A') {
                console.log('Skipping bill with invalid date:', bill);
                return false;
            }
            
            const billFY = getFinancialYearFromDate(bill.date);
            const billQuarter = getFinancialQuarterFromDate(bill.date);
            
            const fyMatch = billFY === fyPart;
            const quarterMatch = billQuarter === targetQuarter;
            const match = fyMatch && quarterMatch;
            
            if (match) {
                console.log(`Bill ${bill.id || 'unknown'}: Date=${bill.date}, FY=${billFY}, Quarter=${billQuarter}, MATCH`);
            }
            
            return match;
        });
        
        console.log('Quarterly filtered bills:', filtered.length);
        
        if (filtered.length === 0) {
            console.log('No bills found. Debug info:');
            console.log('Sample bill analysis:');
            bills.slice(0, 5).forEach(bill => {
                const billFY = getFinancialYearFromDate(bill.date);
                const billQuarter = getFinancialQuarterFromDate(bill.date);
                console.log(`- Bill date: ${bill.date}, FY: ${billFY}, Quarter: ${billQuarter}`);
            });
        }
        
        return filtered;
        
    } else if (currentReportType === 'monthly') {
        console.log('Filtering by Month:', currentReportPeriod);
        
        const [targetYear, targetMonth] = currentReportPeriod.split('-');
        const yearNum = parseInt(targetYear);
        const monthNum = parseInt(targetMonth);
        
        console.log('Monthly filter - Target Year:', yearNum, 'Target Month:', monthNum);
        
        const filtered = bills.filter(bill => {
            if (!bill.date || bill.date === 'N/A') {
                return false;
            }
            
            const billDate = new Date(bill.date);
            if (isNaN(billDate.getTime())) {
                return false;
            }
            
            const billYear = billDate.getFullYear();
            const billMonth = billDate.getMonth() + 1;
            
            const match = billYear === yearNum && billMonth === monthNum;
            
            if (match) {
                console.log(`Bill ${bill.id}: Date=${bill.date}, Year=${billYear}, Month=${billMonth}, MATCH`);
            }
            
            return match;
        });
        
        console.log('Monthly filtered bills:', filtered.length);
        if (filtered.length === 0) {
            console.log('No bills found for period:', currentReportPeriod);
            console.log('Sample bill dates:', bills.slice(0, 5).map(b => ({
                date: b.date,
                year: new Date(b.date).getFullYear(),
                month: new Date(b.date).getMonth() + 1
            })));
        }
        return filtered;
    }
    
    console.log('No filter applied, returning all bills');
    return bills;
}





// Generate summarized report data
function generateSummarizedReportData(bills) {
    const reportData = {
        type: 'summarized',
        periodType: currentReportType,
        period: currentReportPeriod,
        generatedOn: new Date().toISOString(),
        parties: {},
        totalAmount: 0,
        totalBills: bills.length
    };
    
    bills.forEach(bill => {
        const partyName = bill.partyName || 'Unknown';
        const amount = parseFloat(bill.amount) || 0;
        
        if (!reportData.parties[partyName]) {
            reportData.parties[partyName] = {
                totalAmount: 0,
                billCount: 0,
                invoices: []
            };
        }
        
        reportData.parties[partyName].totalAmount += amount;
        reportData.parties[partyName].billCount++;
        reportData.totalAmount += amount;
        
        reportData.parties[partyName].invoices.push({
            invoiceNo: bill.invoiceNo || 'N/A',
            date: bill.date || 'N/A',
            amount: amount,
            description: bill.description || ''
        });
    });
    
    // Sort invoices by date for each party
    Object.keys(reportData.parties).forEach(partyName => {
        reportData.parties[partyName].invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return reportData;
}

// Generate detailed report data
function generateDetailedReportData(bills) {
    const reportData = {
        type: 'detailed',
        periodType: currentReportType,
        period: currentReportPeriod,
        generatedOn: new Date().toISOString(),
        parties: {},
        totalAmount: 0,
        totalBills: bills.length
    };
    
    bills.forEach(bill => {
        const partyName = bill.partyName || 'Unknown';
        const amount = parseFloat(bill.amount) || 0;
        
        if (!reportData.parties[partyName]) {
            reportData.parties[partyName] = {
                totalAmount: 0,
                billCount: 0,
                invoices: []
            };
        }
        
        reportData.parties[partyName].totalAmount += amount;
        reportData.parties[partyName].billCount++;
        reportData.totalAmount += amount;
        
        reportData.parties[partyName].invoices.push({
            invoiceNo: bill.invoiceNo || 'N/A',
            date: bill.date || 'N/A',
            amount: amount,
            description: bill.description || ''
        });
    });
    
    // Sort invoices by date for each party
    Object.keys(reportData.parties).forEach(partyName => {
        reportData.parties[partyName].invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return reportData;
}

// Show export modal
function showExportModal() {
    const modal = document.getElementById('reportExportModal');
    modal.classList.add('active');
}

// Export report in specified format
function exportReport(format) {
    closeExportModal();
    
    if (format === 'pdf') {
        generatePDFReport();
    } else if (format === 'excel') {
        generateExcelReport();
    }
}

// Generate PDF report
// Generate PDF report with improved formatting
// ================= Premium A4 PDF Report =====================
function generatePDFReport() {
    showGlobalLoadingIndicator('Generating PDF report...');
    try {
        if (typeof window.jspdf === 'undefined') throw new Error('jsPDF library not loaded');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // ---- HEADER ----
        doc.setFillColor(245, 245, 250);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 40, 49);
        doc.text('KAMBESHWAR AGENCIES', 105, 18, { align: 'center' });
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 110, 110);
        doc.text('MAPUSA - GOA', 105, 24, { align: 'center' });

        // ---- SUBTITLE and PERIOD ----
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.setTextColor(35, 35, 60);
        doc.text(getReportTitle(), 105, 38, { align: 'center' });
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.setTextColor(85,85,85);
        doc.text(getPeriodText(), 105, 44, { align: 'center' });

        const reportTypeText = currentReportData.type === 'summarized' ? 'SUMMARIZED REPORT' : 'DETAILED REPORT';
        doc.setFontSize(11); doc.setTextColor(105, 105, 125);
        doc.text(reportTypeText, 105, 50, { align: 'center' });

        const generatedDate = new Date(currentReportData.generatedOn);
        doc.setFontSize(9); doc.setTextColor(160, 160, 160);
        doc.text(
            `Generated: ${generatedDate.toLocaleDateString('en-IN')} ${generatedDate.toLocaleTimeString('en-IN')}`,
            105, 56, { align: 'center' });

        // ---- PAGE CONTENT ----
        let yPos = 65;
        if (currentReportData.type === 'summarized') {
            yPos = generatePremiumSummaryTable(doc, yPos);
        } else {
            yPos = generatePremiumDetailedTable(doc, yPos);
        }

        // ---- FOOTER ----
        doc.setDrawColor(210,210,210);
        doc.setLineWidth(0.3);
        doc.line(10, 287, 200, 287);
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Confidential • Generated by KAMBESHWAR AGENCIES | Developed by Hemant Borana', 105, 291, {align:'center'});

        // ---- SAVE ----
        const fileName = generateReportFileName('pdf');
        doc.save(fileName);
        hideGlobalLoadingIndicator();
    } catch (error) {
        console.error('Error generating PDF:', error);
        hideGlobalLoadingIndicator();
        alert('Error generating PDF report. Please try again.');
    }
}

// Helper, safe number
function safeNum(val) {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
}

// ---- PREMIUM SUMMARY TABLE ----
// Fixed generatePremiumSummaryTable function - Replace ₹ with Rs.
// ---- PREMIUM SUMMARY TABLE - Updated with amount column moved 1.5cm right ----
function generatePremiumSummaryTable(doc, y) {
    const left = 16, width = 178, rowH = 9;
    // Updated column positions - moved amount column 15mm (1.5cm) to the right
    const colPartyX = left+15, colBillsX = left+90, colAmtX = left+147, colDrCrX = left+170;
    
    // Table head
    doc.setFillColor(234, 235, 240);
    doc.rect(left, y, width, rowH, 'F');
    doc.setDrawColor(210,210,210);

    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(11); 
    doc.setTextColor(34,40,49);
    doc.text('No.', left+7, y+6, {align: 'center'});
    doc.text('Party', colPartyX+13, y+6, {align: 'left'});
    doc.text('Bills', colBillsX, y+6, {align: 'right'});
    doc.text('AMOUNT', colAmtX, y+6, {align: 'right'});
    doc.text('DR/CR', colDrCrX, y+6, {align: 'center'});

    // Prepare data
    const sorted = Object.entries(currentReportData.parties)
        .sort(([,a],[,b]) => safeNum(b.totalAmount) - safeNum(a.totalAmount));
    let serialNumber = 1;

    let yRow = y+rowH;
    const partyWidth = colBillsX - colPartyX - 8;

    sorted.forEach(([name, d]) => {
        if (yRow+rowH > 275) { 
            doc.addPage(); 
            yRow = 24; 
        }
        if (serialNumber%2===0) { 
            doc.setFillColor(248,248,252); 
            doc.rect(left, yRow-2, width, rowH, 'F'); 
        }

        doc.setFont('helvetica','normal'); 
        doc.setFontSize(10); 
        doc.setTextColor(60,60,60);
        
        doc.text(String(serialNumber), left+7, yRow+4, {align:'center'});

        // Party name truncation
        let pname = name;
        while (doc.getTextWidth(pname) > partyWidth) {
            if (pname.length < 4) break;
            pname = pname.slice(0, -2);
        }
        if (pname !== name) pname = pname.slice(0, -3) + "...";
        doc.text(pname, colPartyX, yRow+4, {align: 'left'});

        doc.setTextColor(60,60,60);
        doc.text(String(d.billCount||0), colBillsX, yRow+4, {align: 'right'});

        // Amount formatting with updated position
        const amt = safeNum(d.totalAmount);
        const absAmount = Math.abs(amt);
        const amtStr = 'Rs. ' + absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const drcr = amt < 0 ? 'Cr' : 'Dr';
        const colorArray = amt < 0 ? [220,53,69] : [40,167,69];
        
        doc.setTextColor(...colorArray); 
        doc.setFont('helvetica','bold');
        doc.text(amtStr, colAmtX, yRow+4, {align:'right'});
        
        doc.setFont('helvetica','normal');
        doc.text(drcr, colDrCrX, yRow+4, {align:'center'});

        serialNumber++;
        yRow += rowH;
    });

    // GRAND TOTAL with updated position
    doc.setFillColor(220,225,245);
    doc.rect(left, yRow-2, width, rowH+2, 'F');
    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(11);
    doc.setTextColor(34,40,49);
    doc.text('TOTAL', colPartyX+13, yRow+5, {align:'left'});
    doc.setTextColor(60,60,60);
    doc.text(String(currentReportData.totalBills||0), colBillsX, yRow+5, {align:'right'});
    
    const totalAmt = safeNum(currentReportData.totalAmount);
    const totalAbsAmount = Math.abs(totalAmt);
    const totalAmtStr = 'Rs. ' + totalAbsAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const totalCrDr = totalAmt<0 ? 'Cr' : 'Dr';
    const totalColorArray = totalAmt<0 ? [220,53,69] : [40,167,69];
    
    doc.setTextColor(...totalColorArray);
    doc.text(totalAmtStr, colAmtX, yRow+5, {align:'right'});
    doc.setFont('helvetica','normal');
    doc.text(totalCrDr, colDrCrX, yRow+5, {align:'center'});

    return yRow+rowH+5;
}

// ---- PREMIUM DETAILED TABLE - Updated with amount column moved 1.5cm right ----
// ---- PREMIUM DETAILED TABLE - Updated with better party name visibility ----
function generatePremiumDetailedTable(doc, y) {
    const left = 16, width = 178, rowH = 8;
    let yRow = y;
    
    // Updated column positions - adjusted to give more space for party names
    const colInvoiceX = left + 8;
    const colDateX = left + 65;      // Moved left to give more space for party name
    const colAmtX = left + 140;      // Moved left slightly
    const colDrCrX = left + 165;     // Moved left slightly
    const colPartyX = left + 5;
    
    const sorted = Object.entries(currentReportData.parties)
        .sort(([, a], [, b]) => safeNum(b.totalAmount) - safeNum(a.totalAmount));
    let partyNumber = 1;

    sorted.forEach(([name, d]) => {
        if (yRow + 4*rowH > 275) { 
            doc.addPage(); 
            yRow = 24; 
        }
        
        // Check if party name needs wrapping
        const fullPartyName = `${partyNumber}. ${name}`;
        const maxPartyWidth = width - 20; // Give more space for party name
        const needsWrapping = doc.getTextWidth(fullPartyName) > maxPartyWidth;
        const partyRowHeight = needsWrapping ? rowH + 6 : rowH + 2; // Extra height if wrapping
        
        doc.setFont('helvetica','bold');
        doc.setFontSize(11); 
        doc.setTextColor(60,66,85);
        doc.setFillColor(238,238,242); 
        doc.rect(left, yRow-2, width, partyRowHeight, 'F');
        
        if (needsWrapping) {
            // Split party name into two lines
            const partyNameOnly = name;
            const line1 = `${partyNumber}. `;
            let line2 = partyNameOnly;
            
            // If party name is still too long for second line, truncate it
            const maxLine2Width = width - 30;
            while (doc.getTextWidth(line2) > maxLine2Width && line2.length > 10) {
                line2 = line2.slice(0, -1);
            }
            if (line2.length < partyNameOnly.length) {
                line2 = line2.slice(0, -3) + '...';
            }
            
            // Draw two lines
            doc.text(line1, colPartyX, yRow + 3);
            doc.text(line2, colPartyX + 10, yRow + 9); // Indent second line slightly
        } else {
            // Single line - try to fit, truncate if necessary
            let displayName = fullPartyName;
            while (doc.getTextWidth(displayName) > maxPartyWidth && displayName.length > 15) {
                displayName = displayName.slice(0, -1);
            }
            if (displayName.length < fullPartyName.length) {
                displayName = displayName.slice(0, -3) + '...';
            }
            doc.text(displayName, colPartyX, yRow + 5);
        }

        // Party summary with updated positioning
        doc.setFont('helvetica','normal'); 
        doc.setFontSize(10); 
        doc.setTextColor(90,90,90);
        
        const amt = safeNum(d.totalAmount);
        const absAmount = Math.abs(amt);
        const amtStr = 'Rs. ' + absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const drcr = amt < 0 ? 'Cr' : 'Dr';
        
        // Position summary on the right side
        const summaryY = needsWrapping ? yRow + 7 : yRow + 5;
        doc.text(`Bills: ${d.billCount||0}`, colAmtX - 40, summaryY, {align:'right'});
        
        doc.setFont('helvetica','bold'); 
        doc.setTextColor(...(amt < 0 ? [220,53,69] : [40,167,69]));
        doc.text(amtStr, colAmtX, summaryY, {align:'right'});
        
        doc.setFont('helvetica','normal');
        doc.text(drcr, colDrCrX, summaryY, {align:'center'});
        
        yRow += partyRowHeight + 2;

        // Invoice headers - adjust positions to match new layout
        doc.setFont('helvetica','bold'); 
        doc.setFontSize(10); 
        doc.setTextColor(41,41,51);
        doc.setFillColor(245,245,248); 
        doc.rect(left, yRow-3, width, rowH, 'F');
        
        doc.text('Invoice No.', colInvoiceX, yRow+4);
        doc.text('Date', colDateX, yRow+4, {align: 'left'});
        doc.text('Amount', colAmtX, yRow+4, {align:'right'});
        doc.text('Dr/Cr', colDrCrX, yRow+4, {align:'center'});
        
        yRow += rowH;

        // Invoice details with updated column positions
        (d.invoices || []).forEach((inv, i) => {
            if (yRow + rowH > 275) { 
                doc.addPage(); 
                yRow = 24;
            }
            
            if (i % 2 === 1) { 
                doc.setFillColor(250,250,252); 
                doc.rect(left, yRow-3, width, rowH, 'F'); 
            }
            
            doc.setFont('helvetica','normal'); 
            doc.setFontSize(10); 
            doc.setTextColor(60,60,60);

            // Invoice number - adjusted width
            let invoiceNo = inv?.invoiceNo ? String(inv.invoiceNo) : "N/A";
            const maxInvoiceWidth = colDateX - colInvoiceX - 5;
            
            while (doc.getTextWidth(invoiceNo) > maxInvoiceWidth && invoiceNo.length > 3) {
                invoiceNo = invoiceNo.slice(0, -1);
            }
            
            if (invoiceNo.length < String(inv?.invoiceNo || "").length && invoiceNo.length > 3) {
                invoiceNo = invoiceNo.slice(0, -3) + "...";
            }
            
            doc.text(invoiceNo, colInvoiceX, yRow+4);

            // Date
            const dateStr = formatDate(inv.date);
            doc.text(dateStr, colDateX, yRow+4, {align:'left'});

            // Amount
            const invAmt = safeNum(inv.amount);
            const invAbsAmount = Math.abs(invAmt);
            const invAmtStr = 'Rs. ' + invAbsAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const invDrCr = invAmt < 0 ? 'Cr' : 'Dr';
            const invColor = invAmt < 0 ? [220,53,69] : [40,167,69];
            
            doc.setFont('helvetica','bold'); 
            doc.setTextColor(...invColor);
            doc.text(invAmtStr, colAmtX, yRow+4, {align:'right'});
            
            doc.setFont('helvetica','normal');
            doc.text(invDrCr, colDrCrX, yRow+4, {align:'center'});
            
            yRow += rowH;
        });

        partyNumber++;
        yRow += 4;
    });

    // Grand total with updated position
    if (yRow + rowH > 275) { 
        doc.addPage(); 
        yRow = 24; 
    }
    
    doc.setFillColor(225,230,245);
    doc.rect(left, yRow-2, width, rowH+2, 'F');
    doc.setFont('helvetica','bold'); 
    doc.setFontSize(11); 
    doc.setTextColor(41,41,61);
    
    doc.text('OVERALL TOTAL', left+15, yRow+5);
    doc.setTextColor(70,70,70); 
    doc.text(String(currentReportData.totalBills||0), left+80, yRow+5, {align:'right'});
    
    const finalAmt = safeNum(currentReportData.totalAmount);
    const finalAbsAmount = Math.abs(finalAmt);
    const finalAmtStr = 'Rs. ' + finalAbsAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalDrCr = finalAmt < 0 ? 'Cr' : 'Dr';
    
    doc.setTextColor(...(finalAmt < 0 ? [220,53,69] : [40,167,69]));
    doc.text(finalAmtStr, colAmtX, yRow+5, {align:'right'});
    
    doc.setFont('helvetica','normal');
    doc.text(finalDrCr, colDrCrX, yRow+5, {align:'center'});

    return yRow + rowH + 5;
}

// Also update the formatAmountForPDF function if it's used elsewhere
function formatAmountForPDF(amount) {
    if (amount === null || amount === undefined) return 'Rs. 0.00';
    
    const absAmount = Math.abs(parseFloat(amount));
    const formattedAmount = 'Rs. ' + absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return formattedAmount;
}

// Format date helper (common in your codebase)
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-IN');
}


// Remove the formatAmountWithAlignment function as we're now handling alignment separately


// Updated function to format amounts for PDF with proper Dr/Cr alignment



// Generate Excel report
function generateExcelReport() {
    showGlobalLoadingIndicator('Generating Excel report...');
    
    try {
        // Check if ExcelJS is available
        if (typeof ExcelJS === 'undefined') {
            throw new Error('ExcelJS library not loaded');
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');
        
        // Company header
        worksheet.mergeCells('A1:D1');
        const headerCell = worksheet.getCell('A1');
        headerCell.value = 'KAMBESHWAR AGENCIES';
        headerCell.font = { bold: true, size: 18, color: { argb: 'FF2C3E50' } };
        headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
        headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
        
        worksheet.mergeCells('A2:D2');
        const subHeaderCell = worksheet.getCell('A2');
        subHeaderCell.value = 'MAPUSA - GOA';
        subHeaderCell.font = { size: 12, color: { argb: 'FF6C757D' } };
        subHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Report details
        let reportTitle = getReportTitle();
        let periodText = getPeriodText();
        
        worksheet.mergeCells('A4:D4');
        const titleCell = worksheet.getCell('A4');
        titleCell.value = reportTitle;
        titleCell.font = { bold: true, size: 16, color: { argb: 'FF495057' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        worksheet.mergeCells('A5:D5');
        const periodCell = worksheet.getCell('A5');
        periodCell.value = periodText;
        periodCell.font = { size: 12, color: { argb: 'FF6C757D' } };
        periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        const reportTypeText = currentReportData.type === 'summarized' ? 'Summarized Report' : 'Detailed Report';
        worksheet.mergeCells('A6:D6');
        const typeCell = worksheet.getCell('A6');
        typeCell.value = reportTypeText;
        typeCell.font = { size: 11, color: { argb: 'FF6C757D' } };
        typeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        const generatedDate = new Date(currentReportData.generatedOn);
        worksheet.mergeCells('A7:D7');
        const dateCell = worksheet.getCell('A7');
        dateCell.value = `Generated on: ${generatedDate.toLocaleDateString('en-IN')} at ${generatedDate.toLocaleTimeString()}`;
        dateCell.font = { size: 10, color: { argb: 'FF6C757D' } };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        let currentRow = 9;
        
        if (currentReportData.type === 'summarized') {
            currentRow = generateSummarizedExcel(worksheet, currentRow);
        } else {
            currentRow = generateDetailedExcel(worksheet, currentRow);
        }
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 12), 50);
        });
        
        // Save the Excel file
        const fileName = generateReportFileName('excel');
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            saveAs(blob, fileName);
            hideGlobalLoadingIndicator();
        });
        
    } catch (error) {
        console.error('Error generating Excel:', error);
        hideGlobalLoadingIndicator();
        alert('Error generating Excel report. Please try again.');
    }
}

// Generate summarized Excel content
function generateSummarizedExcel(worksheet, currentRow) {
    // Headers
    const headerRow = worksheet.getRow(currentRow);
    headerRow.getCell(1).value = 'Party Name';
    headerRow.getCell(2).value = 'Total Bills';
    headerRow.getCell(3).value = 'Total Amount';
    
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF495057' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    
    currentRow++;
    
    // Sort parties by total amount (descending)
    const sortedParties = Object.entries(currentReportData.parties)
        .sort(([,a], [,b]) => b.totalAmount - a.totalAmount);
    
    sortedParties.forEach(([partyName, partyData]) => {
        const row = worksheet.getRow(currentRow);
        
        row.getCell(1).value = partyName;
        row.getCell(2).value = partyData.billCount;
        
        const amountCell = row.getCell(3);
        amountCell.value = partyData.totalAmount;
        amountCell.numFmt = '"₹"#,##0.00';
        
        // Color coding for amounts
        if (partyData.totalAmount < 0) {
            amountCell.font = { color: { argb: 'FFDC3545' } };
        } else {
            amountCell.font = { color: { argb: 'FF28A745' } };
        }
        
        row.alignment = { vertical: 'middle' };
        row.height = 20;
        
        currentRow++;
    });
    
    // Grand total row
    currentRow++;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'GRAND TOTAL';
    totalRow.getCell(2).value = currentReportData.totalBills;
    
    const totalAmountCell = totalRow.getCell(3);
    totalAmountCell.value = currentReportData.totalAmount;
    totalAmountCell.numFmt = '"₹"#,##0.00';
    
    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
    totalRow.alignment = { vertical: 'middle' };
    totalRow.height = 25;
    
    if (currentReportData.totalAmount < 0) {
        totalAmountCell.font = { bold: true, color: { argb: 'FFDC3545' } };
    } else {
        totalAmountCell.font = { bold: true, color: { argb: 'FF28A745' } };
    }
    
    return currentRow;
}

// Generate detailed Excel content
function generateDetailedExcel(worksheet, currentRow) {
    const sortedParties = Object.entries(currentReportData.parties)
        .sort(([,a], [,b]) => b.totalAmount - a.totalAmount);
    
    sortedParties.forEach(([partyName, partyData]) => {
        // Party header
        const partyRow = worksheet.getRow(currentRow);
        partyRow.getCell(1).value = partyName;
        partyRow.font = { bold: true, size: 14, color: { argb: 'FF495057' } };
        partyRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9ECEF' } };
        partyRow.height = 25;
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        currentRow++;
        
        // Party summary
        const summaryRow = worksheet.getRow(currentRow);
        summaryRow.getCell(1).value = `Total Invoices: ${partyData.billCount}`;
        summaryRow.getCell(3).value = `Total Amount: ${formatCurrency(partyData.totalAmount)}`;
        summaryRow.font = { size: 11, color: { argb: 'FF6C757D' } };
        summaryRow.height = 20;
        currentRow++;
        
        // Invoice headers
        currentRow++;
        const headerRow = worksheet.getRow(currentRow);
        headerRow.getCell(1).value = 'Invoice No.';
        headerRow.getCell(2).value = 'Date';
        headerRow.getCell(3).value = 'Amount';
        headerRow.getCell(4).value = 'Description';
        
        headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C757D' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 22;
        currentRow++;
        
        // Invoice details
        partyData.invoices.forEach(invoice => {
            const row = worksheet.getRow(currentRow);
            
            row.getCell(1).value = invoice.invoiceNo;
            row.getCell(2).value = formatDate(invoice.date);
            
            const amountCell = row.getCell(3);
            amountCell.value = invoice.amount;
            amountCell.numFmt = '"₹"#,##0.00';
            
            row.getCell(4).value = invoice.description || '';
            
            // Color coding for amounts
            if (invoice.amount < 0) {
                amountCell.font = { color: { argb: 'FFDC3545' } };
            } else {
                amountCell.font = { color: { argb: 'FF28A745' } };
            }
            
            row.alignment = { vertical: 'middle' };
            row.height = 18;
            
            currentRow++;
        });
        
        currentRow += 2; // Add spacing between parties
    });
    
    // Grand total
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'GRAND TOTAL';
    
    const totalAmountCell = totalRow.getCell(3);
    totalAmountCell.value = currentReportData.totalAmount;
    totalAmountCell.numFmt = '"₹"#,##0.00';
    
    totalRow.font = { bold: true, size: 14 };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
    totalRow.alignment = { vertical: 'middle' };
    totalRow.height = 30;
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    
    if (currentReportData.totalAmount < 0) {
        totalAmountCell.font = { bold: true, color: { argb: 'FFDC3545' } };
    } else {
        totalAmountCell.font = { bold: true, color: { argb: 'FF28A745' } };
    }
    
    return currentRow;
}

// Utility functions
function getReportTitle() {
    const titles = {
        'financialYear': 'FINANCIAL YEAR REPORT',
        'quarterly': 'QUARTERLY REPORT',
        'monthly': 'MONTHLY REPORT'
    };
    return titles[currentReportType] || 'REPORT';
}

function getPeriodText() {
    if (currentReportType === 'financialYear') {
        return `Financial Year: ${currentReportPeriod}`;
    } else if (currentReportType === 'quarterly') {
        if (!currentReportPeriod || !currentReportPeriod.includes('-Q')) {
            return `Quarter: ${currentReportPeriod || 'undefined'}`;
        }
        const [fy, quarterPart] = currentReportPeriod.split('-Q');
        const quarter = quarterPart;
        const quarterNames = {
            '1': 'Q1 (Apr-Jun)',
            '2': 'Q2 (Jul-Sep)',
            '3': 'Q3 (Oct-Dec)',
            '4': 'Q4 (Jan-Mar)'
        };
        return `Quarter: ${quarterNames[quarter] || quarter} FY ${fy}`;
    } else if (currentReportType === 'monthly') {
        const [year, month] = currentReportPeriod.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `Month: ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return `Period: ${currentReportPeriod}`;
}

function debugCurrentQuarter() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentFY = getCurrentFinancialYear();
    const currentQuarter = getCurrentFinancialQuarter();
    
    console.log('=== DEBUG CURRENT QUARTER ===');
    console.log('Today:', today.toISOString());
    console.log('Current Month (1-12):', currentMonth);
    console.log('Current Financial Year:', currentFY);
    console.log('Current Financial Quarter:', currentQuarter);
    console.log('Expected Period:', `${currentFY}-Q${currentQuarter}`);
    console.log('===========================');
    
    return {
        month: currentMonth,
        fy: currentFY,
        quarter: currentQuarter,
        period: `${currentFY}-Q${currentQuarter}`
    };
}


function generateReportFileName(format) {
    let periodPart = '';
    
    if (currentReportType === 'financialYear') {
        periodPart = `FY_${currentReportPeriod.replace('-', '_')}`;
    } else if (currentReportType === 'quarterly') {
        const [fy, quarter] = currentReportPeriod.split('-Q');
        periodPart = `FY_${fy.replace('-', '_')}_Q${quarter}`;
    } else {
        const [year, month] = currentReportPeriod.split('-');
        periodPart = `${year}_${month}`;
    }
    
    const typePart = currentReportData.type === 'summarized' ? 'Summarized' : 'Detailed';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    
    return `Kambeshwar_${typePart}_Report_${periodPart}.${extension}`;
}

// Modal control functions
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.classList.remove('active');
    
    // Show navigation buttons again
    const footerNav = document.querySelector('.footer-nav');
    if (footerNav) {
        footerNav.style.display = 'flex';
    }
    
    // Remove body scroll lock
    document.body.style.overflow = '';
}

function closeExportModal() {
    const modal = document.getElementById('reportExportModal');
    modal.classList.remove('active');
}

// Loading indicators
function showGlobalLoadingIndicator(message) {
    let loadingDiv = document.getElementById('reportGlobalLoadingIndicator');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'reportGlobalLoadingIndicator';
        loadingDiv.className = 'report-global-loading';
        document.body.appendChild(loadingDiv);
    }
    
    loadingDiv.innerHTML = `
        <div class="report-loading-spinner"></div>
        <div class="report-loading-text">${message || 'Processing...'}</div>
    `;
    
    loadingDiv.style.display = 'flex';
}

function hideGlobalLoadingIndicator() {
    const loadingDiv = document.getElementById('reportGlobalLoadingIndicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Utility formatting functions
function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₹0.00';
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Financial Year Utility Functions
// Fixed Financial Year Utility Functions
function getCurrentFinancialYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    if (currentMonth >= 4) { // April to March (4-12)
        return `${currentYear}-${(currentYear + 1).toString().substr(-2)}`;
    } else { // January to March (1-3)
        return `${currentYear - 1}-${currentYear.toString().substr(-2)}`;
    }
}

function getCurrentFinancialQuarter() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    if (currentMonth >= 4 && currentMonth <= 6) return 1; // Apr-Jun = Q1
    if (currentMonth >= 7 && currentMonth <= 9) return 2; // Jul-Sep = Q2  
    if (currentMonth >= 10 && currentMonth <= 12) return 3; // Oct-Dec = Q3
    return 4; // Jan-Mar = Q4
}
function getFinancialYearFromDate(dateString) {
    if (!dateString || dateString === 'N/A') return null;
    
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    if (month >= 4) { // April to December
        return `${year}-${(year + 1).toString().substr(-2)}`;
    } else { // January to March
        return `${year - 1}-${year.toString().substr(-2)}`;
    }
}

function getFinancialQuarterFromDate(dateString) {
    if (!dateString || dateString === 'N/A') return null;
    
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    
    const month = d.getMonth() + 1; // getMonth() returns 0-11, so add 1
    
    if (month >= 4 && month <= 6) return 1; // Apr-Jun = Q1
    if (month >= 7 && month <= 9) return 2; // Jul-Sep = Q2
    if (month >= 10 && month <= 12) return 3; // Oct-Dec = Q3
    return 4; // Jan-Mar = Q4
}



// Generate options for dropdowns
function generateFinancialYearOptions() {
    const currentFY = getCurrentFinancialYear();
    const [startYear, endYear] = currentFY.split('-');
    const options = [];
    
    // Generate options for 5 years before and 2 years after current FY
    for (let i = 5; i >= 1; i--) {
        const year = parseInt(startYear) - i;
        const fy = `${year}-${(year + 1).toString().substr(-2)}`;
        options.push(`<option value="${fy}">${fy}</option>`);
    }
    
    // Add current FY as selected
    options.push(`<option value="${currentFY}" selected>${currentFY}</option>`);
    
    // Add future years
    for (let i = 1; i <= 2; i++) {
        const year = parseInt(startYear) + i;
        const fy = `${year}-${(year + 1).toString().substr(-2)}`;
        options.push(`<option value="${fy}">${fy}</option>`);
    }
    
    return options.join('');
}

function generateFinancialQuarterOptions() {
    const currentFY = getCurrentFinancialYear();
    const currentQuarter = getCurrentFinancialQuarter(); // Returns NUMBER: 1, 2, 3, or 4
    const currentPeriod = `${currentFY}-Q${currentQuarter}`;
    const options = [];
    
    console.log('generateFinancialQuarterOptions Debug:');
    console.log('- currentFY:', currentFY);
    console.log('- currentQuarter:', currentQuarter, typeof currentQuarter);
    console.log('- currentPeriod:', currentPeriod);
    
    // Quarter display names
    const quarterNames = {
        1: 'Q1 (Apr-Jun)',
        2: 'Q2 (Jul-Sep)', 
        3: 'Q3 (Oct-Dec)',
        4: 'Q4 (Jan-Mar)'
    };
    
    // Generate current FY quarters first
    for (let q = 1; q <= 4; q++) {
        const value = `${currentFY}-Q${q}`; // This creates "2025-26-Q1", "2025-26-Q2", etc.
        const isSelected = (q === currentQuarter);
        const label = `FY ${currentFY} ${quarterNames[q]}`;
        options.push(`<option value="${value}" ${isSelected ? 'selected' : ''}>${label}</option>`);
        
        console.log(`Option ${q}: value="${value}", selected=${isSelected}, label="${label}"`);
    }
    
    // Generate previous FY quarters
    const [startYear, endYear] = currentFY.split('-');
    const prevStartYear = parseInt(startYear) - 1;
    const prevFY = `${prevStartYear}-${(prevStartYear + 1).toString().substr(-2)}`;
    
    for (let q = 1; q <= 4; q++) {
        const value = `${prevFY}-Q${q}`;
        const label = `FY ${prevFY} ${quarterNames[q]}`;
        options.push(`<option value="${value}">${label}</option>`);
    }
    
    // Generate next FY quarters  
    const nextStartYear = parseInt(startYear) + 1;
    const nextFY = `${nextStartYear}-${(nextStartYear + 1).toString().substr(-2)}`;
    
    for (let q = 1; q <= 4; q++) {
        const value = `${nextFY}-Q${q}`;
        const label = `FY ${nextFY} ${quarterNames[q]}`;
        options.push(`<option value="${value}">${label}</option>`);
    }
    
    return options.join('');
}

function testQuarterFix() {
    console.log('=== TESTING QUARTER FIX ===');
    const fy = getCurrentFinancialYear();
    const quarter = getCurrentFinancialQuarter();
    const period = `${fy}-Q${quarter}`;
    
    console.log('Financial Year:', fy);
    console.log('Quarter (should be number):', quarter, typeof quarter);
    console.log('Period (should be like "2025-26-Q2"):', period);
    
    // Test parsing
    const [fyPart, quarterPart] = period.split('-Q');
    const targetQuarter = parseInt(quarterPart);
    
    console.log('Parsed FY:', fyPart);
    console.log('Parsed Quarter Part:', quarterPart);
    console.log('Target Quarter (parsed):', targetQuarter);
    console.log('Is valid quarter?', !isNaN(targetQuarter) && targetQuarter >= 1 && targetQuarter <= 4);
    
    return { fy, quarter, period, fyPart, quarterPart, targetQuarter };
}


function generateMonthOptions() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentPeriod = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    const options = [];
    
    console.log('Current Year:', currentYear, 'Current Month:', currentMonth, 'Current Period:', currentPeriod);
    
    // Generate options for current year and previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
        for (let m = 12; m >= 1; m--) {
            const monthStr = m.toString().padStart(2, '0');
            const value = `${year}-${monthStr}`;
            const isSelected = (value === currentPeriod);
            const label = `${getMonthName(m)} ${year}`;
            options.push(`<option value="${value}" ${isSelected ? 'selected' : ''}>${label}</option>`);
        }
    }
    
    return options.join('');
}

function getMonthName(monthNumber) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNumber - 1];
}

// Initialize the report module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeReports();
    
    // Add event listener for report generation button if it exists
    const reportBtn = document.getElementById('generateReportBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateReport);
    }
});

// Make functions available globally
window.generateReport = generateReport;
window.selectReportType = selectReportType;
window.generateReportData = generateReportData;
window.exportReport = exportReport;
window.closeReportModal = closeReportModal;
window.closeExportModal = closeExportModal;
window.updateSelectedPeriod = updateSelectedPeriod;
