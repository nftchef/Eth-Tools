const ethers = require('ethers');

const crypto = require('crypto');
const fs = require('fs')

const path = require("path");
const { Command } = require("commander");
const program = new Command();
const chalk = require("chalk");


const createAddress = () => {
  const id = crypto.randomBytes(32).toString('hex');
  const privateKey = "0x"+id;
  var wallet = new ethers.Wallet(privateKey);

  return wallet.address;
}

program
  .command('generate <count>')
  .description('Output <count> of dummy ETH wallet addresses to an array in addresses.json')
  .action(count => {
    let allAddress = []

    for (let i=1; i <= count ; i++) {
      allAddress.push(createAddress())
    }

    fs.writeFileSync('./addresses.json', JSON.stringify(allAddress))
  })

program
.command('calc <gas> <gwei>')
.description('clone a repository into a newly created directory')
.action((gas, gwei) => {
  const cost = ethers.utils.parseUnits(gwei, 'gwei')
  const basecost = gas * cost;
  console.log(`calculate ${gas} gas at ${cost}`);
  const result = ethers.utils.formatEther(basecost.toString())
  console.log(chalk.greenBright(`Estimate = ${result}`))
});

program.parse()