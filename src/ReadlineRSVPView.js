/**
 * This class assumed to be in DOM context with jQuery loaded.
 */
function ReadlineRSVPView (context) {

    var self = this;

    self.context = context;

    self.isShown = true;

    self.originalDocumentBodyOverflow = 'auto';

    self.init = function(callback) {

        var html = ' <div class="readline_background" id="readline_background"></div>'
                 + ' <div class="readline_rsvp" id="readline_rsvp">'
                 + '     <div class="readline_rsvp_box" id="readline_rsvp_box">'
                 + '         <div class="readline_rsvp_box_border">'
                 + '             <div class="readline_rsvp_progressbar" id="readline_rsvp_progressbar"></div>'
                 + '         </div>'
                 + '         <div class="readline_rsvp_focal_point_container">'
                 + '             <div class="readline_rsvp_focal_point_marker"></div>'
                 + '         </div>'
                 + '         <div class="readline_rsvp_text_container" id="readline_rsvp_text_container">'
                 + '             <span class="readline_rsvp_text" id="readline_rsvp_text">&nbsp;</span>'
                 + '         </div>'
                 + '         <div class="readline_rsvp_focal_point_container">'
                 + '             <div class="readline_rsvp_focal_point_marker"></div>'
                 + '         </div>'
                 + '         <div class="readline_rsvp_box_border">'
                 + '         </div>'
                 + '     </div>'
                 + '     <div class="readline_rsvp_stat" id="readline_rsvp_stat">'
                 + '         <span id="readline_rsvp_stat_duration"></span>'
                 + '         <span> @ </span>'
                 + '         <span id="readline_rsvp_stat_wpm"></span>'
                 + '     </div>'
                 + ' </div>'
                 + '';

        $(html).appendTo('body');

        // Click Background to Dismiss
        $('#readline_background').click(function(e) {
            self.dismiss();
        });

        self.disableScroll();

        // Initially Hide Box
        $('#readline_rsvp_box').hide();
        $('#readline_rsvp_stat').hide();

        // Apply Style Font
        $('#readline_rsvp_text').css({
            'font-size': self.context.UserPreferences.RSVP_FONT_SIZE_STR,
            'font-family': self.context.UserPreferences.RSVP_FONT_FAMILY_STR
        });
        if (!self.context.UserPreferences.RSVP_HIGHLIGHT_FOCAL_POINT_BOOL) {
            $('.readline_rsvp_focal_point_container').hide();
        }
    }

    self.startAnimation = function(callback) {

        $('#readline_rsvp_box').show("clip", { }, 350, function() {
            $('#readline_rsvp_stat').show();
            self.updateView();
            callback();
        });
    }

    self.updateView = function() {

        //console.log("Updating View");

        // Set WPM
        $('#readline_rsvp_stat_wpm').html(self.context.UserPreferences.RSVP_WPM_NUM + " wpm");

        // Shadow Color
        $('#readline_background').css({
            'background': self.context.UserPreferences.RSVP_SHADOW_COLOR_STR
        });


        // Progress
        if (self.context.UserPreferences.RSVP_SHOW_PROGRESS_BOOL) {
            $('#readline_rsvp_progressbar').css({
                'display': 'block'
            });
        } else {
            $('#readline_rsvp_progressbar').css({
                'display': 'none'
            });
        }

        // Show/Hide Focal Point Markers
        if (self.context.UserPreferences.RSVP_HIGHLIGHT_FOCAL_POINT_BOOL) {
            $('div.readline_rsvp_focal_point_container').show();
        } else {
            $('div.readline_rsvp_focal_point_container').hide();
        }
    }

    self.setString = function(str, focalPointIndex) {

        var $readline_word = $('#readline_rsvp_text_container');

        if ($readline_word.length === 0) return;

        // Construct Inner HTML

        var innerHTML = "";
        if (self.context.UserPreferences.RSVP_HIGHLIGHT_FOCAL_POINT_BOOL) {
            for (var i=0; i<str.length; i++) {

                var tmpLetter = str.charAt(i);

                if (i === focalPointIndex) {
                    innerHTML += '<span class="readline_rsvp_text_focus_letter">';
                    innerHTML += tmpLetter;
                    innerHTML += '</span>';
                } else {
                    innerHTML += tmpLetter;
                }
            }
        } else {
            innerHTML = str;
        }

        // Create HTML with the Content

        $readline_word.empty();
        $readline_word.append(
            $('<span></span>')
            .attr('id','readline_rsvp_text')
            .addClass('readline_rsvp_text')
            .html(innerHTML)
            .css({
                'font-size': self.context.UserPreferences.RSVP_FONT_SIZE_STR,
                'font-family': self.context.UserPreferences.RSVP_FONT_FAMILY_STR
            })
        );

        // Set Appearance of the HTML content

        var $chunk = $('#readline_rsvp_text');
        var $focalPoint = $('span.readline_rsvp_text_focus_letter');

        if (self.context.UserPreferences.RSVP_HIGHLIGHT_FOCAL_POINT_BOOL && $focalPoint.length > 0) {

            var chunkOffsetLeft = $chunk.offset().left;
            var focalPointOffsetMiddle = $focalPoint.offset().left + ($focalPoint.width() / 2.0);
            var adjustPx = focalPointOffsetMiddle - chunkOffsetLeft;

            //console.log("Adjust PX:" + adjustPx);

            var paddingLeft = $("div.readline_rsvp_focal_point_marker").width() + 2 - adjustPx;

            $('#readline_rsvp_text_container').css({
                'text-align': 'left'
            });

            $chunk.css({
                'padding-left': paddingLeft + 'px'
            });

        } else {

            $('#readline_rsvp_text_container').css({
                'text-align': 'center'
            });
        }
    }

    self.setTotalDuration = function(totalDuration) {
        $('#readline_rsvp_stat_duration').html(""); // TODO prevent it for now
    }

    self.setProgress = function(progress) {
        $('#readline_rsvp_progressbar').css('width', progress + '%');
    }

    self.isShown = function() {
        return ($('#readline_rsvp').length > 0);
    }

    self.dismiss = function() {
        $('#readline_background').remove();
        $('#readline_rsvp').remove();

        self.restoreScroll();
    }

    self.disableScroll = function() {

        // Save Original Document Overflow Properties (need to save 'html' overflow property?)
        self.originalDocumentBodyOverflow = $('body').css('overflow');

        // Disable Document Scroll
        $('body').css({
            'overflow': 'hidden'
        });
    }

    self.restoreScroll = function() {
        $('body').css('overflow', self.originalDocumentBodyOverflow);
    }

    self.updateUserPreferences = function(userPreferences) {

        self.context.UserPreferences = userPreferences;
        self.updateView();
    }

    self.init();
}
