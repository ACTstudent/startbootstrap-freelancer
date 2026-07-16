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

    // Handle Register submission (Resilient Pure Vanilla JS & Blocks execution with Confirm)
    const registerForm = document.getElementById('registerForm') || document.querySelector('#registerModal form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Immediately stops any form reloads or submissions

            // 1. Grab inputs safely by looking at field types
            const usernameInput = registerForm.querySelector('input[type="text"]') || registerForm.querySelector('[id*="username" i]');
            const emailInput = registerForm.querySelector('input[type="email"]') || registerForm.querySelector('[id*="email" i]');
            const birthdayInput = registerForm.querySelector('input[type="date"]') || registerForm.querySelector('[id*="birthday" i]');

            const usernameVal = usernameInput ? usernameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const birthdayVal = birthdayInput ? birthdayInput.value.trim() : '';

            // 2. Format popup verification details
            const confirmMessage = 
                `Please confirm your registration details:\n\n` +
                `Username: ${usernameVal || 'Not entered'}\n` +
                `Email: ${emailVal || 'Not entered'}\n` +
                `Birthday: ${birthdayVal || 'Not entered'}\n\n` +
                `Click OK to register, or Cancel to edit your details.`;

            // 3. Force stop with window.confirm()
            const userConfirmed = window.confirm(confirmMessage);
            if (!userConfirmed) {
                // If they click "Cancel", stop right here so they can edit
                return;
            }

            // 4. Send background POST request only after they clicked "OK"
            try {
                const formData = new FormData(registerForm);
                const response = await fetch('/api/register', {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    registerForm.reset();

                    // Close registration modal
                    const registerEl = document.getElementById('registerModal');
                    const registerModal = bootstrap.Modal.getInstance(registerEl) || new bootstrap.Modal(registerEl);
                    registerModal.hide();

                    alert("Account created successfully! You can now log in.");
                } else {
                    // Show error alert on modal
                    const regErrorAlert = document.getElementById('registerErrorAlert') || document.querySelector('#registerModal .alert-danger');
                    if (regErrorAlert) {
                        regErrorAlert.innerText = data.message || "Registration failed.";
                        regErrorAlert.classList.remove('d-none');
                    } else {
                        alert(data.message || "Registration failed.");
                    }
                }
            } catch (err) {
                alert("An error occurred during registration: " + err.message);
            }
        });
    }

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
