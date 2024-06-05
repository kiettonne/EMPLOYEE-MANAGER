const express = require("express");
const path = require("path");
const {
  connectToMongoDB,
  closeMongoDBConnection,
  createUsers,
  createManyUser,
  findDocumentsById,
  deleteDocument,
  deleteManyUsers,
  updateDocumentsByID,
  queryDocuments,
} = require("./public/javascripts/mongodb");
const { listUsers } = require("./public/javascripts/users");
const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
  console.log("Server listening on port http://localhost:3000");
});
connectToMongoDB();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "home.html"));
});

process.on("SIGINT", () => {
  closeMongoDBConnection();
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/users", async (req, res) => {
  try {
    const listUser = await listUsers();
    res.json(listUser || {});
  } catch (error) {
    console.log("Faild to fetch list of users", error);
    res.status(500).send("Faild to fetch list of users");
  }
});

app.get("/add-user", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "create.html"));
});


let autoIncremetId = 1;
function generateAutoIncrementId() {
  const id = `NV${String(autoIncremetId).padStart(3, '0')}`;
  autoIncremetId++;
  return id;
}

app.post("/create", async (req, res) => {
  try {
    let count = 0;
    let users = req.body;
    users.forEach(user => {
      user.id = generateAutoIncrementId(); // chỉ định ID tự động
    });
    if (users.length === 1) {
      await createUsers(users[0].id, users[0].name, users[0].email, users[0].birthYear);
      count = 1;
    } else {
      users.forEach(user => {
        user.id = generateAutoIncrementId(); // chỉ định ID tự động
      });
      count = await createManyUser(users);
    }
    users = [];
    res.status(200).json({ message: `${count} Users added successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
  
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "home.html"));
});
app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "read.html"));
});
app.get("/read", async (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const birthYear = req.query.birthYear;
  const birthYearFor = req.query.birthYearFor;
  const birthYearTo = req.query.birthYearTo;

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  if (email && typeof email === 'string') { 
    query.email = { $regex: email, $options: "i" };
  }
  if ( birthYear ) {
    query.birthYear = parseInt(birthYear)
  }
  if (birthYearFor && birthYearTo) {
    query.birthYear = {
      $gte: parseInt(birthYearFor),
      $lte: parseInt(birthYearTo),
    };
  } else if (birthYearFor && !birthYearTo) {
    query.birthYear = { $gte: parseInt(birthYearFor) };
  } else if (!birthYearFor && birthYearTo) {
    query.birthYear = { $lte: parseInt(birthYearTo) };
  }

  const orConditions = [];
  if (query.email) {
    orConditions.push({ email: query.email }); 
  }
  if (query.phone) {
    orConditions.push({ phone: { $regex: query.phone, $options: "i" } });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }
  console.log("🚀 ~ app.get ~ query:", query);
  const result = await queryDocuments(query);
  res.send(result);
});

app.get("/delete", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "delete.html"));
});

app.get("/update", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "update.html"));
});

app.delete("/user", async (req, res) => {
  try {
    const { id } = req.query;
    console.log("🚀 ~ app.delete ~ id:", id);
    const result = await findDocumentsById(id);
    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await deleteDocument(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/users", async (req, res) => {
  try {
    const userIds = req.body.userIds;
    const result = await deleteManyUsers(userIds);
    res.status(200).json({ message: `${result.deletedCount} Users deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/user", async (req, res) => {
  try {
    const { id } = req.query;
    console.log("🚀 ~ app.get ~ id:", id);
    const result = await findDocumentsById(id);
    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update", async (req, res) => {
  try {
    const { id, name, email, birthYear } = req.body;
    console.log("🚀 ~ app.put ~ email:", email);
    console.log("🚀 ~ app.put ~ name:", name);
    console.log("🚀 ~ app.put ~ id:", id);
    const result = await updateDocumentsByID(id, { name, email, birthYear });
    res.status(200).json({ message: `${result} User updated successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update-many", async (req, res) => {
  try {
    const { id, name, email } = req.body;
    console.log("🚀 ~ app.put ~ email:", email);
    console.log("🚀 ~ app.put ~ name:", name);
    console.log("🚀 ~ app.put ~ id:", id);
    const result = await updateDocumentsByID(id, req.body);
    res.status(200).json({ message: `${result} User updated successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
