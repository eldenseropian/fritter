/**
 * Clicking on the follow button follows a user.
 */

$('.follow').click(function() {
    var buttonClicked = $(this);
    if ($(this).text() === 'Follow') {
        updateFollowers('follow', 'Unfollow', buttonClicked);
    } else {
        updateFollowers('unfollow', 'Follow', buttonClicked);
    }
});

function updateFollowers(route, newButtonText, buttonClicked) {
    $.post('/users/' + route + '/' + buttonClicked.attr('id'), function(data) {
        if (data.error) {
            $('#view-users-error').text(data.error);
        } else {
            $('#list-of-following').empty();
            $('#list-of-following').append(data.following.map(function(user) {
                return '<div>' + user.username + '</div>';
            }));
            buttonClicked.text(newButtonText);
        }
    });
}