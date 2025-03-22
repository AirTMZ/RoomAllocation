document.addEventListener('DOMContentLoaded', function() {
    var darkStyle = document.getElementById('darkStyle');
    var darkModeToggle = document.getElementById('darkModeToggle');
    var darkMode = localStorage.getItem('darkMode');

    // If this is the first visit (no preference stored), set to dark mode
    if (darkMode === null) {
        localStorage.setItem('darkMode', 'enabled');
        darkMode = 'enabled';
    }

    // Apply the stored or default preference
    if (darkMode === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    darkModeToggle.addEventListener('click', function() {
        darkMode = localStorage.getItem('darkMode');
        if (darkMode !== 'enabled') {
            enableDarkMode();
            localStorage.setItem('darkMode', 'enabled');
        } else {
            disableDarkMode();
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    function enableDarkMode() {
        darkStyle.disabled = false;
        darkModeToggle.textContent = '☀️';
    }

    function disableDarkMode() {
        darkStyle.disabled = true;
        darkModeToggle.textContent = '🌙';
    }
});
