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
    (history) => {
      const pages = [];

      history.forEach(h => {
        const url = new URL(h.url)
        const page = url.protocol + "//" + url.pathname
        if (!pages.includes(page)) {
          pages.push(page);
        };
      });

      var anchors = document.getElementsByTagName('a');

      for (var el of anchors) {

        try {
          const link = el.protocol + "//" + el.pathname
          if (pages.includes(link)) {
            el.style.backgroundColor = color
          }
        }
        catch (err) {
        }
      }

    }
  );
};
