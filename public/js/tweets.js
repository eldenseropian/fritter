/**
 * Clicking on a tweet redirects to the edit page for that tweet.
 */
$('.my-tweets').click(function() {
    window.location.href = '/tweets/edit/' + $(this).attr('tweet-id');
});

/**
 * Clicking on the edit button for a tweet redirects to the edit page for that
 * tweet.
 */
$('.edit').click(function() {
    window.location.href = '/tweets/edit/' + $(this).attr('tweet-id');
});

/**
 * Clicking on the delete button for a tweet deletes the tweet if the user
 * clicks 'OK' on the confirm dialog, and does nothing if the user clicks
 * 'cancel'.
 */
$('.delete').click(function() {
    var deleteTweet = confirm("Are you sure you want to delete this tweet?");
    if (deleteTweet === true) {
        window.location.href = '/tweets/delete/' + $(this).attr('tweet-id');
    }
});

/**
 * Clicking the new button redirects to the create new tweet page.
 */
$('.new').click(function() {
    window.location.href = '/tweets/new';
});

/**
 * Clicking the favorite/unfavorite button updates the favorite count of that
 * tweet. You may not favorite your own tweets.
 */
$('.favorite').click(function() {
    var tweetId = $(this).attr('tweet-id');
    if ($(this).text() == 'Favorite') {
        updateFavorites('favorite', 'Unfavorite', $(this));
    } else {
        updateFavorites('unfavorite', 'Favorite', $(this));
    }
});

function updateFavorites(route, newButtonText, buttonClicked) {
    var tweetId = buttonClicked.attr('tweet-id');
    $.post('/tweets/' + route + '/' + tweetId, function(data) {
        if (data.error) {
            $('#view-tweets-error').text(data.error);
        } else {
            buttonClicked.text(newButtonText);
            $('.favorite-count[tweet-id=' + tweetId + ']').text(data.favoriteCount);

        }
    });
}

/**
 * Clicking the update button triggers the form's submit by clicking the
 * hidden input[type="submit"] button.
 */
$('#update-button').click(function() {
    $('#submit-button').click();
});

/**
 * Clicking the tweet button triggers the form's submit by clicking the
 * hidden input[type="submit"] button.
 */
$('#tweet-button').click(function() {
    $('#tweet-submit').click();
});