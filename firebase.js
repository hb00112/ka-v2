// Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyBfE8ILQAqlfpWMUTIuz5eIKhsZxCsFgo4",
    authDomain: "hc-order.firebaseapp.com",
    databaseURL: "https://hc-order-default-rtdb.firebaseio.com",
    projectId: "hc-order",
    storageBucket: "hc-order.firebasestorage.app",
    messagingSenderId: "918783629071",
    appId: "1:918783629071:web:f32af53f30d15e53e9107a",
    measurementId: "G-K8Z2DLYSFJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Utility Functions
function formatCurrency(amount) {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0, // ✅ no decimals
        maximumFractionDigits: 0
    }).format(absoluteAmount);
    
    return isNegative ? `-${formatted}` : formatted;
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

function formatDateLong(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
