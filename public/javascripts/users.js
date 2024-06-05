const { findDocuments } = require("./mongodb");

function listUsers() {
  const listUser = findDocuments();
  return listUser;
}
module.exports = {
  listUsers,
};
