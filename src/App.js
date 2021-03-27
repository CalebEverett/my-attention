/*global chrome*/

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Col, Divider, Input, Row, Switch, Table, Tabs } from 'antd';
import Highlighter from "react-highlight-words";
import 'antd/dist/antd.css';

const { TabPane } = Tabs;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: null, filteredHistory: null, searchTerm: null,
      highlight: false, contentData: {}, timeData: {}, searchData: {}
    };
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
        this.getContentStats();
        this.getTimeStats();
        this.getSearchStats();
      }
    );

  };

  statRow = (key, stat, day = 0, week = 0, month = 0, year = 0) => {
    return { key, stat, day, week, month, year }
  };

  getContentStats = () => {
    const pageCounts = this.statRow('pageCounts', "Total pages viewed")

    const day = Date.now() - 1000 * 60 * 60 * 24;
    const week = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const month = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const year = Date.now() - 1000 * 60 * 60 * 24 * 365;

    this.state.history.forEach(h => {
      if (h.last > day) { pageCounts.day += h.visits; };
      if (h.last > week) { pageCounts.week += h.visits; };
      if (h.last > month) { pageCounts.month += h.visits; };
      if (h.last > year) { pageCounts.year += h.visits; };
    });

    const contentData = this.state.contentData

    contentData.pageCounts = pageCounts

    const contentPlaceHolders = [
      this.statRow('pagesNotBounced', "Pages viewed not bounced"),
      this.statRow('newPages', "New pages viewed not bounced"),
      this.statRow('oldPages', "Previously visited pages viewed not bounced"),
      this.statRow('tabsOpened', "Tabs opened"),
      this.statRow('avgTimePerTab', "Average active time per active")
    ]

    contentPlaceHolders.forEach(row => { contentData[row.key] = row })

    this.setState({ contentData })

  };

  getTimeStats = () => {
    const timeData = this.state.timeData

    const timePlaceHolders = [
      this.statRow('browserTime', "Active browser time"),
      this.statRow('timeSearch', "Time searching"),
      this.statRow('timeContent', "Time consuming content"),
    ]

    timePlaceHolders.forEach(row => { timeData[row.key] = row })

    this.setState({ timeData })
  };

  getSearchStats = () => {
    const searchData = this.state.searchData

    const searchPlaceHolders = [
      this.statRow('bounceRate', "Bounce rate"),
      this.statRow('searches', "Total searches"),
      this.statRow('clicks', "Total clicks"),
      this.statRow('bounceClicks', "Bounce clicks"),
      this.statRow('notBounceClicks', "Not bounced clicks"),
      this.statRow('clicksPerSearch', "Average clicks per search"),
    ]

    searchPlaceHolders.forEach(row => { searchData[row.key] = row })

    this.setState({ searchData })
  };

  handleHighlightLinks = (checked) => {
    const message = {
      from: 'app',
      message: "toggle_highlights",
      highlight: checked
    };

    this.setState({ highlight: checked })

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

  history_columns = [
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

  stats_columns = [
    { title: "Statistic", key: 'stat', dataIndex: 'stat' },
    { title: "Day", key: 'day', dataIndex: 'day', align: 'right' },
    { title: "Week", key: 'week', dataIndex: 'week', align: 'right' },
    { title: "Month", key: 'month', dataIndex: 'month', align: 'right' },
    { title: "Year", key: 'year', dataIndex: 'year', align: 'right' },
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
    const { contentData, filteredHistory, history, searchData, timeData } = this.state;
    const contentTableData = Object.values(contentData)
    const timeTableData = Object.values(timeData)
    const searchTableData = Object.values(searchData)

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
        <Divider>Settings</Divider>
        <Row justify="start">
          <Col span={6}>
            <p>Highlight</p>
            <Switch onChange={this.handleHighlightLinks}></Switch>
          </Col>
        </Row>
        <Divider></Divider>
        <Row justify="start">
          <Col span={24}>
            <Tabs defaultActiveKey="statistics">
              <TabPane tab="Statistics" key="stats">
                <Divider>Time</Divider>
                <Table
                  columns={this.stats_columns}
                  dataSource={timeTableData}
                  size="small"
                  width='400px'
                  pagination={false}
                >
                </Table>
                <Divider>Content</Divider>
                <p>Calculations need to be updated - currently total visits attributed to last visit date.</p>
                <Table
                  columns={this.stats_columns}
                  dataSource={contentTableData}
                  size="small"
                  width='400px'
                  pagination={false}
                >
                </Table>
                <Divider>Search</Divider>
                <Table
                  columns={this.stats_columns}
                  dataSource={searchTableData}
                  size="small"
                  width='400px'
                  pagination={false}
                >
                </Table>
              </TabPane>
              <TabPane tab="History" key="history">
                <Input.Search
                  placeholder="Search..."
                  onChange={e => this.search(e.target.value)}
                />
                <Table
                  columns={this.history_columns}
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
