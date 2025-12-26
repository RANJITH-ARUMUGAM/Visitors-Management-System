const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require("pg");
const { log } = require('console');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require("dotenv").config();
const multer = require('multer');
const moment = require('moment');
const CryptoJS = require("crypto-js");
const AES_SECRET_KEY = "password";
const twilio = require("twilio");

const QRCode = require('qrcode');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists and is public/static
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET", "DELETE", "PUT", "SORT"],
  credentials: true
}));

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "5441",
  database: process.env.DB_NAME || "VGMS",
  port: process.env.DB_PORT || 5432
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter connection failed:', err);
  } else {
    console.log('✅ Email transporter is ready to send!');
  }
});
////-------------------------------------Login Page Begins Here------------------------------------------------------////


app.post('/user_login', async (req, res) => {
  const { username, password } = req.body;
  console.log("/login " + username, password);

  db.query("SELECT * FROM ADM_User_T WHERE ADM_Users_loginid=$1", [username], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).send({ success: false, error: "Database error" });
    } else {
      if (results.rowCount > 0) {
        const user = results.rows[0];
        if (!user.adm_users_status) {
          return res.json({
            success: false,
            message: "Your account is not active. Please contact the administrator.",
            status: "inactive"
          });
        }

        let decryptedPassword;
        try {
          const bytes = CryptoJS.AES.decrypt(user.adm_users_password, AES_SECRET_KEY);
          decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
          console.error("Password decryption error:", err);
          return res.status(500).json({ success: false, message: "Error processing password" });
        }

        if (password === decryptedPassword) {
          db.query(`SELECT "Roles_RoleName", "Roles_Application"
                    FROM public.userrole_vw_new 
                    WHERE "Users_LoginID" = $1 AND "UserRole_Status" = true`,
            [username],
            (err2, roleResults) => {
              if (err2) {
                console.error("Role fetch error:", err2);
                return res.status(500).send({ success: false, error: "Role fetch error" });
              }

              let userRole = null;
              let userApp = null;
              if (roleResults.rowCount > 0) {
                userRole = roleResults.rows[0].Roles_RoleName;
                userApp = roleResults.rows[0].Roles_Application;
              }

              let avatar = null;
              if (user.adm_users_profileimage) {
                if (user.adm_users_profileimage.type === 'Buffer') {
                  const base64Image = Buffer.from(user.adm_users_profileimage.data).toString('base64');
                  avatar = `data:image/png;base64,${base64Image}`;
                } else if (typeof user.adm_users_profileimage === 'string') {
                  avatar = user.adm_users_profileimage;
                }
              }

              res.json({
                success: true,
                message: "Login Successful",
                id: user.adm_users_id,
                loginid: user.adm_users_loginid,
                UserRole: userRole,
                Application: userApp,
                name: `${user.adm_users_firstname} ${user.adm_users_lastname}`,
                avatar: avatar,
              });
              console.log("Success - Logged In:", username, "Role:", userRole);
            }
          );
        } else {
          res.json({ success: false, message: "Invalid Login Credential" });
          console.log("Failed - Incorrect Password");
        }
      } else {
        res.json({ success: false, message: "Invalid Login Credential" });
        console.log("Failed - No User");
      }
    }
  });
});




////-------------------------------------Login Page Ends Here------------------------------------------------------////


////-------------------------------------SignUp Page Begins Here------------------------------------------------------////

app.post("/user_signup", async (req, res) => {
  const { username, firstname, lastname, email, mobile, created_by } = req.body;
  console.log("/user_signup" + username, firstname, lastname, email, mobile);
  db.query("INSERT INTO ADM_User_T (ADM_Users_LoginID,ADM_Users_FirstName ,ADM_Users_LastName,ADM_Users_email, ADM_Users_Mobile,created_on, created_by) VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,$6)",
    [username, firstname, lastname, email, mobile, created_by], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ success: false, error: "Database error" });
      }
      else {
        res.json({ success: true, message: "User added successfully." });
        console.log("Data Stored...");
      }
    });
});

app.post('/user_checkemail', async (req, res) => {
  const { email } = req.body;
  console.log("/user_checkemail'" + email);
  db.query('SELECT * FROM ADM_User_T WHERE ADM_Users_email = $1', [email],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
      else {
        if (results.rows.length > 0) {
          res.status(200).send({ exists: true, message: "User Already Exist" });
        } else {
          res.status(200).send({ exists: false });
        }
      }
    }
  );
});
////-------------------------------------Signup Page Ends Here------------------------------------------------------////

////-------------------------------------Admin Page UserList Begins Here------------------------------------------------------////
// 🔹 Fetch All Users
app.get("/userlist_getalldata", (req, res) => {
  console.log("/userlist_getalldata");
  db.query("SELECT * FROM adm_user_t", (err, result) => {
    if (err) {
      console.error("error:", err);
      res.status(500).json({ success: false, error: "error" });
    }
    else
      res.status(200).json({ success: true, data: result.rows });
  }
  );
});

// 🔹 Fetch a Single User by ID (Fixed)
app.get("/userlist_getalldatabyid/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("/userlist_getalldatabyid:" + userId);
  db.query("SELECT * FROM adm_user_t WHERE adm_users_id = $1", [userId],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else {
        if (result.rows.length > 0) {
          //console.log(result.rows[0]);
          res.status(200).json(result.rows[0]);
        } else {
          res.status(404).json({ success: false, error: "User not found" });
          console.log("not found")
        }
      }
    });
});

// Delete a user by ID
app.delete('/userlist_deleteuser/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log("/userlist_deleteuser:" + userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const query = `DELETE FROM adm_user_t WHERE adm_users_id = $1`;
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error executing delete query:', error);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    // Check if any row was deleted
    if (results.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  });
});

//! Edit profile by the user
app.get('/edit_profile/:loginid', async (req, res) => {
  const loginid = req.params.loginid;
  db.query("SELECT * FROM adm_user_t WHERE LOWER(adm_users_loginid) = LOWER($1)", [loginid], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const user = result.rows[0];
    // Convert buffer to base64 string
    if (user.adm_users_profileimage && user.adm_users_profileimage.type === 'Buffer') {
      // Convert the Buffer object to a Base64 string
      const base64Image = Buffer.from(user.adm_users_profileimage.data).toString('base64');
      // Prepend the data URI scheme
      user.adm_users_profileimage = `data:image/png;base64,${base64Image}`;
    }
    return res.json(user);
  });
});


app.put('/edit_profile/:mail', async (req, res) => {
  const mail = req.params.mail;
  const updatedData = req.body;
  console.log("/edit_profile for:", mail);
  let query = `
    UPDATE ADM_User_T SET
      ADM_Users_Address1 = $1,
      ADM_Users_Address2 = $2,
      ADM_Users_Address3 = $3,
      ADM_Users_DOB = $4,
      ADM_Users_Gender = $5,
      modified_on = CURRENT_DATE,
      modified_by = 'User'
  `;
  const params = [
    updatedData.adm_users_address1 || null,
    updatedData.adm_users_address2 || null,
    updatedData.adm_users_address3 || null,
    updatedData.adm_users_dob || null,
    updatedData.adm_users_gender || null,
  ];
  if (updatedData.adm_users_profileimage) {
    try {
      let imageBuffer;
      if (typeof updatedData.adm_users_profileimage === "string") {
        // case: base64 string from frontend
        const base64Data = updatedData.adm_users_profileimage.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (updatedData.adm_users_profileimage.type === "Buffer" || updatedData.adm_users_profileimage.data) {
        // case: JSON with Buffer-like { type: 'Buffer', data: [...] }
        imageBuffer = Buffer.from(updatedData.adm_users_profileimage.data);
      } else if (Buffer.isBuffer(updatedData.adm_users_profileimage)) {
        // case: already a Buffer
        imageBuffer = updatedData.adm_users_profileimage;
      } else {
        return res.status(400).json({ success: false, error: "Unsupported image format" });
      }
      if (!imageBuffer || imageBuffer.length === 0) {
        return res.status(400).json({ success: false, error: "Invalid image data" });
      }
      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: "Image too large. Maximum 5MB allowed." });
      }
      query += `, ADM_Users_ProfileImage = $6::bytea`;
      params.push(imageBuffer);
    } catch (err) {
      console.error("Image conversion error:", err);
      return res.status(400).json({ success: false, error: "Invalid image data" });
    }
  }
  query += ` WHERE LOWER(ADM_Users_LoginID) = LOWER($${params.length + 1})`;
  params.push(mail);
  console.log("Executing query:", query);
  console.log("With params:", params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send({ success: false, error: "Database error" });
    }
    if (results.rowCount > 0) {
      console.log("✅ Profile updated successfully");
      return res.json({ success: true, message: "Profile updated successfully" });
    } else {
      console.log("❌ Profile update failed: User not found");
      return res.json({ success: false, message: "User not found" });
    }
  });
});


// app.post('/validate_password', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const query = 'SELECT adm_users_password FROM adm_user_t WHERE adm_users_loginid = $1';
//     const result = await db.query(query, [email]);
//     if (result.rowCount === 0) {
//       return res.status(404).json({ isValid: false, message: 'User not found' });
//     }
//     const storedHashedPassword = result.rows[0].adm_users_password;
//     const isMatch = await bcrypt.compare(password, storedHashedPassword);
//     if (isMatch) {
//       return res.status(200).json({ isValid: true });
//     } else {
//       return res.status(401).json({ isValid: false, message: 'Invalid password' });
//     }
//   } catch (err) {
//     console.error('Validation error:', err);
//     return res.status(500).json({ isValid: false, message: 'Server error' });
//   }
// });

app.post('/validate_password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT adm_users_password FROM adm_user_t WHERE adm_users_loginid = $1';
    const result = await db.query(query, [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ isValid: false, message: 'User not found' });
    }

    const storedEncrypted = result.rows[0].adm_users_password;
    const bytes = CryptoJS.AES.decrypt(storedEncrypted, AES_SECRET_KEY);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (password === decryptedPassword) {
      return res.status(200).json({ isValid: true });
    } else {
      return res.status(401).json({ isValid: false, message: 'Invalid password' });
    }
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ isValid: false, message: 'Server error' });
  }
});

// app.put('/change_password/:mail', (req, res) => {
//   const mail = req.params.mail;
//   const { newPassword } = req.body;
//   bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
//     if (err) {
//       console.error("Hash error:", err);
//       return res.status(500).json({ success: false, error: 'Error hashing password' });
//     }
//     const query = `
//       UPDATE adm_user_t
//       SET adm_users_password = $1, modified_on = CURRENT_DATE, modified_by = 'System'
//       WHERE adm_users_loginid = $2
//     `;
//     db.query(query, [hashedPassword, mail], (err, result) => {
//       if (err) {
//         console.error("DB error:", err);
//         return res.status(500).json({ success: false, error: 'Database error' });
//       }
//       if (result.rowCount > 0) {
//         return res.status(200).json({ success: true, message: 'Password changed' });
//       } else {
//         return res.status(404).json({ success: false, error: "User not found" });
//       }
//     });
//   });
// });

app.put('/change_password/:mail', (req, res) => {
  const mail = req.params.mail;
  const { newPassword } = req.body;

  try {
    const encryptedPassword = CryptoJS.AES.encrypt(newPassword, AES_SECRET_KEY).toString();

    const query = `
      UPDATE adm_user_t
      SET adm_users_password = $1, modified_on = CURRENT_DATE, modified_by = 'System'
      WHERE adm_users_loginid = $2
    `;
    db.query(query, [encryptedPassword, mail], (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      if (result.rowCount > 0) {
        return res.status(200).json({ success: true, message: 'Password changed' });
      } else {
        return res.status(404).json({ success: false, error: "User not found" });
      }
    });
  } catch (err) {
    console.error("Encryption error:", err);
    res.status(500).json({ success: false, error: "Error encrypting password" });
  }
});

////-------------------------------------Admin Page UserList Ends Here------------------------------------------------------////

////-------------------------------------User Page EditUser Begins Here------------------------------------------------------////

// app.post("/userlist_adduser", (req, res) => {
//   const {
//     adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
//     adm_users_address1, adm_users_address2, adm_users_address3, adm_users_dob, adm_users_gender,
//     adm_users_phoneextn, adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_islocked,
//     adm_users_status, created_by, adm_users_defaultroleid
//   } = req.body;
//   console.log("/userlist_adduser");
//   // Check for required fields
//   if (!adm_users_loginid || !adm_users_password || !adm_users_email || !adm_users_firstname) {
//     res.status(400).json({ error: "Required fields are missing." });
//     return;
//   }
//   // Hash the password before saving
//   bcrypt.hash(adm_users_password, 10, (err, hash) => {
//     if (err) {
//       console.error("Password hashing error:", err);
//       return res.status(500).json({ error: "Error processing password." });
//     }
//     const query = `
//       INSERT INTO adm_user_t (
//         adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
//         adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
//         adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn, adm_users_islocked,
//         adm_users_status, created_on, created_by, adm_users_defaultroleid
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_DATE, $19, $20
//       )
//     `;
//     const values = [
//       adm_users_loginid, hash, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
//       adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
//       adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn,
//       adm_users_islocked === true,
//       adm_users_status === true,
//       created_by,
//       adm_users_defaultroleid
//     ];
//     db.query(query, values, (err) => {
//       if (err) {
//         console.error("Database Error:", err);
//         res.status(500).json({ error: "Error adding user." });
//       } else {
//         res.status(200).json({ message: "User added successfully." });
//       }
//     });
//   });
// });

app.post("/userlist_adduser", (req, res) => {
  const {
    adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
    adm_users_address1, adm_users_address2, adm_users_address3, adm_users_dob, adm_users_gender,
    adm_users_phoneextn, adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_islocked,
    adm_users_status, created_by, adm_users_defaultroleid
  } = req.body;
  console.log("/userlist_adduser");

  if (!adm_users_loginid || !adm_users_password || !adm_users_email || !adm_users_firstname) {
    res.status(400).json({ error: "Required fields are missing." });
    return;
  }

  try {
    const encryptedPassword = CryptoJS.AES.encrypt(adm_users_password, AES_SECRET_KEY).toString();

    const query = `
      INSERT INTO adm_user_t (
        adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
        adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
        adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn, adm_users_islocked,
        adm_users_status, created_on, created_by, adm_users_defaultroleid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_DATE, $19, $20
      )
    `;
    const values = [
      adm_users_loginid, encryptedPassword, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
      adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
      adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn,
      adm_users_islocked === true,
      adm_users_status === true,
      created_by,
      adm_users_defaultroleid
    ];

    db.query(query, values, (err) => {
      if (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Error adding user." });
      } else {
        res.status(200).json({ message: "User added successfully." });
      }
    });
  } catch (err) {
    console.error("Encryption error:", err);
    res.status(500).json({ error: "Error encrypting password." });
  }
});

// app.put("/userlist_changepassword/:id", async (req, res) => {
//   const userId = req.params.id;
//   const { newPassword } = req.body;
//   const currentUserRole = req.session.user.role; // Example using a session
//   if (currentUserRole !== 'Administrator') {
//     return res.status(403).json({ success: false, error: "Access denied. Only Administrators can change passwords." });
//   }
//   if (!newPassword) {
//     return res.status(400).json({ error: "New password is required." });
//   }
//   try {
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     const query = `
//           UPDATE adm_user_t
//           SET adm_users_password = $1, modified_on = CURRENT_DATE
//           WHERE adm_users_id = $2
//           RETURNING *;
//       `;
//     const values = [hashedPassword, userId];
//     db.query(query, values, (err, result) => {
//       if (err) {
//         console.error("Database Error:", err);
//         return res.status(500).json({ error: "Error updating password." });
//       } else {
//         if (result.rowCount === 0) {
//           return res.status(404).json({ success: false, error: "User not found" });
//         } else {
//           res.status(200).json({ success: true, message: "Password updated successfully." });
//         }
//       }
//     });
//   } catch (error) {
//     console.error("Error hashing password:", error);
//     res.status(500).json({ error: "Error processing password." });
//   }
// });

app.put("/userlist_changepassword/:id", async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  const currentUserRole = req.session.user.role;

  if (currentUserRole !== 'Administrator') {
    return res.status(403).json({ success: false, error: "Access denied. Only Administrators can change passwords." });
  }
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }

  try {
    const encryptedPassword = CryptoJS.AES.encrypt(newPassword, AES_SECRET_KEY).toString();

    const query = `
      UPDATE adm_user_t
      SET adm_users_password = $1, modified_on = CURRENT_DATE
      WHERE adm_users_id = $2
      RETURNING *;
    `;
    const values = [encryptedPassword, userId];
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Error updating password." });
      } else {
        if (result.rowCount === 0) {
          return res.status(404).json({ success: false, error: "User not found" });
        } else {
          res.status(200).json({ success: true, message: "Password updated successfully." });
        }
      }
    });
  } catch (error) {
    console.error("Error encrypting password:", error);
    res.status(500).json({ error: "Error processing password." });
  }
});

app.put("/userlist_editusers/:id", async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  if (updatedData.adm_users_password) {
    delete updatedData.adm_users_password;
  }
  console.log("/userlist_editusers : " + userId);
  const fields = Object.keys(updatedData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = Object.values(updatedData);
  values.push(userId);
  const query = `
    UPDATE adm_user_t
    SET ${fields}
    WHERE adm_users_id = $${values.length}
    RETURNING *;
  `;
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Error adding user." });
    } else {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      } else {
        res.status(200).json({ success: true, user: result.rows[0] });
      }
    }
  });
});

////-------------------------------------User Page EditUser Ends Here------------------------------------------------------////

////-------------------------------------MetaData Page Starts Here------------------------------------------------------////

app.get('/metadata_Detail', (req, res) => {
  console.log('MetaData Details');
  db.query("select GEN_Metadtl_ID,GEN_Metahdr_ID,GEN_Metadtl_Value1,GEN_Metadtl_Value2,GEN_Metadtl_Value3,GEN_Metadtl_Value4,GEN_Metadtl_Value5,GEN_Metadtl_Value6,GEN_Metadtl_Value7,GEN_Metadtl_Value8,GEN_Metadtl_Status from GEN_MetadataDtl_T",
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, data: result.rows });
    }
  )
});

app.post('/metadata_Header', (req, res) => {
  console.log('MetaData Header')
  const {
    GEN_Metahdr_ID,
    GEN_Metahdr_Category,
    GEN_Metahdr_CategoryName,
    GEN_Metahdr_Status,
  } = req.body;
  const metahdrquery = `INSERT INTO gen_metadatahdr_t
    (GEN_Metahdr_ID,GEN_Metahdr_Category,GEN_Metahdr_CategoryName,GEN_Metahdr_Status,created_on, created_by) 
    VALUES ($1,$2,$3,$4,CURRENT_DATE,'Admin')`;
  db.query(metahdrquery, [GEN_Metahdr_ID, GEN_Metahdr_Category, GEN_Metahdr_CategoryName, GEN_Metahdr_Status],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, message: 'Meta Data Header inserted' });
    }
  );
});

