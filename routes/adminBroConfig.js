const AdminBro = require("admin-bro");
const AdminBroMongoose = require("admin-bro-mongoose");
const AdminBroExpress = require("admin-bro-expressjs");
const User = require("../models/userModel");

AdminBro.registerAdapter(AdminBroMongoose);

exports.adminBro = new AdminBro({
  resources: [User],
  rootPath: "/api/admin",
});

exports.adminBroRouter = AdminBroExpress.buildRouter(exports.adminBro);
