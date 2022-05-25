const { default: algoliasearch } = require("algoliasearch");
const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const ALGOLIA_ID = functions.config().algolia.appid;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.apikey;
const ALGOLIA_INDEX_NAME = "posts_content";
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.onCreatePost = functions
  .region("asia-northeast3")
  .firestore.document("post/{docid}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const algoliaDoc = {
      objectID: data.docId,
      title: data.title,
      content: data.content,
    };

    try {
      const savePost = await index.saveObject(algoliaDoc, {
        autoGenerateObjectIDIfNotExist: true,
      });
      console.log(savePost);
    } catch (e) {
      console.log(e.message);
    }
  });

exports.onUpdatePost = functions
  .region("asia-northeast3")
  .firestore.document("post/{docid}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();

    const algoliaDoc = {
      objectID: newData.docId,
      title: newData.title,
      content: newData.content,
    };

    try {
      const updatePost = await index.saveObject(algoliaDoc);
      console.log(updatePost);
    } catch (e) {
      console.log(e.message);
    }
  });

exports.onDeletePost = functions
  .region("asia-northeast3")
  .firestore.document("post/{docid}")
  .onDelete(async (snapshot, context) => {
    const objectID = snapshot.data().docId;

    try {
      const deletePost = await index.deleteObject(objectID);
      console.log(deletePost);
    } catch (e) {
      console.log(e.message);
    }
  });

// exports.helloWorld = functions
//   .region("asia-northeast3")
//   .https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
//   });
