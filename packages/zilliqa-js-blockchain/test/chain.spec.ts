import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import BN from 'bn.js';

import {Transaction, Wallet} from '@zilliqa/zilliqa-js-account';
import {HTTPProvider} from '@zilliqa/zilliqa-js-core';

import Blockchain from '../src/chain';

const mock = new MockAdapter(axios);
const provider = new HTTPProvider('https://mock.com');
const wallet = new Wallet(provider);
for (let i = 0; i < 10; i++) {
  wallet.create();
}

const blockchain = new Blockchain(provider, wallet);

describe('Module: Blockchain', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should sign and send transactions', async () => {
    const tx = new Transaction(
      {
        version: 1,
        to: '0x1234567890123456789012345678901234567890',
        amount: new BN(0),
        gasPrice: new BN(1000),
        gasLimit: new BN(1000),
      },
      provider,
    );

    mock
      .onPost()
      .replyOnce(200, {
        result: {nonce: 1},
      })
      .onPost()
      .replyOnce(200, {
        result: {TranID: 'some_hash'},
      })
      .onPost()
      .replyOnce(200, {
        result: {ID: 'some_hash', receipt: {success: 'true'}},
      });

    const {txParams} = await blockchain.createTransaction(tx);

    expect(txParams).toHaveProperty('signature');
    expect(txParams).toHaveProperty('pubKey');
    expect(txParams.id).toEqual('some_hash');
    expect(tx.isConfirmed()).toEqual(true);
  });
});