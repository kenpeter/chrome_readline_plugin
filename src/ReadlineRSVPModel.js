function ReadlineRSVPModel (context, text) {

    var self = this;
    var VOWELS = ['a','e','i','o','u'];

    // Initiate

    self.context = context;

    self.chunks = text.split(/[\n\s]+/); // Split by Space & Newline
    self.chunkIndex = -1;

    /*
     * Returns the current chunk information.
     * Returns false if no more chunks to display.
     *
     * {
     *   "Text": "Word!",          // Text to Display
     *   "DurationMultiplier": 2.0 // Duration Multiplier
     *   "FocalPointIndex": 2      // Optimal Focal Point Index
     * }
     */
    self.currentChunk = function() {

        var chunkText = self.chunks[self.chunkIndex];
        var chunkDurationMultiplier = self.determineDurationMultiplier(chunkText);
        var chunkFocalPointIndex = self.determineFocalPointIndex(chunkText);

        // First Word => Force Double Multiplier
        if (self.chunkIndex === 0) {
            chunkDurationMultiplier = 2.0;
        }

        // TODO 3.0 DurationMultiplier if end of paragraph

        return {
            "Text": chunkText,
            "DurationMultiplier": chunkDurationMultiplier,
            "FocalPointIndex": chunkFocalPointIndex
        }
    }

    self.determineDurationMultiplier = function(text) {

        // Punctuation Case
        if (text.indexOf(",", text.length - 1) !== -1) {
            return 1.8;
        } else if (text.indexOf(":", text.length - 1) !== -1) {
            return 2.0;
        } else if (text.indexOf(";", text.length - 1) !== -1) {
            return 2.0;
        } else if (text.indexOf("!", text.length - 1) !== -1) {
            return 2.0;
        } else if (text.indexOf("?", text.length - 1) !== -1) {
            return 2.0;
        } else if (text.indexOf(".", text.length - 1) !== -1) {
            if (text.indexOf(".", text.length - 1) !== -1) { //..
                return 2.0;
            }
            if (text.split(".").length > 2) { // ex. U.S.
                return 1.0; // regular case
            }
        }

        // Special Case
        if (text === '--') {
            return 1.8;
        } else if (text === '-') {
            return 1.8;
        }

        // Dynamically Adjust Speed on short/long words
        if (self.context.UserPreferences.RSVP_DYNAMIC_SPEED_BOOL) {
            if (text.length < 5) {
                return 0.8;
            } else if (text.length > 15) {
                return 2.0;
            } else if (text.length > 10) {
                return 1.3;
            }
        }

        // Regular Case
        return 1.0;
    }

    self.determineFocalPointIndex = function(text) {

        var textLength = text.length;

        if (textLength  === 1) {
            return 0;
        } else if (textLength === 2) {
            return 0;
        } else if (textLength === 3) {
            return 1;
        } else if (textLength === 4) {
            return 1;
        } else if (textLength === 5) {
            if (VOWELS.indexOf(text.charAt(2).toLowerCase()) > 0) {
                return 2;
            } else {
                return 1;
            }
        } else if (textLength < 10) { // 6, 7, 8, 9
            return 2;
        } else if (textLength < 14) { // 10, 11, 12, 13
            return 3;
        } else {
            return Math.floor(textLength / 3.0) - 1;
        }
        return 0;
    }

    self.stepForward = function() {

        if (self.chunkIndex === (self.chunks.length - 1)) {
            return false;
        } else {
            self.chunkIndex++;
        }
    }

    self.stepBackword = function() {

        if (self.chunkIndex === 0) {
            return false;
        } else {
            self.chunkIndex--;
        }
    }

    // Returns float percent progress
    self.percentProgress = function() {
        return (parseFloat(self.chunkIndex + 1) / parseFloat(self.chunks.length)) * 100.0;
    }

    self.estimatedTotalDurationMultiplier = function() {
        return self.chunks.length * 1.0;
    }

    self.estimatedChunkCount = function() {
        return self.chunks.length;
    }


    /* TODO this is here to write more fine grained split/chunking

    var currentSections = []; // Array of Array (section, chunks)
    var currentChunks = [];
    var currentSubChunks = [];

    var currentSectionIndex = 0;
    var currentChunkIndex = 0;
    var currentSubChunkIndex = 0;

    // Initiate

    var sectionStrings = text.split(/[\n]+/); // Split by Newline

    for (var i=0; i<sectionStrings.length; i++) {
        var currentSectionString = sectionStrings[i];
        var currentChunks = currentSectionString.split(/[\s]+/); // Split by Spaces
        currentSections.push(currentChunks);
    }
    */
}
