require("dotenv").config();
const isLocal = typeof process.pkg === "undefined";

const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const allowList = db.collection(process.env.FIREBASE_ALLOW_LIST);

module.exports = {
  async upload(source) {
    console.log("uploading...", { source });
    const { wallets } = require(path.join(basePath, source));
    console.log(typeof wallets);
    console.log(wallets[0]);

    wallets.forEach(async (wallet) => {
      console.log(`adding ${wallet}`);
      await allowList.doc(wallet).set({});
    });
  },

  async count() {
    const snapshot = await allowList.get();

    console.log({ snapshot });
  },

  async download(writepath) {
    console.log(`saving to: ${path.join(basePath, writepath)}`);
    const snapshot = await allowList.get();
    const list = { wallets: [] };
    snapshot.forEach((doc) => {
      list.wallets.push(doc.id);
    });

    console.log(list);
    fs.writeFileSync(
      path.join(basePath, writepath),
      JSON.stringify(list, null, 2)
    );
  },
};
