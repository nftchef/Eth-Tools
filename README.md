Simple utility for generating an array of Ethereum wallet addresses.
And, a built in basic calculator to output ROUGH estimated tx cost for gas used. 

# generate
use `node index.js generate <count>` where count is the number of wallet addresses you want to generate, to generate the addresses.json file with the output wallet addresses.

# calc
basic calculator to output gas cost in Eth,
`cost = gas used * gas price`

```
node index.js calc <gas used> <gas price in gwei>
```
