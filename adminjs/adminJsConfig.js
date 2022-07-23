const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

AdminJS.registerAdapter(AdminJSMongoose);

const canModifyUsers = ({ currentAdmin }) => {
  return currentAdmin && currentAdmin.role === "admin";
};

const userResourceOptions = {
  properties: {
    passwordChangedAt: { type: "datetime" },
  },
  listProperties: ["_id", "name", "email", "role", "active"],
  editProperties: ["name", "email", "password", "role"],
  showProperties: [
    "_id",
    "name",
    "email",
    "photo",
    "role",
    "active",
    "country",
    "language",
    "savedTopics",
  ],
  filterProperties: [
    "_id",
    "name",
    "email",
    "role",
    "active",
    "country",
    "language",
    "savedTopics",
  ],
  actions: {
    new: {
      isAccessible: canModifyUsers,
      before: async (request) => {
        if (request.payload.password) {
          request.payload = {
            ...request.payload,
            passwordConfirm: request.payload.password
          };
        }
        return request;
      },
    },
    edit: {
      isAccessible: canModifyUsers,
      before: async (request) => {
        if (request.payload.password) {
          request.payload = {
            ...request.payload,
            password: await bcrypt.hash(request.payload.password, 12),
          };
        }
        return request;
      },
    },
    delete: {
      isAccessible: canModifyUsers,
    },
  },
};

exports.adminJs = new AdminJS({
  resources: [{ resource: User, options: userResourceOptions }],
  dashboard: {
    component: AdminJS.bundle("./dashboard-page"),
  },
  locale: {
    translations: {
      labels: {
        User: "Users",
      },
    },
  },
  branding: { companyName: "GNews" },
  rootPath: "/admin",
});

exports.adminJsRouter = AdminJSExpress.buildAuthenticatedRouter(
  exports.adminJs,
  {
    authenticate: async (email, password) => {
      let user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.correctPassword(password, user.password))) {
        return false;
      }
      return user;
    },
    cookiePassword: process.env.ADMIN_JS_COOKIE_PASSWORD,
  },
  undefined,
  {
    resave: false,
    saveUninitialized: false,
  }
);