app.post('/metadata_Details', (req, res) => {
  console.log('MetaData Details')
  const {
    GEN_Metadtl_ID,
    GEN_Metahdr_ID,
    GEN_Metadtl_Value1,
    GEN_Metadtl_Value2,
    GEN_Metadtl_Value3,
    GEN_Metadtl_Value4,
    GEN_Metadtl_Value5,
    GEN_Metadtl_Value6,
    GEN_Metadtl_Value7,
    GEN_Metadtl_Value8,
    GEN_Metadtl_Status,
  } = req.body;
  const query = "INSERT INTO GEN_MetadataDtl_T (GEN_Metadtl_ID,GEN_Metahdr_ID,GEN_Metadtl_Value1,GEN_Metadtl_Value2,GEN_Metadtl_Value3,GEN_Metadtl_Value4,GEN_Metadtl_Value5,GEN_Metadtl_Value6,GEN_Metadtl_Value7,GEN_Metadtl_Value8,GEN_Metadtl_Status,created_on, created_by) VALUES ($1,$2,$3,$4, $5,$6, $7, $8, $9, $10,$11,CURRENT_DATE,'Admin')";
  db.query(query, [
    GEN_Metadtl_ID,
    GEN_Metahdr_ID,
    GEN_Metadtl_Value1 || null,
    GEN_Metadtl_Value2 || null,
    GEN_Metadtl_Value3 || null,
    GEN_Metadtl_Value4 || null,
    GEN_Metadtl_Value5 || null,
    GEN_Metadtl_Value6 || null,
    GEN_Metadtl_Value7 || null,
    GEN_Metadtl_Value8 || null,
    GEN_Metadtl_Status
  ],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, message: 'Meta Data Header inserted' });
    }
  );
});
////-------------------------------------MetaData Page Ends Here------------------------------------------------------////
////-------------------------------------Visitor Details Starts Here------------------------------------------------------////
app.use(bodyParser.json({ limit: '10mb' }));
// app.post('/visitor_lobbyentry', (req, res) => {
//   console.log('Lobby Entry')
//   try {
//     const {
//       visitorId,
//       name,
//       from,
//       toMeet,
//       purpose,
//       idType,
//       idNumber,
//       phoneNumber,
//       email,
//       image,
//     } = req.body;
//     if (!image) {
//       return res.status(400).json({ success: false, message: 'Image is missing in request body' });
//     }
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
//     const fileName = `${visitorId}_${name}.png`;
//     const filePath = path.join(__dirname, '../gatepass_app/public/lobbyentry', fileName);
//     fs.writeFile(filePath, base64Data, 'base64', (err) => {
//       if (err) return res.status(500).send('Failed to save image');
//       // continue after saving...
//     });
//     const inTime = new Date().toLocaleTimeString();
//     const outTime = '';
//     const insertQuery = `
//       INSERT INTO "GMS_LobbyEntry_T" (
//         "GMS_LobbyEntry_ID", "GMS_VisitorName", "GMS_VisitorFrom", "GMS_ToMeet", "GMS_VisitPurpose", 
//        "GMS_IdentificationType", "GMS_IdentificationNo", "GMS_MobileNo", 
//         "GMS_EmailID", "GMS_InTime", "GMS_OutTime", "GMS_VisitorImage", "GMS_Status", 
//         created_on, created_by
//       ) VALUES (
//         $1, $2, $3, $4, $5, 
//         $6, $7, $8, $9, 
//         $10, $11, $12, $13,
//         CURRENT_DATE, 'Admin'
//       )
//     `;
//     db.query(insertQuery, [
//       parseInt(visitorId),
//       name,
//       from,
//       toMeet,
//       purpose,
//       idType || 0,
//       idNumber,
//       phoneNumber,
//       email || '',
//       inTime,
//       outTime,
//       fileName,
//       true
//     ]);
//     res.status(200).json({ success: true, message: 'Data inserted', id: visitorId });
//   } catch (error) {
//     console.error('Error inserting visitor data:', error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });

app.post('/visitorgateentry', async (req, res) => {
  try {
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_ToMeet,
      GMS_ToMeetEmail,
      GMS_VisitPurpose,
      GMS_Expectedexit,
      GMS_VehicleNo,
      GMS_IdentificationType,
      GMS_IdentificationNo,
      GMS_MobileNo,
      GMS_EmailID,
      GMS_VisitorImage,
      GMS_Status = 'Pending',
      created_by = 'system'
    } = req.body;
    // Validate required fields
    if (!GMS_VisitorName?.trim()) {
      return res.status(400).json({ success: false, message: 'Visitor name is required' });
    }
    if (!GMS_MobileNo?.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!GMS_VisitorImage) {
      return res.status(400).json({ success: false, message: 'Visitor image is required' });
    }
    // Process image - remove data URL prefix if present
    const base64Data = GMS_VisitorImage.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const insertQuery = `
      INSERT INTO gms_gate_entries (
        GMS_VisitorName,
        GMS_VisitorFrom,
        GMS_ToMeet,
        GMS_ToMeetEmail,
        GMS_VisitPurpose,
        GMS_Expectedexit,
        GMS_VehicleNo,
        GMS_IdentificationType,
        GMS_IdentificationNo,
        GMS_MobileNo,
        GMS_EmailID,
        GMS_VisitorImage,
        GMS_Status,
        created_by,
         entry_time, 
        GMS_Outtime
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NUll)
      RETURNING GMS_GateEntry_ID;
    `;
    const values = [
      GMS_VisitorName.trim(),
      GMS_VisitorFrom?.trim() || null,
      GMS_ToMeet?.trim() || null,
      GMS_ToMeetEmail?.trim() || null,
      GMS_VisitPurpose?.trim() || null,
      GMS_Expectedexit || null,
      GMS_VehicleNo?.trim() || null,
      GMS_IdentificationType?.trim() || null,
      GMS_IdentificationNo?.trim() || null,
      GMS_MobileNo.trim(),
      GMS_EmailID?.trim() || null,
      imageBuffer, // Binary image data
      GMS_Status,
      created_by
    ];
    const result = await db.query(insertQuery, values);
    res.status(201).json({
      success: true,
      message: 'Visitor entry created successfully',
      visitorId: result.rows[0].GMS_GateEntry_ID
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visitor entry',
      error: error.message
    });
  }
});


app.post('/sendVisitorIDEmail', async (req, res) => {
  const { email, visitor } = req.body;
  console.log('Email request received:', { email, visitor });
  if (!email || !visitor) {
    return res.status(400).json({ message: 'Email and visitor details are required.' });
  }
  try {
    // 1. Generate QR code as buffer (instead of DataURL)
    const qrData = {
      visitorId: visitor.id,
      name: visitor.name,
      from: visitor.from,
      toMeet: visitor.toMeet,
      purpose: visitor.purpose,
      vehicle: visitor.vehicle,
      issuedBy: 'Security Desk',
      date: visitor.date,
      time: visitor.time,
    };
    const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData));
    // 2. Fetch visitor image from DB
    const imageResult = await db.query(
      'SELECT gms_visitorimage FROM gms_gate_entries WHERE GMS_GateEntry_ID = $1',
      [visitor.id]
    );
    if (!imageResult.rows.length || !imageResult.rows[0].gms_visitorimage) {
      return res.status(404).json({ message: 'Visitor image not found in database.' });
    }
    const imageBuffer = imageResult.rows[0].gms_visitorimage;
    // Detect MIME type (JPG/PNG)
    const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
    const mimeType = isJPEG ? 'image/jpeg' : 'image/png';
    // Base64 for debug if needed
    const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    // 3. Compose HTML email (photo + QR use cid)
    const html = `
      <div style="display: flex; gap: 20px; justify-content: center; font-family: Arial, sans-serif; padding: 20px;">
        <!-- FRONT SIDE -->
        <div style="width: 300px; height: 450px; border: 2px solid #2c3e50; border-radius: 10px; overflow: hidden; position: relative; background: white; color: black; padding: 0; box-sizing: border-box;">
          <div style="background: #1d4ed8; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700; color: white;">COMPANY</h3>
            <span style="background: #22c55e; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700;">VISITOR</span>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; margin: 3px; width: 100%;">
            <img src="cid:visitorphoto_${visitor.id}" alt="Visitor" style="width: 125px; height: 125px; border-radius: 50%; border: 2px solid green; object-fit: cover;" />
          </div>
          <div style="font-size: 0.85rem; line-height: 1;">
            <p><strong>ID:</strong> ${visitor.id}</p>
            <p><strong>Name:</strong> ${visitor.name}</p>
            <p><strong>Company:</strong> ${visitor.from}</p>
            <p><strong>To Meet:</strong> ${visitor.toMeet}</p>
            <p><strong>Date:</strong> ${visitor.date}</p>
            <p><strong>Time In:</strong> ${visitor.time}</p>
            <p><strong>Address:</strong> Company name 1/40, 1st street, Guindy, Chennai-68.</p>
          </div>
          <div style="position: absolute; bottom: 0; width: 100%; background: #1ec534; text-align: center; padding: 6px; font-weight: bold; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
            Valid ${visitor.date}
          </div>
        </div>
        <!-- BACK SIDE -->
        <div style="width: 300px; height: 450px; border: 2px solid #2c3e50; border-radius: 10px; background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; box-sizing: border-box;">
          <div style="text-align: center; margin-top: 40px;">
            <img src="cid:visitorqr_${visitor.id}" alt="QR Code" style="width: 160px; height: 160px; margin-bottom: 12px; border: 1px solid #22c55e; padding: 5px; border-radius: 10px;" />
            <p style="font-size: 1rem; margin: 10px 0 0; width: 100%;">Scan this code for visitor details</p>
          </div>
          <div style="margin-top: auto; text-align: center; width: 100%; font-size: 0.75rem; color: #1e293b;">
            <p><strong>In case of emergency, please contact:</strong></p>
            <p>Security: +1 234 567 8900</p>
          </div>
        </div>
      </div>
    `;
    console.log('Attempting to send email to:', email);
    // 4. Send visitor email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Visitor ID Card - ${visitor.name}`,
      html,
      attachments: [
        {
          filename: `visitor_${visitor.id}.jpg`,
          content: imageBuffer,
          cid: `visitorphoto_${visitor.id}`
        },
        {
          filename: `qr_${visitor.id}.png`,
          content: qrBuffer,
          cid: `visitorqr_${visitor.id}`
        }
      ]
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('Visitor email sent successfully:', result.messageId);
    // ✅ Notify employee also
    if (visitor.toMeetEmail) {
      const employeeMailOptions = {
        from: process.env.EMAIL_USER,
        to: visitor.toMeetEmail,
        subject: `Visitor Arrival Notification - ${visitor.name}`,
        html: `
          <p>Dear ${visitor.toMeet},</p>
          <p>This is to inform you that <strong>${visitor.name}</strong> from <strong>${visitor.from}</strong> has arrived to meet you.</p>
          <p><strong>Purpose:</strong> ${visitor.purpose}</p>
          <p><strong>Vehicle:</strong> ${visitor.vehicle || "N/A"}</p>
          <p><strong>Time In:</strong> ${visitor.time}, <strong>Date:</strong> ${visitor.date}</p>
          <br/>
          <p>Regards,<br/>Security Desk</p>
        `
      };
      try {
        const empResult = await transporter.sendMail(employeeMailOptions);
        console.log('Employee notification email sent:', empResult.messageId);
      } catch (err) {
        console.error('Failed to send employee notification email:', err);
      }
    }
    res.status(200).json({
      message: 'Visitor ID Card emailed successfully to visitor (and employee notified if applicable).',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending visitor ID email:', error);
    res.status(500).json({
      message: 'Failed to send visitor ID card.',
      error: error.message
    });
  }
});



