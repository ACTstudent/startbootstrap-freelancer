/*!
* Start Bootstrap - Freelancer v7.0.7 (https://startbootstrap.com/theme/freelancer)
* Copyright 2013-2026 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-freelancer/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // --- Authentication & Session Handling ---
    
    // Check authentication status on load
    checkAuth();

    async function checkAuth() {
        try {
            const res = await fetch('/api/me');
            const data = await res.json();
            if (data.loggedIn) {
                // Show logged in elements, hide logged out elements
                document.querySelectorAll('.auth-logged-out').forEach(el => el.classList.add('d-none'));
                document.querySelectorAll('.auth-logged-in').forEach(el => el.classList.remove('d-none'));
                document.getElementById('navUsername').innerText = data.user.username;
            } else {
                // Show logged out elements, hide logged in elements
                document.querySelectorAll('.auth-logged-out').forEach(el => el.classList.remove('d-none'));
                document.querySelectorAll('.auth-logged-in').forEach(el => el.classList.add('d-none'));
            }
        } catch (err) {
            console.error("Session check failed:", err);
        }
    }

    // Toggle password visibility helper
    setupPasswordToggle('loginTogglePassword', 'loginPassword');
    setupPasswordToggle('registerTogglePassword', 'registerPassword');

    function setupPasswordToggle(buttonId, inputId) {
        const btn = document.getElementById(buttonId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            btn.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        }
    }

    // Inter-modal Navigation
    const linkToRegister = document.getElementById('linkToRegister');
    const linkToLogin = document.getElementById('linkToLogin');
    
    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            const loginEl = document.getElementById('loginModal');
            let loginModal = bootstrap.Modal.getInstance(loginEl);
            if (!loginModal) loginModal = new bootstrap.Modal(loginEl);
            loginModal.hide();
            
            const registerEl = document.getElementById('registerModal');
            let registerModal = bootstrap.Modal.getInstance(registerEl);
            if (!registerModal) registerModal = new bootstrap.Modal(registerEl);
            registerModal.show();
        });
    }
    
    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            const registerEl = document.getElementById('registerModal');
            let registerModal = bootstrap.Modal.getInstance(registerEl);
            if (!registerModal) registerModal = new bootstrap.Modal(registerEl);
            registerModal.hide();
            
            const loginEl = document.getElementById('loginModal');
            let loginModal = bootstrap.Modal.getInstance(loginEl);
            if (!loginModal) loginModal = new bootstrap.Modal(loginEl);
            loginModal.show();
        });
    }

    // Handle Login submission
    const loginForm = document.getElementById('loginForm');
    const loginErrorAlert = document.getElementById('loginErrorAlert');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginErrorAlert) loginErrorAlert.classList.add('d-none');
            
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            
            if (!username || !password) {
                if (loginErrorAlert) {
                    loginErrorAlert.innerText = "Please fill in all fields.";
                    loginErrorAlert.classList.remove('d-none');
                }
                return;
            }
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.success) {
                    const loginEl = document.getElementById('loginModal');
                    const loginModal = bootstrap.Modal.getInstance(loginEl) || new bootstrap.Modal(loginEl);
                    loginModal.hide();
                    loginForm.reset();
                    await checkAuth();
                } else {
                    if (loginErrorAlert) {
                        loginErrorAlert.innerText = data.message || "Invalid credentials.";
                        loginErrorAlert.classList.remove('d-none');
                    }
                }
            } catch (err) {
                if (loginErrorAlert) {
                    loginErrorAlert.innerText = "An error occurred connecting to the server.";
                    loginErrorAlert.classList.remove('d-none');
                }
            }
        });
    }

    // Handle Register submission (With alert confirmation and absolutely NO refresh)
    $('#registerForm').off('submit').on('submit', function (e) {
        e.preventDefault(); // Prevents default browser submit refresh
        var $form = $(this);

        // 1. Grab values from input fields safely
        var usernameVal = $form.find('input[name*="username" i], input[id*="username" i]').val() || '';
        var emailVal = $form.find('input[name*="email" i], input[id*="email" i]').val() || '';
        var birthdayVal = $form.find('input[name*="birthday" i], input[id*="birthday" i]').val() || '';

        // Fallback check in case names/IDs differ
        if (!usernameVal || !emailVal || !birthdayVal) {
            var formDataArray = $form.serializeArray();
            $.each(formDataArray, function(i, field) {
                var nameLower = field.name.toLowerCase();
                if (nameLower.includes('username')) usernameVal = field.value;
                if (nameLower.includes('email')) emailVal = field.value;
                if (nameLower.includes('birthday')) birthdayVal = field.value;
            });
        }

        // 2. Alert the user first to let them see their credentials
        var confirmMessage = "Please confirm your credentials:\n\n" +
                             "Username: " + (usernameVal || "Not entered") + "\n" +
                             "Email: " + (emailVal || "Not entered") + "\n" +
                             "Birthday: " + (birthdayVal || "Not entered") + "\n\n" +
                             "Click OK to submit registration.";
        
        alert(confirmMessage);

        // 3. Make the background AJAX post registration call
        $.ajax({
            url: '/api/register', 
            type: 'POST',
            data: $form.serialize(), 
            success: function (response) {
                // Clear the form fields
                $form[0].reset();

                // Close the register modal gracefully
                const registerEl = document.getElementById('registerModal');
                const registerModal = bootstrap.Modal.getInstance(registerEl) || new bootstrap.Modal(registerEl);
                registerModal.hide();
                
                // Show success message without logging in or refreshing
                alert("Account created successfully! You can now log in."); 
            },
            error: function (xhr, status, error) {
                alert("An error occurred: " + error);
            }
        });

        return false; // Hard stop wrapper to ensure absolutely no form submit refresh happens
    });

    // Handle Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/logout', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    await checkAuth();
                    window.location.hash = '';
                }
            } catch (err) {
                console.error("Logout failed:", err);
            }
        });
    }

});
