# nxtjs
Small collection of JavaScript functions for Nxt. Allows for local signing of transactions, token creation/validation and encryption/decryption of arbitrary messages.

### Install
`npm install nxtjs`

### Test
`npm test`

### Usage
##### node.js:

    var nxtjs = require('nxtjs');

    // Create an account
    var acc = nxtjs.secretPhraseToAccountId('secret');
    console.log(acc);
    
##### Browser:

Create the bundle with browserify:

`browserify index.js -s nxtjs > build/nxtjs.js`

Use in HTML file:

    <script src="nxtjs.js"></script>
    <script>
        var acc = nxtjs.secretPhraseToAccountId('secret');
        console.log(acc);
    </script>

### Functions
#### secretPhraseToPublicKey(secretPhrase)
Returns public key of a given passphrase

#### publicKeyToAccountId(publicKey, numeric)
Returns account ID of a given public key. Set the second parameter to true to
get numeric account ID instead of RS format

#### secretPhraseToAccountId(secretPhrase, numeric)
Returns account ID of a given passphrase.  Set the second parameter to true to
get numeric account ID instead of RS format.

#### signTransactionBytes(unsignedTransactionBytes, secretPhrase)
Signs a hex string of unsigned transaction bytes (e.g. as received from NRS API)
with the provided passphrase and returns it.

#### createToken(string, secretPhrase)
Generates a Nxt cryptographic token

#### parseToken(token, string)
Parses a Nxt cryptographic token. Returns an object with the keys `isValid`,
`timestamp`, `publicKey` and `accountRS`.

#### encryptMessage(plainText, recipientPublicKey, senderSecretPhrase)
Returns an object with the keys `nonce` and `message`

#### decryptMessage(cipherText, nonce, senderPublicKey, recipientSecretPhrase)
Returns the deciphered text as string

#### rsConvert(address)
Converts address in numeric format to Reed-Solomon format, or vice versa. Returns an object with the keys `account` and `accountRS`


### Credits
The purpose of this repo is to consolidate code from multiple sources into one easy to use package for node.js and the browser.
Original code was taken from:
* [NRS client](https://bitbucket.org/JeanLucPicard/nxt/)
* [Jay] (https://github.com/jonesnxt/jay) (Token functions)
