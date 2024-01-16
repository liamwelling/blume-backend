"use strict";

// read env vars from .env file
/// plaid
require("dotenv").config();
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  SandboxItemFireWebhookRequestWebhookCodeEnum,
  WebhookType,
} = require("plaid");
const util = require("util");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
const cors = require("cors");
const fetch = require("node-fetch");
const schedule = require("node-schedule");
///
const fs = require("fs/promises");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const crypto = require("crypto");
const sharp = require("sharp");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// const { S3Client } = require("@aws-sdk/client-s3");

const multer = require("multer");

// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })
require("dotenv").config();

/// AWS
const S3 = require("@aws-sdk/client-s3");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { resolve } = require("path");
const { unix } = require("moment");
///

app.listen(process.env.PORT, () => {
  console.log(`Express server running on port ` + process.env.PORT);
});

/// if statement to check if in production or development
/// if in prod use railway env vars
/// if in dev use .env file

let PLAID_CLIENT_ID;
let PLAID_SECRET;
let HOST_SQL;
let USER_SQL;
let PASSWORD_SQL;
let DATABASE_SQL;
let DATABASE_URL;
let PORT;
let PLAID_ENV;
let PLAID_PRODUCTS;
let PLAID_COUNTRY_CODES;
let WEBHOOK_URL;
let AWS_BUCKET_NAME;
let AWS_BUCKET_REGION;
let AWS_ACCESS_KEY;
let AWS_SECRET_ACCESS_KEY;
let OAUTH_REFRESH_TOKEN;
let OAUTH_CLIENT_SECRET;
let OAUTH_CLIENT_ID;
let MAIL_PASSWORD;
let MAIL_USERNAME;
let ATOM_API_KEY;

// if (process.env.NODE_ENV === "production") {
//   console.log("prod");
  PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
  PLAID_SECRET = process.env.PLAID_SECRET;
  HOST_SQL = process.env.HOST_SQL;
  USER_SQL = process.env.USER_SQL;
  PASSWORD_SQL = process.env.PASSWORD_SQL;
  DATABASE_SQL = process.env.DATABASE_SQL;
  DATABASE_URL = process.env.DATABASE_URL;
  PORT = process.env.PORT;
  PLAID_ENV = process.env.PLAID_ENV;
  PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(",");
  PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(",");
  WEBHOOK_URL = process.env.WEBHOOK_URL;
  AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
  AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
  AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
  OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
  OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  MAIL_PASSWORD = process.env.MAIL_PASSWORD;
  MAIL_USERNAME = process.env.MAIL_USERNAME;
  ATOM_API_KEY = process.env.ATOM_API_KEY;
// } else {
//   PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
//   PLAID_SECRET = process.env.PLAID_SECRET;
//   HOST_SQL = process.env.HOST_SQL;
//   USER_SQL = process.env.USER_SQL;
//   PASSWORD_SQL = process.env.PASSWORD_SQL;
//   DATABASE_SQL = process.env.DATABASE_SQL;
//   DATABASE_URL = process.env.DATABASE_URL;
//   PORT = process.env.PORT;
//   PLAID_ENV = process.env.PLAID_ENV;
//   PLAID_PRODUCTS = process.env.PLAID_PRODUCTS;
//   PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES;
//   WEBHOOK_URL = process.env.WEBHOOK_URL;
//   AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
//   AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
//   AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
//   AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
//   OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
//   OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
//   OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
//   MAIL_PASSWORD = process.env.MAIL_PASSWORD;
//   MAIL_USERNAME = process.env.MAIL_USERNAME;
//   ATOM_API_KEY = process.env.ATOM_API_KEY;
// }

const db = mysql.createConnection(process.env.DATABASE_URL);

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "https://main--gleaming-genie-543e9e.netlify.app",
      "http://localhost:5173",
    ],
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const ATOM_API_KEY = process.env.ATOM_API_KEY

app.get("/hello", (req, res) => {
  res.send("hello");
  // investorIndustryArray()
});

const APP_PORT = process.env.APP_PORT || 8080;

/// plaid
// const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
// const PLAID_SECRET = process.env.PLAID_SECRET;
// const PLAID_ENV = process.env.PLAID_ENV;

// const server = app.listen(APP_PORT, function () {
//   console.log('plaid-quickstart server listening on port ' + APP_PORT);
// });

// const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS ).split(
//   ',',
// );

// const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
//   ',',
// );

const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

let PAYMENT_ID = null;

let TRANSFER_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const client = new PlaidApi(configuration);

app.post("/api/info", function (request, response, next) {
  response.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    products: PLAID_PRODUCTS,
  });
});

/// webhook / notification update
const webhookApp = express();
let webhookUrl = process.env.WEBHOOK_URL;
// const WEBHOOK_PORT = 8080;
// const webhookServer = webhookApp.listen(WEBHOOK_PORT, function () {
//   console.log(
//     `Webhook receiver is up and running at http://localhost:${WEBHOOK_PORT}/`
//   );
// });

webhookApp.use(bodyParser.urlencoded({ extended: false }));
webhookApp.use(
  bodyParser.json({
    verify: function (req, res, buf, encoding) {
      // get rawBody
      req.rawBody = buf.toString();
      req.bodyHash = sha256(req.rawBody);
    },
  })
);

const webHookURLUpdate = async () => {
  try {
    // const updateResponse = await client.itemWebhookUpdate({
    //   access_token: 'access-development-f2492be2-79f1-4913-b587-5261fc0d3021',
    //   webhook: 'http://blume-node-production.up.railway.app/webhook',
    // })
    const updateResponse = await client.itemGet({
      access_token: "access-production-b77a2cb6-11f0-4397-b7bb-a5dc2f4a77a4",
    });
    console.log(updateResponse.data);
  } catch (error) {
    console.log(error);
  }
};
// uncomment vvv to update webhook on server start
// webHookURLUpdate()

app.get("/webhook", async (req, res, next) => {
  try {
    console.log("Webhook received:");
    console.dir(req.body, { colors: true, depth: null });
    console.dir(req.headers, { colors: true, depth: null });

    // if (await verifyWebhook(req)) {
    console.log("Webhook looks good!");
    const product = req.body.webhook_type;
    const code = req.body.webhook_code;
    switch (product) {
      case "INVESTMENTS_TRANSACTIONS":
        // send item id to db to get access token and investorid
        // use access token to get transaction history of recent time
        // use investorid to get list of userids that are subbed to them
        // for each user add transactions to db
        sendNotifications(req.body.item_id);
        console.log(req.body.item_id);
        break;
      case "HOLDINGS":
        console.log(req.body.item_id);
        break;
      case "TRANSACTIONS":
        console.log(req.body.item_id);
        // handleTransactionsWebhook(code, req.body);
        break;
      default:
        console.log(`Can't handle webhook product ${product}`);
        break;
    }
    res.json({ status: "received" });
    // } else {
    //   console.log("Webhook didn't pass verification!");
    //   res.status(401);
    // }
  } catch (error) {
    console.log("webhook error: ", error);
    next(error);
  }
});

const sendNotifications = async (itemID) => {
  // send item id to db to get access token and investorid
  // use access token to get transaction history of recent time
  // use investorid to get list of userids that are subbed to them
  // for each user add transactions to db
  let investorNotificationInfo = await getInvestorNotificationInfo(
    "JpXzm1QJvrujRaNX0BEMcpYnAEA7x0fbe5gzn"
  );
  // call function that gets recent transaction data
  // console.log(investorNotificationInfo)

  getRecentTransactions(investorNotificationInfo);
};

/**
 * Retrieves notification information for a specified investor from the database.
 *
 * @function
 * @async
 * @param {string|number} itemID - The account ID of the investor to retrieve information for.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of investor information objects. Each object contains the investor's ID, access token, first name, last name, and photo.
 *
 * @throws {Error} Throws an error if there's an issue with the database query or mapping the result.
 *
 * @example
 * const investorInfo = await getInvestorNotificationInfo('12345');
 * console.log(investorInfo[0].firstName);  // Outputs the first name of the investor
 */
const getInvestorNotificationInfo = (itemID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `verified_investors` WHERE `account_id` = ?",
      [itemID],
      async (err, result) => {
        if (err) {
          reject(err);
        } else {
          try {
            const mappedResult = await Promise.all(
              result.map(async (i) => {
                return {
                  investorID: i.idverified_investors,
                  token: i.access_token,
                  firstName: i.first_name,
                  investorPhoto: i.investor_photo,
                  lastName: i.last_name,
                };
              })
            );
            resolve(mappedResult);
          } catch (error) {
            reject(error);
          }
        }
      }
    );
  });
};

