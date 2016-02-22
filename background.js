/*
 * Main Background Script.
 *
 * RECEIVES MESSAGES:
 * - RequestRSVP(Text): content script wants to init RSVP
 * - SaveUserPreference(Key, Val)
 *
 * SENDS MESSAGES:
 * - StartRSVP(Text): tell content script to start RSVP
 * - UserPreferencesUpdated(UserPreference)
 *
 */

//// Configs ////

var ICON_PATH_ENABLED = "icon/icon_38px_enabled.png";   // TODO Remove hardcode icon size to 38px resolution (how?)
var ICON_PATH_DISABLED = "icon/icon_38px_disabled.png";


//// SINGLETONS ////

var readlineUser = new ReadlineUser({

    "setter": function(key,val) {
        localStorage[key] = val;
    },
    "getter": function(key) {
        return localStorage[key];
    }
});


//// Install/Update Handler ////

chrome.runtime.onInstalled.addListener(function(details){

    console.log("[INFO] Readline Installed (Version:" + chrome.runtime.getManifest().version + ")");

    var userPreferences = readlineUser.getPreferences();
    var readlineEnabled = userPreferences["ENABLED_BOOL"];

    if (readlineEnabled) {
        chrome.tabs.getAllInWindow(null, function(tabs){
            for(var i=0; i<tabs.length; i++) {
                chrome.browserAction.setIcon({path: ICON_PATH_ENABLED, tabId:tabs[i].id});
            }
        });
    } else {
        chrome.tabs.getAllInWindow(null, function(tabs){
            for(var i=0; i<tabs.length; i++) {
                chrome.browserAction.setIcon({path: ICON_PATH_DISABLED, tabId:tabs[i].id});
            }
        });
    }
});

//// New Tab Event ////

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { // onCreated was getting overwritten

    var userPreferences = readlineUser.getPreferences();
    var readlineEnabled = userPreferences["ENABLED_BOOL"];

    if (readlineEnabled) {
        chrome.browserAction.setIcon({path: ICON_PATH_ENABLED, tabId:tabId});
    } else {
        chrome.browserAction.setIcon({path: ICON_PATH_DISABLED, tabId:tabId});
    }
});


//// MESSAGE HANDLERS ////

function handleMessage_RequestRSVP (request, sender, sendResponse) {

    //console.log("Got RequestRSVP (background)");

    // Send Message "StartRSVP" to Active Tab
    chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            "MessageName": "StartRSVP",
            "Text": request.Text
        });
    });
}

function handleMessage_GetUserPreferences (request, sender, sendResponse) {

    // Return to sender
    sendResponse({
        "preferences": readlineUser.getPreferences()
    });
}

function handleMessage_SaveUserPreference (request, sender, sendResponse) {

    //console.log("SaveUserPreference (Key:" + request.Key + ", Val:" + request.Val + ")");

    var key = request.Key;
    var val = request.Val;

    readlineUser.savePreference(key, val);

    // Broadcast Message "UserPreferencesUpdated" to all tabs
    var updatedUserPreferences = readlineUser.getPreferences();

    sendResponse(updatedUserPreferences);

    chrome.tabs.query({
    }, function (tabs) {
        for(var i=0; i<tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, {
                "MessageName": "UserPreferencesUpdated",
                "UserPreferences": updatedUserPreferences
            });
        }
    });
}

function handleMessage_EnableReadline(request, sender, sendResponse) {

    readlineUser.savePreference("ENABLED_BOOL", true);

    // Set Icon & Broadcase User Preference Update to all Tabs

    var updatedUserPreferences = readlineUser.getPreferences();
    chrome.tabs.getAllInWindow(null, function(tabs){
        for(var i=0; i<tabs.length; i++) {
            chrome.browserAction.setIcon({path: ICON_PATH_ENABLED, tabId:tabs[i].id});
            chrome.tabs.sendMessage(tabs[i].id, {
                "MessageName": "UserPreferencesUpdated",
                "UserPreferences": updatedUserPreferences
            });
        }
    });
}

function handleMessage_DisableReadline(request, sender, sendResponse) {

    readlineUser.savePreference("ENABLED_BOOL", false);

    // Set Icon & Broadcase User Preference Update to all Tabs

    var updatedUserPreferences = readlineUser.getPreferences();
    chrome.tabs.getAllInWindow(null, function(tabs){
        for(var i=0; i<tabs.length; i++) {
            chrome.browserAction.setIcon({path: ICON_PATH_DISABLED, tabId:tabs[i].id});
            chrome.tabs.sendMessage(tabs[i].id, {
                "MessageName": "UserPreferencesUpdated",
                "UserPreferences": updatedUserPreferences
            });
        }
    });
}



//// BIND EVENTS ////

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.MessageName) {
        case "GetUserPreferences": return handleMessage_GetUserPreferences(request, sender, sendResponse);
        case "SaveUserPreference": return handleMessage_SaveUserPreference(request, sender, sendResponse);
        case "RequestRSVP":  return handleMessage_RequestRSVP(request, sender, sendResponse);
        case "EnableReadline": return handleMessage_EnableReadline(request, sender, sendResponse);
        case "DisableReadline": return handleMessage_DisableReadline(request, sender, sendResponse);
    }
});


//// PAGE CONTEXT MENU ////

/*
var context = "page";
var title = "Show Readline";
var id = chrome.contextMenus.create({
    "title": title,
    "contexts": [context],
    "onclick": function(info, tab) {

        //Add all you functional Logic here
        chrome.tabs.query({
            "active": true,
            "currentWindow": true
        }, function (tabs) {
            // Send message to this tab's content script
            chrome.tabs.sendMessage(tabs[0].id, {
                "functiontoInvoke": "ReadlineWholePage",
                "url":tabs[0].url
            });
        });
    }
});
*/


//// SELECTION CONTEXT MENU ////

// Hak
// This is the Chrome right click menu
var contexts = ["selection"];
for (var i = 0; i < contexts.length; i++) {

    var context = contexts[i];
    var title = "Start Readline";

    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "onclick": function(info, tab) {

            //Add all you functional Logic here
            chrome.tabs.query({
                "active": true,
                "currentWindow": true
            }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    "MessageName": "InvokeRSVP",
                    "FallbackSelectionText": info.selectionText
                });
            });
        }
    });
}
