const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const fs = require("fs");
const caCert = fs.readFileSync("ca.pem", "utf8");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


const connection = mysql.createConnection({
  host: "mysql-71523b1-fares21elhamel-0ad8.j.aivencloud.com",
  database: "easierjustice",
  port: 16043,
  user: "avnadmin",
  password: "AVNS_IQz6gJc978gUO1YmrEo",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem").toString()
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


//finished
app.post("/send", async (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const content = req.body.content;
  const sent_at = req.body.sent_at;
    
  const getChatId =
    "SELECT id FROM easierjustice.chats WHERE ( sender_id = " +
    senderId +
    " AND recieved_id = " +
    receiverId +
    " ) OR ( sender_id = " +
    receiverId +
    " AND recieved_id = " +
    senderId +
    ");";
  try {
    connection.query(getChatId, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length === 0) {
        const result = connection.query(
          "INSERT INTO `easierjustice`.`chats` (`recieved_id`, `sender_id`) VALUES (" +
            senderId +
            ", " +
            receiverId +
            ");"
        );
      }

      if (rows.length > 0) {
        const chatId = rows[0].id;
        const result = connection.query(
          " INSERT INTO `easierjustice`.`message` (`sender_id`,`receiver_id`, `content`, `sent_at`, `chatId`) VALUES  ('" +
            senderId +
            "','" +
            receiverId +
            "','" +
            content +
            "','" +
            sent_at +
            "','" +
            chatId +
            "')"
        );
        res.status(200).send({ message: "Message sent successfully!" });
      }
    });
  } catch (error) {
    // console.error('Error sending message:', error);
    res.status(500).send({ message: "Error sending message" });
  }
});

