const Transcript = require("./models/Transcript");
const Users = require("./models/Users");
const Admin = require("./models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("./middleware/auth");
const path = require("path");
const sqlite = require("sqlite3").verbose();
const fs = require("fs");

const SQLITE_CONCIERGE_DB_PATH = path.join(
  __dirname,
  "../db",
  "ConciergeChatbot.sqlite"
);
const SQLITE_PRODUCT_DB_PATH = path.join(
  __dirname,
  "../db",
  "ProductChatbot.sqlite"
);
const SQL_CONCIERGE_DB_PATH = path.join(__dirname, "../db", "Concierge.sql");
const SQL_PRODUCT_DB_PATH = path.join(__dirname, "../db", "Product.sql");

// const SQL_CONCIERGE_DB_PATH = "/home/efin/Code/Hp_dashboard_Ashish/db/ProductChatbot.sqlite";
// const SQL_PRODUCT_DB_PATH = "/home/efin/Code/Hp_dashboard_Ashish/db/ConciergeChatbot.sqlite";
const CONCEIGER_DB = new sqlite.Database(
  SQLITE_CONCIERGE_DB_PATH,
  sqlite.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error(`Error opening database: ${err.message}`);
    } else {
      console.log(`Connected to the database: ${SQLITE_CONCIERGE_DB_PATH}`);
    }
  }
);

const PRODUCT_DB = new sqlite.Database(
  SQLITE_PRODUCT_DB_PATH,
  sqlite.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error(`Error opening database: ${err.message}`);
    } else {
      console.log(`Connected to the database: ${SQLITE_PRODUCT_DB_PATH}`);
    }
  }
);
const port = process.env.PORT;

