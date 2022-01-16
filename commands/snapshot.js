require("dotenv").config();

const { ethers, BigNumber } = require("ethers");

const isLocal = typeof process.pkg === "undefined";

const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");

const path = require("path");

module.exports = {
  async get(contractAddress, count, options) {
    console.log({ contractAddress, count, options });

    // Connect to mainnet with a Project ID (these are equivalent)
    const provider = new ethers.providers.InfuraProvider(
      options.network ? options.network : null,
      process.env.INFURA_PROJECT_ID
    );

    // Depending on the contract being queried, this may need configuration to get
    const abimock = [
      "function ownerOf(uint tokenId) public view returns (address)",
    ];
    const contract = new ethers.Contract(contractAddress, abimock, provider);

    const lookupCount = Number(count);

    new Promise(async (resolve) => {
      const wallets = new Set();
      // query total owned, starting at 0 by default or the start index
      for (let i = 0; i < lookupCount; i++) {
        // console.log("checking owner of ", i);

        let owner;
        try {
          console.log(
            `getting owner of token ${
              options.start ? Number(options.start) + i : i
            }`
          );
          owner = await contract.ownerOf(
            BigNumber.from(options.start ? Number(options.start) + i : i)
          );
          console.log(owner);
          wallets.add(owner);
        } catch (error) {
          console.log("oops", error.message);
        }
      }
      resolve(wallets);
    }).then((wallets) => {
      console.log("snapshot wallets", wallets);
      fs.writeFileSync(
        path.join(basePath, options.output ? options.output : "snapshot.json"),
        JSON.stringify({ wallets: [...wallets] }, null, 2)
      );
    });
  },
};

async function fetchWallets() {}
