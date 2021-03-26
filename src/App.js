/*global chrome*/

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Card, Col, Divider, Input, Row, Table, Tabs } from 'antd';
import Highlighter from "react-highlight-words";
import 'antd/dist/antd.css';

const { TabPane } = Tabs;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { history: null, filteredHistory: null, searchTerm: null, highlight: false, visitCounts: null };
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
        this.setState({ history: data });
        this.getPageCounts();
        console.log(this.state);
      }
    );

  };

  getPageCounts = () => {
    const visitCounts = { day: 0, week: 0, month: 0, year: 0 }

    const day = Date.now() - 1000 * 60 * 60 * 24;
    const week = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const month = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const year = Date.now() - 1000 * 60 * 60 * 24 * 365;

    this.state.history.forEach(h => {
      if (h.last > day) { visitCounts.day += h.visits; };
      if (h.last > week) { visitCounts.week += h.visits; };
      if (h.last > month) { visitCounts.month += h.visits; };
      if (h.last > year) { visitCounts.year += h.visits; };
    });

    this.setState({ visitCounts })

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

  content_columns = [
    { title: "Statistic", key: 'stat' },
    { title: "Day", key: 'day' },
    { title: "Week", key: 'week' },
    { title: "Month", key: 'month' },
    { title: "Year", key: 'year' },
  ]

  dummy_data = [
    {
      stat: "Total pages viewed",
      day: 100,
      week: 1000,
      month: 2000,
      year: 3000,
    }
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
        <Row justify="space-around">
          <Button type="primary" onClick={this.handleHighlightLinks} ghost={!this.state.highlight}>Highlight</Button>
          <Button type="primary" ghost={true}>Block Ads</Button>
          <Button type="primary" ghost={true}>Previous Only</Button>
        </Row>
        <Divider orientation="left"></Divider>
        <Row justify="start">
          <Col span={24}>
            <Tabs defaultActiveKey="statistics">
              <TabPane tab="Statistics" key="stats">
                <p>Key stats for day, week, month, year.</p>
                <Divider>Time</Divider>
                <p>Total active browser time</p>
                <p>Total time searching</p>
                <p>Total time consuming content</p>
                <Divider>Content</Divider>
                <Table
                  columns={this.content_columns}
                  datasource={this.dummy_data}
                  size="small"
                  width='400px'
                >
                </Table>
                <p>Total pages viewed</p>
                <p>Total pages viewed not bounced</p>
                <p>Total new pages viewed not bounced</p>
                <p>Total previously visited pages viewed not bounced</p>
                <p>Total tabs opened</p>
                <p>Average time per active tab</p>
                <Divider>Search</Divider>
                <p>Bounce rate</p>
                <p>Total searches</p>
                <p>Total clicks</p>
                <p>Total bounce clicks</p>
                <p>Total not bounced clicks</p>
                <p>Average clicks per search</p>
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
          </Col>
        </Row>
      </div >
    );
  }
}

export default App;
