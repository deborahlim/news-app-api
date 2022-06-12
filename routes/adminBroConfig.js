const AdminBro = require("admin-bro");
const AdminBroMongoose = require("admin-bro-mongoose");
const AdminBroExpress = require("admin-bro-expressjs");
const User = require("../models/userModel");

AdminBro.registerAdapter(AdminBroMongoose);

const userResourceOptions = {
  properties: {
    passwordChangedAt: {type: "datetime"},
  },
  listProperties: ["_id", "name", "email", "role", "active"],
  editProperties: ["_id", "name", "email", "photo", "role", "active", "password", "passwordConfirm", "country", "language", "savedTopics"],
  showProperties: ["_id", "name", "email", "photo", "role", "active", "password", "passwordChangedAt", "country", "language", "savedTopics"],
  filterProperties: ["_id", "name", "email", "role", "active", "country", "language", "savedTopics"],
};

exports.adminBro = new AdminBro({
  resources: [{ resource: User, options: userResourceOptions }],
  locale: {
    translations: {
      labels: {
        User: "Users"
      }
    }
  },
  branding: {companyName: "GNews"},
  rootPath: "/api/admin",
});

exports.adminBroRouter = AdminBroExpress.buildRouter(exports.adminBro);