/**
 * Fetches and processes recent investment transactions for a given investor.
 *
 * @function
 * @async
 * @param {Array<Object>} investorInfo - An array of investor information objects. Each object should contain the access token for the investor.
 * @property {string} investorInfo.token - The access token for the investor.
 *
 * The function performs the following steps:
 * 1. Retrieves investment transactions for the investor from the last 50 days.
 * 2. Merges the retrieved transactions with their corresponding securities data.
 * 3. Retrieves investor subscription information.
 * 4. Merges subscription data with transactions and securities data.
 * 5. Processes and adds notifications based on the merged data.
 *
 * @throws {Error} Logs any errors that occur during data fetching or processing.
 *
 * @example
 * const investorData = [{ token: 'abc123' }];
 * await getRecentTransactions(investorData);
 */
const getRecentTransactions = async (investorInfo) => {
  let accessToken = investorInfo.map((i) => i.token);

  const startDate = moment().subtract(50, "days").format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  const configs = {
    /// access token should be argument
    access_token: `${accessToken}`,
    start_date: startDate,
    end_date: endDate,
  };
  try {
    const investmentTransactionsResponse =
      await client.investmentsTransactionsGet(configs);
    let transactions =
      investmentTransactionsResponse.data.investment_transactions;
    let securities = investmentTransactionsResponse.data.securities.map(
      (i) => ({ ...i, security_name: i.name })
    );
    let mergedArray = mergeByIdNotifications(transactions, securities);
    let investorSubs = await getSubs();
    let arrayMerge = investorSubs
      .map((i) =>
        mergedArray.map((e) => {
          return { ...e, userID: i };
        })
      )
      .flat(1);
    arrayMerge.forEach((i) => addNotifications(i, investorInfo));
    // console.log(arrayMerge);
    // console.log(securities);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Inserts notifications into the database if they don't already exist.
 *
 * @function
 * @param {Object} notifications - Object containing notification details.
 * @param {Array<Object>} investorInfo - An array of investor information objects.
 *
 * The function:
 * 1. Extracts necessary notification and investor info.
 * 2. Inserts the new notification into the database, ensuring no duplicates are added.
 *
 * @throws {Error} Logs any errors that occur during the database operation.
 *
 * @example
 * const notificationDetails = { userID: '123', ... };
 * const investorData = [{ investorID: 'abc', ... }];
 * addNotifications(notificationDetails, investorData);
 */

const addNotifications = (notifications, investorInfo) => {
  // console.log('info::::',investorInfo)
  let user_id = notifications.userID;
  let investor_id = investorInfo.map((i) => i.investorID);
  let type = notifications.subtype;
  let asset_name = notifications.security_name;
  let date = notifications.date;
  let seen = 1;
  let transaction_id = notifications.investment_transaction_id;
  let first_name = investorInfo.map((i) => i.firstName);
  let last_name = investorInfo.map((i) => i.lastName);
  let investor_photo = investorInfo.map((i) => i.investorPhoto);
  // console.log(`testname ${first_name}`)

  const notificationQuery = `
    INSERT INTO notifications (user_id, investor_id, type, asset_name, date, seen, transaction_id, first_name, last_name, investor_photo)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM dual
    WHERE NOT EXISTS (
      SELECT * FROM notifications
      WHERE user_id = ? AND transaction_id = ?
    ) LIMIT 1;
  `;
  const notificationValues = [
    user_id,
    investor_id,
    type,
    asset_name,
    date,
    seen,
    transaction_id,
    first_name,
    last_name,
    investor_photo,
    user_id,
    transaction_id,
    user_id,
    transaction_id,
  ];
  // console.log(type)
  db.query(notificationQuery, notificationValues, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      // res.send("Success")
      // console.log(results)
    }
  });
};

/**
 * Merges two arrays based on the `security_id` property.
 *
 * @function
 * @param {Array<Object>} a1 - First array containing transaction details.
 * @param {Array<Object>} a2 - Second array containing securities data.
 * @returns {Array<Object>} A merged array where each object combines matching data from both input arrays.
 *
 * @example
 * const transactions = [{ security_id: '1', ... }];
 * const securities = [{ security_id: '1', name: 'StockA', ... }];
 * const merged = mergeByIdNotifications(transactions, securities);
 */
const mergeByIdNotifications = (a1, a2) =>
  a1.map((itm) => ({
    ...a2.find((item) => item.security_id === itm.security_id && item),
    ...itm,
  }));

// * get users notifications *
// take in users id
// get every unread notification for users
// get investor information for each investor, photo, name
// send back in package

app.get("/notifications/:userid", async (req, res) => {
  let userID = req.params.userid;
  let resArray = [];
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM `notifications` WHERE `user_id` = ? AND `seen` = ?",
        [userID, 1],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    // console.log(result.map(i => i))
    resArray = await Promise.all(
      result.map(async (i) => {
        const photoURL = await addImageURL(i.investor_photo);
        return { ...i, photoURL };
      })
    );
    res.json(resArray);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// delete notifications
app.delete("/notifications/:notificationid", (req, res) => {
  let notificationid = req.params.notificationid;
  // console.log(notificationid)
  db.query(
    "DELETE FROM `notifications` WHERE `idnotifications` = ?",
    [notificationid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result)
        res.json(result);
      }
    }
  );
});

app.post("/api/create_link_token", function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const userUUID = uuidv4();
      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: userUUID,
        },
        client_name: "Blume",
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: "en",
        webhook: process.env.WEBHOOK_URL,
      };

      if (PLAID_REDIRECT_URI !== "") {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }

      if (PLAID_ANDROID_PACKAGE_NAME !== "") {
        configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
      }
      const createTokenResponse = await client.linkTokenCreate(configs);
      prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
    })
    .catch(next);
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow

app.post("/api/set_access_token", function (request, response, next) {
  // const email = request.headers.email;
  // console.log('Request: ',request.body, request.body.public_token);
  PUBLIC_TOKEN = request.body.public_token;
  Promise.resolve()
    .then(async function () {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token: PUBLIC_TOKEN,
      });

      prettyPrintResponse(tokenResponse);
      ACCESS_TOKEN = tokenResponse.data.access_token;
      ITEM_ID = tokenResponse.data.item_id;
      // addPlaidInfo(ACCESS_TOKEN, ITEM_ID, email)
      if (PLAID_PRODUCTS.includes("transfer")) {
        TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN);
      }
      response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    })
    .catch(next);
});
// add plaid info to verified investor table

const addPlaidInfo = async (token, id, email) => {
  // const token = 'testtoken';
  // const id = 'testID';
  // const email = 'test@gmail.com';
  console.log(token, id, email);
  db.query(
    "UPDATE `verified_investors` SET `access_token` = ?, `account_id` = ?  WHERE (`investor_email` = ?)",
    [token, id, email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        // res.send("Success")
        console.log(results);
      }
    }
  );
};
// register investor
/// upload photo to S3

const bucketName = process.env.AWS_BUCKET_NAME;
const regionName = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: regionName,
});

const randomNameS3 = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

app.post("/api/register/investor", upload.single("image"), async (req, res) => {
  // console.log('req.body', req.body)
  const email = req.body.email;
  const access = req.body.access;
  const item = req.body.item;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const investor_photo = req.body.investor_photo;
  const birth_year = req.body.year;
  const ssn = req.body.ssn;
  const facebook = req.body.facebook;
  const instagram = req.body.instagram;
  const twitter = req.body.twitter;
  const linkedin = req.body.linkedin;
  // const file = req.file
  const body = req.body;
  // let bufferRaw = req.body.buffer
  // console.log('filee',file)
  console.log("body::", body);
  const photoNameS3 = randomNameS3();
  console.log(
    "RES:::",
    email,
    access,
    item,
    first_name,
    last_name,
    investor_photo,
    birth_year,
    ssn,
    facebook,
    instagram,
    twitter,
    linkedin
  );

  // res.send('RESPONSE:::::::',email, access, item, first_name, last_name, investor_photo, birth_year, ssn, facebook, instagram, twitter, linkedin)

  // if (bufferRaw == undefined){
  //   return
  // } else {
  //   const buffer = await sharp(req.file.buffer).resize({height: 1920, width: 1080, fit: "contain"}).toBuffer()

  //   const photoNameS3 = randomNameS3();

  //   const params = {
  //     Bucket: bucketName,
  //     Key: photoNameS3,
  //     Body: buffer,
  //     ContentType: req.file.mimetype,
  //   }

  //   const command = new PutObjectCommand(params)
  //   await s3.send(command)
  // }

  db.query(
    "INSERT INTO `verified_investors` (`investor_email`,`access_token`,`account_id`, `first_name`, `last_name`, `investor_photo`, `birth_year`, ssn, facebook, instagram, twitter, linkedin, activated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      email,
      access,
      item,
      first_name,
      last_name,
      photoNameS3,
      birth_year,
      ssn,
      facebook,
      instagram,
      twitter,
      linkedin,
      0,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database Error: " + err.message);
      } else {
        res.send("Success");
        console.log(results);
      }
    }
  );
});