app.post('/sendEmail', async (req, res) => {
  const { from, to, cc, bcc, subject, html } = req.body;
  console.log("📨 /sendEmail request:", { from, to, cc, bcc, subject });
  // Build email options (conditionally include bcc)
  const mailOptions = {
    from,
    to,
    cc,
    subject,
    html,
    ...(bcc && { bcc }) // Add bcc only if provided
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).send('Error sending email.');
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Send OTP
app.post('/sendEmailOTP', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  try {
    const result = await db.query(
      `
      WITH existing_user AS (
        SELECT 1 FROM adm_user_t WHERE adm_users_email = $1
      )
      INSERT INTO GMS_OTP (email, otp, otp_expires)
      SELECT $1, $2, $3
      FROM existing_user
      ON CONFLICT (email)
      DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
      `,
      [email, otp, otpExpires]
    );
    // If no row was inserted or updated, email does not exist in adm_user_t
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Email not found in user records' });
    }
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 15 minutes.`,
    });
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error in /sendEmailOTP:', err);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
  try {
    const result = await db.query(
      'SELECT * FROM GMS_OTP WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
      [email, otp]
    );
    if (result.rows.length > 0) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// app.post('/reset-password', async (req, res) => {
//   const { token, newPassword } = req.body;
//   if (!token || !newPassword) {
//     return res.status(400).json({ message: 'Token and password required' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     // Update password in adm_user_t
//     const result = await db.query(
//       `UPDATE adm_user_t 
//        SET adm_users_password = $1, modified_on = NOW() 
//        WHERE adm_users_email = $2 
//        RETURNING adm_users_id`,
//       [hashedPassword, decoded.email]
//     );
//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: 'User not found with this email' });
//     }
//     res.status(200).json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Reset error:', error);
//     res.status(400).json({ message: 'Invalid or expired token' });
//   }
// });

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and password required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const encryptedPassword = CryptoJS.AES.encrypt(newPassword, AES_SECRET_KEY).toString();

    const result = await db.query(
      `UPDATE adm_user_t 
       SET adm_users_password = $1, modified_on = NOW() 
       WHERE adm_users_email = $2 
       RETURNING adm_users_id`,
      [encryptedPassword, decoded.email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // -------------------- Visitor OTP APIs --------------------
// // Send OTP for Visitor Entry
// app.post('/sendVisitorOTP', async (req, res) => {
//   console.log("Request Body:", req.body);
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: 'Email is required' });
//   const otp = generateOTP();
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
//   try {
//     // Save or update OTP in visitor table
//     await db.query(
//       `INSERT INTO GMS_Visitor_OTP (email, otp, otp_expires)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (email)
//         DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
//       `,
//       [email, otp, otpExpires]
//     );
//     // Send email with OTP
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: 'Visitor Verification OTP',
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//     });
//     res.status(200).json({ message: 'Visitor OTP sent successfully' });
//   } catch (err) {
//     console.error('Error in /sendVisitorOTP:', err);
//     res.status(500).json({ message: 'Error sending Visitor OTP' });
//   }
// });
// // Verify Visitor OTP
// app.post('/verifyVisitorOTP', async (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp) {
//     return res.status(400).json({ success: false, message: 'Email and OTP are required' });
//   }
//   try {
//     const result = await db.query(
//       'SELECT * FROM GMS_Visitor_OTP WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
//       [email, otp]
//     );
//     if (result.rows.length > 0) {
//       return res.status(200).json({ success: true, message: 'Visitor OTP verified successfully' });
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
//   } catch (err) {
//     console.error('Error in /verifyVisitorOTP:', err);
//     res.status(500).json({ success: false, message: 'Visitor OTP verification failed' });
//   }
// });
// //////////////////////////////////////////////////////////////////////  visitors Email OTP //////////////
// //////////////////////////////////////////////////////////////////////  visitors SMS  OTP //////////////
// // Send OTP for Visitor Entry via SMS
// app.post('/sendVisitorSmsOTP', async (req, res) => {
//   console.log("Request Body:", req.body);
//   const { phone } = req.body;
//   if (!phone) {
//     return res.status(400).json({ message: 'Phone number is required' });
//   }
//   const otp = generateOTP();
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
//   try {
//     // Save or update OTP in a new visitor_sms_otp table
//     // Ensure you have a 'GMS_Visitor_Sms_OTP' table with columns: 'phone' (primary key), 'otp', 'otp_expires'.
//     await db.query(
//       `INSERT INTO GMS_Visitor_Sms_OTP (phone, otp, otp_expires)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (phone)
//         DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
//       `,
//       [phone, otp, otpExpires]
//     );
//     // Send SMS with OTP using the placeholder function
//     const smsMessage = `Your OTP is ${otp}. It will expire in 10 minutes.`;
//     await sendSms(phone, smsMessage);
//     res.status(200).json({ message: 'Visitor SMS OTP sent successfully' });
//   } catch (err) {
//     console.error('Error in /sendVisitorSmsOTP:', err);
//     res.status(500).json({ message: 'Error sending Visitor SMS OTP' });
//   }
// });
// // Verify Visitor SMS OTP
// app.post('/verifyVisitorSmsOTP', async (req, res) => {
//   const { phone, otp } = req.body;
//   if (!phone || !otp) {
//     return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
//   }
//   try {
//     const result = await db.query(
//       'SELECT * FROM GMS_Visitor_Sms_OTP WHERE phone = $1 AND otp = $2 AND otp_expires > NOW()',
//       [phone, otp]
//     );
//     if (result.rows.length > 0) {
//       return res.status(200).json({ success: true, message: 'Visitor SMS OTP verified successfully' });
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
//   } catch (err) {
//     console.error('Error in /verifyVisitorSmsOTP:', err);
//     res.status(500).json({ success: false, message: 'Visitor SMS OTP verification failed' });
//   }
// });
// Function for sending emails using Nodemailer


const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
// Placeholder function for sending SMS, since you only have Nodemailer
const sendSms = async (to, message) => {
  console.log(`SMS functionality not implemented. Attempted to send to ${to} with message: ${message}`);
  // You would implement a service like Twilio here if needed
  return true;
};

// Send OTP for Visitor Entry (unified for both email and SMS)
app.post('/sendOTP', async (req, res) => {
  console.log("Request Body:", req.body);
  const { contact_info, contact_type } = req.body;
  // Validate request body
  if (!contact_info || !contact_type) {
    return res.status(400).json({ message: 'Contact information and type are required' });
  }
  // Generate a new 6-digit OTP
  const otp = generateOTP();
  // Set OTP to expire in 10 minutes from now
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  try {
    await db.query(
      `INSERT INTO GMS_OTP (contact_info, contact_type, otp, otp_expires)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (contact_info, contact_type)
             DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
            `,
      [contact_info, contact_type, otp, otpExpires]
    );
    // Conditionally send the OTP via email or SMS
    if (contact_type === 'email') {
      const subject = 'Visitor Verification OTP';
      const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      await sendEmail(contact_info, subject, text);
    } else if (contact_type === 'phone') {
      const message = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      await sendSms(contact_info, message);
    } else {
      return res.status(400).json({ message: 'Invalid contact type' });
    }
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    // Log the full error object for detailed debugging
    console.error('Error in /sendOTP:', err);
    // Provide a generic, safe error message to the client
    res.status(500).json({ message: 'Error sending OTP' });
  }
});
// Verify Visitor OTP (unified for both email and SMS)
app.post('/verifyOTP', async (req, res) => {
  const { contact_info, contact_type, otp } = req.body;
  if (!contact_info || !contact_type || !otp) {
    return res.status(400).json({ success: false, message: 'Contact info, type, and OTP are required' });
  }
  try {
    const result = await db.query(
      `SELECT * FROM GMS_OTP
       WHERE contact_info = $1 AND contact_type = $2 AND otp = $3 AND otp_expires > NOW()`,
      [contact_info, contact_type, otp]
    );
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error('Error in /verifyOTP:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});
// //////////////////////////////////////////////////////////////////////  visitors SMS OTP //////////////

//////////////////////////////////////////////////////////////////////  Show all visitors imges //////////////

app.get('/visitor-image/:id', async (req, res) => {
  const visitorId = req.params.id;
  console.log("visito id ", visitorId);
  try {
    const result = await db.query('SELECT gms_visitorimage FROM gms_gate_entries WHERE GMS_GateEntry_ID = $1', [visitorId]);
    if (result.rows.length > 0 && result.rows[0].gms_visitorimage) {
      const imageBuffer = result.rows[0].gms_visitorimage;
      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).send('Server error');
  }
});
///  Show all visitors list //////////////
app.get('/allvisitors', (req, res) => {
  console.log("/allvis visitors request received");
  db.query(`SELECT
            le.gms_lobbyentry_id        AS id,
            le.gms_visitorname         AS visitor_name,
            le.gms_visitorfrom         AS visitor_from,
            le.gms_tomeet              AS to_meet_employeename,

            -- From employee table
            emp.gms_department         AS emp_department,
            emp.gms_designation        AS emp_designation,

            -- From admin user table
            adm.adm_users_deptid       AS adm_department_id,
            adm.adm_users_jobid        AS adm_role_id,

            le.gms_visitpurpose        AS purpose,

            -- lobbyentry does NOT have expected exit → derived from intime + pass duration if needed
            le.gms_intime              AS check_in,
            le.gms_outtime             AS check_out,

            le.gms_status              AS status,

            le.gms_identificationtype  AS id_type,
            le.gms_identificationno    AS id_number,

            le.gms_mobileno            AS phone_number,
            le.gms_emailid             AS email,

            le.created_on,
            le.created_by,
            le.modified_on,
            le.modified_by,

            le.gms_visitorimage        AS image_data

        FROM public.gms_lobbyentry le

        LEFT JOIN public.gms_emplayoee_tbl emp
              ON le.gms_tomeet = CONCAT(emp.gms_first_name, ' ', emp.gms_last_name)

        LEFT JOIN public.adm_user_t adm
              ON le.gms_tomeet = CONCAT(adm.adm_users_firstname, ' ', adm.adm_users_lastname)

        ORDER BY le.created_on DESC;`, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send({
        success: false,
        error: "Database error",
        details: err.message
      });
    }
    if (results.rowCount > 0) {
      console.log(`Successfully retrieved ${results.rowCount} visitors`);
      res.json({
        success: true,
        message: "Visitors retrieved successfully",
        data: results.rows,
        count: results.rowCount
      });
    } else {
      console.log("No visitors found");
      res.json({
        success: true,
        message: "No visitor records found",
        data: [],
        count: 0
      });
    }
  });
});
// Delete visitor
app.delete('/deletevisitor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Visitor ID is required",
      });
    }
    const result = await db.query(
      `DELETE FROM gms_gate_entries WHERE gms_gateentry_id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }
    res.json({
      success: true,
      message: "Visitor deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting visitor:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete visitor",
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////


app.get("/editvisitors/:id", (req, res) => {
  const id = req.params.id;
  console.log('id', id)
  db.query(
    `SELECT gms_gateentry_id, gms_visitorname, gms_visitorfrom, gms_tomeet, gms_visitpurpose, gms_vehicleno, gms_identificationtype, gms_identificationno, gms_mobileno, gms_emailid, gms_intime, gms_outtime, gms_status, created_on, created_by, modified_on, modified_by, gms_visitorimage, gms_visitorimage_bytea, entry_time, gms_tomeetemail
  FROM public.gms_gate_entries 
       WHERE gms_gateentry_id = $1`,
    [id],
    (error, results) => {
      if (error) {
        console.error("Error executing query", error);
        res.status(500).json({ error });
      } else {
        res.json(results.rows);
      }
    }
  );
});

app.get("/viewvisitors/:id", (req, res) => {
  const id = req.params.id;
  console.log('id', id)
  db.query(`SELECT
          gms_lobbyentry_id AS id,
          gms_visitorname,
          gms_visitorfrom,
          gms_tomeet,
          gms_visitpurpose,
          gms_identificationtype,
          gms_identificationno,
          gms_mobileno,
          gms_emailid,
          gms_intime,
          gms_outtime,
          gms_status,
          created_on,
          created_by,
          modified_on,
          modified_by,
          gms_visitorimage
      FROM public.gms_lobbyentry
      WHERE gms_lobbyentry_id = $1;`, [id],
    (error, results) => {
      if (error) {
        console.error("Error executing query", error);
        res.status(500).json({ error });
      } else {
        res.json(results.rows);
      }
    }
  );
});


const moments = require('moment-timezone');

app.put('/updatevisitorstatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Get current IST time as ISO string
    const istTime = moments().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss');
    const updates = {
      status: status,
      ...(status === 'Checked Out' && {
        gms_outtime: istTime
      })
    };
    const result = await db.query(
      `UPDATE gms_gate_entries
       SET gms_status = $1,
           gms_outtime = $2,
           modified_on = NOW()
       WHERE gms_gateentry_id = $3
       RETURNING *`,
      [updates.status, updates.gms_outtime, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }
    res.json({
      success: true,
      message: 'Visitor status updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating visitor status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update visitor status',
    });
  }
});



app.get('/visitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT 
        gms_gateentry_id AS id,
        gms_visitorname AS visitor_name,
        gms_visitorfrom AS visitor_from,
        gms_tomeet AS to_meet,
        gms_visitpurpose AS purpose,
        gms_vehicleno AS vehicle_no,
        gms_intime AS check_in,
        gms_outtime AS check_out,
        gms_status AS status,
        gms_identificationtype AS id_type,
        gms_identificationno AS id_number,
        gms_mobileno AS phone_number,
        gms_emailid AS email,
        gms_visitorimage AS image_data
      FROM gms_gate_entries 
      WHERE gms_gateentry_id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching visitor:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visitor',
    });
  }
});
// Update visitor by ID
app.put('/updatevisitor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_ToMeet,
      GMS_ToMeetEmail,
      GMS_VisitPurpose,
      GMS_VehicleNo,
      GMS_IdentificationType,
      GMS_IdentificationNo,
      GMS_MobileNo,
      GMS_EmailID
    } = req.body;
    const result = await db.query(
      `UPDATE gms_gate_entries
       SET 
           GMS_VisitorName = $1,
           GMS_VisitorFrom = $2,
           GMS_ToMeet = $3,
           GMS_ToMeetEmail = $4,
           GMS_VisitPurpose = $5,
           GMS_VehicleNo = $6,
           GMS_IdentificationType = $7,
           GMS_IdentificationNo = $8,
           GMS_MobileNo = $9,
           GMS_EmailID = $10
       WHERE GMS_GateEntry_ID = $11
       RETURNING *`,
      [
        GMS_VisitorName,
        GMS_VisitorFrom,
        GMS_ToMeet,
        GMS_ToMeetEmail,
        GMS_VisitPurpose,
        GMS_VehicleNo,
        GMS_IdentificationType,
        GMS_IdentificationNo,
        GMS_MobileNo,
        GMS_EmailID,
        id
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }
    res.json({
      success: true,
      message: 'Visitor updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating visitor:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update visitor',
    });
  }
});
//------------------------------------------ get employees list ------------------------------------------//

app.put('/updateviewvisitorstatus/:id', async (req, res) => {
  const { id } = req.params;
  const { gms_status } = req.body;

  if (!gms_status) {
    return res.status(400).json({ message: 'gms_status is required' });
  }

  try {
    const updateQuery = `
      UPDATE public.gms_lobbyentry
      SET gms_status = $1,
          modified_on = NOW()
      WHERE gms_lobbyentry_id = $2
      RETURNING *;
    `;

    const result = await db.query(updateQuery, [gms_status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      visitor: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating visitor status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/gettingemailsfromtwotable', async (req, res) => {
  try {
    const result = await db.query(`
  SELECT 
    id AS user_id,
    COALESCE(gms_first_name, '') || ' ' || COALESCE(gms_last_name, '') AS name,
    gms_email AS email,
    'Employee' AS user_type
  FROM gms_emplayoee_tbl
  WHERE gms_status = 'Active'
  UNION ALL
  SELECT 
    adm_users_id AS user_id,
    COALESCE(adm_users_firstname, '') || ' ' || COALESCE(adm_users_lastname, '') AS name,
    adm_users_email AS email,
    'Admin' AS user_type
  FROM adm_user_t
  WHERE adm_users_status = true
`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        adm_users_id AS id,
        adm_users_firstname || ' ' || adm_users_lastname AS name,
        adm_users_email AS email,
        adm_users_deptid AS department
      FROM 
        public.adm_user_t
      ORDER BY 
        adm_users_id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/department_add", (req, res) => {
  const { department_name, department_description, status } = req.body;
  const query = `
    INSERT INTO gms_department_t (department_name, department_description, status, created_on, created_by)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'System')
    RETURNING department_id
  `;
  db.query(query, [department_name, department_description, status], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ success: false, message: "Failed to add department" });
    }
    res.status(200).json({ success: true, message: "Department added", department_id: result.rows[0].department_id });
  });
});


app.get('/department_getalldata', (req, res) => {
  const query = `
    SELECT 
      department_id, 
      department_name, 
      department_description, 
      status 
    FROM gms_department_t 
    ORDER BY department_id DESC
  `;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching department data:", err);
      return res.status(500).json({ success: false, message: "Database query failed" });
    }
    res.status(200).json({ success: true, data: result.rows });
  });
});
// Route to fetch department by ID
app.get("/department_getbyid/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Route to update department details
app.put("/department_update/:id", async (req, res) => {
  const { id } = req.params;
  const { department_name, department_description, status } = req.body;
  // Assuming the `modified_by` is the user who is making the update
  const modifiedBy = "admin"; // You can get this from the logged-in user's session or JWT
  try {
    const result = await db.query(
      `UPDATE gms_department_t
       SET department_name = $1,
           department_description = $2,
           status = $3,
           modified_on = CURRENT_TIMESTAMP,
           modified_by = $4
       WHERE department_id = $5
       RETURNING *`,
      [department_name, department_description, status, modifiedBy, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    res.status(200).json({ success: true, message: "Department updated successfully.", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Route to delete department by ID
app.delete("/department_delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure the department exists before attempting to delete
    const result = await db.query(
      `SELECT * FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    // Proceed to delete the department
    await db.query(
      `DELETE FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    res.status(200).json({ success: true, message: "Department deleted successfully." });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
//------------------------------------------ get employees list ------------------------------------------//
//------------------------------------------ Designation ------------------------------------------//
// Get all designations
app.get('/GMS_getall_designations', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gms_designations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching designations:', err);
    res.status(500).json({ message: 'Failed to fetch designations' });
  }
});
// Create new designation
app.post('/GMS_createnew_designations', async (req, res) => {
  const { designations_name, designations_status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO gms_designations (designations_name, designations_status) VALUES ($1, $2) RETURNING *',
      [designations_name.trim(), designations_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating designation:', err);
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Designation name must be unique' });
    }
    res.status(500).json({ message: 'Failed to create designation' });
  }
});
// Get designation by ID
app.get('/GMS_getbyid_designations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM gms_designations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching designation:', err);
    res.status(500).json({ message: 'Failed to fetch designation' });
  }
});
// Update designation
app.put('/GMS_update_designations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { designations_name, designations_status } = req.body;
    // Validate incoming fields
    if (!designations_name || !designations_name.trim()) {
      return res.status(400).json({ message: 'Designation name is required' });
    }
    // Optional: Validate status value
    const validStatus = ['Active', 'Inactive'];
    if (!validStatus.includes(designations_status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const result = await db.query(
      `UPDATE gms_designations
       SET designations_name = $1,
           designations_status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [designations_name.trim(), designations_status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.status(200).json({ message: 'Designation updated successfully' });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Delete designation
app.delete('/GMS_delete_designations/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Designations was Deleted', id)
  try {
    const result = await db.query('DELETE FROM gms_designations WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json({ message: 'Designation deleted successfully' });
  } catch (err) {
    console.error('Error deleting designation:', err.message);
    res.status(500).json({ message: 'Failed to delete designation' });
  }
});
//------------------------------------------ Designation ------------------------------------------//
///////////////////////////////////////////////////////// Emplayoees /////////////////////////////////////////////////////////

app.get('/get_all_employees', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        CONCAT(GMS_first_name, ' ', GMS_last_name) AS name,
        GMS_email AS email,
        GMS_phone AS phone,
        gms_joining_date,
        gms_status
      FROM GMS_emplayoee_tbl
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/add_employees', upload.single('image'), async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    joining_date,
    gender,
    department,
    designation,
    status,
    password,
    confirm_password,
    about
  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!email || !first_name || !last_name || !phone || !password || !confirm_password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  try {
    const result = await db.query(`
      INSERT INTO GMS_emplayoee_tbl (
        GMS_first_name,
        GMS_last_name,
        GMS_email,
        GMS_phone,
        GMS_joining_date,
        GMS_gender,
        GMS_department,
        GMS_designation,
        GMS_status,
        GMS_password,
        GMS_confirm_password,
        GMS_about,
        GMS_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      first_name || null,
      last_name || null,
      email || null,
      phone || null,
      joining_date || null,
      gender || null,
      department || null,
      designation || null,
      status || 'Active',
      password || null,
      confirm_password || null,
      about || null,
      imagePath || null
    ]);
    res.status(201).json({
      message: 'Employee added successfully',
      employee: result.rows[0],
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

app.get('/get_byid_employeesview/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }
  try {
    const query = `
      SELECT 
        e.id AS employee_id,
        e.GMS_first_name || ' ' || e.GMS_last_name AS full_name,
        e.GMS_email,
        e.GMS_phone,
        e.GMS_joining_date,
        e.GMS_gender,
        e.GMS_department,
        e.GMS_designation,
        e.GMS_status,
        e.GMS_about,
        e.GMS_image,
        v.gms_gateentry_id AS visitor_id,
        v.gms_visitorname AS visitor_name,
        v.gms_emailid AS visitor_email,
        v.gms_intime AS entry_time,
        v.gms_status AS visitor_status,
        v.gms_tomeet AS to_meet,
        v.gms_tomeetemail AS to_meet_email,
        v.gms_visitorimage AS image,
        v.gms_visitpurpose AS purpose,
        v.gms_mobileno AS phone,
        v.gms_identificationno AS id_number,
        v.gms_identificationtype AS id_type,
        v.gms_vehicleno AS vehicle
      FROM GMS_emplayoee_tbl e
      LEFT JOIN gms_gate_entries v
        ON v.gms_tomeetemail = e.GMS_email
      WHERE e.id = $1
      ORDER BY v.gms_intime DESC
      LIMIT 100
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found or no visitors' });
    }
    const employeeRow = result.rows[0];
    const employee = {
      id: employeeRow.employee_id,
      name: employeeRow.full_name,
      email: employeeRow.gms_email,
      phone: employeeRow.gms_phone,
      department: employeeRow.gms_department,
      designation: employeeRow.gms_designation,
      image: employeeRow.gms_image,
      joining_date: employeeRow.gms_joining_date,
      status: employeeRow.gms_status,
      about: employeeRow.gms_about,
      gender: employeeRow.gms_gender
    };
    const visitors = result.rows
      .filter(row => row.visitor_id !== null)  // Skip if no visitor match
      .map(row => ({
        id: row.visitor_id,
        visitor_name: row.visitor_name,
        email: row.visitor_email,
        entry_time: new Date(row.entry_time).toLocaleString(),
        status: row.visitor_status,
        to_meet: row.to_meet,
        to_meet_email: row.to_meet_email,
        image: row.image,
        purpose: row.purpose,
        phone: row.phone,
        id_number: row.id_number,
        id_type: row.id_type,
        vehicle: row.vehicle
      }));
    res.json({ employee, visitors, count: visitors.length });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

app.get("/get_employee_by_id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM GMS_emplayoee_tbl WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    res.status(200).json({ success: true, data: result.rows[0] }); // return single employee
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});


app.put('/update_employee/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    joining_date,
    gender,
    department,
    designation,
    status,
    about
  } = req.body;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid or missing employee ID' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const existing = await db.query(`SELECT * FROM GMS_emplayoee_tbl WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    let updateQuery = `
      UPDATE GMS_emplayoee_tbl SET
        GMS_first_name = $1,
        GMS_last_name = $2,
        GMS_email = $3,
        GMS_phone = $4,
        GMS_joining_date = $5,
        GMS_gender = $6,
        GMS_department = $7,
        GMS_designation = $8,
        GMS_status = $9,
        GMS_about = $10
    `;
    const values = [
      first_name || null,
      last_name || null,
      email || null,
      phone || null,
      joining_date || null,
      gender || null,
      department || null,
      designation || null,
      status || 'Active',
      about || null
    ];
    if (imagePath) {
      updateQuery += `, GMS_image = $11`;
      values.push(imagePath);
    }
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);
    const result = await db.query(updateQuery, values);
    res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});
///////////////////////////////////////////////////////// Emplayoees /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Attendance Admin /////////////////////////////////////////////////////////
// ✅ GET /CountofTotalEMP
app.get('/CountofTotalEMP', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) AS total_users
       FROM (
         SELECT id AS user_id FROM public.gms_emplayoee_tbl
         UNION ALL
         SELECT adm_users_id AS user_id FROM public.adm_user_t
       ) AS combined_users;`
    );
    res.status(200).json({ total_employees: parseInt(result.rows[0].total_users, 10) });
  } catch (err) {
    console.error('Error fetching employee count:', err);
    res.status(500).json({ error: 'Failed to fetch total employee count' });
  }
});



app.get("/AttendanceEditEMP/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM gms_attendance_temp WHERE gms_userid = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Helper function to convert duration object to PostgreSQL interval string
const durationObjToInterval = (durationObj) => {
  if (!durationObj || (durationObj.hours === 0 && durationObj.minutes === 0 && durationObj.seconds === 0)) {
    return '00:00:00';
  }
  const hours = durationObj.hours || 0;
  const minutes = durationObj.minutes || 0;
  const seconds = durationObj.seconds || 0;
  // Format as HH:MM:SS for PostgreSQL interval
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
// Helper function to validate time format
const isValidTimeFormat = (timeStr) => {
  if (!timeStr) return true; // Allow null/empty
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(timeStr);
};

app.put('/AttendanceEditUpdateEMP/:id', async (req, res) => {
  const {
    employee_id,
    name,
    status,
    check_in,
    check_out,
    break_time,
    late_by
  } = req.body;
  console.log('Received PUT request to update attendance:', {
    employee_id,
    name,
    status,
    check_in,
    check_out,
    break_time,
    late_by
  });
  try {
    // Validate required fields
    if (!employee_id || !name || !status || !check_in) {
      return res.status(400).json({
        error: 'Missing required fields: employee_id, name, status, and check_in are required'
      });
    }
    if (!isValidTimeFormat(check_in)) {
      return res.status(400).json({ error: 'Invalid check_in time format. Use HH:MM:SS' });
    }
    if (check_out && !isValidTimeFormat(check_out)) {
      return res.status(400).json({ error: 'Invalid check_out time format. Use HH:MM:SS' });
    }
    let breakDuration = null;
    let lateDuration = null;
    if (break_time) {
      if (typeof break_time === 'object') {
        breakDuration = durationObjToInterval(break_time);
        console.log('Converted break_time object to interval:', breakDuration);
      } else if (typeof break_time === 'string' && isValidTimeFormat(break_time)) {
        breakDuration = break_time;
      } else {
        return res.status(400).json({ error: 'Invalid break_time format' });
      }
    }
    if (late_by) {
      if (typeof late_by === 'object') {
        lateDuration = durationObjToInterval(late_by);
        console.log('Converted late_by object to interval:', lateDuration);
      } else if (typeof late_by === 'string' && isValidTimeFormat(late_by)) {
        lateDuration = late_by;
      } else {
        return res.status(400).json({ error: 'Invalid late_by format' });
      }
    }
    // Perform the update using name + userid
    const result = await db.query(
      `UPDATE public.gms_attendance_temp 
       SET 
         gms_userid = $1,
         gms_name = $2,
         gms_status = $3,
         gms_checkin = $4,
         gms_checkout = $5,
         gms_breakduration = $6::interval,
         gms_lateduration = $7::interval,
         gms_updatedat = CURRENT_TIMESTAMP
       WHERE gms_userid = $1 AND gms_name = $2
       RETURNING *`,
      [
        employee_id,     // $1
        name,            // $2
        status,          // $3
        check_in,        // $4
        check_out || null, // $5
        breakDuration,   // $6
        lateDuration     // $7
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendance record not found (update)' });
    }
    console.log(`Attendance record for ${name} (user ID ${employee_id}) updated successfully`);
    res.status(200).json({
      message: 'Attendance updated successfully',
      updated_id: result.rows[0].gms_id,
      updated_record: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    if (error.code === '22007') {
      return res.status(400).json({ error: 'Invalid time/interval format' });
    } else if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate entry exists' });
    } else if (error.code === '23503') {
      return res.status(400).json({ error: 'Foreign key constraint violation' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/MonthlyAttendanceReport/:year', async (req, res) => {
  const { year } = req.params;
  try {
    const result = await db.query(
      `WITH all_users AS (
         SELECT id AS user_id FROM public.gms_emplayoee_tbl
         UNION ALL
         SELECT adm_users_id AS user_id FROM public.adm_user_t
       ),
       attendance_with_users AS (
         SELECT 
           DATE_TRUNC('month', a.gms_createdat) AS month,
           LOWER(a.gms_status) AS status
         FROM public.gms_attendance_temp a
         INNER JOIN all_users u ON a.gms_userid = u.user_id
         WHERE EXTRACT(YEAR FROM a.gms_createdat) = $1
       )
       SELECT 
         TO_CHAR(month, 'Mon') AS month,
         month AS sort_order,
         COUNT(*) FILTER (WHERE status = 'present') AS present,
         COUNT(*) FILTER (WHERE status = 'absent') AS absent,
         COUNT(*) FILTER (WHERE status = 'late login') AS late,
         COUNT(*) FILTER (WHERE status = 'permission') AS permission,
         COUNT(*) FILTER (WHERE status = 'wfh') AS wfh,
         COUNT(*) FILTER (WHERE status = 'lop') AS lop
       FROM attendance_with_users
       GROUP BY month
       ORDER BY sort_order`,
      [year]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});
// Attendance summary endpoint
app.get('/AttendanceStatusEMP', async (req, res) => {
  try {
    const result = await db.query(
      `WITH all_users AS (
  SELECT id AS user_id FROM public.gms_emplayoee_tbl
  UNION ALL
  SELECT adm_users_id AS user_id FROM public.adm_user_t
),
attendance_today AS (
  SELECT gms_userid, LOWER(gms_status) AS gms_status
  FROM public.gms_attendance_temp
  WHERE DATE(gms_createdat) = CURRENT_DATE
)
-- Final summary
SELECT 'Present' AS status, COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'present'

UNION ALL

SELECT 'Absent', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status IS NULL

UNION ALL

SELECT 'Late Login', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'late login'

UNION ALL

SELECT 'Permission', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'permission'

UNION ALL

SELECT 'WFH', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'wfh'

UNION ALL

SELECT 'LOP', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'lop';
`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
// Main attendance
app.get('/AttendanceDeltailsEMP', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          COALESCE(e.id, u.adm_users_id) AS id,
          a.gms_name AS name,
          a.gms_status AS status,
          a.gms_checkin AS checkIn,
          a.gms_checkout AS checkOut,
          a.gms_breakduration AS break,
          a.gms_lateduration AS late,
          u.adm_users_profileimage AS images,
          a.gms_createdat::date AS createdDate,
          a.gms_productionhours AS productionHours
      FROM 
          public.gms_attendance_temp a
      LEFT JOIN 
          public.gms_emplayoee_tbl e ON a.gms_userid = e.id
      LEFT JOIN 
          public.adm_user_t u ON a.gms_userid = u.adm_users_id
      WHERE 
          a.gms_createdat::date = CURRENT_DATE
      ORDER BY 
          a.gms_createdat ASC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/AttendanceFullDetails/:userid', async (req, res) => {
  const userid = decodeURIComponent(req.params.userid);
  try {
    const result = await db.query(`
      WITH user_attendance AS (
        SELECT 
          a.gms_userid,
          a.gms_name,
          a.gms_createdat::date AS date,
          a.gms_productionhours,
          a.gms_breakduration,
          a.gms_lateduration,
          a.gms_remarks,
          EXTRACT(EPOCH FROM a.gms_productionhours) AS total_seconds,
          EXTRACT(EPOCH FROM a.gms_breakduration) AS break_seconds,
          EXTRACT(EPOCH FROM a.gms_lateduration) AS late_seconds,
          u.adm_users_profileimage AS profile_image,
          u.adm_users_jobid AS job_id,
          u.adm_users_email AS email
        FROM public.gms_attendance_temp a
        LEFT JOIN public.adm_user_t u ON a.gms_userid = u.adm_users_id
        WHERE a.gms_userid = $1
      ),
      daily_summary AS (
        SELECT 
          date,
          total_seconds,
          break_seconds,
          late_seconds,
          CASE 
            WHEN total_seconds > 32400 THEN total_seconds - 32400
            ELSE 0
          END AS overtime_seconds
        FROM user_attendance
      ),
      today_record AS (
        SELECT * FROM user_attendance WHERE date = CURRENT_DATE LIMIT 1
      )
      SELECT 
        t.gms_name AS username,
        t.gms_userid AS user_id,
        t.profile_image,
        t.job_id,
        t.email,
        t.gms_productionhours AS production_hours_today,
        -- Aggregated durations
        ROUND(SUM(CASE WHEN ua.date = CURRENT_DATE THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_today,
        ROUND(SUM(CASE WHEN ua.date >= date_trunc('week', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_week,
        ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_month,
        ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN d.overtime_seconds ELSE 0 END) / 3600, 2) AS overtime_month,
        -- Today's breakdown
        ROUND((t.total_seconds - COALESCE(t.break_seconds, 0) - COALESCE(t.late_seconds, 0)) / 3600.0, 2) AS working_hours,
        ROUND((t.total_seconds - COALESCE(t.break_seconds, 0)) / 3600.0, 2) AS productive_hours,
        ROUND(t.break_seconds / 3600.0, 2) AS break_hours,
        ROUND(t.late_seconds / 3600.0, 2) AS late_hours,
        ROUND(CASE 
                WHEN t.total_seconds > 32400 THEN (t.total_seconds - 32400) / 3600.0
                ELSE 0
              END, 2) AS overtime_hours
      FROM user_attendance ua
      LEFT JOIN daily_summary d ON ua.date = d.date
      LEFT JOIN today_record t ON TRUE
      GROUP BY 
        t.gms_name, t.gms_userid, t.profile_image, t.job_id, t.email,
        t.gms_productionhours, t.break_seconds, t.late_seconds, t.total_seconds;
    `, [userid]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: 'No attendance record found for user.' });
    }
    res.status(200).json({
      username: row.username,
      userId: row.user_id,
      profileImage: row.profile_image,
      jobId: row.job_id,
      email: row.email,
      productionhours: row.production_hours_today,
      total_hours_today: row.total_hours_today,
      total_hours_week: row.total_hours_week,
      total_hours_month: row.total_hours_month,
      overtime_month: row.overtime_month,
      working_hours: row.working_hours,
      productive_hours: row.productive_hours,
      break_hours: row.break_hours,
      late_hours: row.late_hours,
      overtime_hours: row.overtime_hours
    });
  } catch (error) {
    console.error('Error fetching full attendance details:', error);
    res.status(500).json({ error: 'Failed to fetch attendance full details' });
  }
});
// WITH user_attendance AS (
//   SELECT 
//     a.gms_userid,
//     a.gms_name,
//     a.gms_createdat::date AS date,
//     a.gms_productionhours,
//     a.gms_breakduration,
//     a.gms_lateduration,
//     a.gms_remarks,
//     EXTRACT(EPOCH FROM a.gms_productionhours) AS total_seconds,
//     EXTRACT(EPOCH FROM a.gms_breakduration) AS break_seconds,
//     EXTRACT(EPOCH FROM a.gms_lateduration) AS late_seconds,
//     u.adm_users_profileimage AS profile_image,
//     u.adm_users_jobid AS job_id,
//     u.adm_users_email AS email
//   FROM public.gms_attendance_temp a
//   LEFT JOIN public.adm_user_t u ON a.gms_userid = u.adm_users_id
//   WHERE a.gms_userid = 46
// ),
// daily_overtime AS (
//   SELECT 
//     date,
//     CASE 
//       WHEN total_seconds > 32400 THEN total_seconds - 32400
//       ELSE 0
//     END AS overtime_seconds
//   FROM user_attendance
// ),
// monthly_overtime AS (
//   SELECT 
//     SUM(CASE 
//         WHEN total_seconds > 32400 THEN total_seconds - 32400
//         ELSE 0 
//     END) AS month_overtime_seconds
//   FROM user_attendance
//   WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
// ),
// today_record AS (
//   SELECT * FROM user_attendance WHERE date = CURRENT_DATE LIMIT 1
// )
// SELECT 
//   t.gms_name AS username,
//   t.gms_userid AS user_id,
//   t.profile_image,
//   t.job_id,
//   t.email,
//   -- Raw durations (interval)
//   TO_CHAR(t.gms_productionhours, 'HH24:MI:SS') AS production_hours_today,
//   TO_CHAR(t.gms_breakduration, 'HH24:MI:SS') AS break_duration,
//   TO_CHAR(t.gms_lateduration, 'HH24:MI:SS') AS late_duration,
//   -- Computed values formatted as HH:MI:SS
//   TO_CHAR(make_interval(secs => ROUND(t.late_seconds)), 'HH24:MI:SS') AS late_hours,
//   TO_CHAR(make_interval(secs => ROUND(t.total_seconds - COALESCE(t.break_seconds, 0) - COALESCE(t.late_seconds, 0))), 'HH24:MI:SS') AS working_hours,
//   TO_CHAR(make_interval(secs => ROUND(t.total_seconds - COALESCE(t.break_seconds, 0))), 'HH24:MI:SS') AS productive_hours,
//   TO_CHAR(make_interval(secs => ROUND(COALESCE(t.break_seconds, 0))), 'HH24:MI:SS') AS break_hours,
//   TO_CHAR(make_interval(secs => ROUND(CASE WHEN t.total_seconds > 32400 THEN (t.total_seconds - 32400) ELSE 0 END)), 'HH24:MI:SS') AS overtime_today,
//   -- Total durations for today, week, and month
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN ua.date = CURRENT_DATE THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_today,
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN ua.date >= date_trunc('week', CURRENT_DATE) AND ua.date <= CURRENT_DATE THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_week,
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_month,
//   -- Monthly overtime in HH:MI:SS
//   TO_CHAR(make_interval(secs => ROUND(COALESCE(m.month_overtime_seconds, 0))), 'HH24:MI:SS') AS overtime_this_month
// FROM user_attendance ua
// LEFT JOIN today_record t ON TRUE
// LEFT JOIN monthly_overtime m ON TRUE
// GROUP BY 
//   t.gms_name, t.gms_userid, t.profile_image, t.job_id, t.email,
//   t.gms_productionhours, t.gms_breakduration, t.gms_lateduration,
//   t.total_seconds, t.break_seconds, t.late_seconds, m.month_overtime_seconds;
////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/AttendanceDeltailsEMPTable/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = `
      SELECT 
          gms_name AS "Name",
          TO_CHAR(gms_createdat, 'YYYY-MM-DD') AS "createdDate",
          TO_CHAR(gms_checkin, 'HH24:MI:SS') AS "checkIn",
          gms_status AS status,
          TO_CHAR(gms_checkout, 'HH24:MI:SS') AS "checkOut",
          TO_CHAR(gms_breakduration, 'HH24:MI:SS') AS "break",
          TO_CHAR(gms_lateduration, 'HH24:MI:SS') AS "late",
          -- Overtime = productionHours - 8 hours (if > 0)
          CASE 
              WHEN gms_productionhours > INTERVAL '8 hours' 
              THEN TO_CHAR(gms_productionhours - INTERVAL '8 hours', 'HH24:MI:SS')
              ELSE '00:00:00'
          END AS "overtime",
          TO_CHAR(gms_productionhours, 'HH24:MI:SS') AS "productionHours"
      FROM 
          public.gms_attendance_temp
      WHERE 
          gms_userid = $1
      ORDER BY 
          gms_createdat DESC;
    `;
    const result = await db.query(query, [userId]);
    res.status(200).json({
      success: true,
      records: result.rows
    });
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records'
    });
  }
});
// Delete attendance record endpoint
app.delete('/AttendanceDeleteEMP/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `DELETE FROM public.gms_attendance_temp WHERE gms_userid = $1`,
      [id]
    );
    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
///////////////////////////////////////////////////////// Attendance Admin /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Attendance Emplayoees /////////////////////////////////////////////////////////
// Get employee profile data
app.get('/api/employee/profile', async (req, res) => {
  try {
    // Find the most recent attendance record for Bob Johnson
    const profileQuery = `
      SELECT 
          gms_userid, 
          gms_name, 
          gms_avatar AS "profileImage",
          gms_status,
          TO_CHAR(gms_checkin, 'HH12:MI AM') AS "lastPunchIn",
          TO_CHAR(COALESCE(gms_productionhours, '00:00:00'::interval), 'HH24.MI')::numeric AS "productionHours"
      FROM 
          public.gms_attendance_temp
      WHERE 
          gms_name = 'Bob Johnson'   
      ORDER BY 
          gms_createdat DESC
      LIMIT 1;
    `;
    const profileResult = await db.query(profileQuery);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const profile = profileResult.rows[0];
    // Check if user is currently punched in
    const isPunchedIn = profile.gms_status === 'Present' && !profile.gms_checkout;
    res.json({
      ...profile,
      isPunchedIn
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get timeline data. Full working version of /api/attendance/timeline endpoint with debug logs and fixes
app.get('/api/attendance/timeline', async (req, res) => {
  try {
    const userId = 'Bob Johnson'; // Hardcoded for example
    const todayDate = new Date().toISOString().split('T')[0];
    // Helper to convert 'HH:MM:SS' interval string to hours
    const intervalToHours = (interval) => {
      if (!interval) return 0;
      if (typeof interval === 'object') {
        const h = interval.hours || 0;
        const m = interval.minutes || 0;
        const s = interval.seconds || 0;
        return h + m / 60 + s / 3600;
      }
      if (typeof interval === 'string') {
        const parts = interval.split(':').map(Number);
        return (parts[0] || 0) + (parts[1] || 0) / 60 + (parts[2] || 0) / 3600;
      }
      return 0;
    };
    // Query to get today's attendance records
    const timelineQuery = `
      SELECT 
        gms_checkin,
        gms_checkout,
        gms_breakduration,
        gms_productionhours,
        gms_lateduration
      FROM 
        public.gms_attendance_temp
      WHERE 
        gms_name = $1
        AND DATE(gms_createdat) = CURRENT_DATE
      ORDER BY 
        gms_checkin ASC
    `;
    const result = await db.query(timelineQuery, [userId]);
    let workingHours = 0;
    let breakHours = 0;
    let overtime = 0;
    let segments = [];
    const today = new Date();
    const baseDate = today.toISOString().split('T')[0];
    if (result.rows.length > 0) {
      result.rows.forEach(record => {
        const checkinStr = record.gms_checkin;
        const checkoutStr = record.gms_checkout;
        const startTime = checkinStr ? new Date(`${baseDate}T${checkinStr}`) : null;
        const endTime = checkoutStr ? new Date(`${baseDate}T${checkoutStr}`) : null;
        const prodHours = intervalToHours(record.gms_productionhours);
        const brkHours = intervalToHours(record.gms_breakduration);
        workingHours += prodHours;
        breakHours += brkHours;
        if (prodHours > 8) overtime += prodHours - 8;
        // Debug log for each record
        console.log({
          checkinStr,
          checkoutStr,
          startTime,
          endTime,
          prodHours,
          brkHours
        });
        // Timeline segment calculation
        if (startTime && endTime) {
          const dayStart = new Date(startTime);
          dayStart.setHours(6, 0, 0, 0);
          const dayEnd = new Date(startTime);
          dayEnd.setHours(30, 0, 0, 0); // 6 AM next day
          const totalDuration = dayEnd - dayStart;
          const timelineStart = ((startTime - dayStart) / totalDuration) * 100;
          const timelineEnd = ((endTime - dayStart) / totalDuration) * 100;
          // Work segment
          segments.push({ start: timelineStart, end: timelineEnd, color: 'bg-green-500' });
          // Break segment (assume in middle of shift)
          if (brkHours > 0) {
            const totalHours = (endTime - startTime) / (1000 * 60 * 60);
            const workPortion = totalHours - brkHours;
            const breakStartTime = new Date(startTime.getTime() + workPortion * 0.5 * 60 * 60 * 1000);
            const breakEndTime = new Date(breakStartTime.getTime() + brkHours * 60 * 60 * 1000);
            const breakStart = ((breakStartTime - dayStart) / totalDuration) * 100;
            const breakEnd = ((breakEndTime - dayStart) / totalDuration) * 100;
            segments.push({ start: breakStart, end: breakEnd, color: 'bg-yellow-500' });
          }
          // Overtime segment
          if (prodHours > 8) {
            const overtimeStartTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);
            const overtimeStart = ((overtimeStartTime - dayStart) / totalDuration) * 100;
            segments.push({ start: overtimeStart, end: timelineEnd, color: 'bg-blue-500' });
          }
        }
      });
    }
    const productiveHours = workingHours * 0.8; // Simplified productivity estimate
    const timelineData = [
      { label: 'Working hours', value: `${workingHours.toFixed(1)}h`, color: 'text-gray-800', indicator: 'bg-gray-500' },
      { label: 'Productive Hours', value: `${productiveHours.toFixed(1)}h`, color: 'text-green-500', indicator: 'bg-green-500' },
      { label: 'Break hours', value: `${(breakHours * 60).toFixed(0)}m`, color: 'text-yellow-500', indicator: 'bg-yellow-500' },
      { label: 'Overtime', value: `${overtime.toFixed(1)}h`, color: 'text-blue-500', indicator: 'bg-blue-500' },
    ];
    res.json({
      summary: timelineData,
      segments: segments
    });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get summary statistics for dashboard cards
app.get('/api/attendance/summary', async (req, res) => {
  try {
    const userId = 'Bob Johnson'; // Hardcoded for example
    const now = new Date();
    // Today's hours
    const todayQuery = `
      SELECT 
        COALESCE(SUM(gms_productionhours), 0) as today_hours
      FROM 
        public.gms_attendance_temp
      WHERE 
        gms_name = $1
        AND DATE(gms_createdat) = CURRENT_DATE
    `;
    // This week's hours
    const weekQuery = `
      SELECT 
        COALESCE(SUM(gms_productionhours), 0) as week_hours
      FROM 
        public.gms_attendance_temp
      WHERE 
        gms_name = $1
        AND gms_createdat >= date_trunc('week', CURRENT_DATE)
        AND gms_createdat <= CURRENT_DATE
    `;
    // This month's hours
    const monthQuery = `
      SELECT 
        COALESCE(SUM(gms_productionhours), 0) as month_hours
      FROM 
        public.gms_attendance_temp
      WHERE 
        gms_name = $1
        AND gms_createdat >= date_trunc('month', CURRENT_DATE)
        AND gms_createdat <= CURRENT_DATE
    `;
    // Overtime this month
    const overtimeQuery = `
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN gms_productionhours > 8 THEN gms_productionhours - 8
            ELSE 0
          END
        ), 0) as overtime_hours
      FROM 
        public.gms_attendance_temp
      WHERE 
        gms_name = $1
        AND gms_createdat >= date_trunc('month', CURRENT_DATE)
        AND gms_createdat <= CURRENT_DATE
    `;
    // Execute all queries in parallel
    const [todayResult, weekResult, monthResult, overtimeResult] = await Promise.all([
      db.query(todayQuery, [userId]),
      db.query(weekQuery, [userId]),
      db.query(monthQuery, [userId]),
      db.query(overtimeQuery, [userId])
    ]);
    // Calculate percentage changes compared to previous periods
    // For simplicity, we're using hardcoded values for the trend percentages
    // In a real implementation, you would query previous periods and calculate the change
    const summaryCards = [
      {
        title: "Total Hours Today",
        value: todayResult.rows[0].today_hours.toString(),
        total: "9",
        color: "bg-orange-500",
        chartColor: "#F97316",
        trend: "+5% This Week",
        donutData: [parseFloat(todayResult.rows[0].today_hours), 9 - parseFloat(todayResult.rows[0].today_hours)],
      },
      {
        title: "Total Hours Week",
        value: weekResult.rows[0].week_hours.toString(),
        total: "40",
        color: "bg-gray-800",
        chartColor: "#1F2937",
        trend: "-2% Last Week",
        donutData: [parseFloat(weekResult.rows[0].week_hours), 40 - parseFloat(weekResult.rows[0].week_hours)],
      },
      {
        title: "Total Hours Month",
        value: monthResult.rows[0].month_hours.toString(),
        total: "168",
        color: "bg-blue-500",
        chartColor: "#3B82F6",
        trend: "+8% Last Month",
        donutData: [parseFloat(monthResult.rows[0].month_hours), 168 - parseFloat(monthResult.rows[0].month_hours)],
      },
      {
        title: "Overtime this Month",
        value: overtimeResult.rows[0].overtime_hours.toString(),
        total: "28",
        color: "bg-pink-500",
        chartColor: "#EC4899",
        trend: "+12% Last Month",
        donutData: [parseFloat(overtimeResult.rows[0].overtime_hours), 28 - parseFloat(overtimeResult.rows[0].overtime_hours)],
      },
    ];
    res.json(summaryCards);
  } catch (error) {
    console.error('Error fetching summary data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
///////////////////////////////////////////////////////// Attendance Emplayoees /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Complete Punch In and Punch Out with Utilities /////////////////////////////////////////////////////////
// ================== HELPER FUNCTIONS ==================
// Convert milliseconds to PostgreSQL interval format
function msToInterval(ms) {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
// Calculate total break time from punch logs
async function calculateBreakTime(userId, today) {
  try {
    // Get all punch logs for the day ordered by time
    const logs = await db.query(
      `SELECT gms_checkin_log, gms_checkout_log 
       FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 
       ORDER BY gms_createdat ASC`,
      [userId, today]
    );
    if (logs.rows.length <= 1) return '00:00:00';
    let totalBreakMs = 0;
    // Calculate break time between consecutive sessions
    for (let i = 0; i < logs.rows.length - 1; i++) {
      const currentCheckout = logs.rows[i].gms_checkout_log;
      const nextCheckin = logs.rows[i + 1].gms_checkin_log;
      if (currentCheckout && nextCheckin) {
        const checkoutTime = new Date(`${today}T${currentCheckout}`);
        const checkinTime = new Date(`${today}T${nextCheckin}`);
        const breakDuration = checkinTime - checkoutTime;
        if (breakDuration > 0) {
          totalBreakMs += breakDuration;
        }
      }
    }
    return msToInterval(totalBreakMs);
  } catch (error) {
    console.error('Error calculating break time:', error);
    return '00:00:00';
  }
}
// Calculate total production hours from all sessions
async function calculateProductionHours(userId, today) {
  try {
    const logs = await db.query(
      `SELECT gms_checkin_log, gms_checkout_log 
       FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 
       ORDER BY gms_createdat ASC`,
      [userId, today]
    );
    let totalProductionMs = 0;
    for (const log of logs.rows) {
      if (log.gms_checkin_log && log.gms_checkout_log) {
        const checkinTime = new Date(`${today}T${log.gms_checkin_log}`);
        const checkoutTime = new Date(`${today}T${log.gms_checkout_log}`);
        const sessionDuration = checkoutTime - checkinTime;
        if (sessionDuration > 0) {
          totalProductionMs += sessionDuration;
        }
      }
    }
    return msToInterval(totalProductionMs);
  } catch (error) {
    console.error('Error calculating production hours:', error);
    return '00:00:00';
  }
}
// ================== PUNCH IN ENDPOINT ==================

app.post('/AttendancePunchIn', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  try {
    // Get current IST time
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const nowTime = istTime.toTimeString().substring(0, 8);
    const nowISO = istTime.toISOString();
    // Attendance rules
    const scheduledStart = new Date(`${today}T09:30:00`);
    const lateLimit = new Date(`${today}T09:45:00`);
    const currentTime = new Date(`${today}T${nowTime}`);
    // Get user info
    const userRes = await db.query(
      'SELECT adm_users_firstname, adm_users_lastname FROM ADM_User_T WHERE adm_users_id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const userName = `${userRes.rows[0].adm_users_firstname} ${userRes.rows[0].adm_users_lastname}`;
    // Check if user has any incomplete session (not punched out)
    const openSession = await db.query(
      `SELECT * FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 AND gms_checkout_log IS NULL`,
      [userId, today]
    );
    if (openSession.rows.length > 0) {
      return res.status(400).json({ message: 'Already punched in. Please punch out first.' });
    }
    // Check if temp record exists for today
    const tempRecord = await db.query(
      `SELECT * FROM gms_attendance_temp WHERE gms_userid = $1 AND DATE(gms_createdat) = $2`,
      [userId, today]
    );
    // Determine status and late duration only for first punch-in of the day
    let status = 'Present';
    let lateDuration = '00:00:00';
    if (tempRecord.rows.length === 0) {
      // First punch-in of the day
      if (currentTime > scheduledStart && currentTime <= lateLimit) {
        status = 'Late Login';
        lateDuration = msToInterval(currentTime - scheduledStart);
      } else if (currentTime > lateLimit) {
        status = 'LOP';
        lateDuration = msToInterval(currentTime - scheduledStart);
      }
      // Create temp record
      await db.query(
        `INSERT INTO gms_attendance_temp (
          gms_userid, gms_name, gms_status, gms_checkin, gms_checkout,
          gms_breakduration, gms_lateduration, gms_productionhours,
          gms_createdat, gms_updatedat
        ) VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, $8)`,
        [
          userId,
          userName,
          status,
          nowTime,
          '00:00:00',
          lateDuration,
          '00:00:00',
          nowISO
        ]
      );
    } else {
      // Subsequent punch-in (after break)
      await db.query(
        `UPDATE gms_attendance_temp 
         SET gms_updatedat = $1 
         WHERE gms_userid = $2 AND DATE(gms_createdat) = $3`,
        [nowISO, userId, today]
      );
    }
    // Insert into log table
    await db.query(
      `INSERT INTO gms_attendance_log (
        gms_userid, gms_name_log, gms_checkin_log, gms_checkout_log,
        gms_createdat, gms_updatedat
      ) VALUES ($1, $2, $3, NULL, $4, $4)`,
      [userId, userName, nowTime, nowISO]
    );
    return res.status(201).json({
      message: `Punch-in recorded`,
      checkInTime: nowTime,
      status: status
    });
  } catch (err) {
    console.error('Punch In error:', err);
    res.status(500).json({ message: 'Punch In failed', error: err.message });
  }
});
// ================== PUNCH OUT ENDPOINT ==================

app.post('/AttendancePunchOut', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  try {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const nowTime = istTime.toTimeString().substring(0, 8);
    const nowISO = istTime.toISOString();
    const userRes = await db.query(
      'SELECT adm_users_firstname, adm_users_lastname FROM ADM_User_T WHERE adm_users_id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const userName = `${userRes.rows[0].adm_users_firstname} ${userRes.rows[0].adm_users_lastname}`;
    // Check for open session
    const openSession = await db.query(
      `SELECT * FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 AND gms_checkout_log IS NULL 
       ORDER BY gms_id DESC LIMIT 1`,
      [userId, today]
    );
    if (openSession.rows.length === 0) {
      return res.status(400).json({ message: 'No active session found. Please punch in first.' });
    }
    // Update the log with checkout time
    await db.query(
      `UPDATE gms_attendance_log
       SET gms_checkout_log = $1, gms_updatedat = $2
       WHERE gms_id = $3`,
      [nowTime, nowISO, openSession.rows[0].gms_id]
    );
    // Calculate updated totals
    const breakTime = await calculateBreakTime(userId, today);
    const productionHours = await calculateProductionHours(userId, today);
    // Get first check-in and update temp record
    const firstSession = await db.query(
      `SELECT gms_checkin_log FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 
       ORDER BY gms_createdat ASC LIMIT 1`,
      [userId, today]
    );
    const firstCheckin = firstSession.rows[0]?.gms_checkin_log;
    // Update temp record with latest checkout and calculated totals
    await db.query(
      `UPDATE gms_attendance_temp
       SET gms_checkout = $1, gms_breakduration = $2, gms_productionhours = $3, gms_updatedat = $4
       WHERE gms_userid = $5 AND DATE(gms_createdat) = $6`,
      [nowTime, breakTime, productionHours, nowISO, userId, today]
    );
    return res.status(200).json({
      message: 'Punch out recorded',
      checkOutTime: nowTime,
      breakTime: breakTime,
      productionHours: productionHours
    });
  } catch (err) {
    console.error('Punch Out error:', err);
    res.status(500).json({ message: 'Punch Out failed', error: err.message });
  }
});
// ================== ATTENDANCE STATUS ENDPOINT ==================

app.get('/AttendanceStatus/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
  try {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    // Check for open session
    const openSession = await db.query(
      `SELECT * FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2 AND gms_checkout_log IS NULL`,
      [userId, today]
    );
    const hasOpenSession = openSession.rows.length > 0;
    // Get temp record for status
    const tempRecord = await db.query(
      `SELECT gms_checkin, gms_checkout, gms_status, gms_productionhours
       FROM gms_attendance_temp
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2`,
      [userId, today]
    );
    if (tempRecord.rows.length === 0) {
      return res.json({
        isPunchedIn: false,
        isPunchedOut: false,
        status: 'not_started'
      });
    }
    const record = tempRecord.rows[0];
    let status = 'not_started';
    if (record.gms_status === 'Absent') {
      status = 'absent';
    } else if (hasOpenSession) {
      status = 'working';
    } else if (record.gms_checkin && record.gms_checkout) {
      status = 'finished';
    }
    return res.json({
      isPunchedIn: hasOpenSession,
      isPunchedOut: !hasOpenSession && !!record.gms_checkout,
      status,
      checkInTime: record.gms_checkin,
      checkOutTime: record.gms_checkout,
      productionHours: record.gms_productionhours
    });
  } catch (err) {
    console.error("Error fetching punch status:", err);
    res.status(500).json({ message: "Error fetching punch status", error: err.message });
  }
});
// ================== ATTENDANCE DETAILS ENDPOINT (Updated) ==================
// ================== ATTENDANCE SUMMARY ENDPOINT (Updated) ==================

app.get('/AttendanceStatusEMP', async (req, res) => {
  try {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const query = `
      SELECT 
        CASE 
          WHEN gms_status = 'Late Login' THEN 'Late Login'
          ELSE gms_status 
        END as status,
        COUNT(*) as count
      FROM (
        SELECT DISTINCT ON (gms_userid) gms_userid, gms_status
        FROM gms_attendance_temp
        WHERE DATE(gms_createdat) = $1
        ORDER BY gms_userid, gms_createdat DESC
      ) distinct_records
      GROUP BY status
    `;
    const result = await db.query(query, [today]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
});
// ================== DELETE ATTENDANCE ENDPOINT ==================

app.delete('/AttendanceDeleteEMP/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM gms_attendance_temp WHERE gms_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    // Also delete related log entries
    await db.query(
      'DELETE FROM gms_attendance_log WHERE gms_userid = $1 AND DATE(gms_createdat) = DATE($2)',
      [result.rows[0].gms_userid, result.rows[0].gms_createdat]
    );
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
  }
});
///////////////////////////////////////////////////////// End of Complete Code /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Module Start /////////////////////////////////////////////////////////
const current = new Date()
const Currdate = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
///////////////////////////////////////////////////////// Module Start /////////////////////////////////////////////////////////

app.get('/moduleload', (req, res) => {
  db.query(`SELECT *,
    CASE 
        WHEN "Module_Valid" IS TRUE THEN 'Active'
        WHEN "Module_Valid" IS FALSE THEN 'Inactive'
        ELSE 'Unknown' 
    END AS "Module_Valid_Converted"
     FROM public."GMS_Module" WHERE "Module_Application"='GMS' order by "Module_ID"desc `, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});


app.delete('/moduledlt/:id', (req, res) => {
  const ModID = req.params.id;
  console.log('/moduledlt/:id', ModID)
  db.query(`select a.* from public."GMS_Module" a, 
        public."GMS_Program" b
        where  b."Program_ModuleID" = a."Module_ID" and b."Program_Valid" = true and a."Module_ID" = $1 `, [ModID], (err, data) => {
    if (err) {
      console.log('query Error')
    } else {
      if ((data.rows).length >= 1) {
        return res.json({ Status: "Error", Error: "Child Record Present - Cannot be Deleted" });
      } else {
        db.query(`Delete FROM public."GMS_Module" where "Module_ID" = $1 AND "Module_Application"='GMS'`, [ModID], (error, result) => {
          if (error) {
            console.log('query Error')
          } else {
            return res.json({ Status: "Success" });
          }
        });
      }
    }
  })
});



app.post('/moduleadd/:createdby', (req, res) => {
  const createdby = req.params.createdby;
  console.log('/moduleadd/:createdby', req.body.Module_Code, req.body.Module_Name, req.body.Module_Valid, req.body.Module_Created_ON, createdby)
  db.query(`SELECT "Module_Code" FROM public."GMS_Module" WHERE trim(UPPER("Module_Code")) = trim(UPPER($1)) AND "Module_Application"='GMS'`, [req.body.Module_Code], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Module_Name" FROM public."GMS_Module" WHERE trim(UPPER("Module_Name")) = trim(UPPER($1)) AND "Module_Application"='GMS'`, [req.body.Module_Name], (err1, result1) => {
          if (err1) {
            console.log('error1');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`INSERT INTO public."GMS_Module"("Module_Code","Module_Name","Module_Valid","Module_Created_ON","Module_Created_BY","Module_Application") VALUES ($1,$2,$3,$4,$5,$6)`,
                [req.body.Module_Code, req.body.Module_Name, req.body.Module_Valid, Currdate, createdby, 'GMS'], (err, result) => {
                  if (err) {
                    console.log('error', err)
                    return res.json(err);
                  } else {
                    console.log("added")
                    return res.json("Added success");
                  }
                });
            }
          }
        })
      }
    }
  })
});


