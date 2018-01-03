import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'toastr/build/toastr.css'
import toastr from 'toastr/build/toastr.min.js'
import FaCopy from 'react-icons/lib/fa/copy';
import copy from 'copy-to-clipboard';
import bitcoinCash from 'bitcoincashjs';
import './App.css';

const Address = bitcoinCash.Address;
const LegacyFormat = Address.LegacyFormat;
const CashAddrFormat = Address.CashAddrFormat;
const BitpayFormat = Address.BitpayFormat;

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      input: '',
      network: 'livenet',
      prefixed: true,
      hasOutput: false,
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
        legacy: '',
        cashaddr: '',
        bitpay: '',
      });
    }
    else {
      const address = option.value;
      const network = address.network.name;
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
        network: network,
        prefixed: prefixed,
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
                      <h2 className="display-4">Address Translator</h2>
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
                        <div className="form-group mb-2">
                          <select value={this.state.network} onChange={this.onNetworkChange.bind(this)} className="custom-select custom-select-sm" disabled>
                            <option value="livenet" defaultValue>Mainnet</option>
                            <option value="testnet">Testnet</option>
                          </select>
                        </div>
                        <div className="form-group mx-sm-3 mb-2">
                          <div className="form-check form-check-inline">
                            <input checked={this.state.prefixed} onChange={this.onPrefixedChange.bind(this)} className="form-check-input" type="checkbox" id="prefix-input" value="option1" />
                            <label className="form-check-label" htmlFor="prefix-input">Display with prefix</label>
                          </div>
                        </div>
                      </form>
                      {
                        this.state.hasOutput ?
                        (
                          <div className="output"> {/* 1KBoA6asnP8dyEi5SBXa13qPSWPitdbcYk */}
                          <hr />
                            <div><span onClick={this.copyLegacy.bind(this)}><strong>Legacy format:</strong> { this.state.legacy }</span>  <button type="button" className="btn btn-light btn-sm" onClick={this.copyLegacy.bind(this)}><FaCopy /></button></div>
                            <div><span onClick={this.copyCashAddr.bind(this)}><strong>Cash Address format:</strong> { this.state.cashaddr } </span> <button type="button" className="btn btn-light btn-sm" onClick={this.copyCashAddr.bind(this)}><FaCopy /></button></div>
                            <div><span onClick={this.copyBitpay.bind(this)}><strong>Bitpay format:</strong> { this.state.bitpay } </span>  <button type="button" className="btn btn-light btn-sm" onClick={this.copyBitpay.bind(this)}><FaCopy /></button></div>
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
      </div>
    );
  }
}

export default App;