/// atom api
// snapshot , takes in array of tickers, maps through
// tickers sending back array of ticker snapshots

app.get("/stock/stock_snapshots", async (req, res) => {
  let ticker = req.headers.ticker;
  let results = ticker.toString().split(",");
  if (ticker.length == 0) {
    res.send("Empty");
    console.log("good");
  } else {
    let mapArray = await Promise.all(
      results.map(async (i) => atomSnapshotCall(i))
    );
    res.json(mapArray);
  }
});
/**
 * Fetches a snapshot of equity prices for a given ticker from the Atom Finance API.
 *
 * @function
 * @async
 * @param {string} ticker - The equity ticker symbol for which to fetch the snapshot.
 * @returns {Array<Object>|undefined} Returns an array of merged asset and snapshot data with type "equity" or undefined if no snapshots exist.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const ticker = 'AAPL';
 * const snapshot = await atomSnapshotCall(ticker);
 */

async function atomSnapshotCall(ticker) {
  return fetch(
    `https://platform.atom.finance/api/2.0/price/snapshot?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assets: [
          {
            identifier: "ticker",
            value: `${ticker}`,
            assetType: "equity",
            market: "USA",
          },
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then((response) =>
      response.priceSnapshots?.map((i) => {
        return { ...i.asset, ...i.snapshot, type: "equity" };
      })
    );
}

/**
 * Fetches a snapshot of fund prices for a given ticker from the Atom Finance API.
 *
 * @function
 * @async
 * @param {string} ticker - The fund ticker symbol for which to fetch the snapshot.
 * @returns {Array<Object>|undefined} Returns an array of merged asset and snapshot data with type "fund" or undefined if no snapshots exist.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const ticker = 'VFINX';
 * const snapshot = await atomSnapshotCallFund(ticker);
 */
async function atomSnapshotCallFund(ticker) {
  return fetch(
    `https://platform.atom.finance/api/2.0/price/snapshot?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assets: [
          {
            identifier: "ticker",
            value: `${ticker}`,
            assetType: "fund",
            market: "USA",
          },
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then((response) =>
      response.priceSnapshots?.map((i) => {
        return { ...i.asset, ...i.snapshot, type: "fund" };
      })
    );
}

async function atomSnapshotCallCrypto(ticker) {
  return fetch(
    `https://platform.atom.finance/api/2.0/price/snapshot?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assets: [
          { identifier: "ticker", value: `${ticker}`, assetType: "crypto" },
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then((response) => response);
}

/**
 * Fetches a snapshot of prices for a given ticker and type from the Atom Finance API.
 *
 * @function
 * @async
 * @param {string} ticker - The ticker symbol for which to fetch the snapshot.
 * @param {string} type - The type of the asset (e.g., 'equity' or 'fund').
 * @returns {Array<Object>|undefined} Returns an array of merged asset and snapshot data or undefined if no snapshots exist.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const ticker = 'AAPL';
 * const type = 'equity';
 * const snapshot = await atomConditionalSnapshotCall(ticker, type);
 */
async function atomConditionalSnapshotCall(ticker, type) {
  //  console.log('cond',type)
  return fetch(
    `https://platform.atom.finance/api/2.0/price/snapshot?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assets: [
          {
            identifier: "ticker",
            value: `${ticker}`,
            assetType: `${type}`,
            market: "USA",
          },
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then((response) =>
      response.priceSnapshots?.map((i) => {
        return { ...i.asset, ...i.snapshot };
      })
    );
}

// atom news
/**
 * Fetches news feed for a specific ticker from the Atom Finance API.
 *
 * @function
 * @async
 * @param {string} ticker - The ticker symbol for which to fetch the news.
 * @param {string} type - The type of the asset (e.g., 'equity' or 'fund').
 * @returns {Array<Object>|undefined} Returns an array of news data or undefined if no news is found.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const ticker = 'AAPL';
 * const type = 'equity';
 * const newsData = await getAtomNews(ticker, type);
 */
// for specific ticker
const getAtomNews = async (ticker, type) => {
  // console.log('news',type)
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      assets: [
        {
          identifier: "ticker",
          assetType: `${type}`,
          market: "USA",
          value: `${ticker}`,
        },
      ],
      languages: ["en-US"],
      pagination: { page: 1, limit: 10 },
    }),
  };

  return (
    fetch(
      `https://platform.atom.finance/api/2.0/news/feed?api_key=${ATOM_API_KEY}`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        return response.news;
      })
      // .then(response => console.log(response.news))
      .catch((err) => console.error(err))
  );
};

// related news
app.get("/related_news", async (req, res) => {
  let tickers = req.headers.tickers.split(",");
  const unqStoreStocks = [...new Set(tickers)];
  // console.log('related news', unqStoreStocks)

  // let responseNews = await atomOverviewCall1();

  let responseNews = await getRelatedAtomNews(unqStoreStocks, "equity");
  // console.log(responseNews)
  res.json(responseNews);
});

/**
 * Fetches news feed for multiple tickers from the Atom Finance API.
 *
 * @function
 * @async
 * @param {Array<string>} tickers - An array of ticker symbols for which to fetch the news.
 * @param {string} type - The type of the asset (e.g., 'equity' or 'fund').
 * @returns {Array<Object>|undefined} Returns an array of news data or undefined if no news is found.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const tickers = ['AAPL', 'GOOGL'];
 * const type = 'equity';
 * const newsData = await getRelatedAtomNews(tickers, type);
 */
const getRelatedAtomNews = async (tickers, type) => {
  // console.log('news',type)

  let assetArray = tickers.map((i) => {
    return {
      identifier: "ticker",
      assetType: `${type}`,
      market: "USA",
      value: `${i}`,
    };
  });
  // console.log(assetArray)
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      assets: assetArray,
      languages: ["en-US"],
      pagination: { page: 1, limit: 10 },
    }),
  };

  return (
    fetch(
      `https://platform.atom.finance/api/2.0/news/feed?api_key=${ATOM_API_KEY}`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        return response.news;
      })
      // .then(response => console.log(response.news.map((i) => i.headline)))
      .catch((err) => console.error(err))
  );
};

// top news
// 'for you' homepage
app.get("/news", async (req, res) => {
  // console.log('topnews')
  // let responseNews = await atomOverviewCall1();

  let responseNews = await getTopAtomNews();
  // console.log(responseNews)
  res.json(responseNews);
});
/**
 * Fetches top news from the Atom Finance API.
 *
 * @function
 * @async
 * @param {string} ticker - The ticker symbol for which to fetch the news (currently unused in the function but kept for consistency).
 * @param {string} type - The type of the asset (e.g., 'equity' or 'fund'). Currently unused in the function but kept for consistency.
 * @returns {Array<Object>|undefined} Returns an array of top news data or undefined if no news is found.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * const ticker = 'AAPL';
 * const type = 'equity';
 * const topNewsData = await getTopAtomNews(ticker, type);
 */
const getTopAtomNews = async (ticker, type) => {
  // console.log('news',type)
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      // assets: [{identifier: 'ticker', assetType: 'equity', market: 'USA', value: 'AAPL'}],
      newsTypes: ["General News"],
      newsSubtypes: ["Top News"],
      languages: ["en-US"],
      pagination: { page: 1 },
    }),
  };

  return (
    fetch(
      `https://platform.atom.finance/api/2.0/news/feed?api_key=${ATOM_API_KEY}`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        return response.news;
      })
      // .then(response => console.log(response.news.map(i => i)))
      .catch((err) => console.error(err.error))
  );
};

// atom stock history

app.get(`/stock/stock_history/`, async (req, res) => {
  let ticker = req.headers.ticker;
  let timePeriod = req.headers.range;
  let type = req.headers.type.toLowerCase();
  let historicalData = await getStockHistory(ticker, timePeriod, type);
  console.log(historicalData);
  res.json(historicalData);
});

