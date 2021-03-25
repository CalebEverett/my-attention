/*global chrome*/

// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(
   function (tab) {
      // Send a message to the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         var activeTab = tabs[0];
         chrome.tabs.sendMessage(activeTab.id, { message: "clicked_browser_action" });
      });
      return true
   });

chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      console.log(request.message);
      switch (request.message) {
         case "get_history":
            chrome.history.search({ text: '', startTime: 1612998413443 - 30 * 24 * 60 * 60 * 100, maxResults: 500 },
               function (data) { sendResponse({ history: data }) });
            break;
         case "toggle_highlights":
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
               var activeTab = tabs[0];
               chrome.tabs.sendMessage(activeTab.id, request);
            });
            break;
         default:
            break;
      }
      return true
   }
);