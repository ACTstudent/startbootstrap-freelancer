// Handle Register submission (jQuery AJAX Alert Integration)
    $('#registerForm').off('submit').on('submit', function (e) {
        e.preventDefault();

        // 1. Serialize input values into key-value pairs
        var formDataArray = $(this).serializeArray();
        
        // 2. Filter to keep only the specific credentials you want to alert
        var allowedFields = ['username', 'email', 'birthday'];
        var alertMessage = "Please confirm your credentials:\n\n";
        
        $.each(formDataArray, function(i, field) {
            // Check if the lowercase field name matches one of your target fields
            var fieldNameLower = field.name.toLowerCase();
            if (allowedFields.includes(fieldNameLower)) {
                // Capitalize the first letter of the name for a cleaner display
                var capitalizedLabel = field.name.charAt(0).toUpperCase() + field.name.slice(1);
                alertMessage += capitalizedLabel + ": " + field.value + "\n";
            }
        });

        // 3. Trigger alert with the filtered credential details
        alert(alertMessage);

        // 4. Fire the AJAX background post request without page reload
        $.ajax({
            url: '/api/register', 
            type: 'POST',
            data: $(this).serialize(), 
            success: function (response) {
                // Hide modal and clear form variables upon successful submission
                const registerEl = document.getElementById('registerModal');
                const registerModal = bootstrap.Modal.getInstance(registerEl) || new bootstrap.Modal(registerEl);
                registerModal.hide();
                $('#registerForm')[0].reset();
            },
            error: function (xhr, status, error) {
                alert("An error occurred: " + error);
            }
        });
    });