app.get('/module/:id', (req, res) => {
  const id = req.params.id;
  console.log('/module/:id', id);
  db.query(`select * from public."GMS_Module" where "Module_ID" = $1`, [id], (err, result) => {
    if (err) return res.json(err);
    return res.json(result.rows);
  });
});


app.put('/moduleedit/:modifiedby/:id', (req, res) => {
  const ModId = req.params.id;
  const modifiedby = req.params.modifiedby;
  console.log('/moduleedit/:modifiedby/:id', ModId, modifiedby);
  db.query(`SELECT "Module_Code" FROM public."GMS_Module" WHERE trim(UPPER("Module_Code")) = trim(UPPER($1))  AND "Module_ID" != $2 AND "Module_Application"='GMS'`, [req.body.Module_Code, ModId], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Module_Name" FROM public."GMS_Module" WHERE trim(UPPER("Module_Name")) = trim(UPPER($1)) and "Module_ID" != $2 AND "Module_Application"='GMS'`, [req.body.Module_Name, ModId], (err1, result1) => {
          if (err1) {
            console.log('error2');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`update public."GMS_Module" set "Module_Code" = $1,"Module_Name"=$2,"Module_Valid"=$3,"Module_Modified_BY"=$4,"Module_Modified_ON"=$5 ,"Module_Application"=$6 where "Module_ID" = $7`,
                [req.body.Module_Code, req.body.Module_Name, req.body.Module_Valid, modifiedby, Currdate, 'GMS', ModId], (err, result) => {
                  if (err) {
                    return res.json({ Message: "error" })
                  } else {
                    return res.json(result);
                  }
                })
            }
          }
        }
        )
      }
    }
  })
});
//////------------------ Module Ends Here------------------------------///////
//////------------------ Program Starts Here------------------------------///////