const getStockHistory = async (ticker, timePeriod, type) => {
  let time = Date.now();
  let period = "Minute";
  let periodLength = 30;
  switch (timePeriod) {
    case "day":
      time = moment().subtract(1, "d").format("YYYY-MM-DD");
      // period = 'Second'
      break;
    case "week":
      time = moment().subtract(7, "d").format("YYYY-MM-DD");
      break;
    case "month":
      time = moment().subtract(30, "d").format("YYYY-MM-DD");
      break;
    case "year":
      time = moment().subtract(365, "d").format("YYYY-MM-DD");
      period = "Day";
      break;
    case "all":
      time = moment().subtract(5, "y").format("YYYY-MM-DD");
      period = "Day";
      periodLength = 100;
      break;
  }
  console.log("time:" + time + ticker + type);
  // const month = moment().subtract(1,'d').format('YYYY-MM-DD');
  const date = new Date(time).valueOf();
  // console.log(date)
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      assets: [
        {
          identifier: "ticker",
          value: `${ticker}`,
          assetType: `${type}`,
          market: "USA",
        },
      ],
      periodUnit: period,
      startTime: date,
      endTime: Date.now(),
      periodLength: 30,
    }),
  };

  return (
    fetch(
      `https://platform.atom.finance/api/v3/price/history-delayed?api_key=${ATOM_API_KEY}`,
      options
    )
      .then((response) => response.json())
      .then((response) => response)
      // .then(response => console.log(response.priceHistory[0].quotes))
      .catch((err) => console.error(err))
  );
};
// browse stocks search feature

async function atomSearchSnapshotCall(ticker, type) {
  return fetch(
    `https://platform.atom.finance/api/2.0/price/snapshot?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        assets: [
          {
            identifier: "ticker",
            value: `${ticker}`,
            assetType: `${type}`,
            market: "USA",
          },
        ],
      }),
    }
  )
    .then((response) => response.json())
    .then((response) =>
      response.priceSnapshots?.map((i) => {
        return { ...i.asset, ...i.snapshot };
      })
    );
}

app.get("/stock/search2.0/", async (req, res) => {
  const ticker = req.headers.ticker;
  try {
    // atom search results without price/change
    let atomSearchResult = await atomSearch(ticker);
    let searchResponsePromises = atomSearchResult.map(async (i) => {
      let ticker = i.ticker;
      let assetType = i.assetType;
      const snapshot = await atomSearchSnapshotCall(
        ticker,
        assetType.toLowerCase()
      );
      return {
        ...i,
        price: snapshot[0].price,
        changePercent: snapshot[0].changePercent,
        change: snapshot[0].change,
        type: assetType,
      };
    });

    let searchResponse = await Promise.all(searchResponsePromises);
    // console.log(searchResponse);
    res.status(200).json(searchResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

const atomSearch = async (query) => {
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      query: `${query}`,
      searchCriteria: ["Enhanced"],
      pagination: { page: 2 },
    }),
  };
  return fetch(
    `https://platform.atom.finance/api/2.0/search?api_key=${ATOM_API_KEY}`,
    options
  )
    .then((response) => response.json())
    .then((response) => response.searchResults)
    .catch((err) => console.error("error:" + err));
};

app.get("/stock/search/", async (req, res) => {
  let responseData = [];
  let ticker = req.headers.ticker;
  let equityResponseData = [];
  let fundResponseData = [];

  equityResponseData = await atomSnapshotCall(`${ticker}`);
  fundResponseData = await atomSnapshotCallFund(`${ticker}`);

  if (fundResponseData) {
    responseData = fundResponseData;
  } else {
    responseData = equityResponseData;
  }
  // console.log(responseData)
  res.json(responseData);
});

// overview call, called for the stock page, needs to take in equity type

app.get("/stock/stock_overview", async (req, res) => {
  let ticker = req.headers.ticker.toUpperCase();
  let type = req.headers.tickertype.toLowerCase();
  console.log("type:", type);
  console.log("ticker:", ticker);

  // let atomResults = []
  // let snapshotResults = []
  // let newsResults = []
  // if (type = 'equity'){
  //   atomResults = await atomOverviewCall1(ticker, type);
  //   snapshotResults = await atomSnapshotCall(ticker);
  //   newsResults = await getAtomNews(ticker)
  // } else {
  //   atomResults = await atomOverviewCall1(ticker, type);
  //   snapshotResults = await atomSnapshotCall(ticker);
  //   newsResults = await getAtomNews(ticker)
  // }

  let atomResults = await atomOverviewCall1(ticker, type);
  console.log(atomResults);
  let snapshotResults = await atomConditionalSnapshotCall(ticker, type);
  // console.log(snapshotResults)
  let newsResults = await getAtomNews(ticker, type);
  // console.log(newsResults)
  res.json({
    overview: atomResults,
    snapshot: snapshotResults,
    news: newsResults,
  });
});
// const options = {
//   method: 'POST',
//   headers: {accept: 'application/json', 'content-type': 'application/json'},
//   body: JSON.stringify({
//     asset: {identifier: 'ticker', value: 'AAPL', assetType: 'equity', market: 'USA'}
//   })
// };

// fetch('https://platform.atom.finance/api/2.0/equity/overview?api_key=03a47c53-eb29-41ba-b433-57105c706060', options)
//   .then(response => response.json())
//   .then(response => console.log(response))
//   .catch(err => console.error(err));

// const options = {
//   method: 'POST',
//   headers: {accept: 'application/json', 'content-type': 'application/json'},
//   body: JSON.stringify({
//     asset: {identifier: 'ticker', value: 'NKE', assetType: 'equity', market: 'USA'}
//   })
// };

// async function callAPI(n) {
//   return fetch('https://jsonplaceholder.typicode.com/todos/' + n)
//       .then(response => response.json())
// }

async function atomOverviewCall1(ticker, type) {
  // console.log('call1',type)

  return fetch(
    `https://platform.atom.finance/api/2.0/equity/overview?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          identifier: "ticker",
          value: `${ticker}`,
          assetType: `${type}`,
          market: "USA",
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((response) => response);
  // .then((response )=> {
  //   console.log(response.lists[0].name)
  //   return(JSON.stringify(response.lists[0].name))
  //   // arr.push(response.lists[0].name)
  //  JSON.stringify(response.lists[0].name)})
  // .catch(err => console.error(err));
}

// async function atomOverviewCall1(ticker, type) {

//  return fetch(`https://platform.atom.finance/api/2.0/equity/overview?api_key=${ATOM_API_KEY}`,
//   {
//     method: 'POST',
//     headers: {accept: 'application/json', 'content-type': 'application/json'},
//     body: JSON.stringify({
//       body: JSON.stringify({asset: {identifier: 'ticker', assetType: 'crypto', value: 'BTC', market: null}})
//     })
//   })
//   .then(response => response.json())
//   .then(response => response)
//   .catch(err => console.error(err));
// }

// returning respponse.lists[0] for industry
async function atomOverviewCall(ticker, type) {
  console.log(type);
  console.log(ticker);

  return fetch(
    `https://platform.atom.finance/api/2.0/equity/overview?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          identifier: "ticker",
          value: "NKE",
          assetType: "equity",
          market: "USA",
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((response) => response.lists[0].name);
}
async function atomOverviewCallFund(type, ticker) {
  console.log(type);
  console.log(ticker);

  return fetch(
    `https://platform.atom.finance/api/2.0/equity/overview?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          identifier: "ticker",
          value: "NKE",
          assetType: "fund",
          market: "USA",
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((response) => response.lists[0].name);
}

async function atomOverviewCallCrypto(type, ticker) {
  console.log(type);
  console.log(ticker);

  return fetch(
    `https://platform.atom.finance/api/2.0/crypto/overview?api_key=${ATOM_API_KEY}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        asset: {
          identifier: "ticker",
          value: "bit",
          assetType: "crypto",
          market: "USA",
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((response) => console.log("resss", response));
  // .then(response => response.lists[0].name)
}

async function atomCall(type, ticker) {
  // console.log(type)
  // console.log(ticker)
  // let crypto = 'crypto'
  // if (type = 'cryptocurrency') {
  //   type = 'crypto'
  //   ticker = 'BTC'
  // } else {
  //   type = 'equity'
  //   ticker = 'NKE'
  // }
  return (
    fetch(
      `https://platform.atom.finance/api/2.0/equity/overview?api_key=${ATOM_API_KEY}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          asset: {
            identifier: "ticker",
            value: `${ticker}`,
            assetType: `equity`,
            market: "USA",
          },
        }),
      }
    )
      .then((response) => response.json())
      // .then(response => console.log(response.lists[0].name))
      .then((response) => response.lists[0].name)
  );
  // .then((response )=> {
  //   console.log(response.lists[0].name)
  //   return(JSON.stringify(response.lists[0].name))
  //   // arr.push(response.lists[0].name)
  //  JSON.stringify(response.lists[0].name)})
  // .catch(err => console.error(err));
}

