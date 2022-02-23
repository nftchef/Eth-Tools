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
const userVerificationList = db.collection(process.env.FIREBASE_USER_LIST);

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

  async crosscheck(source) {
    console.log(source);
    const list = require(path.join(basePath, source));
    console.log(list.length);

    let duplicates = 0;
    let users = 0;
    // list is an original list of users wallet addresses
    // Check if the user also used the /wallet command
    // if they did, make check if the wallet the added was different
    // remove the first wallet, add the new one
    // { users: 275, duplicates: 23 }

    for (const entry of list) {
      const userID = Object.keys(entry)[0];
      const originalWallet = entry[userID];
      // console.log({ id: Object.keys(entry)[0], wallet: originalWallet });
      // console.log(userWallet);

      const ref = userVerificationList.doc(userID);
      const doc = await ref.get();
      if (!doc.exists) {
        // console.log("No such document!");
        // add the user to the db
        const newdata = {
          earlyVerified: true,
          wallet: originalWallet,
          progress: "complete",
        };
        // ref.set(newdata);
        // return { verification: false };
      } else {
        users++;
        // User used the /wallet command
        const data = doc.data();
        console.log({ datatype: typeof data.wallet, wallet: data.wallet });

        const userAddedWallet = data.wallet;
        // delete whatever original wallet was associated with the userID
        const dupe = originalWallet != userAddedWallet;
        const original = await allowList.doc(`${originalWallet}`).get();
        // if (original.exists) {
        console.log("original exists", original.data());
        console.log(`\nDELETED: ${originalWallet} \n`);
        original.data();
        // } else {
        //   console.log("no original found", original.data());
        // }
        if (dupe) {
          duplicates += 1;
          // await allowList
          //   // delete the original wallet
          //   .doc(`${originalWallet}`)
          //   .delete()

          //   .then(async (r) => {
          //     console.log(r);
          //     // add the new wallet
          // await allowList.doc(userAddedWallet).set({});
          //     // duplicates += 1;
          //     //     console.log(`\nDELETED: ${originalWallet} \n`, r);
          //     //   });
          //     // }
          console.log({
            dupe,
          });
        }
      }
    }

    console.log({ users, duplicates });
  },

  async clean(source) {
    console.log(source);
    const list = require(path.join(basePath, source));
    console.log(list.length);

    let users = 0;
    // list is an original list of users wallet addresses
    // Check if the user also used the /wallet command
    // if they did, make check if the wallet the added was different
    // remove the first wallet, add the new one
    // { users: 275, duplicates: 23 }

    for (const entry of list) {
      const userID = Object.keys(entry)[0];
      const originalWallet = entry[userID];
      // console.log({ id: Object.keys(entry)[0], wallet: originalWallet });
      // console.log(userWallet);
      const ref = userVerificationList.doc(userID);
      const doc = await ref.get();
      if (!doc.exists) {
        console.log("No such document!");
      }
    }
    console.log(`${users} : Did not submit`);
  },

  async remove(userID) {
    // get the role verification wallet if they used /wallet
    const ref = userVerificationList.doc(userID);
    const doc = await ref.get();
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      const data = doc.data();
      console.log({ datatype: typeof data.wallet, wallet: data.wallet });

      const userAddedWallet = data.wallet;
      await allowList
        // delete the original wallet
        .doc(`${userAddedWallet}`)
        .delete();
      console.log("DELETED");
      await userVerificationList.doc(userID).set({
        ...data,
        earlyVerified: false,
        status: "REMOVED",
      });
    }
  },
  async add(userID, walletAddress) {
    // get the role verification wallet if they used /wallet
    const ref = userVerificationList.doc(userID);
    const doc = await ref.get();
    if (!doc.exists) {
      console.log("Does not exist, adding");
      // add the user to the db
      const newdata = {
        earlyVerified: true,
        wallet: walletAddress,
        progress: "complete",
      };
      ref.set(newdata);
      // add the wallet to the allow list db
      await allowList.doc(walletAddress).set({});
    } else {
      console.log("user already exists, updating");
      const data = doc.data();
      console.log({ datatype: typeof data.wallet, wallet: data.wallet });

      const originalWallet = data.wallet;
      await allowList
        // delete the original wallet
        .doc(`${originalWallet}`)
        .delete();
      await userVerificationList.doc(userID).set({
        ...data,
        wallet: walletAddress,
      });
      await allowList.doc(walletAddress).set({});
      console.log("UPDATED");
    }
  },
};
