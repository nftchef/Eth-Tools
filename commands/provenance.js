const keccak256 = require("keccak256");
const fs = require("fs");
// const chalk = require("chalk");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
console.log({ basePath });

// const { buildDir } = require(path.join(basePath, "/src/config.js"));
// // Read files from the build folder defined in config.
// const metadata = JSON.parse(
//   fs.readFileSync(path.join(buildDir, `/json/_metadata.json`), "utf-8")
// );

module.exports = {
  generate(inputdir, options) {
    const files = fs
      .readdirSync(path.join(basePath, inputdir))
      // filter out non-images
      .filter((item) => {
        return !/(^|\/)\.[^\/\.]/g.test(item);
      });
    console.log({ inputdir, options, count: files.length });
    const hashes = [];
    files.forEach((file) => {
      const readData = fs.readFileSync(path.join(basePath, inputdir, file));
      const itemHash = hash(readData);
      hashes.push(itemHash);
      console.log(itemHash);
    });

    const accumulatedHashString = hashes.reduce((acc, item) => {
      return acc.concat(item);
    }, []);

    const provenance = keccak256(accumulatedHashString.join("")).toString(
      "hex"
    );
    fs.writeFileSync(
      path.join(
        basePath,
        options.outputfile ? options.outputfile : "_provenance.json"
      ),
      JSON.stringify(
        { provenance, concatenatedHashString: accumulatedHashString.join("") },
        null,
        "\t"
      )
    );

    console.log(
      `\nProvenance Hash Save in !\n${
        options.outputfile ? options.outputfile : "_provenance.json"
      }`
    );
    console.log(provenance);
  },
};

/**
 * Given some input, creates a sha256 hash.
 * @param {Object} input
 */
const hash = (input) => {
  const hashable = typeof input === Buffer ? input : JSON.stringify(input);
  return keccak256(hashable).toString("hex");
};