//finished this router
app.get("/getLowData", (req, res) => {
    console.log("Hello Fares it's work fine");
    const title = req.query.title;
  const queryData =
    "SELECT * FROM  easierjustice.law WHERE title = '" + title + "';";

  try {
    connection.query(queryData, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length !== 1) {
        res.status(401).send("Invalid username or password");
      }
      // console.log(rows[0]);
      res.send(rows[0]);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.get("/chats", async (req, res) => {
  const userId = req.query.userId;
  // console.log(userId);
  const queryChatId =
    "SELECT m.content AS last_message ,m.sent_at, u.name AS sender,u.lastname,u.id FROM chats c LEFT JOIN (SELECT chatId, MAX(sent_at) AS max_sent_at  FROM message GROUP BY chatId ) AS last_message ON c.id = last_message.chatId LEFT JOIN message m ON c.id = m.chatId AND m.sent_at = last_message.max_sent_at LEFT JOIN users u ON c.sender_id = u.id OR c.sender_id = u.id  WHERE (c.sender_id = " +
    userId +
    " OR c.recieved_id =" +
    userId +
    ") ORDER BY c.id ASC LIMIT 0, 50000";
  try {
    connection.query(queryChatId, (err, result, fields) => {
      if (err) throw err;
      if (result.length === 0) {
        console.log(result);
        res.send({ result: 0 });
      } else {
        res.send(result);
      }
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
//finished
app.get("/messages", (req, res) => {
  const senderId = req.query.senderId;
  const recievedId = req.query.recievedId;

  // console.log(senderId, recievedId);
  const query =
    "SELECT * FROM easierjustice.message WHERE ( sender_id = " +
    senderId +
    " AND receiver_id = " +
    recievedId +
    " ) OR (sender_id = " +
    recievedId +
    " AND receiver_id = " +
    senderId +
    ") ORDER BY sent_at ASC;";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        // console.log('makayen walo');
        res.status(200);
      }
      // console.log(rows);
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.get("/lawyers", (req, res) => {
//   const query = 'SELECT * FROM easierjustice.users WHERE type = "محامي";';
    const query = "SELECT * FROM easierjustice.users WHERE type ='محامي';";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(200).send({ message: "no data" });
      }
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
app.get("/judiciel", (req, res) => {
  const query = "SELECT * FROM easierjustice.users WHERE type = 'محضر قضائي'";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(200);
      }
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
app.get("/notary", (req, res) => {
  const query = "SELECT * FROM easierjustice.users WHERE type ='موثق'";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(200);
      }
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
app.get("/clerk", (req, res) => {
  const query = "SELECT * FROM easierjustice.users WHERE type ='كاتب عمومي'";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(200);
      }
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.get("/search", (req, res, next) => {
  const fullnamesearch = req.query.fullnamesearch;
  const nameParts = fullnamesearch.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  if (nameParts.length > 2) {
    var query =
      "SELECT * FROM users WHERE (CONCAT_WS(' ', name,lastname)LIKE '%" +
      fullnamesearch +
      "%') OR (CONCAT_WS(' ',lastname,name)LIKE '%" +
      fullnamesearch +
      "%') ;";
  } else {
    var query =
      "SELECT * FROM users WHERE (name LIKE '" +
      firstName +
      "' OR lastname LIKE '" +
      lastName +
      "') OR (lastname LIKE '" +
      firstName +
      "' OR name LIKE '" +
      lastName +
      "') OR (name LIKE '" +
      fullnamesearch +
      "' OR lastname LIKE '" +
      fullnamesearch +
      "')";
  }

  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 0) {
        res.status(200).send({ resul: "no data" });
        return;
      }
      res.send(rows);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.post("/signIn", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(email, password);

  const query =
    "SELECT * FROM easierjustice.users WHERE email = '" +
    email +
    "' && password = '" +
    password +
    "';";
  try {
    connection.query(query, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length !== 1) {
        // console.log(rows);
        res.send("not user name");
      }
      // console.log(rows[0]);
      res.send(rows[0]);
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.post("/verification", async (req, res) => {
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;

  const verificationQuery =
    "SELECT * FROM easierjustice.users WHERE email = '" +
    email +
    "' OR phone = '" +
    phoneNumber +
    "';";

  try {
    connection.query(verificationQuery, (err, rows, fields) => {
      if (err) throw err;
      if (rows.length == 1) {
        res.status(200).send({ result: 1 });
        return;
      }
      res.status(200).send({ result: 0 });
      return;
    });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.post("/signup", async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  const password = req.body.password;

  const insertionQuery =
    "INSERT INTO easierjustice.users (name, lastname, email, phone, password) VALUES ( '" +
    firstname +
    "', '" +
    lastname +
    "', '" +
    email +
    "', '" +
    phoneNumber +
    "', '" +
    password +
    "');";

  const newUser =
    "SELECT * FROM easierjustice.users WHERE email ='" +
    email +
    "' OR phone ='" +
    phoneNumber +
    "';";
   
    try {
    const result =  connection.query(insertionQuery);
    // const res = await connection.query(newUser);

    connection.query(newUser, (err, rows, fields) => {
      if (err) throw err;
        if (rows.length == 1) {
            console.log(rows)
        res.send(rows[0]);
        return;
      }
    });
  } catch (error) {
    // console.error('Error inserting data:', error);
    res.status(500).json({ message: "Error: Data insertion failed!" });
  }
});
app.put("/update", async (req, res) => {
   const id = req.body.userId;
   const password = req.body.userPassword;
   const phoneNumber = req.body.userPhone;
   const query = "UPDATE `easierjustice`.`users` SET `phone` = '" + phoneNumber + "', `password` = '" + password + "' WHERE (`id` = '" + id + "');";
   try {
        connection.query(query, (err, rows, fields) => {
          if (err) throw err;
          // console.log(rows);
          if (rows.affectedRows === 1) {
            console.log(rows.affectedRows);
            res.status(200).send('okay');
          } else {
            res.status(400).send('No record found with the provided ID');
          }
        });
     console.log(result);
   } catch (error) {
     
   }
});

app.listen(3000, () => {
  console.log("server of login and sign up in port 4000");
});
