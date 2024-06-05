const { MongoClient, ObjectId } = require("mongodb");
const mongodbUrl = process.env.MONGODB_URL;
let dbCollection;
let client;

async function connectToMongoDB() {
  client = new MongoClient(
    "mongodb://localhost:27017"
  );
  await client.connect();
  dbCollection = client.db("test").collection("users");
}
async function closeMongoDBConnection() {
  if (client) {
    await client
      .close()
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.log("Failed to disconnect from MongoDB:", err);
        process.exit(1);
      });
  } else {
    process.exit(0);
  }
}
async function findDocumentsByName(userName) {
  const documents = await dbCollection
    .find({ name: { $regex: userName } })
    .toArray();
  return documents;
}
async function findDocumentsById(userId) {
  try {
    const objectId = new ObjectId(userId);
    const documents = await dbCollection.find({ _id: objectId }).toArray();
    return documents;
  } catch (error) {
    console.error("Error finding documents by ID:", error);
    throw error;
  }
}
async function deleteDocument(id) {
  try {
    const objectId = new ObjectId(id);
    return await dbCollection.deleteOne({ _id: objectId });
  } catch (error) {
    console.error("Error deleting documents by ID:", error);
    throw error;
  }
}
async function deleteManyUsers(userId) {
  try {
    const result = await User.deleteMany({ _id: { $in: userId } });
    return result;
  } catch (error) {
    throw new Error("Failed to delete users");
  }
}

async function findDocuments() {
  const documents = await dbCollection.find().toArray();
  return documents;
}
async function queryDocuments( query ) {
  const documents = await dbCollection.find( query ).toArray();
  return documents;
}
async function updateDocumentsByID(userId, updatedData) {
  const objectId = new ObjectId(userId);
  const result = await dbCollection.updateOne(
    { _id: objectId },
    { $set: updatedData }
  );
  return result.modifiedCount;
}
async function createUsers( name, email, birthYear) {
  const result = await dbCollection.insertOne({ name: name, email: email, birthYear: birthYear });
  return result;
}
async function createManyUser(users) {
  const result = await dbCollection.insertMany(users);
  return result.insertedCount;
}
module.exports = {
  connectToMongoDB,
  closeMongoDBConnection,
  findDocumentsByName,
  findDocumentsById,
  findDocuments,
  updateDocumentsByID,
  createUsers,
  createManyUser,
  deleteDocument,
  deleteManyUsers,
  queryDocuments,
};
