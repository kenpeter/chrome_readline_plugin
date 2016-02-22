/*
 * Copyright (C) 2014 Jiho Park <jihop@jihopark.com>
 */
$(document).ready(function() {

    chrome.extension.sendRequest({
        'MessageName': 'GetUserPreferences'

    }, function(response) {

        // Initialize

        var userPreferences = response.preferences;


        // WPM (Special Case)

        $('#wpm_value').html(userPreferences.RSVP_WPM_NUM);
        $('#wpm_slider').slider({
            min: 10,
            max: 2000, // Hak
            step: 10,
            value: userPreferences.RSVP_WPM_NUM,
            slide: function(e, ui) {
                var wpmValue = ui.value;
                $('#wpm_value').html(wpmValue);
            },
            stop: function(e, ui) {

                // Save User Preference
                var wpmValue = ui.value;
                chrome.extension.sendRequest({
                    'MessageName': 'SaveUserPreference',
                    'Key': 'RSVP_WPM_NUM',
                    'Val': wpmValue
                }, function(response) {
                    console.log(response);
                    // TODO
                });
            }
        });


        // Input Checkbox

        $("input[type=checkbox]").each(function() {

            var inputName = $(this).attr('name');

            console.log("Loaded " + inputName + ":" + userPreferences[inputName]);

            if (userPreferences[inputName] === true) {
                $(this).prop('checked', true);
            }

            // Save on Change
            $(this).change(function() {

                var boolValue = new Boolean($(this).prop('checked') === true).toString();
                console.log(inputName + ":" + boolValue);
                chrome.extension.sendRequest({
                    'MessageName': 'SaveUserPreference',
                    'Key': inputName,
                    'Val': boolValue
                });
            });
        });


        // Select Dropdown

        $('select').each(function() {

            var selectName = $(this).attr('name');
            var selectValue = userPreferences[selectName];

            // Mark matching option 'selected'
            $(this).find('option').each(function() {

                var optionValue = $(this).attr('value');
                if (optionValue === selectValue) {
                    $(this).prop('selected', true);
                }
            });

            // Save on Change
            $(this).change(function() {

                var changeToValue = this.value;
                chrome.extension.sendRequest({
                    'MessageName': 'SaveUserPreference',
                    'Key': selectName,
                    'Val': changeToValue
                });
            });
        });

        document.activeElement.blur();

    });
});
