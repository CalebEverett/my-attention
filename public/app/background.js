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

const getHistory = (startTime, maxResults = 500) => {
   return new Promise((resolve, reject) => {
      try {
         chrome.history.search({ text: '', startTime, maxResults },
            history => { resolve(history) });
      } catch (error) {
         reject(error)
      }
   })
}

const getVisits = (url) => {
   return new Promise((resolve, reject) => {
      try {
         chrome.history.getVisits({ url },
            (visits) => { resolve(visits) });
      } catch (error) {
         reject(error)
      }
   })
}

const statRow = (key, stat, day = 0, week = 0, month = 0, year = 0) => {
   return { key, stat, day, week, month, year }
};

const getContentData = () => {
   this.pageCounts = statRow('pageCounts', "Total page views")
   this.contentPlaceHolders = [
      statRow('pageCountsUnique', "Unique page views"),
      statRow('pagesNotBounced', "Page views not bounced"),
      statRow('newPages', "New page views not bounced"),
      statRow('oldPages', "Previously visited page views not bounced"),
      statRow('tabsOpened', "Tabs opened"),
      statRow('avgTimePerTab', "Average active time per tab")
   ];

   const day = Date.now() - 1000 * 60 * 60 * 24;
   const week = Date.now() - 1000 * 60 * 60 * 24 * 7;
   const month = Date.now() - 1000 * 60 * 60 * 24 * 30;
   const year = Date.now() - 1000 * 60 * 60 * 24 * 365;

   getHistory(historyStart, 0)
      .then(history => {
         Promise.all(history.map(h => getVisits(h.url)))
            .then(visits => {
               const allVisits = [].concat(...visits)
               allVisits.forEach(v => {
                  if (v.visitTime > day) { this.pageCounts.day += 1; };
                  if (v.visitTime > week) { this.pageCounts.week += 1; };
                  if (v.visitTime > month) { this.pageCounts.month += 1; };
                  if (v.visitTime > year) { this.pageCounts.year += 1; };
               });
               contentData.pageCounts = this.pageCounts;
               this.contentPlaceHolders.forEach(row => { contentData[row.key] = row });
            })
      })
      .catch((error) => console.log(error))
};

const contentData = {};
getContentData()

chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      console.log(request.message);
      switch (request.message) {
         case "get_history":
            getHistory(historyStart).then((history) => { sendResponse(history) });
            break;
         case "toggle_highlights":
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
               var activeTab = tabs[0];
               chrome.tabs.sendMessage(activeTab.id, request);
            });
            break;
         case "get_content_data":
            sendResponse(contentData);
            break;
         default:
            break;
      }
      return true
   }
);


