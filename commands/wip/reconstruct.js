/**
 * given an already generated collection, with OS standard metadata.attributes
 * - manually create a map of trait_types to folders
 * - find files that match the trait attribute, regardless of weight
 * - have an override option in case a particular trait_type value was
 *    originally overwritten/renamed or the file is hard for the script to
 *    find correctly
 *
 *
 *
 */
const { createCanvas, loadImage } = require(path.join(
  basePath,
  "/node_modules/canvas"
));
const isLocal = typeof process.pkg === "undefined";

const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");

// load the relative path of the art /layers folder
const layers = path.join(basePath, "layers");

// load the metadata files to loop through
const metadataPath = path.join(basePath, "json");

// map the trait_type to folders, this will also control the order
// this should be pretty much 1:1 layers definition
const traitMap = {
  Body: "1.Body", // in case the folder name is different that trait_type
  Head: "Head",
  Eyes: "Eyes",
};

// setup the canvas
const canvasSettings = {
  width: 512,
  height: 512,
  smoothing: false, // set to false when up-scaling pixel art.
};
const canvas = createCanvas(canvasSettings.width, canvasSettings.height);
const ctxMain = canvas.getContext("2d");
ctxMain.imageSmoothingEnabled = canvasSettings.smoothing;

// load each metadata file and loop over it
const dataset = fs
  .readdirSync(metadataPath) // filter out .DS_Store
  .filter((item) => {
    return !/(^|\/)\.[^\/\.]/g.test(item);
  });

dataset.forEach((file) => {
  const readData = fs.readFileSync(path.join(basePath, inputdir, file));
  const metadata = JSON.parse(readData);
  // Push the attributes to the main counter and increment
  metadata.attributes = metadata.attributes.filter((attr) => attr.value !== "");

  // Loop over each attribute and paint the image to the candvas
  const artLayers = metadata.attributes.map((attribute) => {
    /**
     * TODO:
     * Based on the trait_type layer, search the folder for the attribute.value
     * return the file path,
     * then load it by returning loadLayerImg(path)
     */
  });

  await Promise.all(artLayers).then((renderObjectArray) => {
    //TODO: Make sure the data passed in here is accurate,
    // then pass it to paintLayer
    const layerData = {
      newDna,
      layerConfigIndex,
      abstractedIndexes,
      _background: background,
    };
    paintLayers(ctxMain, renderObjectArray, layerData);

    // TODO: Save the canvas to file
  });
});

/**
 * Paints the given renderOjects to the main canvas context.
 *
 * @param {Array} renderObjectArray Array of render elements to draw to canvas
 * @param {Object} layerData data passed from the current iteration of the loop or configured dna-set
 *
 */
const paintLayers = (canvasContext, renderObjectArray, layerData) => {
  debugLogs ? console.log("\nClearing canvas") : null;
  canvasContext.clearRect(0, 0, format.width, format.height);

  const { abstractedIndexes, _background } = layerData;

  renderObjectArray.forEach((renderObject) => {
    // one main canvas
    // each render Object should be a solo canvas
    // append them all to main canbas
    canvasContext.globalAlpha = renderObject.layer.opacity;
    canvasContext.globalCompositeOperation = renderObject.layer.blendmode;
    canvasContext.drawImage(
      drawElement(renderObject, canvasContext),
      0,
      0,
      format.weight,
      format.height
    );
  });

  if (_background.generate) {
    canvasContext.globalCompositeOperation = "destination-over";
    drawBackground(canvasContext);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
};

const saveImage = (_edition) => {
  fs.writeFileSync(
    `${buildDir}/images/${_edition}${outputJPEG ? ".jpg" : ".png"}`,
    canvas.toBuffer(`${outputJPEG ? "image/jpeg" : "image/png"}`)
  );
};