async function atomMapTest(array) {
  array.map(async (i) => atomOverviewCall());
}

const industryFunction = async (type, ticker) => {
  let industry = "";
  // industry = await atomCall(type, ticker)

  if (type == "cryptocurrency") {
    return "Crypto";
  }
  if (type == "equity") {
    industry = await atomCall(type, ticker);
    console.log("Plaid Industry: ", industry);
    if (`${industry}` == "Consumer Cyclicals") {
      return "Consumer Staples";
    }
    if (`${industry}` == "Consumer Non-Cyclicals") {
      return "Consumer Staples";
    }
    if (`${industry}` == "Technology") {
      return "Technology";
    }
    if (`${industry}` == "Industrials") {
      return "Industrials";
    }
  } else {
    return "ETF";
  }
  return "Crypto";
};

const mergeById = (a1, a2) =>
  a1.map((itm) => ({
    ...a2.find((item) => item.security_id === itm.security_id && item),
    ...itm,
  }));

/// timed investor ROI calculation
// let hourROI = [9, 12, 15];
// let minuteROI = [30, 30, 35];

/// !!!! goes off too often !!!!!!

// const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(1, 5)];
// rule.hour = [9, 12, 15];
// rule.minute = [30, 30, 38];

// const job1 = schedule.scheduleJob(rule, function(){
//   // individual investor balances
//     timedBalances()
//   // averaged investor balances
//     investorROIChart()

//     console.log('ran')
// });

const weekdaysOnly = new schedule.Range(1, 5); // Monday to Friday

// Job execution logic
function executeJob() {
  timedBalances();
  investorROIChart();
  console.log("ran");
}

// 09:30**
function adjustToEST(hour, minute) {
  const currentTimeInEST = moment.tz("America/New_York");
  currentTimeInEST.hour(hour);
  currentTimeInEST.minute(minute);
  currentTimeInEST.second(0);

  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = weekdaysOnly;
  rule.hour = currentTimeInEST.utc().hour();
  rule.minute = currentTimeInEST.utc().minute();
  return rule;
}

const rule1 = adjustToEST(9, 31);
const rule4 = adjustToEST(12, 50);
const rule5 = adjustToEST(14, 33);

// const rule1 = new schedule.RecurrenceRule();
// rule1.dayOfWeek = weekdaysOnly;
// rule1.hour = 9;
// rule1.minute = 30;

// // 12:21
// const rule2 = new schedule.RecurrenceRule();
// rule2.dayOfWeek = weekdaysOnly;
// rule2.hour = 12;
// rule2.minute = 21;

// // 12:25
// const rule3 = new schedule.RecurrenceRule();
// rule3.dayOfWeek = weekdaysOnly;
// rule3.hour = 12;
// rule3.minute = 23;

// // 12:30**
// const rule4 = new schedule.RecurrenceRule();
// rule4.dayOfWeek = weekdaysOnly;
// rule4.hour = 12;
// rule4.minute = 18;

// // 15:30**
// const rule5 = new schedule.RecurrenceRule();
// rule5.dayOfWeek = weekdaysOnly;
// rule5.hour = 14;
// rule5.minute = 25;

// // 15:38
// const rule6 = new schedule.RecurrenceRule();
// rule6.dayOfWeek = weekdaysOnly;
// rule6.hour = 16;
// rule6.minute = 27;

// Scheduling the jobs
schedule.scheduleJob(rule1, executeJob);
// schedule.scheduleJob(rule2, executeJob);
// schedule.scheduleJob(rule3, executeJob);
schedule.scheduleJob(rule4, executeJob);
schedule.scheduleJob(rule5, executeJob);
// schedule.scheduleJob(rule6, executeJob);

const ruleIndustry = new schedule.RecurrenceRule();
ruleIndustry.dayOfWeek = [0, new schedule.Range(1, 5)];
ruleIndustry.hour = [9, 12, 15];
ruleIndustry.minute = [35, 35, 35];

// rule.dayOfWeek = [0, new schedule.Range(1, 5)];
// rule.hour = [12];
// rule.minute = [15];

const job2 = schedule.scheduleJob(ruleIndustry, function () {
  investorIndustryArray();
});

// for (let i = 0; i < hourROI.length; i++) {
//   let rule = new schedule.RecurrenceRule();
//   rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
//   rule.hourROI = hourROI[i];
//   rule.minuteROI = minuteROI[i];

//   let j = schedule.scheduleJob(rule, function(){
//     // timedBalances()
//     // investorROIChart()
//     console.log('ran')
//   });
// }

/**
 * Retrieves balances for all investors at a certain point in time.
 * Creates an array of all the investors and their plaid credentials then
 * maps through them and for each will calculate their current ROI and
 * then add that to the table investor_balance_history
 *
 * @async
 * @function timedBalances
 * @throws {Error} Will throw an error if retrieving subscriptions, investors, or balances fails.
 * @returns {Promise<void>} This function does not have a return value; its results are logged to the console.
 */
const timedBalances = async () => {
  // let investorSubs = await getSubs();
  let investors = await getAllInvestors();
  console.log("investors:", investors);
  let balances = investors.map((i) => getAllBalances(i.token, i.investorID));
  // console.log(balances);
};

/**
 * Retrieves all balances for a given investor and inserts ROI and other
 * information into a database.
 *
 * this function calculates the investors entire ROI by finding the ROI of each holding
 * by using this algo " ROI: (i.institution_price - (i.cost_basis/i.quantity)) * i.quantity "
 *
 * @async
 * @function getAllBalances
 * @param {string} token - The access token used for API authentication.
 * @param {string} investorID - The unique ID of the investor for whom to retrieve balances.
 * @throws {Error} Will throw an error if the API request or database operations fail.
 * @returns {void} This function does not have a return value; its results are stored in a database.
 */

const getAllBalances = async (token, investorID) => {
  console.log("getallbalances token:", token);
  const request = {
    access_token: token,
  };

  try {
    const response = await client.investmentsHoldingsGet(request);
    // const holdings = response.data.accounts[0].balances;
    // console.log(response.data.accounts)
    const holdings = response.data.holdings.filter((i) => i.type != "cash");
    const securities = response.data.securities.filter((i) => i.type != "cash");
    // console.log('holdings:',holdings)
    // console.log('securities:',securities)
    let mergedArray = mergeById(holdings, securities);
    // console.log(mergedArray)
    const arrayROI = mergedArray.map((i) => {
      // Calculate the total original cost and total current value for each holding
      const totalOriginalCost = i.cost_basis;
      const totalCurrentValue = i.institution_price * i.quantity;
      // Then calculate the ROI for each holding
      let ROI;
      if (totalOriginalCost === 0 || totalOriginalCost === null) {
        // For an origin cost of zero, set ROI to be the current value
        ROI = totalCurrentValue;
      } else {
        // Otherwise, calculate ROI normally
        ROI = totalCurrentValue - totalOriginalCost;
      }
      // console.log(ROI)
      // And return the updated object
      return {
        name: i.name,
        originCost: i.cost_basis / i.quantity,
        currentCost: i.institution_price,
        date: i.institution_price_as_of,
        quantity: i.quantity,
        ROI: ROI,
      };
    });

    //  console.log('arrayROI:',arrayROI);

    const sumROI = arrayROI.reduce((accumulator, object) => {
      return accumulator + object.ROI;
    }, 0);

    const roundedSumROI = Math.round(sumROI);
    // console.log(roundedSumROI);
    let newDate = new Date().toLocaleString();
    let date = moment().toDate();
    let timeEST = moment().tz("America/New_York").format();

    console.log(
      "timed balances  :",
      "date:",
      date,
      "new date:",
      newDate,
      "ID:",
      investorID,
      roundedSumROI
    );
    db.query(
      "INSERT INTO `investor_balance_history` (`ROI`, `date`, `investor_id`) VALUES (?,?,?)",
      [roundedSumROI, date, investorID],
      (err, results) => {
        if (err) {
          console.log("error:", err);
        } else {
          // res.send("Success")
          // console.log("results:",results)
        }
      }
    );
    const arrayOfROI = await calculateROI(investorID);
    const initialROI = arrayOfROI[0];
    const recentROI = arrayOfROI[arrayOfROI.length - 1];
    const currentROIPercentage = ((initialROI - recentROI) / initialROI) * 100;
    console.log("ROI % :", currentROIPercentage);
    addROI(currentROIPercentage, investorID);
  } catch (error) {
    console.log(error);
  }
};

