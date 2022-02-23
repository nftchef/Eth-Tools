const ethers = require("ethers");

const crypto = require("crypto");
const fs = require("fs");

const path = require("path");
const { Command } = require("commander");
const program = new Command();

const allowList = require("./commands/allowList");
const snapshot = require("./commands/snapshot");
const provenance = require("./commands/provenance");
const metadata = require("./commands/metadata");
const rarity = require("./commands/rarity");

const createAddress = () => {
  const id = crypto.randomBytes(32).toString("hex");
  const privateKey = "0x" + id;
  var wallet = new ethers.Wallet(privateKey);

  return wallet.address;
};

program
  .command("generate <count>")
  .description(
    "Output <count> of dummy ETH wallet addresses to an array in addresses.json"
  )
  .action((count) => {
    let allAddress = [];

    for (let i = 1; i <= count; i++) {
      allAddress.push(createAddress());
    }

    fs.writeFileSync("./addresses.json", JSON.stringify(allAddress));
  });

program
  .command("calc <gas> <gwei>")
  .description("clone a repository into a newly created directory")
  .action((gas, gwei) => {
    const cost = ethers.utils.parseUnits(gwei, "gwei");
    const basecost = gas * cost;
    console.log(`calculate ${gas} gas at ${cost}`);
    const result = ethers.utils.formatEther(basecost.toString());
    console.log(chalk.greenBright(`Estimate = ${result}`));
  });

program
  .command("uploadList <source>")
  .description("upload List of wallet addresses to a firebase FireStore ")

  .action((source) => {
    allowList.upload(source);
  });

program
  .command("allowlist")
  .description("get information about the firebase allow list FireStore ")

  .action(() => {
    allowList.count();
  });

program
  .command("crosscheck <source>")
  .description("given an uploaded list, check and remove duplicates")

  .action((source) => {
    allowList.crosscheck(source);
  });

program
  .command("clean <source>")
  .description(
    "remove wallet ID's from the DB if they are not present in the verification dv"
  );

program
  .command("remove <userID>")
  .description(
    "remove wallet ID's from the DB if they are not present in the verification dv"
  );

program
  .command("add <userID> <walletAddress>")
  .description(
    "Add a user to both the role-verification db AND their wallet to the WL"
  )

  .action((userID, walletAddress) => {
    allowList.add(userID, walletAddress);
  });

program
  .command("downloadList <writepath>")
  .description(
    "Save the firestore allow list to the passed in <writepath> file, as JSON"
  )

  .action((writepath) => {
    allowList.download(writepath);
  });

program
  .command("snapshot <contract> <count>")
  .description(
    "Get a Set of wallet addresses that hold a given token from the given Mainnet contract address <contract>, and number of tokens <count> to query"
  )
  .option(
    "-n --network <network>",
    "by default, this queries mainnet. pass in network to query a different network, e.g. Rikeby"
  )
  .option(
    "-o --output <outputfile>",
    "define the filename to wite the snapshot result JSON to"
  )
  .option("-s --start <start>", "Start the snapshot from a a <start> tokenID")
  .action((contract, count, options) => {
    snapshot.get(contract, count, options);
  });

program
  .command("provenance <inputdir>")
  .description("generate a provenance hash from a folder of images")
  //TODO: add option to generate provenance from json attributes, too
  .option(
    "-m --metadata <includeMetadata>",
    "by default, A provenance hash will be generated from JSON metadata, "
  )
  .option(
    "-o --output <outputfile>",
    "output the provenance hash data to a custom file/location"
  )

  .action((inputdir, options) => {
    provenance.generate(inputdir, options);
  });

program
  .command("cleanEmptyTraits <inputdir>")
  .description(
    "Remove any empty attributes in OpenSea standard metadata for all json files in a given directory"
  )
  //TODO: add option to generate provenance from json attributes, too
  .option(
    "-o --output <outputDir>",
    "output the provenance hash data to a custom file/location"
  )

  .action((inputdir, options) => {
    metadata.cleanEmptyTraits(inputdir, options);
  });

// TEMP:
program
  .command("fixTypo <inputdir> <incorrect> <correct>")
  .description("fix a typo for a given attribute")
  //TODO: add option to generate provenance from json attributes, too
  .option(
    "-o --output <outputDir>",
    "output the provenance hash data to a custom file/location"
  )

  .action((inputdir, incorrect, correct, options) => {
    metadata.fixTypo(inputdir, incorrect, correct, options);
  });
program
  .command("fixTypes <inputdir>")
  .description("fix a typo for a given attribute")
  //TODO: add option to generate provenance from json attributes, too
  .option(
    "-o --output <outputDir>",
    "output the provenance hash data to a custom file/location"
  )

  .action((inputdir, options) => {
    metadata.fixTypes(inputdir, options);
  });

program
  .command("rarity <inputdir>")
  .description(
    "Calculate and output rarity data for all attribbutes used from a given folder of OpenSea Spec. metadata json files"
  )
  //TODO: add option to generate provenance from json attributes, too
  .option(
    "-o --output <outputDir>",
    "output the provenance hash data to a custom file/location"
  )

  .action((inputdir, options) => {
    rarity.calculate(inputdir, options);
  });

program.parse();
