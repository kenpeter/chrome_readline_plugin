/*
 * Sends Message:
 * - GetUserPreferences
 * - EnableReadline
 * - DisableReadline
 */
$(document).ready(function() {

    // Populate Options Link URL
    $('#options').attr('href', chrome.extension.getURL("options.html"));

    // Get User Preferences
    chrome.extension.sendRequest({
        'MessageName': 'GetUserPreferences'

    }, function(response) {

        var userPreferences = response.preferences;
        var readlineEnabled = userPreferences["ENABLED_BOOL"];

        if (readlineEnabled) {
            $('#switch').html("Disable Readline");
            $('#switch').click(function(e){
                e.preventDefault();
                chrome.extension.sendRequest({
                    'MessageName': 'DisableReadline'
                }, function(response){});
                window.close();
            });
        } else {
            $('#switch').html("Enable Readline");
            $('#switch').click(function(e){
                e.preventDefault();
                chrome.extension.sendRequest({
                    'MessageName': 'EnableReadline'
                }, function(response){});
                window.close();
            });
        }
    });
});
