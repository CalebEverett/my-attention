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
      (history) => {
        const data = history.map((item, index) => ({
          key: index,
          title: item.title,
          url: item.url,
          visits: item.visitCount,
          last: item.lastVisitTime
        }));
        this.setState({ history: data });
        this.getTimeStats();
        this.getSearchStats();
      }
    );

  };

  statRow = (key, stat, day = 0, week = 0, month = 0, year = 0) => {
    return { key, stat, day, week, month, year }
  };


  getContentData = () => {
    const message = {
      from: 'app',
      message: "get_content_data",
    };

    chrome.runtime.sendMessage(
      message,
      (contentData) => { this.setState({ contentData }); console.log(this.state.contentData); }
    );
  }

  statRow = (key, stat, day = 0, week = 0, month = 0, year = 0) => {
    return { key, stat, day, week, month, year }
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
    this.getContentData();

  };

  onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  }

  getStatsTable = (title, tableData) => {
    return <div><Divider>{title}</Divider>
      <Table
        columns={this.stats_columns}
        dataSource={tableData}
        size="small"
        width='400px'
        pagination={false}
      >
      </Table>
    </div>
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
                {this.getStatsTable("Time", timeTableData)}
                {this.getStatsTable("Content", contentTableData)}
                {this.getStatsTable("Search", searchTableData)}
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