// timedBalances();

const getAllInvestors = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `verified_investors` WHERE activated = 1",
      (err, result) => {
        return err
          ? reject(err)
          : resolve(
              result.map((i) => {
                return {
                  investorID: i.idverified_investors,
                  token: i.access_token,
                };
              })
            );
      }
    );
  });
};

const calculateROI = (investorID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM investor_balance_history WHERE investor_id = ?",
      [investorID],
      (err, result) => {
        return err
          ? reject(err)
          : resolve(
              result.map((i) => {
                return i.ROI;
              })
            );
      }
    );
  });
};
const addROI = (ROI, investorID) => {
  // return new Promise ((resolve, reject) => {
  db.query(
    "UPDATE verified_investors SET ROI = ? WHERE idverified_investors = ?",
    [ROI, investorID],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // res.send("Success")
        // console.log(result)
      }
    }
  );
  // })
};

// timed average of all investor ROI

// app.get('/testroi', async (req, res) => {
//   investorROIChart()
//   res.json(":)")
// })
const investorROIChart = async () => {
  let ROIList = await investorROIs();
  console.log("ROI LIST : ", ROIList);
  let length = ROIList.length;
  let totalROI = ROIList.reduce((partialSum, i) => partialSum + Number(i), 0);
  let avgROI = totalROI / length;
  let date = moment().toDate();
  console.log(totalROI / length);
  db.query(
    "INSERT INTO average_roi (`ROI`, `date`) VALUES (?,?)",
    [avgROI, date],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        // res.send("Success")
        console.log(results);
      }
    }
  );
};

const investorROIs = async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT ROI FROM verified_investors", (err, result) => {
      return err
        ? reject(err)
        : resolve(
            result.map((i) => {
              return i.ROI;
            })
          );
    });
  });
};

/// homepage chart using daily ROI average

app.get("/homepage_chart", async (req, res) => {
  let investorData = await getHomepageROIData();
  let stockData = await getHomepageStockData();
  // console.log('stock::', stockData)
  res.json({ investors: investorData, market: stockData });
});

const getHomepageROIData = async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM `average_roi`", (err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
};
const getHomepageStockData = async () => {
  let period = "Minute";
  let time = Date.now();
  time = moment().subtract(7, "d").format("YYYY-MM-DD");
  const date = new Date(time).valueOf();

  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      assets: [
        {
          identifier: "ticker",
          value: `SPY`,
          assetType: `fund`,
          market: "USA",
        },
      ],
      periodUnit: period,
      startTime: date,
      endTime: Date.now(),
      periodLength: 30,
    }),
  };

  return (
    fetch(
      `https://platform.atom.finance/api/v3/price/history-delayed?api_key=${ATOM_API_KEY}`,
      options
    )
      // .then(response => console.log(response))
      .then((response) => response.json())
      .then((response) => response)
      // .then(response => console.log(response.priceHistory[0].quotes))
      .catch((err) => console.error(err))
  );
};

// app.get('/api/holdings', function (request, response, next) {

//   Promise.resolve()
//     .then(async function () {
//       const holdingsResponse = await client.investmentsHoldingsGet({
//         access_token: 'access-development-c1e43f04-fdc7-440a-918f-a435157f69ef',
//       });
//       prettyPrintResponse(holdingsResponse);

//       response.json({ error: null, holdings: holdingsResponse.data });
//     })
//     .catch(next);
// });

// investor industry function
// once a day, this function is called to go through every investor,
// get their holdings, build array of the industies they hold, then
// add that array to their database

// let hourIndustry = [4, 20];
// let minuteIndustry = [30, 30];

// for (let i = 0; i < hourIndustry.length; i++) {
//   let rule = new schedule.RecurrenceRule();
//   rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
//   rule.hourIndustry = hourIndustry[i];
//   rule.minuteIndustry = minuteIndustry[i];

//   let j = schedule.scheduleJob(rule, function(){
//     // investorIndustryArray()
//     console.log('ran Industry')
//   });
// }

const investorIndustryArray = async () => {
  let investorArray = await getAllInvestors();
  investorArray.map(async (i) => {
    let industryArray = await createIndustryArray(i.token);
    let stringIndustryArray = JSON.stringify(industryArray);
    db.query(
      "UPDATE `verified_investors` SET `industries` = ? WHERE (`idverified_investors` = ?)",
      [stringIndustryArray, i.investorID],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          // res.send("Success")
        }
      }
    );
  });
  // let responseArray = await createIndustryArray()
  // console.log(responseArray)
};
``;
const createIndustryArray = async (token) => {
  const holdingsResponse = await client.investmentsHoldingsGet({
    access_token: token,
  });
  let holdings = holdingsResponse.data.holdings.filter((i) => i.type != "cash");
  let securities = holdingsResponse.data.securities.filter(
    (i) => i.type != "cash"
  );
  let mergedArray = mergeById(holdings, securities);
  let responseArray = await Promise.all(
    mergedArray.map(async (i) => {
      return await industryFunction(i.type, i.ticker_symbol);
    })
  );
  let noDuplicateArray = [...new Set(responseArray)];
  return noDuplicateArray;
};

// vvv daily call function vvv

// var dailyIndustry = schedule.scheduleJob('0 0 * * *', function(){
//   investorIndustryArray()
// });

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get("/api/holdings", function (request, response, next) {
  let investorID = request.headers.investorid;

  console.log(investorID);
  // let arr = calculateROI(investorID);

  db.query(
    "SELECT `access_token` FROM `verified_investors` WHERE `idverified_investors` = ?",
    [investorID],
    (err, result) => {
      if (err) {
        console.log("ERROR :", err);
      } else {
        let securities = [];
        let holdings = [];
        let mergedArray = [];
        // let responseArray = [];
        let atomArray = [];
        let token = result[0].access_token;
        console.log("Token: ", token);
        Promise.resolve()
          .then(async function () {
            const holdingsResponse = await client.investmentsHoldingsGet({
              access_token: token,
            });
            console.log(holdingsResponse);
            holdings = holdingsResponse.data.holdings.filter(
              (i) => i.security_id != "7dD8KV8owvUgA3rkNbmLtLPy8Kyr9dFQmvKD4"
            );
            securities = holdingsResponse.data.securities.filter(
              (i) => i.security_id != "7dD8KV8owvUgA3rkNbmLtLPy8Kyr9dFQmvKD4"
            );
            mergedArray = mergeById(holdings, securities);
            console.log(mergedArray);
            let responseArray = await Promise.all(
              mergedArray.map(async (i) => {
                return {
                  ...i,
                  industry: await industryFunction(i.type, i.ticker_symbol),
                };
              })
            );

            // console.log(responseArray)
            response.json({
              error: null,
              holdings: responseArray,
              balance: holdingsResponse.data,
            });
          })
          .catch(next);
      }
    }
  );
});

/// plaid transactions
// app.get('/api/investments_transactions', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const startDate = moment().subtract(100, 'days').format('YYYY-MM-DD');
//       const endDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
//       const configs = {
//         access_token: 'access-development-51982363-fca1-4530-b013-c31993d6b7b1',
//         start_date: startDate,
//         end_date: endDate,
//       };
//       const investmentTransactionsResponse =
//         await client.investmentsTransactionsGet(configs);
//       let array1 = investmentTransactionsResponse.data.securities
//       let array2 = investmentTransactionsResponse.data.investment_transactions
//       let mergedArray = mergeById(array1, array2);
//       // console.log(mergedArray);
//       getSubs();
//       // prettyPrintResponse(investmentTransactionsResponse);
//       response.json({
//         error: null,
//         investments_transactions: mergedArray,
//       });
//     })
//     .catch(next);
// });

// turn this into a callable function
app.get("/api/investments_transactions", function (request, response, next) {
  Promise.resolve()
    .then(async function () {
      const startDate = moment().subtract(100, "days").format("YYYY-MM-DD");
      const endDate = moment().subtract(3, "days").format("YYYY-MM-DD");
      const configs = {
        /// access token should be argument
        access_token: "access-development-51982363-fca1-4530-b013-c31993d6b7b1",
        start_date: startDate,
        end_date: endDate,
      };
      const investmentTransactionsResponse =
        await client.investmentsTransactionsGet(configs);
      let array1 = investmentTransactionsResponse.data.securities;
      let array2 = investmentTransactionsResponse.data.investment_transactions;
      let mergedArray = mergeById(array1, array2);
      // let investorSubs = await getSubs();
      // let arraymerge = investorSubs.map(i => mergedArray.map(e => {
      //   return {...e, userID: i}
      // })).flat(1)
      // arraymerge.forEach(i => addNotifications(i));
      // works ^^^^

      // test suite
      sendNotifications();

      // end test suite

      // addNotifications(arraymerge)

      // let investors = await getAllInvestors();
      // let balances = investors.map(i => getAllBalances(i.token, i.investorID))
      // console.log(investors)

      // getAllBalances()
      // let arraymerge = mergedArray.map(e => {
      //   return {...e, userID: 69}
      // })
      // console.log(arraymerge);

      // addNotifications(arraymerge)
      // prettyPrintResponse(investmentTransactionsResponse);
      response.json({
        error: null,
        investments_transactions: mergedArray,
        // historical_data: historycal
      });
    })
    .catch(next);
});