app.get('/programload', (req, res) => {
  console.log('/program')
  db.query(`SELECT *,
     CASE 
        WHEN "Program_Valid" IS TRUE THEN 'Active'
        WHEN "Program_Valid" IS FALSE THEN 'Inactive'
        ELSE 'Unknown' 
    END AS "Program_Valid_Converted"  FROM public."programmodule_vw" where "Module_Application"='GMS' order by "Program_ID" desc`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.delete('/programdlt/:id', (req, res) => {
  const ProgID = req.params.id;
  console.log('/programdlt/:id', ProgID);
  db.query(`select a.* from public."GMS_Program" a, 
        public."GMS_Roleprograms" b
        where  b."RolePrograms_ProgramID" = a."Program_ID" 
    and b."RolePrograms_Valid" = true and a."Program_ID" = $1`, [ProgID], (err, data) => {
    if (err) {
      console.log('query Error')
    } else {
      if ((data.rows).length >= 1) {
        return res.json({ Status: "Error", Error: "Child Record Present - Cannot be Deleted" });
      } else {
        db.query(`Delete FROM public."GMS_Program" where "Program_ID" = $1`, [ProgID])
      }
    }
  })
});


app.post('/programadd/:createdby', (req, res) => {
  const createdby = req.params.createdby
  console.log("/programadd/:createdby", req.body.Program_Code, req.body.Program_Name, req.body.Program_ModuleID, req.body.Program_Valid, Currdate, createdby, req.body.Program_Nav_Name)
  db.query(`SELECT "Program_Code" FROM public."GMS_Program" WHERE trim(UPPER("Program_Code")) = trim(UPPER($1)) AND  "Program_ModuleID" =$2`, [req.body.Program_Code, req.body.Program_ModuleID], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Program_Name" FROM public."GMS_Program" WHERE trim(UPPER("Program_Name")) = trim(UPPER($1)) AND  "Program_ModuleID" =$2 `, [req.body.Program_Name, req.body.Program_ModuleID], (err1, result1) => {
          if (err1) {
            console.log('error2');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`SELECT "Program_Nav_Name" FROM public."GMS_Program" WHERE trim(UPPER("Program_Nav_Name")) = trim(UPPER($1)) AND  "Program_ModuleID" =$2`, [req.body.Program_Nav_Name, req.body.Program_ModuleID], (err1, result1) => {
                if (err1) {
                  console.log('error2');
                  return res.json(err1);
                } else {
                  if (result1.rows.length > 0) {
                    return res.json({ message: 'Display Name already exists' });
                  } else {
                    db.query(`INSERT INTO public."GMS_Program"("Program_Code", "Program_Name", "Program_Valid", "Program_Created_ON", "Program_Created_BY", "Program_ModuleID", "Program_Nav_Name")
                    VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                      [req.body.Program_Code, req.body.Program_Name, req.body.Program_Valid, Currdate, createdby, req.body.Program_ModuleID, req.body.Program_Nav_Name.trim()], (err, result) => {
                        if (err) {
                          console.log('error')
                          return res.json(err);
                        } else {
                          db.query(`INSERT INTO public."GMS_WorkflowProgram"
                          ("WorkflowProgram_ProgramID", "Businessunit_ID", "Organisation_ID",
                          "WorkflowProgram_ModuleID", "WorkflowProgram_ProgramCode",
                          "WorkflowProgram_ProgramName", "WorkflowProgram_Valid", "WorkflowProgram_WorkflowRequired")
                        SELECT DISTINCT p."Program_ID",  wp."Businessunit_ID",  wp."Organisation_ID", p."Program_ModuleID",
                         p."Program_Code", p."Program_Nav_Name",p."Program_Valid", false
                         FROM public."GMS_Program" p
                         CROSS JOIN 
                         (SELECT DISTINCT "Businessunit_ID", "Organisation_ID" 
                        FROM public."GMS_WorkflowProgram") wp
                        WHERE 
                        NOT EXISTS (
                        SELECT 1
                        FROM public."GMS_WorkflowProgram" existing_wp
                        WHERE p."Program_ID" = existing_wp."WorkflowProgram_ProgramID"
                          AND wp."Businessunit_ID" = existing_wp."Businessunit_ID"
                          AND wp."Organisation_ID" = existing_wp."Organisation_ID");`, (err1, result1) => {
                            if (err1) {
                              console.log('error2');
                              return res.json(err1);
                            } else {
                              return res.json("Added success");
                            }
                          })
                        }
                      });
                  }
                }
              })
            }
          }
        })
      }
    }
  })
});


app.get('/program/:id', (req, res) => {
  const id = req.params.id;
  console.log("/program/:id", id);
  db.query(`select * from public."GMS_Program" where "Program_ID" = $1`, [id], (err, result) => {
    if (err) return res.json(err);
    return res.json(result.rows);
  });
});



app.put('/programedit/:modifiedby/:id', (req, res) => {
  const ProgId = req.params.id;
  const modifiedby = req.params.modifiedby;
  console.log("/programedit/:modifiedby/:id", req.body.Program_Code, req.body.Program_Name, req.body.Program_ModuleID, req.body.Program_Valid, modifiedby, Currdate, req.body.Program_Nav_Name, ProgId)
  db.query(`SELECT "Program_Code" FROM public."GMS_Program" WHERE trim(UPPER("Program_Code")) = trim(UPPER($1))  AND  "Program_ModuleID" = $2 AND "Program_ID" != $3`, [req.body.Program_Code, req.body.Program_ModuleID, ProgId], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Program_Name" FROM public."GMS_Program" WHERE trim(UPPER("Program_Name")) = trim(UPPER($1)) AND  "Program_ModuleID" = $2 and "Program_ID" != $3`, [req.body.Program_Name, req.body.Program_ModuleID, ProgId], (err1, result1) => {
          if (err1) {
            console.log('error2');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`SELECT "Program_Nav_Name" FROM public."GMS_Program" WHERE trim(UPPER("Program_Nav_Name")) = trim(UPPER($1)) AND  "Program_ModuleID" = $2 and "Program_ID" != $3`, [req.body.Program_Nav_Name, req.body.Program_ModuleID, ProgId], (err1, result1) => {
                if (err1) {
                  console.log('error2');
                  return res.json(err1);
                } else {
                  if (result1.rows.length > 0) {
                    return res.json({ message: 'Display Name already exists' });
                  } else {
                    db.query(`update public."GMS_Program" set "Program_Code" = $1, "Program_Name" = $2, "Program_ModuleID" = $3, "Program_Valid" = $4, "Program_Modified_BY" = $5, "Program_Modified_ON" = $6, "Program_Nav_Name" = $7 Where "Program_ID" = $8`,
                      [req.body.Program_Code, req.body.Program_Name, req.body.Program_ModuleID, req.body.Program_Valid, modifiedby, Currdate, req.body.Program_Nav_Name.trim(), ProgId], (err, result) => {
                        if (err) {
                          return res.json({ Message: "error" })
                        } else {
                          return res.json(result);
                        }
                      })
                  }
                }
              })
            }
          }
        })
      }
    }
  })
});



app.get('/moduleactive', (req, res) => {
  db.query(`SELECT * FROM public."GMS_Module" where "Module_Valid" = true and "Module_Application" = 'GMS' order by "Module_ID"`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
//////------------------ Program Ends Here------------------------------///////
//////------------------ Roles Starts Here------------------------------///////



app.get('/rolesload', (req, res) => {
  db.query(`SELECT *,
    CASE 
        WHEN "Roles_Status" IS TRUE THEN 'Active'
        WHEN "Roles_Status" IS FALSE THEN 'Inactive'
        ELSE 'Unknown' 
    END AS "Roles_Status_Converted" FROM public."GMS_Roles" Where "Roles_Application" ='GMS' order by "Roles_ID" desc`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.delete('/rolesdlt/:id', (req, res) => {
  const RoleID = req.params.id;
  console.log('/rolesdlt/:id', RoleID);
  db.query(`select a.* from public."GMS_Roles" a,
        public."GMS_Roleprograms" b
        where  b."RolePrograms_RoleID" = a."Roles_ID" and b."RolePrograms_Valid" = true and a."Roles_ID" = $1 `, [RoleID], (err, data) => {
    if (err) {
      console.log('query Error1')
    } else {
      if ((data.rows).length >= 1) {
        return res.json({ Status: "Error", Error: "Child Record Present - Cannot be Deleted" });
      } else {
        db.query(`Delete FROM public."GMS_Roles" where "Roles_ID" = $1`, [RoleID], (error, result) => {
          if (error) {
            console.log('query Error')
          } else {
            return res.json({ Status: "Success" });
          }
        });
      }
    }
  })
});


app.post('/rolesadd', (req, res) => {
  const name = req.body.Roles_RoleName
  const code = req.body.Roles_Code
  console.log('/rolesadd', req.body.Roles_Code, req.body.Roles_RoleName, req.body.Roles_Status, req.body.Roles_Created_BY, req.body.Roles_Application)
  db.query(`SELECT "Roles_Code" FROM public."GMS_Roles" WHERE trim(UPPER("Roles_Code")) = trim(UPPER($1))  AND "Roles_Application" ='GMS'`, [code], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Roles_RoleName" FROM public."GMS_Roles" WHERE trim(UPPER("Roles_RoleName")) = trim(UPPER($1)) AND "Roles_Application" ='GMS'`, [name], (err1, result1) => {
          if (err1) {
            console.log('error2');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`INSERT INTO public."GMS_Roles"("Roles_Code", "Roles_RoleName","Roles_Status","Roles_Created_ON", "Roles_Created_BY","Roles_Application") Values($1,$2,$3,$4,$5,$6)`,
                [req.body.Roles_Code, req.body.Roles_RoleName, req.body.Roles_Status, Currdate, req.body.Roles_Created_BY, 'GMS'], (err, result) => {
                  if (err) {
                    console.log('error3')
                    return res.json(err);
                  } else {
                    return res.json("Added success");
                  }
                });
            }
          }
        })
      }
    }
  })
});




app.get('/roles/:id', (req, res) => {
  const id = req.params.id;
  console.log('/roles/:id', id);
  db.query(`select * from public."GMS_Roles" where "Roles_ID" = $1`, [id], (err, result) => {
    if (err) return res.json(err);
    return res.json(result.rows);
  });
});


app.put('/rolesedit/:id', (req, res) => {
  const RoleId = req.params.id;
  const name = req.body.Roles_RoleName
  const code = req.body.Roles_Code
  console.log('/rolesedit/:id', req.body.Roles_Code, req.body.Roles_RoleName, req.body.Roles_Status, req.body.Roles_Modified_BY, Currdate, req.body.Roles_Application, RoleId)
  db.query(`SELECT "Roles_Code" FROM public."GMS_Roles" WHERE trim(UPPER("Roles_Code")) = trim(UPPER($1)) AND "Roles_Application" ='GMS' AND "Roles_ID" != $2`, [code, RoleId], (err1, result1) => {
    if (err1) {
      console.log('error1');
      return res.json(err1);
    } else {
      if (result1.rows.length > 0) {
        return res.json({ message: 'Code already exists' });
      } else {
        db.query(`SELECT "Roles_RoleName" FROM public."GMS_Roles" WHERE trim(UPPER("Roles_RoleName")) = trim(UPPER($1)) AND "Roles_Application" ='GMS' AND "Roles_ID" != $2`, [name, RoleId], (err1, result1) => {
          if (err1) {
            console.log('error2');
            return res.json(err1);
          } else {
            if (result1.rows.length > 0) {
              return res.json({ message: 'Name already exists' });
            } else {
              db.query(`update public."GMS_Roles" set "Roles_Code" = $1,"Roles_RoleName"=$2,"Roles_Status"=$3,"Roles_Modified_BY"=$4,"Roles_Modified_ON"=$5, "Roles_Application"=$6 Where "Roles_ID" = $7`,
                [req.body.Roles_Code, req.body.Roles_RoleName, req.body.Roles_Status, req.body.Roles_Modified_BY, Currdate, req.body.Roles_Application, RoleId], (err, result) => {
                  if (err) {
                    console.log('error3');
                    return res.json({ Message: "error3" })
                  } else {
                    return res.json(result);
                  }
                });
            }
          }
        })
      }
    }
  })
});





app.get('/rolecodecheck/:code', (req, res) => {
  //  console.log('insert')
  var code = req.params.code;
  console.log('/rolecodecheck/:code', code);
  db.query(`SELECT * FROM public."GMS_Roles" where  substring("Roles_Code",1,3)=$1`, [code], (error, results) => {
    console.log(res)
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      if ((results.rows).length >= 1) {
        //console.log(code.toString())
        console.log("Available")
        return res.json({ Status: "Available" });
      } else {
        console.log("NotAvailable")
        //console.log(code)
        return res.json({ Status: "NotAvailable" });
      }
    }
  });
  //console.log(code.toString())
});




