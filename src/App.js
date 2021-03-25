/*global chrome*/

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Divider, Input, Row, Table, Tabs } from 'antd';
import Highlighter from "react-highlight-words";
import 'antd/dist/antd.css';

const { TabPane } = Tabs;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { history: null, filteredHistory: null, searchTerm: null, highlight: false };
  };

  getHistory = () => {
    const message = {
      from: 'app',
      message: "get_history",
    };

    chrome.runtime.sendMessage(
      message,
      (response) => {
        const data = response.history.map((item, index) => ({
          key: index,
          title: item.title,
          url: item.url,
          visits: item.visitCount,
          last: item.lastVisitTime
        }));
        this.setState({ history: data })
      }
    );

  };

  handleHighlightLinks = () => {
    const message = {
      from: 'app',
      message: "toggle_highlights",
      highlight: !this.state.highlight
    };

    this.setState({ highlight: !this.state.highlight })
    console.log(message);

    chrome.runtime.sendMessage(
      message,
      (response) => {
        console.log(response)
      }
    );

  };

  highlight = (text) => {
    return <Highlighter
      highlightStyle={{ backgroundColor: "yellow" }}
      searchWords={[this.state.searchTerm]}
      autoEscape={true}
      textToHighlight={text}
    />
  };

  columns = [
    {
      title: 'Link',
      key: 'link',
      width: '50%',
      render: (_, record) => <a href={record.url} rel="noreferrer" target='_blank'>{this.highlight(record.title)}</a>
    },
    {
      title: 'Visits',
      dataIndex: 'visits',
      key: 'visits',
      width: '25%',
      sorter: (a, b) => a.visits - b.visits
    },
    {
      title: 'Last Visited',
      dataIndex: 'last',
      key: 'last',
      width: '25%',
      render: ts => new Date(ts).toISOString().substring(0, 10),
      sorter: (a, b) => a.last - b.last
    },
  ]

  search = searchTerm => {
    const { history } = this.state;
    console.log("PASS", { searchTerm });

    const filteredHistory = history.filter(record => record.title.toLowerCase().includes(searchTerm.toLowerCase()));

    this.setState({ filteredHistory, searchTerm });

  };

  componentDidMount() {
    this.getHistory();
  };

  onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  }

  render() {
    const { filteredHistory, history } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          {this.props.isExt ?
            <img src={chrome.runtime.getURL("static/media/logo.svg")} className="App-logo" alt="logo" />
            :
            <img src={logo} className="App-logo" alt="logo" />
          }

          <h1 className="App-title">my attention</h1>
        </header>
        <Divider orientation="left"></Divider>
        <Row justify="start">
          <Button type="primary" onClick={this.handleHighlightLinks} ghost={!this.state.highlight}>Highlight</Button>
        </Row>
        <Divider orientation="left"></Divider>
        <Row justify="start">
          <Tabs defaultActiveKey="history">
            <TabPane tab="Statistics" key="stats">
              <p>Hello Mellow</p>
            </TabPane>
            <TabPane tab="History" key="history">
              <Input.Search
                placeholder="Search..."
                onChange={e => this.search(e.target.value)}
              />
              <Table
                columns={this.columns}
                dataSource={filteredHistory ? filteredHistory : history}
                size="small"
                onChange={this.onChange}
                pagination={{ defaultPageSize: 50 }}
                width='400px'
              >
              </Table>
            </TabPane>
          </Tabs>
        </Row>
      </div >
    );
  }
}

export default App;