module.exports = {
  init: function (app, config) {
    var fs = require("fs");
    var mongoose = require("mongoose");
    const db_URL =
      "mongodb+srv://hiranraj:Hiran2001@cluster0.6pnihvs.mongodb.net/HP_APC_Dashboard?retryWrites=true&w=majority";
    mongoose
      .connect(db_URL)
      .then(() => {
        console.log("connection successful");
        console.log(db_URL);
      })
      .catch((err) => {
        console.log(err);
      });
    const ALLOW_DUPLICATE = true;
    /**
     * For saving users visited
     */
    app.post("/rest/save-user", (req, res) => {
      let params = req.body;
      const users = new Users(params);
      const findUser = Users.find({
        name: params.name,
        email: params.email,
      }).exec((err, user) => {
        if (err) return;
        if (user.length !== 0) {
          let resultObj = {};
          resultObj.status = "success";
          resultObj.message = "User-Data retrieved successfully";
          resultObj.results = user[0];
          return res.end(JSON.stringify(resultObj));
        } else {
          return users.save().then((doc) => {
            let resultObj = {};
            resultObj.status = "success";
            resultObj.message = "Saved successfully";
            resultObj.results = doc;
            res.send(JSON.stringify(resultObj));
          });
        }
      });
    });

    // API Refresher

    app.get("/rest/refresh", (req, res) => {
      (async () => {
        const { createBackup } = await import("@cretezy/cloudflare-d1-backup");

        // sql write Concierge
        createBackup({
          accountId: "e740addb6f457fe8a3ba3a773776d467",
          databaseId: "10863c58-c03e-4fab-abf2-bcdf3d829759",
          apiKey: "VeIr7vgnElqVRHAeevWc0pAtCIJrkex4TusKAks_",
        }).then((backup) => {
          fs.writeFile(SQL_CONCIERGE_DB_PATH, backup, (err) => {
            if (err) console.log(err);
            else {
              console.log(" Concierge File written successfully\n");
            }
          });
        });

        // sql write Product
        createBackup({
          accountId: "e740addb6f457fe8a3ba3a773776d467",
          databaseId: "03bf3813-0319-4d26-b4b4-0870b31c53c8",
          apiKey: "VeIr7vgnElqVRHAeevWc0pAtCIJrkex4TusKAks_",
        }).then((backup) => {
          fs.writeFile(SQL_PRODUCT_DB_PATH, backup, (err) => {
            if (err) console.log(err);
            else {
              console.log(" Product File written successfully\n");

              const sqlProductQueries = fs.readFileSync(
                SQL_PRODUCT_DB_PATH,
                "utf8"
              );

              const productDB = new sqlite.Database(SQLITE_PRODUCT_DB_PATH);
              productDB.serialize(() => {
                productDB.exec(sqlProductQueries, (err) => {
                  if (err) {
                    console.error("Error executing SQL queries:", err.message);
                  } else {
                    console.log("Product SQL queries executed successfully.");
                  }

                  productDB.close();
                });
              });
            }
          });
        });

        // Sqlite write conceirge


        // // Sqlite write product
      })();
    });

    // Get all sessions

    app.get("/rest/concierge/sessions", (req, res) => {
      const query = "SELECT DISTINCT sessionId, timestamp FROM Messages";
      CONCEIGER_DB.all(query, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          const sessions = rows.map((row) => row.sessionId);

          res.json(rows);
        }
      });
    });

    app.get("/rest/product/sessions", (req, res) => {
      const query = "SELECT DISTINCT sessionId, timestamp FROM Messages";

      PRODUCT_DB.all(query, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          const sessions = rows.map((row) => row.sessionId);

          res.json(rows);
        }
      });
    });

    app.get("/rest/concierge/:sessionId", (req, res) => {
      const sessionId = req.params.sessionId;
      const query = "SELECT * FROM Messages WHERE sessionId = ?";
      CONCEIGER_DB.all(query, [sessionId], (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json(rows);
        }
      });
    });

    //get product sessions ids
    app.get("/rest/product/:sessionId", async (req, res) => {
      const sessionId = req.params.sessionId;
      const query = "SELECT * FROM Messages WHERE sessionId = ?";
      PRODUCT_DB.all(query, [sessionId], (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json(rows);
        }
      });
    });

    /**
     * For admin details
     */
    app.post("/rest/login-admin", async (req, res) => {
      let { username, password, initialAdmin = false } = req.body;
 
      try {
        const admin = new Admin({
          name: username,
          // email,
          password,
        });
        initialAdmin &&
          (await admin.save().then((admin) => {
            if (admin) {
              res.status(200).json({
                status: true,
                message: "Admin created successfully",
                results: {
                  id: admin._id,
                  name: admin.name,
                  // email: admin.email,
                },
              });
            }
          }));
        !initialAdmin &&
          Admin.findOne({
            name: username,
            // email,
          }).exec(async (err, admin) => {
            if (err) {
              res.status(400).json({
                status: false,
                message: "Error: Failed to fetch the admin details",
                results: {},
              });
            }
            if (!admin) {
              res.status(400).json({
                status: false,
                message: "Admin details not found",
                results: {},
              });
            }
            if (admin) {
              const passwordMatch = await bcrypt.compare(
                password,
                admin.password
              );
              if (!passwordMatch) {
                res.status(400).json({
                  status: false,
                  message: "Invalid credentials",
                  results: {},
                });
              } else {
                const token = jwt.sign(
                  { id: admin._id },
                  process.env.JWT_SECRET_KEY
                );
                res.status(200).json({
                  status: true,
                  message: "Admin details retrieved successfully",
                  results: {
                    id: admin._id,
                    name: admin.name,
                    // email: admin.email,
                    access_token: token,
                  },
                });
              }
            }
          });
      } catch (error) {
        res
          .status(500)
          .json({ status: "false", message: `${error?.message}`, results: {} });
      }
    });

    /**
     * For saving transcript
     */
    app.post("/rest/save-transcript", authenticateUser, (req, res) => {
      let params = req.body;
      const transcript = new Transcript(params);
      return transcript.save().then((doc) => {
        let resultObj = {};
        resultObj.status = "success";
        resultObj.message = "Saved successfully";
        resultObj.results = doc;
        res.end(JSON.stringify(resultObj));
      });
    });
    /**
     * For getting transcript
     */
    app.get(
      "/rest/fetch-transcript/:sessionId",
      authenticateUser,
      (req, res) => {
        let params = { sessionId: req.params.sessionId };
        var resultObj = {};
        Transcript.find(params, {}, { skip: 0, limit: 10000 })
          .populate("sessionId")
          .sort({ date: 1 })
          .exec(function (error, doc) {
            if (doc.length > 0) {
              resultObj.status = "success";
              resultObj.message = "Transcript fetch Successfully";
              resultObj.results = doc;
              res.end(JSON.stringify(resultObj));
            } else {
              resultObj.status = "failed";
              resultObj.message = "No transcripts found !";
              resultObj.results = [];
              res.end(JSON.stringify(resultObj));
            }
          });
      }
    );

    /**
     * For getting all users
     */
    app.get("/rest/fetch-users", authenticateUser, (req, res) => {
      let params = req.body;
      var resultObj = {};
      Users.find(params, {}, { skip: 0, limit: 10000 })
        .sort({ date: -1 })
        .exec(function (error, doc) {
          if (doc.length > 0) {
            resultObj.status = "success";
            resultObj.message = "Users Listed Successfully";
            resultObj.results = doc;
            res.end(JSON.stringify(resultObj));
          } else {
            resultObj.status = "failed";
            resultObj.message = "No users found !";
            resultObj.results = [];
            res.end(JSON.stringify(resultObj));
          }
        });
    });
  },
};
