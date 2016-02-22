/*
 * Content Script that runs on every page loaded.
 *
 * SENDS MESSAGE:
 * - RequestRSVP(Text)
 * - GetUserPreferences()
 *
 * RECEIVED MESSAGE:
 * - StartRSVP(Text): Start RSVP on this page
 * - UpdatePreferences(message.preferences)
 *
 */
(function() {

    // Request User Preferences

    chrome.extension.sendRequest({
        'MessageName': 'GetUserPreferences'

    }, function(response) {

        // Initialize

        var context = {};
            context.UserPreferences = response.preferences;

        var rsvpController = new ReadlineRSVPController(context);
        var previousSelectionText = "";

        // Fallback selection text is what chrome API propagates (For PDF plugin, this is the only handle we have to selection text)
        function invokeRSVP (fallbackSelectionText) {

            var selectionText = window.getSelection().toString().trim();
            var selectionTextChunks = selectionText.split(/[\n\s]+/); // Split by Newline or Spaces

            // Fallback
            if (typeof selectionText == 'undefined' || selectionText.length === 0) {
                if (typeof(fallbackSelectionText) !== 'undefined' && fallbackSelectionText.length > 0) {
                    selectionText = fallbackSelectionText;
                    selectionTextChunks = selectionText.split(/[\n\s]+/); // Split by Newline or Spaces
                }
            }

            // Selection Text is Too Short
            if (selectionTextChunks.length < 2) {
                return;
            }

            sendMessage_RequestRSVP(selectionText);
        }

        // Highlight Functions

        function highlightParagraph ($p) {

            // Skip no text paragraph
            if ($p.text().length === 0) return;

            // Skip non-leaf paragraph
            if ($p.find('p').length > 0) return;

            // Skip already highlighted
            if (typeof($p.attr('data-readline-background')) !== 'undefined') return;

            $p
            .attr('data-readline-background', $p.css('background-color')) // Save original background color
            .bind('mouseenter.Readline', function() {
                // Check Already Hovered
                if ($(this).find('font.readline_hover').size() > 0) return;
                $(this).html('<font class="readline_hover">' + $(this).html() + '</font>');
            })
            .bind('mouseleave.Readline', function() {
                $(this).html($('> font.readline_hover', this).html())
            })
            .bind('click.Readline', function(e) {
                e.preventDefault();
                sendMessage_RequestRSVP($(this).text());
            });

            // Mouse was already hovered over => Manually inject hover
            if ($p.is(':hover')) {
                if ($p.find('font.readline_hover').size() > 0) {
                    return;
                }

                $p
                .html('<font class="readline_hover">' + $p.html() + '</font>');
            }
        }

        function unhighlightParagraph ($p) {

            if (typeof($p.attr('data-readline-background')) === 'undefined') return;

            var originalHtml = $p.find('font.readline_hover').html();

            $p
            .removeAttr('data-readline-background')
            .html(originalHtml)
            .unbind('click.Readline')
            .unbind('mouseenter.Readline')
            .unbind('mouseleave.Readline');
        }

        // Input Handlers

        $(window).mouseup(function(e) {
            if (context.UserPreferences.RSVP_AUTOSTART_BOOL && !rsvpController.isShown()) {

                // Invoke RSVP only when selection is different than previous mouseup selection.
                // This happens when you just dismissed RSVP and mouse-clicked on the selected text.

                var selectionText = window.getSelection().toString();
                if (previousSelectionText != selectionText) {
                    invokeRSVP();
                }
                previousSelectionText = selectionText;
            }
        });

        $(window).keydown(function(e) {
            switch(e.keyCode) {

                case 18: // Alt
                    if (context.UserPreferences.RSVP_ALT_HOVER_TRIGGER_SELECTION_BOOL) {
                        $('p').each(function() {
                            highlightParagraph($(this));
                        });
                    }
                    break;

                case 32: // Spacebar
                    if (rsvpController.isShown()) {
                        if (rsvpController.isPaused()) {
                            rsvpController.resume();
                        } else {
                            rsvpController.pause();
                        }
                    } else if (context.UserPreferences.RSVP_SPACEBAR_TRIGGER_BOOL) {
                        // TODO check if select text is editable (edge case)
                        var selectionText = window.getSelection().toString().trim();
                        var selectionTextChunks = selectionText.split(/[\n\s]+/); // Split by Newline or Spaces
                        if (selectionTextChunks.length > 1) {
                            e.preventDefault();
                            invokeRSVP();
                        }
                    }
                    break;

                case 27: // Escape
                    if (rsvpController.isShown()) {
                        rsvpController.dismiss();
                    }
                    break;

                case 37: // Left Arrow
                    if (rsvpController.isShown()) {
                        e.preventDefault();
                        rsvpController.stepBackword();
                    }
                    break;

                case 39: // Right Arrow
                    if (rsvpController.isShown()) {
                        e.preventDefault();
                        rsvpController.stepForward();
                    }
                    break;

                case 38: // Up Arrow
                    if (rsvpController.isShown()) {
                        e.preventDefault();

                        var currentWPM = parseInt(context.UserPreferences.RSVP_WPM_NUM);
                        if (currentWPM < 1000) {
                            chrome.extension.sendRequest({
                                'MessageName': 'SaveUserPreference',
                                'Key': 'RSVP_WPM_NUM',
                                'Val': currentWPM + 10
                            }, function(response) {});
                        }
                    }
                    break;

                case 40: // Down Arrow
                    if (rsvpController.isShown()) {
                        e.preventDefault();

                        var currentWPM = parseInt(context.UserPreferences.RSVP_WPM_NUM);
                        if (currentWPM > 10) {
                            chrome.extension.sendRequest({
                                'MessageName': 'SaveUserPreference',
                                'Key': 'RSVP_WPM_NUM',
                                'Val': currentWPM - 10
                            }, function(response) {});
                        }
                    }
                    break;
            }
        });

        $(window).keyup(function(e) {
            switch(e.keyCode) {

                case 18: // Alt
                    if (context.UserPreferences.RSVP_ALT_HOVER_TRIGGER_SELECTION_BOOL) {
                        $('p').each(function() {
                            unhighlightParagraph($(this));
                        });
                    }
                    break;
            }
        });


        // Message Handlers

        function sendMessage_RequestRSVP(text) {

            chrome.extension.sendRequest({
                'MessageName': 'RequestRSVP',
                'Text': text
            }, function(response) {
                // do something here?
            });
        }

        chrome.extension.onMessage.addListener(function (message, sender, callback) {
            switch(message.MessageName) {

                case "UserPreferencesUpdated":
                    context.UserPreferences = message.UserPreferences;
                    rsvpController.updateUserPreferences(context.UserPreferences);
                    break;

                case "StartRSVP":
                    // Start Only on Top Frame Window
                    if (window.parent === window) {
                        rsvpController.start(message.Text);
                    }
                    break;

                case "InvokeRSVP":
                    invokeRSVP(message.FallbackSelectionText);
                    break;
            }
        });
    });
}());
