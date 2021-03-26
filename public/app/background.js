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


const historyStart = Date.now() - 365 * 24 * 60 * 60 * 1000

chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      console.log(request.message);
      switch (request.message) {
         case "get_history":
            chrome.history.search({ text: '', startTime: historyStart, maxResults: 500 },
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

chrome.history.search({ text: '', startTime: historyStart, maxResults: 1 },
   function (data) {
      const url = new URL(data[0].url);
      console.log({ 'pathname': url.pathname });
   });
