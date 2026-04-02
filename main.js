function switchTab(type) {
    const traderBtn = document.getElementById('trader-tab');
    const mineBtn = document.getElementById('mine-tab');
    const indicator = document.querySelector('.tab-indicator');
    const submitBtn = document.getElementById('submit-btn');
    const loginBox = document.querySelector('.login-box');

    if (type === 'trader') {
        traderBtn.classList.add('active');
        mineBtn.classList.remove('active');
        indicator.style.transform = 'translateX(0)';
        submitBtn.textContent = 'Login as Trader';
        
        // Add a subtle accent color shift
        document.documentElement.style.setProperty('--primary', '#00d2ff');
        document.documentElement.style.setProperty('--secondary', '#3a7bd5');
    } else {
        mineBtn.classList.add('active');
        traderBtn.classList.remove('active');
        indicator.style.transform = 'translateX(calc(100% + 5px))';
        submitBtn.textContent = 'Login as Mine Admin';
        
        // Shift to a more "earthy" but still premium tone for Mines
        document.documentElement.style.setProperty('--primary', '#10b981');
        document.documentElement.style.setProperty('--secondary', '#059669');
    }

    // Add a small bounce animation to the box when switching
    loginBox.style.animation = 'none';
    loginBox.offsetHeight; // trigger reflow
    loginBox.style.animation = 'switchPulse 0.4s ease-out';
}

// Add CSS for the pulse animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes switchPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-dots">Authenticating...</span>';
    
    // Simulate API call
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1200);
});
