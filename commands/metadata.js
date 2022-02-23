require("dotenv").config();
const isLocal = typeof process.pkg === "undefined";

const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");

function initOutput(options) {
  const outputDir = options.outputDir ? options.outputDir : "./metadata-output";
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, {
      recursive: true,
    });
  }
  fs.mkdirSync(outputDir);
  return outputDir;
}

module.exports = {
  cleanEmptyTraits(inputdir, options) {
    const outputDir = initOutput(options);
    const dataset = fs
      .readdirSync(path.join(basePath, inputdir)) // filter out .DS_Store
      .filter((item) => {
        return !/(^|\/)\.[^\/\.]/g.test(item);
      });
    const clean = dataset.map((file) => {
      const readData = fs.readFileSync(path.join(basePath, inputdir, file));
      const metadata = JSON.parse(readData);
      // console.log(metadata);
      // rclean up attributes
      metadata.attributes = metadata.attributes.filter(
        (attr) => attr.value !== ""
      );

      metadata.developer = "NFTChef";
      metadata.compiler = "HashLips Art Engine - @NFTChef Fork";

      // output each file after cleaning
      fs.writeFileSync(
        path.join(outputDir, file),
        JSON.stringify(metadata, null, "\t")
      );

      return metadata;
    });

    console.log({ inputdir, options, count: dataset.length });
    console.log(clean);
  },
  fixTypo(inputdir, incorrect, correct, options) {
    const outputDir = initOutput(options);
    const dataset = fs
      .readdirSync(path.join(basePath, inputdir)) // filter out .DS_Store
      .filter((item) => {
        return !/(^|\/)\.[^\/\.]/g.test(item);
      });
    dataset.forEach((file) => {
      const readData = fs.readFileSync(path.join(basePath, inputdir, file));
      const metadata = JSON.parse(readData);

      metadata.attributes.forEach((obj) => {
        if (obj.value.includes(incorrect)) {
          obj.value = obj.value.replace(incorrect, correct);
          console.log("contains incorrect", obj.value);
        }
      });
      // output each file after cleaning
      fs.writeFileSync(
        path.join(outputDir, file),
        JSON.stringify(metadata, null, "\t")
      );
    });
    console.log({ inputdir, incorrect, correct, out: options.outputDir });
  },

  /**
   * TODO: very specific script for renaming a trait type error in the metadata.
   * not supported via. CLI commands or documentation.
   *
   * @param {String} inputdir directory of metadata files
   * @param {Object} options
   */
  fixTypes(inputdir, options) {
    // console.log({ inputdir, out: options.outputDir });
    // const outputDir = initOutput(options);
    // const dataset = fs
    //   .readdirSync(path.join(basePath, inputdir)) // filter out .DS_Store
    //   .filter((item) => {
    //     return !/(^|\/)\.[^\/\.]/g.test(item);
    //   });
    // let count = 0;
    // dataset.forEach((file) => {
    //   const readData = fs.readFileSync(path.join(basePath, inputdir, file));
    //   const metadata = JSON.parse(readData);
    //   metadata.attributes.forEach((obj) => {
    //     if (
    //       obj.trait_type == "Brown Cheetah" ||
    //       obj.trait_type == "Black" ||
    //       obj.trait_type == "Beige"
    //     ) {
    //       obj.trait_type = "Bear Type";
    //       // console.log("contains incorrect", obj.trait_type);
    //       count++;
    //     }
    //   });
    //   // output each file after cleaning
    //   fs.writeFileSync(
    //     path.join(outputDir, file),
    //     JSON.stringify(metadata, null, "\t")
    //   );
    // });
    // console.log({ count });
  },
};
