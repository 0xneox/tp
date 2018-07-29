import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import BurgerMenu from 'react-burger-menu';
import { Input, Button, Icon, Popup, Label, Table } from 'semantic-ui-react'
import PopoutWindow from 'react-popout'

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const sideChanged = this.props.children.props.right !== nextProps.children.props.right;

    if (sideChanged) {
      this.setState({hidden : true});

      setTimeout(() => {
        this.show();
      }, this.props.wait);
    }
  }

  show() {
    this.setState({hidden : false});
  }

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className={this.props.side}>
        {this.props.children}
      </div>
    );
  }
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      currentMenu: 'scaleRotate',
      side: 'left',
      ethereumAddress: '',
      loadingEthereum: false,
      ethereumTransactions: [],
      iTransactionCount: '',
      showTransactionLabel: false
    };
    this.getItems = this.getItems.bind(this);
    this.onEthereumInputChange = this.onEthereumInputChange.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
  }

  getItems() {
    let items = [
          <h2 key="0"><i className="fa fa-fw fa-cubes fa-2x" /><span>TaxPotter</span></h2>,
          <a key="1" href=""><i className="fa fa-fw fa-gears" /><span>About</span></a>,
          <a key="1" href=""><i className="fa fa-fw fa-money" /><span>How it works</span></a>,
          <a key="5" href=""><i className="fa fa-fw fa-list" /><span>Contact</span></a>,
        ];
    return items;
  }

  onEthereumInputChange(event) {
    this.setState({ethereumAddress: event.target.value});
  }

  getTransactions() {
    var aTransactions, oDate, sLocaleDateTime, sValue, iTransactionCount;
    var aCleanTransactions = [];
    var that = this;
    this.setState({loadingEthereum: true}); // set input to loading
    axios.get("http://api.etherscan.io/api?module=account&action=txlist&address=" + this.state.ethereumAddress + "&startblock=0&endblock=99999999&sort=asc&apikey=D5VZY7FYF3JZA1IZPTNV6ZCC34YIG29Q28")
      .then(function (response) {
        console.log(response);
        aTransactions = response.data.result;
        aTransactions.forEach((oTransaction) => {
          console.log(oTransaction.timeStamp);
          oDate = new Date(oTransaction.timeStamp*1000); // convert UNIX timestamp
          sLocaleDateTime = oDate.toLocaleDateString() + " " + oDate.toLocaleTimeString(); // date to human readable string
          sValue = (parseFloat(oTransaction.value) / 1000000000000000000).toString(); // TODO: include bignumber.js?
          aCleanTransactions.push({amount: sValue, to: oTransaction.to, time: sLocaleDateTime})
        });
        iTransactionCount = aCleanTransactions.length;
        that.setState({loadingEthereum: false, ethereumTransactions: aCleanTransactions, ethereumTransactionCount: iTransactionCount, showTransactionLabel: true});
      })
      .catch(function (error) {
        console.log(error);
        that.setState({loadingEthereum: false});
      });
  }

  buildAddressInputs() {
    const transactionTable = this.buildTable();
    let addressInputs = (
      <div>
        <Input placeholder='ETH Address...' className="input__wide" loading={this.state.loadingEthereum} icon={<Icon name='clone' link/>} value={this.state.ethereumAddress} onChange={this.onEthereumInputChange}/>
        <Button primary onClick={this.getTransactions}>
          <Icon name='checkmark' />
          Go!
        </Button>
        { this.state.showTransactionLabel && <Popup
            trigger={<button> <Label color='green' horizontal>{this.state.ethereumTransactionCount} Transactions Found</Label></button>}
            header="Transactions"
            height="324"
            width="548"
            position="right center"
            content={transactionTable}
            hoverable={true}
          /> }
        <br/>
      </div>
    );
    return addressInputs;
  }

  { this.state.showTransactionLabel && <Popup
  <Button primary onClick={this.state.ethereumTransactionCount}<Label color='green' horizontal>Transactions Found</Label>



  buildAddAddressButtons() {
    let addAddressButtons = (
      <div>

        <Button secondary>
          <Icon name='euro' />
          ETH
        </Button>

      </div>
    )
    return addAddressButtons;
  }

  buildTable() {
    if (this.state.ethereumTransactions.length === 0) {
      return;
    }
    let rows = [];
    // build table for popup
    this.state.ethereumTransactions.forEach((oTransaction) => {
      rows.push(
        <Table.Row>
          <Table.Cell>{oTransaction.amount}</Table.Cell>
          <Table.Cell>{oTransaction.to}</Table.Cell>
          <Table.Cell>{oTransaction.time}</Table.Cell>
        </Table.Row>
      );
    });
    let transactionTable = (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>To</Table.HeaderCell>
            <Table.HeaderCell>Date & Time</Table.HeaderCell>
            <Table.HeaderCell>Cost at Transaction Time (USD)</Table.HeaderCell>
            <Table.HeaderCell>Tax Incurred</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    );
    return transactionTable;
  }

  render() {
    const Menu = BurgerMenu[this.state.currentMenu];
    const items = this.getItems();
    const addressInputs = this.buildAddressInputs();
    const addAddressButtons = this.buildAddAddressButtons();

    return (
      <div id="outer-container" style={{height: '100%'}}>
        <MenuWrap wait={20}>
          <Menu id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
            {items}
          </Menu>
        </MenuWrap>
        <main id="page-wrap">
          <h1><a href="">TaxPotter </a></h1>
          <h2 className="description"></h2>
          <h2 className="instructions">Enter your crypto address and calculate the capital gains </h2>
          <p>Currently BTC or  ETH support<sup>*</sup></p>
          <br/>
          {addressInputs}
          <Popup
              trigger={<Button secondary>
                <Icon name='plus' />
                Add another address...
              </Button>}
              content={addAddressButtons}
              hoverable={true}
            />
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <sup>*Not for production,alpha version  </sup>
        </main>

      </div>
    );
  }
}

export default App;
