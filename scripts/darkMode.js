document.addEventListener('DOMContentLoaded', function() {
    var darkStyle = document.getElementById('darkStyle');
    var darkModeToggle = document.getElementById('darkModeToggle');
    var darkMode = localStorage.getItem('darkMode');

    if (darkMode === 'enabled') {
        enableDarkMode();
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