// get investor subscribers
function getSubs() {
  let investor_id = 11;
  let responseArray = [];
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM myinvestors WHERE `investor_id` = 11",
      [investor_id],
      (err, result) => {
        return err ? reject(err) : resolve(result.map((i) => i.users_idusers));
      }
      //   (err, result) =>{
      //     if (err) {
      //         console.log('error')

      //     } else {
      //       responseArray = result.map(i => i.users_idusers)
      //       return(responseArray)
      //     }
      // }
    );
  });
}

// app.use('/api', function (error, request, response, next) {
//   prettyPrintResponse(error.response);
//   response.json(formatError(error.response));
// });

// const server = app.listen(APP_PORT, function () {
//   console.log('plaid-quickstart server listening on port ' + APP_PORT);
// });

const prettyPrintResponse = (response) => {
  // console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

const formatError = (error) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};

/// non plaid

/// multer

/// register user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const birthyear = req.body.birthyear;
  const risk = req.body.risk;
  const save = req.body.save;
  const income = req.body.income;
  const outpace = req.body.outpace;
  const earn = req.body.earn;
  const crypto = req.body.crypto;
  const bluechip = req.body.bluechip;
  const utilities = req.body.utilities;
  const tech = req.body.tech;
  const biotech = req.body.biotech;
  const realestate = req.body.realestate;
  const howdidyouhear = req.body.howdidyouhear;
  const promo_code = req.body.promocode;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.query(
      "INSERT INTO `users` (email, password, username, birthyear, risk, save, income, outpace, earn, crypto, bluechip, utilities, tech, biotech, realestate, howdidyouhear, promocode ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        email,
        hash,
        username,
        birthyear,
        risk,
        save,
        income,
        outpace,
        earn,
        crypto,
        bluechip,
        utilities,
        tech,
        biotech,
        realestate,
        howdidyouhear,
        promo_code,
      ],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Success");
          console.log(results);
        }
      }
    );
  });
});

app.use(
  session({
    key: "iduser",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
      // cookie expires in 24 hours //
    },
  })
);

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("Token required.");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "Failed to authenticate." });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};
app.get("/userAuth", verifyJWT, (req, res) => {
  res.send("Authenticated");
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(req);
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email, password],
    (err, result) => {
      // console.log(result)
      // res.send(result)
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            const id = result[0].id;
            //change jwtsecret to .env variable!!!//
            //expiresIN: 600 = 10 minutes//
            const token = jwt.sign({ id }, "jwtSecret", {
              expiresIn: 600,
            });
            // req.session.username = username
            req.session.email = result;
            res.json({
              auth: true,
              token: token,
              result: result,
            });
          } else {
            res.json({
              auth: false,
              message: "Wrong username/password combination!",
            });
          }
        });
      } else {
        res.json({
          auth: false,
          message: "User not found",
        });
      }
    }
  );
});

/// get my investors
/// get array of investor ids
/// map the array with function that returns needed investors data
/// respond back with new mapped array

app.get("/investors/myinvestors", async (req, res) => {
  let tickerString = req.headers.tickers;
  let tickers = tickerString.toString().split(",");
  console.log(tickers);
  if (tickers.length == 0) {
    res.send("No Subscribed Investors");
    console.log("No Subscribed Investors");
  } else {
    let mapArray = await Promise.all(tickers.map(async (i) => myInvestors(i)));
    res.json(mapArray);
  }
});
const myInvestors = async (investor_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `verified_investors` WHERE `idverified_investors` = ?",
      [investor_id],
      (err, result) => {
        return err
          ? reject(err)
          : Promise.resolve().then(async function () {
              const responseArray = await Promise.all(
                result.map(async (i) => {
                  return {
                    ...i,
                    image_url: await addImageURL(i.investor_photo),
                  };
                })
              );
              // console.log(responseArray)
              // res.json(responseArray)
              resolve(responseArray);
            });
      }
    );
  });
};

/// get all investors

app.get("/investors/getall/", async (req, res) => {
  db.query(
    "SELECT * FROM `verified_investors` WHERE activated = 1",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result)
        Promise.resolve().then(async function () {
          const responseArray = await Promise.all(
            result.map(async (i) => {
              return {
                ...i,
                image_url: await addImageURL(i.investor_photo),
                industry_array: await removeSymbols(i.industries),
              };
            })
          );
          // console.log(responseArray)
          res.json(responseArray);
        });
        // let addedURLArray = (result.map( async i => addImageURL(i)))
        // console.log(addedURLArray)
      }
    }
  );
});

function removeSymbols(string) {
  let stringified = string.replace(/[ \ | " ]/g, "");
  return stringified.replace(/[\[\]']+/g, "", "").split(",");
}

/// get investor data
app.get("/investors/:investorid", async (req, res) => {
  let investorID = req.params.investorid;
  let investorInfo = await getInvestorInformation(investorID);
  // console.log('info:',investorInfo)
  res.json([investorInfo]);
  // db.query( 'SELECT * FROM `verified_investors` WHERE `idverified_investors` = ?',
  // [investorID],
  // (err, result) => {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     const getParams = {
  //       Bucket: bucketName,
  //       Key: result.investor_photo,
  //     }
  //     const command = new GetObjectCommand(getParams);
  //     const url = await getSignedUrl(s3, command, {expiresIn: 360})
  //     console.log(url)
  //     res.json(result)

  //   }
  // }
  // )
});
const addImageURL = async (investor_photo) => {
  return new Promise((resolve, reject) => {
    const photoName = `${investor_photo}`;
    Promise.resolve().then(async function () {
      const getParams = {
        Bucket: bucketName,
        Key: photoName,
      };
      const command = new GetObjectCommand(getParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 360 });

      return resolve(url);
    });
  });
};
const getInvestorInformation = async (investorID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `verified_investors` WHERE `idverified_investors` = ?",
      [investorID],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          const photoName = result[0].investor_photo;
          Promise.resolve().then(async function () {
            const getParams = {
              Bucket: bucketName,
              Key: photoName,
            };
            // console.log(getParams)
            const command = new GetObjectCommand(getParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 360 });
            // console.log({...result[0], image_url: url})

            return resolve({ ...result[0], image_url: url });
          });
        }
      }
    );
  });
};

/// get stored historical balance data
app.get("/investorHistory/:investorid", (req, res) => {
  let investorID = req.params.investorid;
  db.query(
    "SELECT * FROM `investor_balance_history` WHERE `investor_id` = ?",
    [investorID],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result)
        res.json(result);
      }
    }
  );
});

const getHistoricalData = async (investorID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM `investor_balance_history` WHERE `investor_id` = ?",
      [investorID],
      (err, result) => {
        return err ? reject(err) : resolve(result);
      }
    );
  });
};

///Get all myStocks
app.get("/mystocks/:userid", (req, res) => {
  let userid = req.params.userid;
  db.query(
    "SELECT stockticker FROM mystocks WHERE users_idusers = ?",
    [userid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.json(result);
      }
    }
  );
});

// get user info, stocks, name, email
const getMystocks = async (userID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT stockticker FROM mystocks WHERE users_idusers = ?",
      [userID],
      (err, result) => {
        return err ? reject(err) : resolve(result);
      }
    );
  });
};
const getUserInfo = async (userID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE idusers = ?",
      [userID],
      (err, result) => {
        return err ? reject(err) : resolve(result);
      }
    );
  });
};
app.get("/userInfo/:userid", async (req, res) => {
  let userid = req.params.userid;
  let tickerArray = await getMystocks(userid);
  let userInfo = await getUserInfo(userid);
  res.json({
    tickers: tickerArray,
    user: userInfo,
  });
});

/// Get all myInvestors
app.get("/myinvestors/:userid", (req, res) => {
  let userid = req.params.userid;
  db.query(
    "SELECT `investor_id` FROM myinvestors WHERE users_idusers = ?",
    [userid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result)
        res.json(result);
      }
    }
  );
});

