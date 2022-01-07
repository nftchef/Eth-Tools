require("dotenv").config();
const isLocal = typeof process.pkg === "undefined";

const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");

// function initOutput(options) {
//   const outputDir = options.outputDir ? options.outputDir : "./metadata-output";
//   if (fs.existsSync(outputDir)) {
//     fs.rmSync(outputDir, {
//       recursive: true,
//     });
//   }
//   fs.mkdirSync(outputDir);
//   return outputDir;
// }

/**
 * // read through all the files, collecting attributes and their counts
 * to later process the raroty percent
 */
module.exports = {
  calculate(inputdir, options) {
    let rarity = {};
    let totals = {};

    const dataset = fs
      .readdirSync(path.join(basePath, inputdir)) // filter out .DS_Store
      .filter((item) => {
        return !/(^|\/)\.[^\/\.]/g.test(item);
      });
    dataset.forEach((file) => {
      const readData = fs.readFileSync(path.join(basePath, inputdir, file));
      const metadata = JSON.parse(readData);
      // Push the attributes to the main counter and increment
      metadata.attributes = metadata.attributes.filter(
        (attr) => attr.value !== ""
      );

      metadata.attributes.forEach((attribute) => {
        rarity = {
          ...rarity,
          [attribute.trait_type]: {
            ...rarity[attribute.trait_type],
            [attribute.value]: {
              count: rarity[attribute.trait_type]
                ? rarity[attribute.trait_type][attribute.value]
                  ? rarity[attribute.trait_type][attribute.value].count + 1
                  : 1
                : 1,
            },
          },
        };

        totals = {
          ...totals,
          [attribute.trait_type]: totals[attribute.trait_type]
            ? (totals[attribute.trait_type] += 1)
            : 1,
        };
      });
    });

    // loop again to write percentages
    for (category in rarity) {
      for (element in rarity[category]) {
        rarity[category][element].percentage = (
          (rarity[category][element].count / totals[category]) *
          100
        ).toFixed(4);
      }
    }

    // sort everything alphabetically (could be refactored)
    for (let subitem in rarity) {
      rarity[subitem] = Object.keys(rarity[subitem])
        .sort()
        .reduce((obj, key) => {
          obj[key] = rarity[subitem][key];
          return obj;
        }, {});
    }
    const ordered = Object.keys(rarity)
      .sort()
      .reduce((obj, key) => {
        obj[key] = rarity[key];
        return obj;
      }, {});

    // TODO: Calculate rarity score
    console.log({ inputdir, options, count: dataset.length });

    // console.log(totals);
    console.table(ordered);
  },
};
