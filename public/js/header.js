/**
 * Clicking 'fritter' redirects to the view all tweets page.
 */
$('#fritter').click(function() {
    window.location.href = '/tweets';
});

/**
 * Clicking 'Users' redirects to the view all users page.
 */
$('#view-users').click(function() {
    window.location.href = '/users';
});

/**
 * Clicking the logout button redirects to the home page (login/signup).
 */
$('#logout').click(function() {
    window.location.href = '/';
});