/// Delete MyStock
app.delete("/mystocks/:userid/:ticker", (req, res) => {
  let userid = req.params.userid;
  let ticker = req.params.ticker;
  // console.log(id);
  db.query(
    "DELETE FROM mystocks WHERE users_idusers = ? AND stockticker = ?",
    [userid, ticker],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});
/// Delete MyInvestor
app.delete("/myinvestors/:userid/:investorid", (req, res) => {
  let userid = req.params.userid;
  let investorid = req.params.investorid;
  // console.log(id);
  db.query(
    "DELETE FROM myinvestors WHERE users_idusers = ? AND `investor_id` = ?",
    [userid, investorid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

/// Add into MyStocks
app.post("/mystocks/:userid/:ticker", (req, res) => {
  let userid = req.params.userid;
  let ticker = req.params.ticker;
  db.query(
    "INSERT INTO `mystocks` (users_idusers, stockticker) VALUES (?, ?)",
    [userid, ticker],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "SELECT stockticker FROM mystocks WHERE users_idusers = ?",
          [userid],
          (err, result) => {
            res.send(result);
            console.log(result);
          }
        );
        // res.send(result);
        // console.log(result);
      }
    }
  );
});

/// Add into myInvestors
app.post("/myInvestors/:userid/:investorid", (req, res) => {
  let userid = req.params.userid;
  let investorid = req.params.investorid;
  db.query(
    "INSERT INTO `myinvestors` (users_idusers, `investor_id`) VALUES (?, ?)",
    [userid, investorid],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "SELECT `investor_id` FROM myinvestors WHERE users_idusers = ?",
          [userid],
          (err, result) => {
            res.send(result);
            console.log(result);
          }
        );
        // res.send(result);
        // console.log(result);
      }
    }
  );
});

// sendNotifications()

// Forgot Password

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const generatePIN = (length = 4) => {
  return Math.floor(
    Math.random() * (9 * Math.pow(10, length - 1)) + Math.pow(10, length - 1)
  ).toString();
};

app.post("/forgotpassword", (req, res) => {
  const email = req.body.email;
  console.log("Email: ", email);
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("EEERRROOORR");
    } else {
      if (result.length > 0) {
        console.log("email found", result);
        res.send("email found");

        const pin = generatePIN();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 20);
        db.query(
          "INSERT INTO PASSWORD_RESET_PINS (email, pin, expires) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE pin = VALUES(pin), expires = VALUES(expires);",
          [email, pin, expiryTime],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              const output = `
            <p style="font-size: 16px; font-weight: normal;">Blume password reset.</p>
            <p>Enter this code in the app to reset your password: <strong>${pin}</strong></p>         
            `;

              let mailOptions = {
                from: "investwithblume@gmail.com", // You can change this to whatever you like. !this is NOT where you add in the email address!
                to: email, // Use your same googele email ("send yourself an email") to test if the app works.
                subject: "Blume Password Reset", // change the subject to whatever you like.
                html: output, // this is the output variable defined earlier that contains our message.
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error); // if anything goes wrong an error will show up in your terminal.
                } else {
                  console.log("Message sent: %s", info.messageId); // if it's a success, a confirmation will show up in your terminal.
                }
              });
              console.log("pin inserted :", result);
            }
          }
        );
        // const token = crypto.randomBytes(20).toString('hex');
        // const today = new Date();
        // const expires = new Date(today);
        // expires.setDate(today.getDate() + 1);
        // db.query('INSERT INTO `password_reset` (email, token, expires) VALUES (?,?,?)',
        // [email, token, expires],
        // (err, result) => {
        //   if (err) {
        //     console.log(err)
        //   } else {
        //     const transporter = nodemailer.createTransport({
        //       service: 'gmail',
        //       auth: {
        //         user: 'liamwellingg36@gmail.com',
        //         pass: 'Liamwellingg36!'
        //       }
        //     });
        //     const mailOptions = {
        //       from: 'liamwellingg36@gmail.com',
        //       to: email,
        //       subject: 'Link to Reset Password',
        //       text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        //       Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
        //       http://localhost:3000/reset/${token}\n\n
        //       If you did not request this, please ignore this email and your password will remain unchanged.\n`
        //     };
        //     console.log('sending mail');
        //     transporter.sendMail(mailOptions, (err, response) => {
        //       if (err) {
        //         console.error('there was an error: ', err);
        //       } else {
        //         console.log('here is the res: ', response);
        //         res.status(200).json('recovery email sent');
        //       }
        //     });
        //   }
        // }
        // )
      } else {
        console.log("email not found");
        res.status(404).json({
          error: {
            code: "EMAIL_NOT_FOUND",
            message: "The provided email was not found in our database.",
          },
        });
      }
    }
  });
});

app.post("/validatepin", (req, res) => {
  const email = req.body.email;
  const pin = req.body.pin;
  console.log("Email: ", email, pin);
  // first check if pin and email combo exist in the table
  db.query(
    "SELECT * FROM PASSWORD_RESET_PINS WHERE email = ? AND pin = ?",
    [email, pin],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("ERROR");
      } else {
        // if the pin exists, check if the pin has expired
        // if the pin has expired, return a message that prompts the message "pin expired"
        //
        if (!result || result.length === 0) {
          return res.send("INVALID");
        }
        const pinID = result[0].idPASSWORD_RESET_PINS;
        const storedPin = result[0].pin;
        const expiryTimestamp = new Date(result[0].expires);
        if (expiryTimestamp < new Date()) {
          db.query(
            "DELETE FROM PASSWORD_RESET_PINS WHERE idPASSWORD_RESET_PINS = ?",
            [pinID],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                console.log("pin deleted :", result);
              }
            }
          );
          return res.send("EXPIRED");
        }
        if (storedPin === pin) {
          return res.send("VALID");
        } else {
          return res.send("INVALID");
        }
        // if (result.length > 0) {
        //   console.log('pin found', result)
        //   res.send('VALID')
        // } else {
        // if pin does not exist, return a message that prompts the message "pin not found"
        // console.log('pin not found')
        // res.send('INVALID')
        //   res.status(404).json({
        //     error: {
        //         code: "PIN_NOT_FOUND",
        //         message: "The provided pin was not found in our database."
        //     }
        // });;
        //   }
      }
    }
  );
});

app.post("/resetpassword", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("New pass: ", password);
  bcrypt.hash(password, saltRounds, (err, hash) => {
    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hash, email],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(result)
          res.send("Success");
        }
      }
    );
  });
});

// delete user

app.post("/deleteuser", (req, res) => {
  const userid = req.body.userID;
  console.log(userid);
  db.query("DELETE FROM users WHERE idusers = ?", [userid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send("Success");
    }
  });
});

/// ADMIN PAGE

app.get("/getallinvestors", (req, res) => {
  db.query("SELECT * FROM `verified_investors`", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(result)
      res.json(result);
    }
  });
});
// password reset email

// transporter.sendMail(mailOptions, (error, info) => {

//   if (error) {
//     console.log(error);   // if anything goes wrong an error will show up in your terminal.
//   } else {
//       console.log("Message sent: %s", info.messageId);    // if it's a success, a confirmation will show up in your terminal.
//     }
// });
const getHoldings = async (investorID) => {
  console.log(investorID);
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT `access_token` FROM `verified_investors` WHERE `idverified_investors` = ?",
      [investorID],
      (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          let securities = [];
          let holdings = [];
          let mergedArray = [];
          let atomArray = [];
          let token = result[0].access_token;

          Promise.resolve()
            .then(async function () {
              const holdingsResponse = await client.investmentsHoldingsGet({
                access_token: token,
              });
              holdings = holdingsResponse.data.holdings.filter(
                (i) => i.security_id != "7dD8KV8owvUgA3rkNbmLtLPy8Kyr9dFQmvKD4"
              );
              securities = holdingsResponse.data.securities.filter(
                (i) => i.security_id != "7dD8KV8owvUgA3rkNbmLtLPy8Kyr9dFQmvKD4"
              );
              mergedArray = mergeById(holdings, securities);
              console.log(holdingsResponse.data);
              let responseArray = await Promise.all(
                mergedArray.map(async (i) => {
                  return {
                    ...i,
                    industry: await industryFunction(i.type, i.ticker_symbol),
                  };
                })
              );

              resolve({
                error: null,
                holdings: responseArray,
                balance: holdingsResponse.data,
              });
            })
            .catch(reject);
        }
      }
    );
  });
};

// getHoldings(50);

// timedBalances();
// investorROIChart();
// executeJob();
// investorIndustryArray()