app.get('/rolecodemaxnum/:code', (req, res) => {
  //  console.log('insert')
  var code = req.params.code;
  console.log('/rolecodemaxnum/:code', code);
  db.query(`select max(TO_NUMBER(substring("Roles_Code",4,2),'99')) as codemaxnum from public."GMS_Roles" where substring("Roles_Code",1,3) = $1`, [code], (error, results) => {
    console.log(res)
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
  //console.log(code.toString())
});
//////------------------ Roles Ends Here------------------------------///////
//////------------------ RoleProgram Starts Here------------------------------///////


app.get('/roleprorole/:bu/:ou', (req, res) => {
  console.log('/roleprorole/:bu/:ou', BU, OU);
  db.query(`SELECT * FROM public."GMS_Roles" where "Roles_Status" = $1 AND "Businessunit_ID" = $2 and "Organisation_ID" = $3`, [true, BU, OU], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
      console.log(results.rows)
    }
  });
});


app.get('/rolepromodule', (req, res) => {
  console.log('/rolepromodule')
  db.query(`SELECT * FROM public."GMS_Module" WHERE "Module_Valid" = 'true' AND "Module_Application"='GMS' order by "Module_ID"`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.get('/roleproprogram/:modid', (req, res) => {
  const modid = req.params.modid
  console.log('/roleproprogram/:modid', modid);
  db.query(`select * from public."GMS_Program" where "Program_ModuleID" = $1 AND "Program_Valid" =$2 `, [modid, true], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
      console.log(results.rows, 'twfsfxfhg')
    }
  });
});



app.get('/progavail/:roleid/:modid', (req, res) => {
  const roleid = req.params.roleid
  const modid = req.params.modid
  console.log('/progavail/:roleid/:modid', roleid, modid)
  db.query(`select "RolePrograms_ID","RolePrograms_StatusCheck" From  public."GMS_Roleprograms"
      Where "RolePrograms_RoleID" =$1 AND "RolePrograms_Module_ID" =$2`, [roleid, modid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      if ((results.rows).length >= 1) {
        console.log("Available")
        return res.json({ Status: "Available" })
      } else {
        console.log("not Available")
        return res.json({ Status: "NotAvailable" })
      }
    }
  });
});


app.post('/findprogid/:roleid/:modid', (req, res) => {
  const roleid = req.params.roleid
  const modid = req.params.modid
  console.log('/findprogid/:roleid/:modid', roleid, modid);
  db.query(`select "RolePrograms_ID","RolePrograms_StatusCheck" From  public."GMS_Roleprograms"
      Where "RolePrograms_RoleID" =$1 AND "RolePrograms_Module_ID" =$2`, [roleid, modid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      console.log(results.rows)
      return res.json(results.rows)
    }
  });
});


app.get('/roleprodefault/:roleid/:modid', (req, res) => {
  const roleid = req.params.roleid
  const modid = req.params.modid
  console.log('/roleprodefault/:roleid/:modid', roleid, modid)
  db.query(`select "RolePrograms_ProgramID","RolePrograms_StatusCheck" From  public."GMS_Roleprograms"
      Where  "RolePrograms_RoleID" =$1 AND "RolePrograms_Module_ID" =$2`, [roleid, modid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      console.log(results.rows)
      res.json(results.rows);
    }
  });
});




app.post('/roleproadd/:proid/:check', (req, res) => {
  const createdby = req.params.createdby;
  const proid = req.params.proid;
  const check = req.params.check === 'true';
  const roleid = req.body.RolePrograms_RoleID;
  const modid = req.body.RolePrograms_Module_ID;
  console.log('/roleproadd/:proid/:check', proid, check, roleid, modid, req.body.RolePrograms_Created_BY)
  db.query(`SELECT * FROM public."GMS_Roleprograms" WHERE "RolePrograms_RoleID" = $1 AND "RolePrograms_Module_ID" = $2 AND "RolePrograms_ProgramID" =$3`, [roleid, modid, proid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err });
    }
    if (result.rows.length > 0) {
      const existingRecord = result.rows[0];
      const oldUserRoleStatusCheck = existingRecord.RolePrograms_StatusCheck;
      if (!check && oldUserRoleStatusCheck) {
        db.query(`DELETE FROM public."GMS_Roleprograms" WHERE  "RolePrograms_RoleID" = $1 AND "RolePrograms_Module_ID" = $2 AND "RolePrograms_ProgramID" =$3`, [roleid, modid, proid],
          (error1, result1) => {
            if (error1) {
              console.error(error1);
              return res.status(500).json({ error1 });
            }
            console.log(result1.rows);
            return res.json("Deleted existing record");
          }
        );
      } else if (check && !oldUserRoleStatusCheck) {
        db.query(`INSERT INTO public."GMS_Roleprograms"("RolePrograms_RoleID", "RolePrograms_Module_ID", "RolePrograms_ProgramID", "RolePrograms_StatusCheck", "RolePrograms_Valid", "RolePrograms_Created_BY", "RolePrograms_Created_ON") VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [roleid, modid, proid, check, true, req.body.RolePrograms_Created_BY, Currdate], (error2, result2) => {
            if (error2) {
              console.error(error2);
              return res.status(500).json({ error2 });
            }
            console.log(result2.rows);
            return res.json("Added success");
          }
        );
      } else {
        return res.json("No change needed");
      }
    } else {
      if (check) {
        db.query(`INSERT INTO public."GMS_Roleprograms"("RolePrograms_RoleID", "RolePrograms_Module_ID", "RolePrograms_ProgramID", "RolePrograms_StatusCheck", "RolePrograms_Valid", "RolePrograms_Created_BY", "RolePrograms_Created_ON") VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [roleid, modid, proid, check, true, req.body.RolePrograms_Created_BY, Currdate],
          (error3, result3) => {
            if (error3) {
              console.error(error3);
              return res.status(500).json({ error3 });
            }
            console.log(result3.rows);
            return res.json("Added success");
          }
        );
      } else {
        return res.json("No change needed");
      }
    }
  }
  );
});
//////------------------ RoleProgram Ends Here------------------------------///////
//////------------------  Userrole Starts Here------------------------------///////

