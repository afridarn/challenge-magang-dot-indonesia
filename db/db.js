const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  connectionLimit: "10", // the number of connections node.js will hold open to our database
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

let db = {};

db.getUserByPhone = (phone) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE user_phone = ?', [phone], (error, users) => {
      if (error) {
        return reject(error);
      }
      return resolve(users[0]);
    });
  });
};

db.insertUser = (phone, password) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO users (user_phone, user_password) VALUES (?, ?)', [phone, password], (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result.insertId);
    });
  });
};

db.getContact = (phone) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT contact_phone, contact_name FROM contacts WHERE user_phone = ?', [phone], (error, contacts) => {
      if (error) {
        return reject(error);
      }
      return resolve(contacts);
    });
  });
};

db.getContactByName = (name, phone) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT contact_phone, contact_name FROM contacts WHERE user_phone = ? AND contact_name = ?', [phone, name], (error, contacts) => {
      if (error) {
        return reject(error);
      }
      console.log(contacts);
      return resolve(contacts);
    });
  });
};

db.checkContact = (phone, number) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM contacts WHERE user_phone = ? AND contact_phone = ?', [phone, number], (error, contacts) => {
      if (error) {
        return reject(error);
      }
      return resolve(contacts[0]);
    });
  });
};

db.insertContact = (phone, number, name) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO contacts (user_phone, contact_phone, contact_name) VALUES (?, ?, ?)', [phone, number, name], (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result.insertId);
    });
  });
};

db.deleteContact = (phone, number) => {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM contacts WHERE user_phone = ? AND contact_phone = ?', [phone, number], (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

db.updateContact = (phone, number, nname, nnumber) => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE contacts SET contact_phone = ?, contact_name = ? WHERE user_phone = ? AND contact_phone = ?', [nnumber, nname, phone, number], (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};


module.exports = db;