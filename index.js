const TelegramBot = require("node-telegram-bot-api");
const {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} = require("firebase/firestore");
const { app } = require("./firebase.js");
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const expressApp = express();
const port = process.env.PORT || "";

const url =
  Number(process.env.PRODUCTION) == 0
    ? "https://light-tetra-upright.ngrok-free.app" // ngrok forward url
    : "https://tgwebhookairdropbot.vercel.app";

const token = process.env.TELEGRAM_BOT_TOKEN;

const options = {
  webHook: {
    port: 443,
  },
};

const rthw = `/bot${token}`;

const bot = new TelegramBot(token, options);

expressApp.use(bodyParser.json());

expressApp.post(rthw, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

expressApp.listen(port, () => {
  bot.setWebHook(`${url}/bot${token}`);
  console.log("server on!");
});

const db = getFirestore(app);
const userCollection = collection(db, "user");
const publicChatId = "-4006439389";

const getReferrals = () => {
  const header = "<b>Affliate stats</b>\n";
  let referralInfo = "";
  let referralData = [];
  bot.onText(/\/ref/, async (msg) => {
    if (msg.chat.type == "private") return;
    const chatId = msg.chat.id;
    referralInfo += header;
    try {
      const collectionDocs = await getDocs(userCollection);
      collectionDocs.docs.forEach((collectioDoc) => {
        const { username, referrals } = collectioDoc.data();
        referralData.push({ username, referrals: referrals.length });
      });
      referralData
        .sort((a, b) => b.referrals - a.referrals)
        .forEach((data) => {
          referralInfo += `@${data.username} has a total of <b>#${data.referrals}</b> referrals\n`;
        });
      console.log(referralInfo);
      bot.sendMessage(publicChatId, referralInfo, { parse_mode: "HTML" });
      referralInfo = "";
      referralData = [];
    } catch (err) {
      console.log(err);
    }
  });
};

const getUserId = () => {
  bot.on("message", async (msg) => {
    if (msg.chat.type !== "private") return;
    const chatId = msg.chat.id;

    try {
      const memberStatus = (await bot.getChatMember(publicChatId, chatId))
        .status;
      if (memberStatus == "left")
        return bot.sendMessage(
          chatId,
          "Please join the community to be able to get your airdropPasscode"
        );
      // await bot.sendMessage(chatId, "Please wait, getting airdropPasscode....");
      let userSnapShot = await queryDB(chatId);
      // add the member to db if not in db
      if (userSnapShot.empty) {
        const newMember = {
          id: chatId,
          username: msg.chat.username,
          first_name: msg.chat.first_name,
        };
        await addMemberToDB(newMember);
        // query the member data again
        userSnapShot = await queryDB(chatId);
      }
      const userDocs = userSnapShot.docs[0].data();
      const userAirdropPasscode = userDocs.airdropPasscode;
      const text = `Hi @${msg.chat.username}\nYour airdrop passCode: ${userAirdropPasscode}
    `;
      await bot.sendMessage(chatId, text);
    } catch (err) {
      console.log(err);
    }
  });
};

const addMemberToDB = async (newMember) => {
  const referralId = getRandomId();
  const airdropPasscode = generateRandomNumbers();
  const newMemberData = {
    name: newMember.first_name,
    referralId,
    airdropPasscode,
    referrals: [],
    userId: Number(newMember.id),
    username: newMember.username,
  };

  // check if user already exists before adding
  try {
    const userSnapShot = await queryDB(newMemberData.userId);
    if (!userSnapShot.empty) return console.log("User already exists");
    const adduser = await addDoc(userCollection, newMemberData).catch((err) =>
      console.log("Error from addNewChatMembersToDB function", err)
    );

    console.log("New member added successfully");
  } catch (err) {
    console.log(err);
  }
};

const addNewChatMembersToDB = async () => {
  bot.on("new_chat_members", async (e) => {
    const newChatMember = e.new_chat_member;
    await addMemberToDB(newChatMember);
  });
};

const queryDB = async (userId) => {
  try {
    const queryUser = query(userCollection, where("userId", "==", userId));
    const userSnapShot = await getDocs(queryUser);
    return userSnapShot;
  } catch (err) {
    console.log(err);
  }
};

const getRandomId = () => {
  return crypto.randomUUID();
};

const generateRandomNumbers = () => {
  return Math.ceil(Math.random() * 10 ** 7);
};

// to keep bot running
const makeFetchRequest = () => {
  setInterval(() => {
    try {
      fetch(url).then((res) => {
        console.log(res, "fetched");
      });
    } catch (err) {
      console.log(err);
    }
  }, 30 * 1000);
};

getReferrals();
getUserId();
addNewChatMembersToDB();
makeFetchRequest();

module.exports = expressApp;