app.get('/userrole', (req, res) => {
  console.log('/userrole')
  db.query(`SELECT * FROM public."userrole_vw" order by "UserRole_ID"`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});


app.get('/userroledefault/:roleid', (req, res) => {
  const roleid = req.params.roleid
  console.log('/userroledefault/:roleid', roleid);
  db.query(`select "User_ID","UserRole_StatusCheck" From  public."GMS_UserRoles"
    Where "Role_ID" =$1`, [roleid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});


app.get('/useravail/:roleid', (req, res) => {
  const roleid = req.params.roleid
  console.log('/useravail/:roleid/', roleid)
  db.query(`select "User_ID","UserRole_StatusCheck" From  public."GMS_UserRoles"
      Where "Role_ID" =$1`, [roleid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      if ((results.rows).length >= 1) {
        console.log("Available")
        return res.json({ Status: "Available" })
      } else {
        console.log("not Available")
        return res.json({ Status: "NotAvailable" })
      }
    }
  });
});


app.post('/finduserid/:roleid', (req, res) => {
  const roleid = req.params.roleid
  console.log('finduserid', roleid)
  db.query(`select "User_ID","UserRole_StatusCheck" From  public."GMS_UserRoles"
      Where "Role_ID" =$1`, [roleid], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      console.log(results.rows)
      return res.json(results.rows)
    }
  });
});




app.get('/userroleroles', (req, res) => {
  console.log('/userroleroles')
  db.query(`SELECT * FROM public."GMS_Roles" where "Roles_Status" = $1 AND "Roles_Application"='GMS'`, [true], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
      console.log(results.rows)
    }
  });
});



app.get('/userroleuser', (req, res) => {
  console.log('/userroleuser')
  db.query(`SELECT 
      adm_users_id      AS "Users_ID",
      adm_users_loginid AS "Users_LoginID",
      adm_users_email   AS "Users_Email",
      adm_users_mobile::text AS "Users_Mobile",
      adm_users_deptid  AS "Users_DeptID",
      adm_users_islocked AS "Users_IsLocked"
    FROM public.adm_user_t
    WHERE adm_users_islocked = $1;
`, [false], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
      console.log(results.rows)
    }
  });
});


app.post('/userroleadd/:userid/:check', (req, res) => {
  const userid = req.params.userid;
  const check = req.params.check === 'true';
  const roleid = req.body.Role_ID
  console.log('/userroleadd/:userid/:check', roleid, userid, true, Currdate, req.body.created_by, check)
  db.query(`SELECT * FROM public."GMS_UserRoles" WHERE "Role_ID" = $1 AND "User_ID" = $2`, [roleid, userid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ err });
    }
    if (result.rows.length > 0) {
      const existingRecord = result.rows[0];
      const oldUserRoleStatusCheck = existingRecord.UserRole_StatusCheck;
      if (!check && oldUserRoleStatusCheck) {
        db.query(`DELETE FROM public."GMS_UserRoles" WHERE  "Role_ID" = $1 AND "User_ID" = $2`, [roleid, userid],
          (error1, result1) => {
            if (error1) {
              console.error(error1);
              return res.status(500).json({ error1 });
            }
            console.log(result1.rows);
            return res.json("Deleted existing record");
          }
        );
      } else if (check && !oldUserRoleStatusCheck) {
        db.query(`INSERT INTO public."GMS_UserRoles"("Role_ID", "User_ID", "UserRole_Status", "created_on", "created_by", "UserRole_StatusCheck") VALUES($1, $2, $3, $4, $5, $6)`,
          [roleid, userid, true, Currdate, req.body.created_by, check], (error2, result2) => {
            if (error2) {
              console.log('error2');
              return res.status(500).json({ error2 });
            }
            console.log(result2.rows);
            return res.json("Added success");
          }
        );
      } else {
        return res.json("No change needed");
      }
    } else {
      if (check) {
        db.query(`INSERT INTO public."GMS_UserRoles"("Role_ID", "User_ID", "UserRole_Status", "created_on", "created_by", "UserRole_StatusCheck") VALUES($1, $2, $3, $4, $5, $6)`,
          [roleid, userid, true, Currdate, req.body.created_by, check],
          (error3, result3) => {
            if (error3) {
              console.log('error3' + error3);
              return res.status(500).json({ error3 });
            }
            console.log(result3.rows);
            return res.json("Added success");
          }
        );
      } else {
        return res.json("No change needed");
      }
    }
  }
  );
});
//////------------------  Userrole Ends Here------------------------------///////
///---------------------User Role View Starts Here------------------------------//


