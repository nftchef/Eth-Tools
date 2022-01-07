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
};
