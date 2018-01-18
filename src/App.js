import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'toastr/build/toastr.css'
import { Network, Type, toLegacyAddress, toBitpayAddress, toCashAddress, detectAddressNetwork, detectAddressType } from 'bchaddrjs';
import $ from 'jquery';
import copy from 'copy-to-clipboard';
import FaCopy from 'react-icons/lib/fa/copy';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';
import React, { Component } from 'react';
import toastr from 'toastr/build/toastr.min.js'

class App extends Component {
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
                      <h1 className="display-3">Bitcoin<wbr />&#8203;<span>Cash</span>.js</h1>
                      <h2 className="display-4">Address Translator <span className="question" data-toggle="modal" data-target="#question-modal"><FaQuestionCircle /></span></h2>
                    </div>
                  </div>
                </div>
                <TranslatorContainer copyText={this.copyText}/>
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

  copyText(text) {
    if (copy(text)) {
      toastr.success('Address copied to clipboard.', '', { timeOut: 1000 });
    }
    else {
      toastr.warning('Could not copy address to clipboard.', '', { timeOut: 1000 });
    }
  }
}

class TranslatorContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addressInputValue: '',
      prefixCheckboxValue: true,
    }
  }

  onAddressInputChange(event) {
    this.setState({
      addressInputValue: event.target.value.trim(),
    });
  }

  onPrefixCheckboxChange(event) {
    this.setState({
      prefixCheckboxValue: $(event.target).is(':checked'),
    });
  }

  render() {
    let legacyAddress;
    let bitpayAddress;
    let cashAddress;
    let network;
    let type;
    let isValidAddress;
    try {
      isValidAddress = true;
      legacyAddress = toLegacyAddress(this.state.addressInputValue);
      bitpayAddress = toBitpayAddress(this.state.addressInputValue);
      cashAddress = toCashAddress(this.state.addressInputValue);
      network = detectAddressNetwork(this.state.addressInputValue);
      type = detectAddressType(this.state.addressInputValue);
      if (cashAddress.indexOf(':') === -1 && this.state.prefixCheckboxValue) {
        cashAddress = networkToCashPrefix(network) + ':' + cashAddress;
      }
      else if (cashAddress.indexOf(':') !== -1 && !this.state.prefixCheckboxValue) {
        cashAddress = cashAddress.split(':')[1];
      }
    }
    catch (error) {
      isValidAddress = false;
    }
    const copyText = this.props.copyText;
    return (
      <Translator
        addressInputValue={this.state.addressInputValue}
        onAddressInputChange={this.onAddressInputChange.bind(this)}
        prefixCheckboxValue={this.state.prefixCheckboxValue}
        onPrefixCheckboxChange={this.onPrefixCheckboxChange.bind(this)}
        isValidAddress={isValidAddress}
        legacyAddress={legacyAddress}
        bitpayAddress={bitpayAddress}
        cashAddress={cashAddress}
        network={network}
        type={type}
        copyText={copyText}
      />
    );
  }
}

function networkToCashPrefix(network) {
  switch (network) {
    case Network.Mainnet:
      return 'bitcoincash';
    default:
      return 'bchtest';
  }
}

function Translator(props) {
  const {
    addressInputValue,
    onAddressInputChange,
    prefixCheckboxValue,
    onPrefixCheckboxChange,
    isValidAddress,
    legacyAddress,
    bitpayAddress,
    cashAddress,
    network,
    type,
    copyText,
  } = props;
  let error, output;
  if (addressInputValue.length > 0) {
    if (isValidAddress) {
      output = (
        <TranslatorOutput
          legacyAddress={legacyAddress}
          bitpayAddress={bitpayAddress}
          cashAddress={cashAddress}
          network={network}
          type={type}
          copyText={copyText}
        />
      );
    }
    else {
      error = (
        <span className="invalid-address">
          <em>This is not a valid Bitcoin Cash address.</em>
        </span>
      );
    }
  }
  return (
    <div className="Translator">
      <div className="card">
        <div className="card-body">
          <div className="address-input">
            <label htmlFor="address">Enter the address you wish to translate:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">Address</span>
              </div>
              <input value={addressInputValue} onChange={onAddressInputChange} type="text" className="form-control" id="address" />
            </div>
          </div>
          <form className="form-inline">
            <div className="form-group mx-sm-1 mb-1">
              <div className="form-check form-check-inline">
                <input checked={prefixCheckboxValue} onChange={onPrefixCheckboxChange} className="form-check-input" type="checkbox" id="prefix-input" value="option1" />
                <label className="form-check-label" htmlFor="prefix-input">Display with prefix</label>
              </div>
            </div>
          </form>
          { output }
          { error }
        </div>
      </div>
    </div>
  );
}

function TranslatorOutput(props) {
  const {
    legacyAddress,
    bitpayAddress,
    cashAddress,
    network,
    type,
    copyText,
  } = props;
  const networkName = network === Network.Mainnet ? 'mainnet' : 'testnet';
  const typeName = type === Type.P2PKH ? 'Pay-to-Public-Key-Hash' : 'Pay-to-Script-Hash';
  const copyLegacy = () => copyText(legacyAddress);
  const copyCashAddr = () => copyText(cashAddress);
  const copyBitpay = () => copyText(bitpayAddress);
  return (
    <div className="output">
      <hr />
      <div className="legacy-output"><strong>Legacy format:</strong> <span onClick={copyLegacy}> {legacyAddress}</span>  <button type="button" className="btn btn-light btn-sm" onClick={copyLegacy}><FaCopy /></button></div>
      <div className="cashaddr-output"><strong>Cash Address format:</strong> <span onClick={copyCashAddr}> {cashAddress} </span> <button type="button" className="btn btn-light btn-sm" onClick={copyCashAddr}><FaCopy /></button></div>
      <div className="bitpay-output"><strong>Bitpay format:</strong> <span onClick={copyBitpay}> {bitpayAddress} </span>  <button type="button" className="btn btn-light btn-sm" onClick={copyBitpay}><FaCopy /></button></div>
      <em>
        This is a {networkName} address, of type {typeName}.
      </em>
    </div>
  );
}

export default App;