app.get('/UserRoleView', (req, res) => {
  console.log('/UserRoleView')
  db.query(`select * FROM public.userrole_vw_new Where "Roles_Application"='GMS' order by "Users_LoginID"`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});


app.get('/UserLoginID', (req, res) => {
  console.log('/UserLoginID')
  db.query(`select Distinct "Users_LoginID" FROM public."GMS_User" order by "Users_LoginID"`, (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});

app.get('/userrole_filter/:login', (req, res) => {
  const LoginID = req.params.login
  console.log('/userrole_filter/:login', LoginID)
  db.query(`select * FROM public.userrole_vw where "Users_LoginID" = $1`, [LoginID], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
///---------------------User Role View Ends Here------------------------------//
/* ------------------------------- LoggedIn Page Starts Here    -------------------------------------- */



app.get('/programnavmas/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavmas/:role', role);
  db.query(` SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='MAS' AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.get('/programnavtrn/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavtrn/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='TRN' AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.get('/programnavvws/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavvws/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='VWS' AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});



app.get('/programnavadm/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavadm/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='ADM' AND a."RolePrograms_StatusCheck" = 'true'
       AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});


app.get('/programnavwfo/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavwfo/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='WFL' AND a."RolePrograms_StatusCheck" = 'true'
      AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});




app.get('/programnavexp/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavexp/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='EXP' AND a."RolePrograms_StatusCheck" = 'true'
       AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});

app.get('/programnavimp/:role', (req, res) => {
  const role = req.params.role
  console.log('/programnavimp/:role', role);
  db.query(`SELECT * FROM public."roleprogramroleprograme_vw" a
      join "GMS_Program" b on b."Program_ID" = a."RolePrograms_ProgramID"
      join "GMS_Module" c on c."Module_ID" = b."Program_ModuleID"
      where  c."Module_Code" ='IMP' AND a."RolePrograms_StatusCheck" = 'true'
       AND a."Roles_RoleName" = $1 and c."Module_Application"= 'GMS' AND a."Roles_Application" ='GMS' order by a."Program_ID" asc`, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// For OPE module
app.get('/programnavope/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavope/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'OPR' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
// For VISI module
app.get('/programnavvisi/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavvisi/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'VISI' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
// For LVE module
app.get('/programnavlve/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavlve/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'LVE' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
// For MMM module
app.get('/programnavmmm/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavmmm/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'MMM' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
// For ATT module
app.get('/programnavatt/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavatt/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'ATT' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
// For SETP module
app.get('/programnavsetp/:role', (req, res) => {
  const role = req.params.role;
  console.log('/programnavsetp/:role', role);
  db.query(`
    SELECT * FROM public."roleprogramroleprograme_vw" a
    JOIN "GMS_Program" b ON b."Program_ID" = a."RolePrograms_ProgramID"
    JOIN "GMS_Module" c ON c."Module_ID" = b."Program_ModuleID"
    WHERE c."Module_Code" = 'SETP' 
      AND a."RolePrograms_StatusCheck" = 'true' 
      AND a."Roles_RoleName" = $1 
      AND c."Module_Application" = 'GMS' 
      AND a."Roles_Application" = 'GMS' 
    ORDER BY a."Program_ID" ASC
  `, [role], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error });
    } else {
      res.json(results.rows);
    }
  });
});
/* ---------------------------------------     Loggedin page ends here    ------------------------------------------------- */
/* ---------------------------------------     Vehicle APIs    ------------------------------------------------- */
// Get All Vehicle Entries
app.get('/vehicle-entry', (req, res) => {
  const fetchQuery = 'SELECT * FROM public."GMS_LogVehicleEntry" ORDER BY "GMS_id" DESC';
  db.query(fetchQuery, (err, result) => {
    if (err) {
      console.error("Error fetching all vehicle entries:", err);  // Log to terminal
      return res.status(500).json({ error: 'Database fetch error', details: err });
    }
    return res.status(200).json(result.rows);
  });
});
// Get Single Vehicle Entry
app.get('/Editvehicle-entry/:id', (req, res) => {
  const id = req.params.id;
  const fetchQuery = 'SELECT * FROM public."GMS_LogVehicleEntry" WHERE "GMS_id" = $1';
  db.query(fetchQuery, [id], (err, result) => {
    if (err) {
      console.error(`Error fetching vehicle entry with ID ${id}:`, err);
      return res.status(500).json({ error: 'Database fetch error', details: err });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle entry not found' });
    }
    return res.status(200).json(result.rows[0]);
  });
});
// Create New Vehicle Entry
app.post('/AddNewvehicle-entry', async (req, res) => {
  const {
    GMS_vehicle_number,
    GMS_driver_name,
    GMS_driver_contact_number,
    GMS_vehicle_type,
    GMS_purpose_of_entry,
    GMS_entry_time,
    GMS_expected_exit_time,
    GMS_status,
    GMS_security_check,
    GMS_attachments
  } = req.body;
  const requiredFields = [
    'GMS_vehicle_number',
    'GMS_driver_name',
    'GMS_vehicle_type',
    'GMS_purpose_of_entry',
    'GMS_entry_time',
    'GMS_status'
  ];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    console.warn("Missing required fields on insert:", missingFields);
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }
  const insertQuery = `
    INSERT INTO public."GMS_LogVehicleEntry" (
      "GMS_vehicle_number", "GMS_driver_name", "GMS_driver_contact_number", 
      "GMS_vehicle_type", "GMS_purpose_of_entry", "GMS_entry_time", 
      "GMS_expected_exit_time", "GMS_status", "GMS_security_check", "GMS_attachments", "GMS_out_time"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  try {
    const result = await db.query(insertQuery, [
      GMS_vehicle_number,
      GMS_driver_name,
      GMS_driver_contact_number || null,
      GMS_vehicle_type,
      GMS_purpose_of_entry,
      GMS_entry_time,
      GMS_expected_exit_time || null,
      GMS_status,
      GMS_security_check || 'Pending',
      GMS_attachments || '[]',
      null
    ]);
    return res.status(201).json({
      message: 'Vehicle entry created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error inserting vehicle entry:", err);  // Log to terminal
    return res.status(500).json({
      error: 'Database insert error',
      details: err.message
    });
  }
});
// Update Vehicle Entry
app.put('/Editvehicle-entry/:id', async (req, res) => {
  const id = req.params.id;
  const {
    GMS_vehicle_number,
    GMS_driver_name,
    GMS_driver_contact_number,
    GMS_vehicle_type,
    GMS_purpose_of_entry,
    GMS_entry_time,
    GMS_expected_exit_time,
    GMS_status,
    GMS_security_check
  } = req.body;
  const checkQuery = 'SELECT * FROM public."GMS_LogVehicleEntry" WHERE "GMS_id" = $1';
  try {
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle entry not found' });
    }
    const updateQuery = `
      UPDATE public."GMS_LogVehicleEntry"
      SET 
        "GMS_vehicle_number" = $1,
        "GMS_driver_name" = $2,
        "GMS_driver_contact_number" = $3,
        "GMS_vehicle_type" = $4,
        "GMS_purpose_of_entry" = $5,
        "GMS_entry_time" = $6,
        "GMS_expected_exit_time" = $7,
        "GMS_status" = $8,
        "GMS_security_check" = $9,
        "GMS_out_time" = NOW(),
        "updated_at" = NOW()
      WHERE "GMS_id" = $10
      RETURNING *
    `;
    const result = await db.query(updateQuery, [
      GMS_vehicle_number || checkResult.rows[0].GMS_vehicle_number,
      GMS_driver_name || checkResult.rows[0].GMS_driver_name,
      GMS_driver_contact_number || checkResult.rows[0].GMS_driver_contact_number,
      GMS_vehicle_type || checkResult.rows[0].GMS_vehicle_type,
      GMS_purpose_of_entry || checkResult.rows[0].GMS_purpose_of_entry,
      GMS_entry_time || checkResult.rows[0].GMS_entry_time,
      GMS_expected_exit_time || checkResult.rows[0].GMS_expected_exit_time,
      GMS_status || checkResult.rows[0].GMS_status,
      GMS_security_check || checkResult.rows[0].GMS_security_check,
      id
    ]);
    return res.status(200).json({
      message: 'Vehicle entry updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error updating vehicle entry ID ${id}:`, err);
    return res.status(500).json({
      error: 'Database update error',
      details: err.message
    });
  }
});
// Update Vehicle Checkout
app.put('/vehicle-entry/checkout/:id', async (req, res) => {
  const id = req.params.id;
  const { GMS_checkout_time } = req.body;
  if (!GMS_checkout_time) {
    console.warn(`Checkout failed: missing GMS_checkout_time for ID ${id}`);
    return res.status(400).json({ error: 'Checkout time is required' });
  }
  const checkQuery = 'SELECT * FROM public."GMS_LogVehicleEntry" WHERE "GMS_id" = $1';
  try {
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle entry not found' });
    }
    const updateQuery = `
      UPDATE public."GMS_LogVehicleEntry"
      SET 
        "GMS_out_time" = $1,
        "GMS_status" = 'OUT',
        "updated_at" = NOW()
      WHERE "GMS_id" = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [
      GMS_checkout_time,
      id
    ]);
    return res.status(200).json({
      message: 'Vehicle checkout recorded successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error checking out vehicle ID ${id}:`, err);
    return res.status(500).json({
      error: 'Database update error',
      details: err.message
    });
  }
});
// Delete Vehicle Entry
app.delete('/Delvehicle-entry/:id', async (req, res) => {
  const id = req.params.id;
  const checkQuery = 'SELECT * FROM public."GMS_LogVehicleEntry" WHERE "GMS_id" = $1';
  try {
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle entry not found' });
    }
    const deleteQuery = 'DELETE FROM public."GMS_LogVehicleEntry" WHERE "GMS_id" = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);
    return res.status(200).json({
      message: 'Vehicle entry deleted successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error deleting vehicle ID ${id}:`, err);
    return res.status(500).json({
      error: 'Database delete error',
      details: err.message
    });
  }
});
/* ---------------------------------------     Vehicle APIs End    ------------------------------------------------- */
/* ---------------------------------------     Material Movement APIs    ------------------------------------------------- */
// Get All Material Movements
app.get('/material-movement', (req, res) => {
  const fetchQuery = 'SELECT * FROM public."GMS_MaterialMovement" ORDER BY "GMS_id" DESC';
  db.query(fetchQuery, (err, result) => {
    if (err) {
      console.error("Error fetching all material movements:", err);
      return res.status(500).json({ error: 'Database fetch error', details: err });
    }
    return res.status(200).json(result.rows);
  });
});
// Get Single Material Movement
app.get('/Editmaterial-movement/:id', (req, res) => {
  const id = req.params.id;
  const fetchQuery = 'SELECT * FROM public."GMS_MaterialMovement" WHERE "GMS_id" = $1';
  db.query(fetchQuery, [id], (err, result) => {
    if (err) {
      console.error(`Error fetching material movement with ID ${id}:`, err);
      return res.status(500).json({ error: 'Database fetch error', details: err });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Material movement not found' });
    }
    return res.status(200).json(result.rows[0]);
  });
});
// Create New Material Movement
app.post('/AddNewmaterial-movement', async (req, res) => {
  const {
    GMS_material_name,
    GMS_quantity,
    GMS_unit,
    GMS_movement_type,
    GMS_source_location,
    GMS_destination_location,
    GMS_vehicle_number,
    GMS_authorized_by,
    GMS_entry_time,
    GMS_material_code,
    GMS_attachments,
    GMS_material_type
  } = req.body;
  const requiredFields = [
    'GMS_material_name',
    'GMS_quantity',
    'GMS_unit',
    'GMS_movement_type',
    'GMS_source_location',
    'GMS_destination_location',
    'GMS_authorized_by',
    'GMS_entry_time',
    'GMS_material_code',
    'GMS_material_type'
  ];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    console.warn("Missing required fields on insert:", missingFields);
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }
  const insertQuery = `
    INSERT INTO public."GMS_MaterialMovement" (
      "GMS_material_name", "GMS_quantity", "GMS_unit", 
      "GMS_movement_type", "GMS_source_location", "GMS_destination_location", 
      "GMS_vehicle_number", "GMS_authorized_by", "GMS_entry_time", 
      "GMS_material_code", "GMS_attachments", "GMS_material_type"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  try {
    const result = await db.query(insertQuery, [
      GMS_material_name,
      GMS_quantity,
      GMS_unit,
      GMS_movement_type,
      GMS_source_location,
      GMS_destination_location,
      GMS_vehicle_number || null,
      GMS_authorized_by,
      GMS_entry_time,
      GMS_material_code,
      GMS_attachments || '[]',
      GMS_material_type
    ]);
    return res.status(201).json({
      message: 'Material movement created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error inserting material movement:", err);
    return res.status(500).json({
      error: 'Database insert error',
      details: err.message
    });
  }
});
// Update Material Movement
app.put('/Editmaterial-movement/:id', async (req, res) => {
  const id = req.params.id;
  const {
    GMS_material_name,
    GMS_quantity,
    GMS_unit,
    GMS_movement_type,
    GMS_source_location,
    GMS_destination_location,
    GMS_vehicle_number,
    GMS_authorized_by,
    GMS_entry_time,
    GMS_material_code,
    GMS_attachments,
    GMS_material_type
  } = req.body;
  const checkQuery = 'SELECT * FROM public."GMS_MaterialMovement" WHERE "GMS_id" = $1';
  try {
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Material movement not found' });
    }
    const updateQuery = `
      UPDATE public."GMS_MaterialMovement"
      SET 
        "GMS_material_name" = $1,
        "GMS_quantity" = $2,
        "GMS_unit" = $3,
        "GMS_movement_type" = $4,
        "GMS_source_location" = $5,
        "GMS_destination_location" = $6,
        "GMS_vehicle_number" = $7,
        "GMS_authorized_by" = $8,
        "GMS_entry_time" = $9,
        "GMS_material_code" = $10,
        "GMS_attachments" = $11,
        "GMS_material_type" = $12,
        "updated_at" = NOW()
      WHERE "GMS_id" = $13
      RETURNING *
    `;
    const result = await db.query(updateQuery, [
      GMS_material_name || checkResult.rows[0].GMS_material_name,
      GMS_quantity || checkResult.rows[0].GMS_quantity,
      GMS_unit || checkResult.rows[0].GMS_unit,
      GMS_movement_type || checkResult.rows[0].GMS_movement_type,
      GMS_source_location || checkResult.rows[0].GMS_source_location,
      GMS_destination_location || checkResult.rows[0].GMS_destination_location,
      GMS_vehicle_number || checkResult.rows[0].GMS_vehicle_number,
      GMS_authorized_by || checkResult.rows[0].GMS_authorized_by,
      GMS_entry_time || checkResult.rows[0].GMS_entry_time,
      GMS_material_code || checkResult.rows[0].GMS_material_code,
      GMS_attachments || checkResult.rows[0].GMS_attachments,
      GMS_material_type || checkResult.rows[0].GMS_material_type,
      id
    ]);
    return res.status(200).json({
      message: 'Material movement updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error updating material movement ID ${id}:`, err);
    return res.status(500).json({
      error: 'Database update error',
      details: err.message
    });
  }
});
// Delete Material Movement
app.delete('/Delmaterial-movement/:id', async (req, res) => {
  const id = req.params.id;
  const checkQuery = 'SELECT * FROM public."GMS_MaterialMovement" WHERE "GMS_id" = $1';
  try {
    const checkResult = await db.query(checkQuery, [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Material movement not found' });
    }
    const deleteQuery = 'DELETE FROM public."GMS_MaterialMovement" WHERE "GMS_id" = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);
    return res.status(200).json({
      message: 'Material movement deleted successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error deleting material movement ID ${id}:`, err);
    return res.status(500).json({
      error: 'Database delete error',
      details: err.message
    });
  }
});
/* ---------------------------------------     Material Movement APIs End    ------------------------------------------------- */
/* ---------------------------------------     Dashbord Views Start    ------------------------------------------------- */

app.get('/Dashboard_combined_view_VW', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dashboard_combined_view');
    res.json({
      dashboard_data: result.rows[0].dashboard_data
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});


app.post('/manual-checkout', async (req, res) => {
  const { gateEntryId, modifiedBy } = req.body;
  try {
    const result = await db.query(
      `UPDATE public.gms_gate_entries
       SET gms_outtime = NOW(),
           gms_status = 'Checked Out',
           modified_on = NOW(),
           modified_by = $2
       WHERE gms_gateentry_id = $1
         AND gms_outtime IS NULL
         AND gms_status = 'Accepted'
       RETURNING *`,
      [gateEntryId, modifiedBy]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No active visitor found or already checked out.' });
    }
    res.status(200).json({
      message: 'Visitor successfully checked out.',
      updatedVisitor: result.rows[0]
    });
  } catch (error) {
    console.error('Error in manual checkout:', error);
    res.status(500).json({ message: 'Server error during manual checkout' });
  }
});
/* ---------------------------------------     Dashbord Views End    ------------------------------------------------- */
/* ---------------------------------------     Pre Booking Start    ------------------------------------------------- */
// 1. CREATE - Add new pre-booking
app.post('/appointments', async (req, res) => {
  const { visitor_name, phone_number, email, visitor_from, to_meet, purpose, booking_date, booking_time, expected_exit_time, id_type, id_number, vehicle_no } = req.body;
  // Server-side validation
  const requiredFields = ['visitor_name', 'phone_number', 'email', 'visitor_from', 'to_meet', 'purpose', 'booking_date', 'booking_time', 'id_type', 'id_number'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing_fields: missingFields
    });
  }
  try {
    const client = await db.connect();
    const result = await client.query(
      `INSERT INTO public.gms_pre_booking (
                gms_visitor_name, gms_phone_number, gms_email, gms_visitor_from,
                gms_to_meet, gms_purpose, gms_booking_date, gms_booking_time,
                gms_expected_exit_time, gms_id_type, gms_id_number, gms_vehicle_no,
                gms_status, gms_created_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
            ) RETURNING gms_pre_booking_id, gms_status;`,
      [visitor_name, phone_number, email, visitor_from, to_meet, purpose, booking_date, booking_time, expected_exit_time || null, id_type, id_number, vehicle_no || null, 'Pending']
    );
    client.release();
    const newBooking = result.rows[0];
    res.status(201).json({
      message: 'Pre-booking created successfully',
      booking_id: newBooking.gms_pre_booking_id,
      status: newBooking.gms_status
    });
  } catch (err) {
    console.error('Error creating pre-booking:', err);
    res.status(500).json({
      error: 'Database error',
      details: err.message
    });
  }
});
// 2. READ - Get all pre-bookings
app.get('/allappointments', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        gms_pre_booking_id, gms_visitor_name, gms_phone_number,
        gms_email, gms_visitor_from, gms_to_meet, gms_purpose,
        gms_booking_date, gms_booking_time, gms_expected_exit_time,
        gms_id_type, gms_id_number, gms_vehicle_no, gms_status,
        gms_created_at, gms_updated_at
      FROM gms_pre_booking
      ORDER BY gms_booking_date DESC, gms_booking_time DESC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
// 3. READ - Get single pre-booking by ID
app.get('/preBookings/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM gms_pre_booking WHERE gms_pre_booking_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pre-booking not found'
      });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
// 4. UPDATE - Update pre-booking status
app.put('/updateappointments/:id', async (req, res) => {
  const { id } = req.params;
  const { gms_status } = req.body;
  try {
    const updateQuery = `
          UPDATE gms_pre_booking 
          SET gms_status = $1, gms_updated_at = NOW()
          WHERE gms_pre_booking_id = $2
          RETURNING *`;
    const result = await db.query(updateQuery, [gms_status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.status(200).json({ message: 'Status updated successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// 5. DELETE - Cancel pre-booking
app.delete('/pre-bookings/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM gms_pre_booking WHERE gms_pre_booking_id = $1`,
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pre-booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Pre-booking cancelled successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

////-------------------------------------End here ------------------------------------------------------////

// Function to generate a unique pass code
function generatePassCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


// 2. Placeholder for fetching old visitors (Search suggestions)
app.get('/getOldVisitors', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (gms_mobileno)
        gms_lobbyentry_id,
        gms_visitorname        AS "GMS_VisitorName",
        gms_visitorfrom        AS "GMS_VisitorFrom",
        gms_mobileno           AS "GMS_MobileNo",
        gms_emailid            AS "GMS_EmailID",
        gms_visitorimage       AS "GMS_VisitorImage",
        created_on
      FROM public.gms_lobbyentry
      ORDER BY gms_mobileno, created_on DESC
      LIMIT 50;
    `;

    const result = await db.query(query);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching old visitors:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// 3. Placeholder for checking and returning existing visitor data
// 3. Placeholder for checking and returning existing visitor data
app.post('/checkExistingVisitor', async (req, res) => {
  const { contact_info, contact_type } = req.body;

  if (!contact_info || !contact_type) {
    return res.status(400).json({ message: 'contact_info and contact_type are required' });
  }

  try {
    let query = '';
    let values = [];

    if (contact_type === 'email') {
      query = `
        SELECT 
          gms_visitorname AS "GMS_VisitorName",
          gms_visitorfrom AS "GMS_VisitorFrom",
          gms_tomeet AS "GMS_ToMeet",
          gms_visitpurpose AS "GMS_VisitPurpose",
          gms_identificationtype AS "GMS_IdentificationType",
          gms_identificationno AS "GMS_IdentificationNo",
          gms_mobileno AS "GMS_MobileNo",
          gms_emailid AS "GMS_EmailID",
          gms_visitorimage AS "GMS_VisitorImage",
          gms_status AS "GMS_Status",
          address,
          gender,
          COUNT(*) as total_visits,
          MAX(created_on) as last_visit
        FROM public.gms_lobbyentry
        WHERE gms_emailid = $1
        GROUP BY 
          gms_visitorname, gms_visitorfrom, gms_tomeet, gms_visitpurpose,
          gms_identificationtype, gms_identificationno, gms_mobileno,
          gms_emailid, gms_visitorimage, gms_status, address, gender
        ORDER BY last_visit DESC
        LIMIT 1
      `;
      values = [contact_info.toLowerCase()];
    }

    if (contact_type === 'sms') {
      query = `
        SELECT 
          gms_visitorname AS "GMS_VisitorName",
          gms_visitorfrom AS "GMS_VisitorFrom",
          gms_tomeet AS "GMS_ToMeet",
          gms_visitpurpose AS "GMS_VisitPurpose",
          gms_identificationtype AS "GMS_IdentificationType",
          gms_identificationno AS "GMS_IdentificationNo",
          gms_mobileno AS "GMS_MobileNo",
          gms_emailid AS "GMS_EmailID",
          gms_visitorimage AS "GMS_VisitorImage",
          gms_status AS "GMS_Status",
          address,
          gender,
          COUNT(*) as total_visits,
          MAX(created_on) as last_visit
        FROM public.gms_lobbyentry
        WHERE gms_mobileno = $1
        GROUP BY 
          gms_visitorname, gms_visitorfrom, gms_tomeet, gms_visitpurpose,
          gms_identificationtype, gms_identificationno, gms_mobileno,
          gms_emailid, gms_visitorimage, gms_status, address, gender
        ORDER BY last_visit DESC
        LIMIT 1
      `;
      values = [contact_info];
    }

    const result = await db.query(query, values);

    if (result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        exists: true,
        visitor: result.rows[0],
        total_visits: result.rows[0].total_visits,
        last_visit: result.rows[0].last_visit,
        is_frequent_visitor: result.rows[0].total_visits > 3 // Define frequent as >3 visits
      });
    }

    return res.status(200).json({
      success: true,
      exists: false
    });

  } catch (error) {
    console.error('Error checking existing visitor:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Add this endpoint for quick registration (optional)
app.post('/quickVisitorEntry', async (req, res) => {
  const client = await db.connect();

  try {
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_VisitorImage,
      GMS_ToMeet,
      GMS_VisitPurpose,
      GMS_MobileNo,
      GMS_EmailID,
      skip_otp = false
    } = req.body;

    // Validate required fields
    if (!GMS_VisitorName || !GMS_MobileNo || !GMS_ToMeet) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const query = `
      INSERT INTO gms_lobbyentry (
        gms_visitorname,
        gms_visitorfrom,
        gms_tomeet,
        gms_visitpurpose,
        gms_identificationtype,
        gms_identificationno,
        gms_mobileno,
        gms_emailid,
        gms_visitorimage,
        gms_intime,
        gms_status,
        created_by,
        created_on,
        skip_otp_verification
      ) VALUES ($1, $2, $3, $4, 1, 'N/A', $5, $6, $7, 
                NOW(), false, 'quick_entry', NOW(), $8)
      RETURNING gms_lobbyentry_id;
    `;

    const values = [
      GMS_VisitorName,
      GMS_VisitorFrom || '',
      GMS_ToMeet,
      GMS_VisitPurpose || 'General Meeting',
      GMS_MobileNo,
      GMS_EmailID || '',
      GMS_VisitorImage,
      skip_otp
    ];

    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      // Generate pass code
      const passCode = `VST-${Date.now().toString().slice(-6)}`;
      const tempVisitorId = `TEMP-${Date.now().toString().slice(-8)}`;

      res.status(201).json({
        success: true,
        message: "Quick entry created successfully.",
        gms_lobbyentry_id: result.rows[0].gms_lobbyentry_id,
        passCode: passCode,
        tempVisitorId: tempVisitorId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create quick entry"
      });
    }

  } catch (err) {
    console.error("Quick Entry Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during quick entry"
    });
  } finally {
    client.release();
  }
});

// 6. Visitor Lobby Entry Submission (Step 3)
app.post('/visitorlobbyentry', async (req, res) => {
  const client = await db.connect();

  try {
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_VisitorImage,
      GMS_ToMeet,
      GMS_VisitPurpose,
      GMS_IdentificationType,
      GMS_IdentificationNo,
      GMS_MobileNo,
      GMS_EmailID,
      GMS_Status,
      created_by
    } = req.body;

    // Apply safe defaults
    const safeStatus = (GMS_Status === undefined || GMS_Status === null) ? false : GMS_Status;
    const safeIDType = GMS_IdentificationType || 1;
    const safeIDNo = GMS_IdentificationNo || "N/A";

    // Server timestamps
    const serverCreatedOn = new Date().toISOString();

    const query = `
      INSERT INTO gms_lobbyentry (
        gms_visitorname,
        gms_visitorfrom,
        gms_tomeet,
        gms_visitpurpose,
        gms_identificationtype,
        gms_identificationno,
        gms_mobileno,
        gms_emailid,
        gms_visitorimage,
        gms_intime,
        gms_status,
        created_by,
        created_on,
        gms_outtime,
        modified_on,
        modified_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        NOW(),      -- gms_intime
        $10,
        $11,
        $12,
        NULL, NULL, NULL
      )
      RETURNING gms_lobbyentry_id;
    `;

    const values = [
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_ToMeet,
      GMS_VisitPurpose,
      safeIDType,
      safeIDNo,
      GMS_MobileNo,
      GMS_EmailID,
      GMS_VisitorImage,
      safeStatus,
      created_by,
      serverCreatedOn
    ];

    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      res.status(201).json({
        success: true,
        message: "Visitor entry created successfully.",
        gms_lobbyentry_id: result.rows[0].gms_lobbyentry_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to insert entry."
      });
    }

  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during lobby entry submission."
    });
  } finally {
    client.release();
  }
});


app.post('/sendVisitorNotification', async (req, res) => {
  const clientDb = await db.connect();

  try {
    const {
      lobbyEntryId,      // INTEGER
      tempVisitorId,     // "TEMP-85428555"
      passCode,
      visitor,
      qrCodeUrl
    } = req.body;

    if (!lobbyEntryId || !visitor) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const {
      GMS_VisitorName,
      GMS_EmailID,
      GMS_MobileNo,
      GMS_ToMeet,
      GMS_ToMeetEmail,
      GMS_VisitPurpose
    } = visitor;

    await clientDb.query('BEGIN');

    /* ===========================
       EMAIL TO VISITOR (WITH QR)
    ============================ */
    await transporter.sendMail({
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: GMS_EmailID,
      subject: 'Your Visit Is Confirmed',
      html: `
        <div style="font-family:Arial">
          <h2>Visit Confirmation</h2>
          <p>Dear <b>${GMS_VisitorName}</b>,</p>

          <table cellpadding="6">
            <tr><td>Host</td><td>${GMS_ToMeet}</td></tr>
            <tr><td>Purpose</td><td>${GMS_VisitPurpose}</td></tr>
            <tr><td>Pass Code</td><td><b>${passCode}</b></td></tr>
          </table>

          <p><b>QR Code (For Entry)</b></p>
          <img src="${qrCodeUrl}" width="160" />

          <p>Temporary ID: ${tempVisitorId}</p>
        </div>
      `
    });

    await clientDb.query(
      `INSERT INTO gms_notifications
       (recipient_type, recipient_id, message, sent_via)
       VALUES ($1, $2, $3, 'email')`,
      [
        'VISITOR',
        lobbyEntryId,
        `Visitor email sent (Temp ID: ${tempVisitorId}, Pass: ${passCode})`
      ]
    );

    /* ===========================
       EMAIL TO HOST (NO QR)
    ============================ */
    await transporter.sendMail({
      from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
      to: GMS_ToMeetEmail,
      subject: `Visitor Alert – ${GMS_VisitorName}`,
      html: `
        <div style="font-family:Arial">
          <h3>Visitor Alert</h3>
          <p><b>${GMS_VisitorName}</b> is visiting you.</p>

          <table cellpadding="6">
            <tr><td>Mobile</td><td>${GMS_MobileNo}</td></tr>
            <tr><td>Purpose</td><td>${GMS_VisitPurpose}</td></tr>
            <tr><td>Pass Code</td><td>${passCode}</td></tr>
          </table>
        </div>
      `
    });

    await clientDb.query(
      `INSERT INTO gms_notifications
       (recipient_type, recipient_id, message, sent_via)
       VALUES ($1, $2, $3, 'email')`,
      [
        'HOST',
        lobbyEntryId,
        `Host email sent for ${GMS_VisitorName} (Temp ID: ${tempVisitorId})`
      ]
    );

    await clientDb.query('COMMIT');

    res.json({ success: true });

  } catch (err) {
    await clientDb.query('ROLLBACK');
    console.error('Email Notification Error:', err);
    res.status(500).json({ success: false });
  } finally {
    clientDb.release();
  }
});



// 7. Pass Generation (Step 5)
app.post('/generatePass', async (req, res) => {
  const client = await db.connect();
  try {
    const {
      gateentry_id, valid_from, valid_to, sendSMS, sendEmail,
      visitorName, visitorMobile, hostEmail
    } = req.body;

    if (!gateentry_id) {
      return res.status(400).json({ success: false, message: 'Gate entry ID is required to create a pass.' });
    }

    // 1. Generate unique pass code
    let passCode;
    let isUnique = false;
    let attempts = 0;

    // Ensure the generated pass code is unique
    while (!isUnique && attempts < 10) {
      passCode = generatePassCode(PASS_CODE_LENGTH);
      const checkQuery = 'SELECT pass_code FROM gms_visitor_passes WHERE pass_code = $1';
      const checkResult = await client.query(checkQuery, [passCode]);
      if (checkResult.rows.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ success: false, message: 'Failed to generate a unique pass code.' });
    }

    // 2. Insert into gms_visitor_passes
    const insertQuery = `
            INSERT INTO gms_visitor_passes (
                gateentry_id, pass_code, valid_from, valid_to, status, created_at
            ) VALUES (
                $1, $2, $3, $4, $5, NOW()
            ) RETURNING pass_id, pass_code;
        `;

    // Valid_from and Valid_to are ISO strings passed from client
    const values = [
      gateentry_id,
      passCode,
      valid_from,
      valid_to,
      'active' // Assuming a successful creation means 'active' status
    ];

    const result = await client.query(insertQuery, values);

    // 3. Send notifications (optional)
    const passId = result.rows[0].pass_id;
    const passMessage = `Your visitor pass code is ${passCode}. Valid until ${new Date(valid_to).toLocaleDateString()}. Entry ID: ${gateentry_id}.`;

    if (sendSMS && visitorMobile) {
      await sendNotification('SMS', visitorMobile, passMessage);
    }

    if (sendEmail && hostEmail) {
      await sendNotification('Email', hostEmail, `New Visitor Pass Generated for ${visitorName}. ${passMessage}`);
    }

    res.status(201).json({
      success: true,
      message: 'Pass generated successfully.',
      pass_code: passCode,
      pass_id: passId
    });

  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ success: false, message: 'Server error during pass generation.' });
  } finally {
    client.release();
  }
});



////-------------------------------------End here ------------------------------------------------------////




app.listen(PORT, () => {
  console.log("Connected to backend connection..");
  console.log(`Server running on http://ServerPort:${PORT}`);
});
