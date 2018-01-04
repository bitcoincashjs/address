import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'toastr/build/toastr.css'
import toastr from 'toastr/build/toastr.min.js'
import FaCopy from 'react-icons/lib/fa/copy';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';
import copy from 'copy-to-clipboard';
import bch from 'bitcoincashjs';
import './App.css';

const Address = bch.Address;
const LegacyFormat = Address.LegacyFormat;
const CashAddrFormat = Address.CashAddrFormat;
const BitpayFormat = Address.BitpayFormat;

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      input: '',
      prefixed: true,
      hasOutput: false,
      network: '',
      type: '',
      legacy: '',
      cashaddr: '',
      bitpay: '',
    }
  }

  onInputChange(event){
    const input = event.target.value.trim();
    const option = this.decodeAddress(input);
    if (option.empty) {
      this.setState({
        input: input,
        hasOutput: false,
        network: '',
        type: '',
        legacy: '',
        cashaddr: '',
        bitpay: '',
      });
    }
    else {
      const address = option.value;
      const network = address.network.name;
      const type = address.type;
      const cashaddr = address.toString(CashAddrFormat);
      const prefixed = this.state.prefixed
          || (input === cashaddr && input.indexOf(':') !== -1);
      const legacy = address.toString(LegacyFormat);
      const cashaddrDisplay = prefixed ?
          cashaddr :
          cashaddr.split(':')[1];
      const bitpay = address.toString(BitpayFormat);
      this.setState({
        input: input,
        prefixed: prefixed,
        network: network,
        type: type,
        hasOutput: true,
        legacy: legacy,
        cashaddr: cashaddrDisplay,
        bitpay: bitpay,
      });
    }
  }

  decodeAddress(input) {
    let result = this.optional(Address.fromString, input, null, null, LegacyFormat);
    if (result.empty) {
      result = this.optional(Address.fromString, input, null, null, BitpayFormat);
    }
    if (result.empty) {
      for (const network of ['livenet', 'testnet']) {
        for (const type of [Address.PayToPublicKeyHash, Address.PayToScriptHash]) {
          const prefix = network === 'livenet' ? 'bitcoincash' : 'bchtest';
          result = this.optional(Address.fromString, input, network, type, CashAddrFormat);
          if (result.empty) {
            result = this.optional(Address.fromString, `${prefix}:${input}`, network, type, CashAddrFormat);
          }
          if (!result.empty) {
            break;
          }
        }
        if (!result.empty) {
          break;
        }
      }
    }
    return result;
  }

  optional(fn, ...args) {
    try {
      return {
        empty: false,
        value: fn(...args)
      };
    }
    catch (err) {
      return {
        empty: true,
        value: null
      }
    }
  }

  onNetworkChange(event) {
    this.setState({
      network: event.target.value,
    });
  }

  onPrefixedChange(event) {
    const prefixed = $(event.target).is(':checked');
    if (!this.state.hasOutput) {
      this.setState({
        prefixed: prefixed,
      });
    }
    else {
      if (prefixed && this.state.cashaddr.indexOf(':') === -1) {
        const prefix = this.state.network === 'livenet' ? 'bitcoincash' : 'bchtest';
        const cashaddr = `${prefix}:${this.state.cashaddr}`;
        this.setState({
          prefixed: prefixed,
          cashaddr: cashaddr,
        });
      }
      else if (!prefixed && this.state.cashaddr.indexOf(':') !== -1) {
        this.setState({
          prefixed: prefixed,
          cashaddr: this.state.cashaddr.split(':')[1],
        });
      }
    }
  }

  copyLegacy() {
    const success = copy(this.state.legacy);
    this.afterCopy(success);
  }

  copyCashAddr() {
    const success = copy(this.state.cashaddr);
    this.afterCopy(success);
  }

  copyBitpay() {
    const success = copy(this.state.bitpay);
    this.afterCopy(success);
  }

  afterCopy(success) {
    if (success) {
      toastr.success('Address copied to clipboard.', '', { timeOut: 1000 });
    }
    else {
      toastr.warning('Could not copy address to clipboard.', '', { timeOut: 1000 });
    }
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8 offset-lg-2">
              <div className="content">
                <div className="Title">
                  <div className="jumbotron jumbotron-fluid">
                    <div className="container">
                      <h1 className="display-3">Bitcoin&#8203;<span>Cash</span>.js</h1>
                      <h2 className="display-4">Address Translator <span className="question" data-toggle="modal" data-target="#question-modal"><FaQuestionCircle /></span></h2>
                    </div>
                  </div>
                </div>
                <div className="Translator">
                  <div className="card">
                    <div className="card-body">
                      <div className="address-input">
                        <label htmlFor="address">Enter the address you wish to translate:</label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">Address</span>
                          </div>
                          <input value={this.state.input} onChange={this.onInputChange.bind(this)} type="text" className="form-control" id="address" />
                        </div>
                      </div>
                      <form className="form-inline">
                        <div className="form-group mx-sm-1 mb-1">
                          <div className="form-check form-check-inline">
                            <input checked={this.state.prefixed} onChange={this.onPrefixedChange.bind(this)} className="form-check-input" type="checkbox" id="prefix-input" value="option1" />
                            <label className="form-check-label" htmlFor="prefix-input">Display with prefix</label>
                          </div>
                        </div>
                      </form>
                      <span className="invalid-address"><em>{ this.state.input && !this.state.hasOutput ? 'This is not a valid Bitcoin Cash address.' : '' }</em></span>
                      {
                        this.state.hasOutput ?
                        (
                          <div className="output">
                            <hr />
                            <div className="legacy-output"><strong>Legacy format:</strong> <span onClick={this.copyLegacy.bind(this)}> { this.state.legacy }</span>  <button type="button" className="btn btn-light btn-sm" onClick={this.copyLegacy.bind(this)}><FaCopy /></button></div>
                            <div className="cashaddr-output"><strong>Cash Address format:</strong> <span onClick={this.copyCashAddr.bind(this)}> { this.state.cashaddr } </span> <button type="button" className="btn btn-light btn-sm" onClick={this.copyCashAddr.bind(this)}><FaCopy /></button></div>
                            <div className="bitpay-output"><strong>Bitpay format:</strong> <span onClick={this.copyBitpay.bind(this)}> { this.state.bitpay } </span>  <button type="button" className="btn btn-light btn-sm" onClick={this.copyBitpay.bind(this)}><FaCopy /></button></div>
                            <em>
                              This is a {
                                this.state.network === 'livenet' ? 'mainnet' : 'testnet'
                              } address, of type {
                                this.state.type === 'pubkeyhash' ? 'Pay-to-Public-Key-Hash' : 'Pay-to-Script-Hash'
                              }.
                            </em>
                          </div>
                        ) :
                        ''
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="question-modal" className="modal" tabindex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">A small FAQ</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <h6>Why do we need an address translator?</h6>
                <p><a href="https://www.bitcoincash.org">Bitcoin Cash</a> is a new project, driven by innovation and evolving at a great pace. This means that new alternatives are constantly being explored in order to find the best way which can make us scale to a global level.</p>
                <p>Address formats are no exception to this rule; many exist, and many more will likely exist in the future. This app allows you to translate between different address formats, to help you bridge the gap and stay up to date with the latest Bitcoin Cash features.</p>
                <h6>What is the difference between an address and an address format?</h6>
                <p>Very generally, an address is a destination to which you can send Bitcoin Cash. However, the same destination can be expressed textually in many different ways. The same address can be expressed in many different formats, but <strong>all formats still represent the same destination</strong>. You will need to use whichever format your wallet or exchange uses, but your transaction will still arrive at the same address.</p>
                <h6>Which address formats are currently in use?</h6>
                <p>There are currently 3 different address formats in wide deployment: the original format (<strong>Legacy</strong>), the <strong>Bitpay</strong> format, and the new <strong>Cash Address</strong> format. For example, if your exchange only understands the Legacy format and you want to send funds to the Copay wallet (which uses the Bitpay format), you will need to translate the recipient address given by Copay into Legacy format for your exchange to understand it.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
