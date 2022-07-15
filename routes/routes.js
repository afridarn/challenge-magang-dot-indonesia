const routes = require('express').Router();
const db = require('../db/db');
const jsonwebtoken = require('jsonwebtoken');
const jwtkey = process.env.JWTTOKEN
const {
  hashSync,
  genSaltSync,
  compareSync
} = require("bcrypt");

routes.get('/', (req, res) => {
  try {
    const phone = req.body.phone;
    return res.json({
      message: `Hi there!`
    });
  } catch (e) {
    console.log(e);
  };
});

routes.post('/register', async (req, res) => {
  try {
    const user_phone = req.body.phone;
    let user_password = req.body.password;

    checkPhone = await db.getUserByPhone(user_phone);

    if (!user_phone || !user_password) {
      return res.status(400).json({
        status: "Fail",
        message: "Please fill in all the data first"
      });
    }

    if (checkPhone) {
      return res.status(400).json({
        status: "Fail",
        message: "Phone number already used"
      })
    }

    const salt = genSaltSync(10);
    user_password = hashSync(user_password, salt);

    await db.insertUser(user_phone, user_password);

    res.status(201).json({
      status: "Success",
      message: "User created"
    });

  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }

});

routes.post('/login', async (req, res) => {
  try {
    const user_phone = req.body.phone;
    const user_password = req.body.password;
    user = await db.getUserByPhone(user_phone);

    if (!user) {
      return res.status(401).json({
        status: "Fail",
        message: "Invalid phone number or password"
      })
    }

    const isValidPassword = compareSync(user_password, user.user_password);
    if (isValidPassword) {
      user.password = undefined;
      const jsontoken = jsonwebtoken.sign({
        user: user
      }, jwtkey, {
        expiresIn: '59m'
      });

      res.status(200).json({
        status: "Success",
        token: jsontoken
      });

    } else {
      return res.status(401).json({
        status: "Fail",
        message: "Invalid phone number or password"
      });
    }

  } catch (e) {
    console.log(e);
  }
});

routes.get('/contacts', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "Access Denied! Unauthorized User"
      });
    }

    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString()
    var response = JSON.parse(decoded)

    const user_phone = response.user.user_phone;

    const contact = await db.getContact(user_phone);

    if (!contact) {
      return res.status(404).json({
        status: "Fail",
        message: "No contacts found"
      });
    } else {
      return res.status(200).json({
        status: "Success",
        contacts: contact
      });
    }

  } catch (e) {
    console.log(e);
  }
});

routes.get('/contacts/:name', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "Access Denied! Unauthorized User"
      });
    }

    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString()
    var response = JSON.parse(decoded)

    const user_phone = response.user.user_phone;
    const contact_name = req.params.name;

    if (!contact_name) {
      return res.status(400).json({
        status: "Fail",
        message: "Input the number please"
      });
    }

    const contact = await db.getContactByName(contact_name, user_phone);

    if (!contact) {
      return res.status(404).json({
        status: "Fail",
        message: "No contacts found"
      });
    } else {
      return res.status(200).json({
        status: "Success",
        contacts: contact
      });
    }

  } catch (e) {
    console.log(e);
  }
});

routes.post('/contacts', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "Access Denied! Unauthorized User"
      });
    }

    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString()
    var response = JSON.parse(decoded)

    const user_phone = response.user.user_phone;
    const contact_phone = req.body.phone_number;
    const contact_name = req.body.contact_name;

    if (!contact_name || !contact_phone) {
      return res.status(400).json({
        status: "Fail",
        message: "Please fill in all the data first"
      });
    }

    const checkContact = await db.checkContact(user_phone, contact_phone);

    if (checkContact) {
      return res.status(400).json({
        status: "Fail",
        message: "Phone number already saved before"
      });
    } else {
      await db.insertContact(user_phone, contact_phone, contact_name);
      return res.status(201).json({
        status: "Success",
        message: "Contact successfully saved"
      });
    }
  } catch (e) {
    console.log(e);
  }
});

routes.delete('/contacts/:number', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "Access Denied! Unauthorized User"
      });
    }

    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString()
    var response = JSON.parse(decoded)

    const user_phone = response.user.user_phone;
    const contact_phone = req.params.number;

    if (!contact_phone) {
      return res.status(400).json({
        status: "400",
        message: "Please fill in the phone number to be deleted"
      });
    }

    const checkContact = await db.checkContact(user_phone, contact_phone);

    if (!checkContact) {
      return res.status(404).json({
        status: "Fail",
        message: "Phone number not found"
      });
    } else {
      await db.deleteContact(user_phone, contact_phone);
      return res.status(200).json({
        status: "Success",
        message: "Contact successfully deleted"
      });
    }

  } catch (e) {
    console.log(e);
  }
});

routes.put('/contacts/:number', async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: "Fail",
        message: "Access Denied! Unauthorized User"
      });
    }

    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString()
    var response = JSON.parse(decoded)

    const user_phone = response.user.user_phone;
    const contact_phone = req.params.number;

    if (!contact_phone) {
      return res.status(400).json({
        status: "400",
        message: "Please fill in the phone number to be updated"
      });
    }

    const checkContact = await db.checkContact(user_phone, contact_phone);
    const new_name = req.body.new_name;
    const new_number = req.body.new_number;

    if (!checkContact) {
      return res.status(404).json({
        status: "Fail",
        message: "Phone number not found"
      });
    } else {
      await db.updateContact(user_phone, contact_phone, new_name, new_number);
      return res.status(201).json({
        status: "Success",
        message: "Contact successfully updated"
      });
    }

  } catch (e) {
    console.log(e);
  }
});

module.exports = routes;