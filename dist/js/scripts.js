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

    // Handle Register submission
    const registerForm = document.getElementById('registerForm');
    const registerErrorAlert = document.getElementById('registerErrorAlert');
    const registerSuccessAlert = document.getElementById('registerSuccessAlert');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (registerErrorAlert) registerErrorAlert.classList.add('d-none');
            if (registerSuccessAlert) registerSuccessAlert.classList.add('d-none');
            
            const usernameInput = document.getElementById('registerUsername');
            const emailInput = document.getElementById('registerEmail');
            const birthdayInput = document.getElementById('registerBirthday');
            const passwordInput = document.getElementById('registerPassword');
            
            const username = usernameInput ? usernameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const birthday = birthdayInput ? birthdayInput.value : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            
            if (!username || !email || !password) {
                if (registerErrorAlert) {
                    registerErrorAlert.innerText = "Please fill in all required fields.";
                    registerErrorAlert.classList.remove('d-none');
                }
                return;
            }
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, birthday, password })
                });
                const data = await response.json();
                if (data.success) {
                    if (registerSuccessAlert) {
                        registerSuccessAlert.innerText = data.message || "Registration successful!";
                        registerSuccessAlert.classList.remove('d-none');
                    }
                    registerForm.reset();
                    
                    // Automatically redirect to login modal after 1.5 seconds
                    setTimeout(() => {
                        const registerEl = document.getElementById('registerModal');
                        const registerModal = bootstrap.Modal.getInstance(registerEl) || new bootstrap.Modal(registerEl);
                        registerModal.hide();
                        if (registerSuccessAlert) registerSuccessAlert.classList.add('d-none');
                        
                        const loginEl = document.getElementById('loginModal');
                        const loginModal = bootstrap.Modal.getInstance(loginEl) || new bootstrap.Modal(loginEl);
                        loginModal.show();
                    }, 1500);
                } else {
                    if (registerErrorAlert) {
                        registerErrorAlert.innerText = data.message || "Registration failed.";
                        registerErrorAlert.classList.remove('d-none');
                    }
                }
            } catch (err) {
                if (registerErrorAlert) {
                    registerErrorAlert.innerText = "An error occurred connecting to the server.";
                    registerErrorAlert.classList.remove('d-none');
                }
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

$(document).ready(function () {
    // Target your registration form ID (e.g., #registerForm)
    $('#registerForm').on('submit', function (e) {
        // Prevent the browser from doing a default page reload/submit
        e.preventDefault();

        // 1. Serialize all form input values into a key-value format
        var formDataArray = $(this).serializeArray();
        
        // 2. Format the details nicely to show in the alert
        var alertMessage = "Creating Account with the following details:\n\n";
        $.each(formDataArray, function(i, field) {
            alertMessage += field.name + ": " + field.value + "\n";
        });

        // 3. Perform the AJAX request
        $.ajax({
            url: '/api/register', // Replace this with your actual signup endpoint (e.g., Supabase, PHP, etc.)
            type: 'POST',
            data: $(this).serialize(), // Send the serialized form data
            success: function (response) {
                // Display the alert with all submitted details upon click/submit
                alert(alertMessage);
                
                // Optionally: Hide the modal on success and clear form
                $('#registerModal').modal('hide');
                $('#registerForm')[0].reset();
            },
            error: function (xhr, status, error) {
                alert("An error occurred: " + error);
            }
        });
    });
});
