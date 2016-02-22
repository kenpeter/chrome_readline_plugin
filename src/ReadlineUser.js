/*
 * Store data about user preference or configuration. Must be instantiated with
 * getter and setter function. Instantiate like this:
 *
 * var readlineStorage = new ReadlineStorage({
 *     "getter": function(key) {
 *         return value; // However way you want
 *     },
 *     "setter": function(key,val) {
 *         // However you want to set this key/val
 *     }
 * });
 */
function ReadlineUser (config) {

    var setter = config.setter;
    var getter = config.getter;

    var DEFAULT_PREFERENCES = {
        "ENABLED_BOOL"                          : true,
        "RSVP_WPM_NUM"                          : 250,
        "RSVP_AUTOSTART_BOOL"                   : false,
        "RSVP_ALT_SELECT_TRIGGER_BOOL"          : false,
        "RSVP_ALT_HOVER_TRIGGER_SELECTION_BOOL" : true,
        "RSVP_SPACEBAR_TRIGGER_BOOL"            : false,
        "RSVP_HIGHLIGHT_FOCAL_POINT_BOOL"       : true,
        "RSVP_SHOW_PROGRESS_BOOL"               : true,
        "RSVP_FONT_SIZE_STR"                    : "36px",    // Medium
        "RSVP_FONT_FAMILY_STR"                  : "Verdana",
        "RSVP_SHADOW_COLOR_STR"                 : "#dddddd",
        "RSVP_DYNAMIC_SPEED_BOOL"               : true,
    };

    // Returns single user preference value with the correct type.
    // Returns null if illegal key
    this.getPreferenceValue = function(key) {

        var defaultVal = DEFAULT_PREFERENCES[key];
        var defaultValType = typeof(defaultVal);
        var savedVal = getter(key);
        var savedValType = typeof(savedVal);

        // Illegal Key => Return null
        if (defaultValType == 'undefined') {
            return null;
        }

        // No Saved Value => Return Default
        if (savedVal == null || savedValType == 'undefined') {
            return defaultVal;
        }

        // Boolean Type Conversion
        if (defaultValType == 'boolean') {
            if (savedValType == 'boolean') {
                return savedVal;
            } else {
                if (savedVal == 'true') {
                    return true;
                } else {
                    return false;
                }
            }

        // Number Type Conversion
        } else if (defaultValType == 'number') {
            return parseInt(savedVal, 10); // TODO handle float case (currently not used)

        // String Type Conversion
        } else if (defaultValType == 'string') {
            return savedVal;

        // Unsuppoted Type
        } else {
            console.log("[WARN] Unsupported user preference value type:" + defaultValType);
            return null;
        }
    }

    this.getPreferences = function() {

        var userPreferences = {};
        for (var tmpKey in DEFAULT_PREFERENCES) {
            var tmpVal = this.getPreferenceValue(tmpKey);
            if (tmpVal != null) {
                userPreferences[tmpKey] = tmpVal;
            }
        }
        return userPreferences;
    }

    this.savePreference = function(key, val) {

        if (typeof(key) === 'undefined' || typeof(val) === 'undefined') {
            console.log("[WARN] Cannot Save User Preference (Key:" + key + ", Val:" + val + ", Type:" + typeof(val) + ")");
            return false;
        }

        console.log("[INFO] Saving User Preference (Key:" + key + ", Val:" + val + ", Type:" + typeof(val) + ")");

        return setter(key, val.toString());
    }

}
