/**
 * When the user clicks the login button, hide the signup form (if visible) and
 * the error message (if visible) and show the login form.
 */
$('#login-button').click(function() {
    $('#signup').addClass('not-here');
    $('#signup-button').removeClass('selected');

    $('#error-message').addClass('not-here');

    $('#login').removeClass('not-here');
    $('#login-button').addClass('selected');
});

/**
 * When the user clicks the signup button, hide the login form (if visible) and
 * the error message (if visible) and show the signup form.
 */
$('#signup-button').click(function() {
    $('#login').addClass('not-here');
    $('#login-button').removeClass('selected');

    $('#error-message').addClass('not-here');

    $('#signup').removeClass('not-here');
    $('#signup-button').addClass('selected');
});