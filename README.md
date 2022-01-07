run `yarn` before use.

# Wallet/account tools

Simple utility for generating an array of Ethereum wallet addresses.
And, a built in basic calculator to output ROUGH estimated tx cost for gas used.

## generate

use `node index.js generate <count>` where count is the number of wallet addresses you want to generate, to generate the addresses.json file with the output wallet addresses.

# Calculation tools

## calc

basic calculator to output gas cost in Eth,
`cost = gas used * gas price`

```
node index.js calc <gas used> <gas price in gwei>
```

# Snapshot

Take a snapshot of current token holders (wallet addresses) for a given contract address

# Provenance Hash

Generate a provenance hash from a folder.

# Metadata Tools

## Clean empty traits

It's possible that your image generation left you with empty `trait_type` values, this command will remove any object with a `trait_type` whose sibling `value` is `""` empty.

# Firebase Firestore Tools

For use when an offchain allow-list is stored on FB

For these commands to work, you must add both the collection name, as `FIREBASE_ALLOW_LIST`, and a Firebase service key as `FIREBASE_SERVICE_KEY`, strigified object, in `.env`

> use .env-template and rename to .env

Commands:

- downloadList <writepath> - Save the firestore allow list to the passed in <writepath> file, as JSON
- uploadList <source> upload List of wallet addresses to a firebase FireStore
- allowlist - get information about the firebase allow list FireStore

## uploadList <source>

`node index.js uploadList ./wallets.json`

Requires a source JSON file in the following format:

```
{
  "wallets": [
    ...
  ]
}
```

Pass in the path to this file relative to the `cwd` and each wallet will be added to the collection as the document.id

### downloadList <writepath>

`node index.js downloadList ./dowloaded-wallets.json `

Dowload the data from the allow list collection as JSON.

### allowlist

Console log the collection data 'snapshot'. Useful for counting the size.
