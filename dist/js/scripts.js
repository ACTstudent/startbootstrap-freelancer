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

    // Handle Register submission (Custom In-Website Alert Confirmation)
    $('#registerForm').off('submit').on('submit', function (e) {
        e.preventDefault();
        var $form = $(this);

        // 1. Grab registration credentials from form
        var usernameVal = $form.find('input[name*="username" i], input[id*="username" i]').val() || '';
        var emailVal = $form.find('input[name*="email" i], input[id*="email" i]').val() || '';
        var birthdayVal = $form.find('input[name*="birthday" i], input[id*="birthday" i]').val() || '';

        // Fallback check
        if (!usernameVal || !emailVal || !birthdayVal) {
            var formDataArray = $form.serializeArray();
            $.each(formDataArray, function(i, field) {
                var nameLower = field.name.toLowerCase();
                if (nameLower.includes('username')) usernameVal = field.value;
                if (nameLower.includes('email')) emailVal = field.value;
                if (nameLower.includes('birthday')) birthdayVal = field.value;
            });
        }

        // 2. Hide the main register modal so they see the custom confirm alert clearly
        const registerEl = document.getElementById('registerModal');
        const registerModal = bootstrap.Modal.getInstance(registerEl) || new bootstrap.Modal(registerEl);
        registerModal.hide();

        // 3. Create a clean, custom website popup modal on the fly
        var customModalHtml = `
            <div class="modal fade" id="customConfirmModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-user-check me-2"></i> Confirm Your Details</h5>
                        </div>
                        <div class="modal-body p-4" id="confirmModalBody">
                            <p class="text-muted mb-4">Please make sure your details are correct before registering:</p>
                            <div class="mb-2"><strong>Username:</strong> <span class="text-secondary">${usernameVal}</span></div>
                            <div class="mb-2"><strong>Email Address:</strong> <span class="text-secondary">${emailVal}</span></div>
                            <div class="mb-0"><strong>Birthday:</strong> <span class="text-secondary">${birthdayVal}</span></div>
                        </div>
                        <div class="modal-footer border-0" id="confirmModalFooter">
                            <button type="button" class="btn btn-outline-secondary" id="btnCancelConfirm">Edit Details</button>
                            <button type="button" class="btn btn-primary text-white" id="btnProceedRegister">Confirm & Register</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append custom popup modal to the DOM
        $('body').append(customModalHtml);
        var confirmModalEl = document.getElementById('customConfirmModal');
        var confirmModal = new bootstrap.Modal(confirmModalEl, { backdrop: 'static', keyboard: false });
        confirmModal.show();

        // If they click "Edit Details", close this and reopen the register modal
        $('#btnCancelConfirm').on('click', function() {
            confirmModal.hide();
            confirmModalEl.remove();
            registerModal.show();
        });

        // If they click "Confirm & Register", call the registration API, but keep alert visible
        $('#btnProceedRegister').on('click', function() {
            // Disable buttons during submission process
            $('#btnCancelConfirm, #btnProceedRegister').prop('disabled', true);

            $.ajax({
                url: '/api/register', 
                type: 'POST',
                data: $form.serialize(), 
                success: function (response) {
                    // Update the alert popup to show success instead of executing login/automatic redirect
                    $('#confirmModalBody').html(`
                        <div class="text-center py-3">
                            <i class="fas fa-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                            <h4 class="text-success mb-2">Registration Complete!</h4>
                            <p class="text-muted">Your account was created successfully. You can now use your credentials to log in.</p>
                        </div>
                    `);
                    
                    // Change buttons to only offer a manual transition to the login page
                    $('#confirmModalFooter').html(`
                        <button type="button" class="btn btn-success text-white w-100" id="btnGoToLogin">Proceed to Login</button>
                    `);

                    $form[0].reset();

                    // Handle manual login transition button
                    $('#btnGoToLogin').on('click', function() {
                        confirmModal.hide();
                        confirmModalEl.remove();
                        
                        // Open the Login modal manually
                        const loginEl = document.getElementById('loginModal');
                        const loginModal = bootstrap.Modal.getInstance(loginEl) || new bootstrap.Modal(loginEl);
                        loginModal.show();
                    });
                },
                error: function (xhr, status, error) {
                    // On error, let them go back to edit the registration form
                    confirmModal.hide();
                    confirmModalEl.remove();
                    registerModal.show();
                    alert("An error occurred: " + error);
                }
            });
        });
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
