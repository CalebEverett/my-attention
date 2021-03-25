/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import App from "./App";
class Main extends React.Component {
  render() {
    return (
      <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}>
        <FrameContextConsumer>
          {
            ({ document, window }) => {
              return <App document={document} window={window} isExt={true} />
            }
          }
        </FrameContextConsumer>
      </Frame>
    )
  }
}

const app = document.createElement('div');
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Main />, app);

app.style.display = "none";

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(request.message)
    switch (request.message) {
      case "clicked_browser_action":
        togglePopUp();
        break;
      case "toggle_highlights":
        toggleHighlight(request.highlight)
        break;
      default:
        break;
    }
    return true
  }
);

const togglePopUp = () => {
  if (app.style.display === "none") {
    app.style.display = "block";
  } else {
    app.style.display = "none";
  }
};


const toggleHighlight = (highlight) => {
  const color = highlight ? 'yellow' : ""

  console.log(color)

  chrome.runtime.sendMessage(
    {
      from: 'app',
      message: "get_history",
    },
    (response) => {
      const domains = [];

      for (var h of response.history) {
        const url = new URL(h.url);
        if (!domains.includes(url.hostname)) {
          domains.push(url.hostname);
        };
      };

      var anchors = document.getElementsByTagName('a');

      for (var el of anchors) {

        try {
          if (domains.includes(el.hostname) && el.hostname.indexOf('google') === -1) {
            el.style.backgroundColor = color
          }
        }
        catch (err) {
        }
      }

    }
  );
};