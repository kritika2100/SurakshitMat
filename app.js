const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db_con.js');
const { sendOTPEmail, sendVerifyMail } = require('./mailSend.js');
const { generateOTP, validateOTP } = require('./utils.js');
const app = express();
app.use(session({ secret: "test123!@#" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
// Set EJS as the view engine
app.set('view engine', 'ejs');
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images', 'party_logos'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index');
});
//TO MOVE TO LOGIN PAGE
app.get('/login', function (req, res) {
    var msg = "";
    if (req.session.msg != "")
        msg = req.session.msg;
    res.render('login', { msg: "LOGIN TO SURAKSHITMAT" });
});
//ADMIN LOGIN
app.post('/login_submit1', function (req, res) {
    const { email, pass } = req.body;
    let sql = "";
    let params = [];
    if (isNaN(email)) {
        sql = "SELECT * FROM admin WHERE email = ? AND pass = ? AND status = 1 AND softdelete = 1";
        params = [email, pass]; // Add email and pass as parameters
    } else {
        sql = "SELECT * FROM admin WHERE voterid = ? AND pass = ? AND status = 1 AND softdelete = 1";
        params = [email, pass]; // Add mobile and password as parameters
    }
    db.query(sql, params, function (err, result, fields) {
        if (err) {
            console.error(err);
            res.render('login', { msg: "Error processing login request" });
        } else {
            if (result.length === 0) {
                res.render('login', { msg: "Username or Password did not match" });
            } else {
                req.session.userid = result[0].uid;
                req.session.un = result[0].username;
                // Redirect to the candidates page after successful admin login
                res.redirect('/candidates');
            }
        }
    });
});
// user LOGIN
app.post('/login_submit2', async (req, res) => {
    const { email, aadharid, pass, otp } = req.body;
    const sql = "SELECT * FROM voter WHERE email = ? AND aadharid = ? AND pass = ? AND status = 1 AND softdelete = 1";
    const params = [email, aadharid, pass];

    // First, validate the OTP
    if (otp && otp.trim() !== '') {
        // Validate the OTP here
        if (!validateOTP(otp, req.session.otp)) {
            return res.render('login', { msg: "Invalid OTP" });
        }
    } else {
        return res.render('login', { msg: "Please enter OTP" });
    }

    // If OTP is valid, proceed with database query
    db.query(sql, params, function (err, result, fields) {
        if (err) {
            console.error(err);
            res.render('login', { msg: "Error processing login request" });
        } else {
            if (result.length === 0) {
                res.render('login', { msg: "Aadhar ID or Email or Password did not match" });
            } else {
                req.session.userid = result[0].uid;
                req.session.un = result[0].username;
                res.redirect('/voter');
            }
        }
    });
});

// TO GENERATE OTP FOR LOGIN
app.get('/generateOTP', async (req, res) => {
    try {
        const { email } = req.query;
        const otp = generateOTP();
        req.session.otp = otp.toString();
        const success = await sendOTPEmail(email); // Call sendOTPEmail with email only
        if (success) {
            res.send(otp.toString());
        } else {
            res.send("false");
        }
    } catch (err) {
        console.error(err); w
        res.send("false");
    }
});

//SIGNUP PAGE FOR VOTERS/USER
app.get('/signup', (req, res) => {
    const { errmsg } = req.query; // Assuming errmsg is passed as a query parameter
    res.render('signup', { errmsg }); // Pass errmsg to the template
});
app.post('/reg_submit1', (req, res) => {
    const { fname, mname, lname, dob, mobileno, aadharid, pass, nationality, email } = req.body;

    // Check if Aadhar ID already exists
    const sql_check = "SELECT COUNT(*) AS count FROM voter WHERE aadharid = ?";

    db.query(sql_check, [aadharid], function (err, result, fields) {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).send("Internal Server Error");
        }

        const aadharCount = result[0].count;

        if (aadharCount > 0) {
            // If Aadhar ID exists, show error message
            return res.render('signup', { errmsg: "Aadhar ID already exists" });
        }

        // If Aadhar ID is unique, proceed with signup
        const sql = "INSERT INTO voter (fname, mname, lname, dob, mobileno, aadharid, pass, nationality, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const t = new Date();
        const m = t.getMonth() + 1;
        const dor = t.getFullYear() + "-" + m + "-" + t.getDate();

        db.query(sql, [fname, mname, lname, dob, mobileno, aadharid, pass, nationality, email], function (err, result) {
            if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).send("Internal Server Error");
            }

            if (result.insertId > 0) {
                if (isNaN(email))
                    sendVerifyMail(email);
                req.session.msg = "Account created,Please Check Your Mail to Verify Your Email.";
                res.redirect('/');//redirect to login page
            }
            else {
                res.render('signup', { errmsg: "Cannot complete signup,try again" });
            }
        });
    });
});

//TO VERIFY YOUR MAIL
app.get('/verifyemail', function (req, res) {
    let email = req.query['email'];
    let sql_update = "update voter set status=1 where email=?";
    db.query(sql_update, [email], function (err, result) {
        if (err)
            console.log(err);
        if (result.affectedRows == 1) {
            req.session.msg = "Email verified now you can login with your password and email";
            res.redirect('/');//redirecting to login page
        }
        else {
            req.session.msg = "Cannot verify your email contact website admin";
            res.redirect('/');
        }
    });
});

//ADMIIN PAGE
app.get('/candidates', (req, res) => {
    // Retrieve the list of candidates from the database
    const sql = 'SELECT * FROM candidates';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error retrieving candidates:', err);
            return res.status(500).send('Error retrieving candidates. Please try again.');
        } else {
            // Fetch admin's data
            const adminSql = 'SELECT uid, fname, email FROM admin LIMIT 1'; // Assuming you want to fetch the first admin
            db.query(adminSql, (adminErr, adminResult) => {
                if (adminErr) {
                    console.error('Error retrieving admin data:', adminErr);
                    return res.status(500).send('Error retrieving admin data. Please try again.');
                } else {
                    // Extract adminId from the admin's data
                    const adminId = adminResult[0].uid;

                    // Render the candidates page with the retrieved data and admin's info
                    res.render('candidates', { candidates: result, adminName: adminResult[0].fname, adminEmail: adminResult[0].email });
                }
            });
        }
    });
});


//ADD A CANDIDATE
// Route to render the form for adding a new candidate
app.get('/addcandidate', (req, res) => {
    res.render('addcandidate');
});

// Route to handle adding a new candidate
app.post('/addcandidatessubmit', upload.single('party_logo_path'), (req, res) => {
    // Extract form data
    const { full_name, party_name, dob, nationality, email } = req.body;

    // Extract party logo filename
    const party_logo_path = req.file.filename;

    // Check if the candidate already exists in the database
    const sqlCheck = 'SELECT COUNT(*) AS count FROM candidates WHERE full_name = ? AND dob = ? AND email = ?';
    db.query(sqlCheck, [full_name, dob, email], (err, result) => {
        if (err) {
            console.error('Error checking candidate existence:', err);
            return res.status(500).send('Error checking candidate existence. Please try again.');
        }

        // Check if the candidate already exists
        if (result[0].count > 0) {
            console.log('Candidate already exists.');
            return res.status(400).render('addcandidate', { errmsg: "Candidate already exists." });
        } else {
            // If candidate does not exist, proceed with registration
            const sqlInsert = "INSERT INTO candidates (full_name, party_name, dob, nationality, email, party_logo_path) VALUES (?, ?, ?, ?, ?, ?)";
            const values = [full_name, party_name, dob, nationality, email, party_logo_path];

            db.query(sqlInsert, values, (err, result) => {
                if (err) {
                    console.error('Error adding candidate:', err);
                    return res.status(500).send('Error adding candidate. Please try again.');
                } else {
                    console.log('Candidate added successfully.');
                    res.redirect('/candidates'); // Redirect to the home page after adding candidate
                }
            });
        }
    });
});

//DELETE THE CANDIDATE
app.get('/deletecandidate/:candidate_id', (req, res) => {
    const candidateId = req.params.candidate_id;

    // Here you can perform any necessary operations before deleting the candidate
    // For example, you might want to display a confirmation page before deletion

    // Then, you can redirect or render a confirmation page
    const sql = 'DELETE FROM candidates WHERE candidate_id = ?';
    db.query(sql, [candidateId], (err, result) => {
        if (err) {
            console.error('Error deleting candidate:', err);
            return res.status(500).send('Error deleting candidate. Please try again.');
        }
        // Redirect to the candidates list page after deletion
        res.redirect('/candidates');
    });
});


//UPDATE THE CANDIDATE
app.get('/updatecandidate/:id', (req, res) => {
    const candidateId = req.params.id;
    res.render('updatecandidate', { candidate_id: candidateId });
});
// Handle updating a candidate
app.post('/updatecandidate', upload.single('party_logo_path'), (req, res) => {
    const candidateId = req.body.candidate_id; // Retrieve candidate ID from the request body
    const { full_name, party_name } = req.body;
    const party_logo_path = req.file ? req.file.filename : null; // Get uploaded party logo filename

    // Assuming req.session.userid contains the ID of the logged-in user
    try {
        // Update database with the new data
        let sqlupdate = "UPDATE candidates SET full_name=?, party_name=?, party_logo_path=? WHERE candidate_id=?";
        db.query(sqlupdate, [full_name, party_name, party_logo_path, candidateId], function (err, result) {
            if (err) {
                console.error(err);
                req.session.msg = "Error updating candidate";
            } else {
                if (result.affectedRows === 1) {
                    req.session.msg = "Candidate updated successfully";
                } else {
                    req.session.msg = "Unable to update candidate";
                }
            }
            res.redirect('/candidates'); // Redirect regardless of the result
        });
    } catch (error) {
        console.error(error);
        req.session.msg = "Error processing file upload";
        res.redirect('/candidates');
    }
});

// GET route to render the voter page
app.get('/voter', (req, res) => {
    // Check if user is logged in
    if (!req.session.userid) {
        console.error('User ID is undefined in session.');
        return res.status(500).send('User ID is undefined in session. Please log in again.');
    }

    // Query the voter status, name, and Aadhar ID for the current user
    const sqlQuery = "SELECT voterstatus, fname, aadharid FROM voter WHERE uid = ?";
    db.query(sqlQuery, [req.session.userid], (err, result) => {
        if (err) {
            console.error('Error retrieving voter data:', err);
            return res.status(500).send('Error retrieving voter data. Please try again.');
        } else {
            let hasVoted = false;
            let fname = '';
            let aadharid = '';

            // Check if a row was returned
            if (result.length > 0) {
                // Voter data found
                const voterStatus = result[0].voterstatus;
                fname = result[0].fname;
                aadharid = result[0].aadharid;
                hasVoted = voterStatus === 1;
            } else {
                // Voter data not found
                console.log('Voter data not found for user:', req.session.userid);
                // Handle the case where the user does not exist or there is no voter data
            }

            // Proceed with rendering the page or performing other actions
            // For example, you can render the page with the retrieved data and hasVoted variable
            const sql = 'SELECT * FROM candidates';
            db.query(sql, (err, result) => {
                if (err) {
                    console.error('Error retrieving candidates:', err);
                    return res.status(500).send('Error retrieving candidates. Please try again.');
                } else {
                    // Render the voter page with the retrieved data, hasVoted variable, fname, and aadharid
                    res.render('voter', { candidates: result, hasVoted: hasVoted, fname: fname, aadharid: aadharid });
                }
            });
        }
    });
});



// POST route to handle voting
app.post('/vote/:id', (req, res) => {
    const candidateId = req.params.id;
    
    // Assuming req.session.userid contains the ID of the logged-in user
    const userId = req.session.userid;

    if (!userId) {
        console.error('User ID is undefined in session.');
        return res.status(500).send('User ID is undefined in session. Please log in again.');
    }

    // Check if the user has already voted
    const sqlCheckVote = "SELECT voterstatus FROM voter WHERE uid = ?";
    db.query(sqlCheckVote, [userId], (err, result) => {
        if (err) {
            console.error('Error checking voter status:', err);
            return res.status(500).send('Error checking voter status. Please try again.');
        } else {
            // Check if a row was returned
            if (result.length > 0) {
                const voterStatus = result[0].voterstatus;
                if (voterStatus === 1) {
                    // User has already voted
                    console.log('User has already voted.');
                    return res.status(403).send('You have already voted.');
                } else {
                    // User has not voted, proceed with updating vote count
                    const sqlUpdate = "UPDATE candidates SET votes = votes + 1 WHERE candidate_id = ?";
                    db.query(sqlUpdate, [candidateId], (err, result) => {
                        if (err) {
                            console.error('Error updating vote count:', err);
                            return res.status(500).send('Error updating vote count. Please try again.');
                        } else {
                            // Update the voterstatus to indicate that the user has voted
                            const sqlUpdateVoterStatus = "UPDATE voter SET voterstatus = 1 WHERE uid = ?";
                            db.query(sqlUpdateVoterStatus, [userId], (err, result) => {
                                if (err) {
                                    console.error('Error updating voter status:', err);
                                    return res.status(500).send('Error updating voter status. Please try again.');
                                } else {
                                    console.log('User vote count updated successfully.');
                                    // Redirect to the main page after voting
                                    res.redirect('/');
                                }
                            });
                        }
                    });
                }
            } else {
                // Voter status not found
                console.log('Voter status not found for user:', userId);
                return res.status(500).send('Voter status not found.');
            }
        }
    });
});


// Route to get all registered voters and the party they have voted for
app.get('/registeredvoters', (req, res) => {
    const sql = `
    SELECT voter.*, candidates.party_name AS voted_party 
    FROM voter 
    LEFT JOIN candidates ON voter.voterstatus = candidates.candidate_id 
    WHERE voter.status = 1`;
    db.query(sql, (err, registeredVoters) => {
        if (err) {
            console.error('Error retrieving registered voters:', err);
            res.status(500).send('Error retrieving registered voters. Please try again.');
            return;
        }
        res.render('registeredvoters', { registeredVoters: registeredVoters });
    });
});


app.get('/live-result', (req, res) => {
    // Fetch vote counts for all candidates from the database
    const sql = 'SELECT party_name, party_logo_path, votes FROM candidates';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error retrieving vote counts:', err);
            return res.status(500).send('Error retrieving vote counts. Please try again.');
        } else {
            // Calculate total votes
            const totalVotes = result.reduce((total, candidate) => total + candidate.votes, 0);
            // Render the live result page with the retrieved data
            res.render('live-result', { candidates: result, totalVotes: totalVotes });
        }
    });
});

app.get('/logout', function (req, res) {
    //req.session.userid = "";
    res.redirect('/');
});
    app.get('/howtovote', (req, res) => {
        res.render('howtovote'); // Assuming you have a howtovote.ejs file in your views directory
    });
    app.get('/about', (req, res) => {
        res.render('about'); 
    });
    app.get('/contactus', (req, res) => {
        res.render('contactus');
    });
    app.post('/submit_contact', (req, res) => {
        // Extract data from the form submission
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;
    
        // Here you can handle the form submission data (e.g., send an email, save to database, etc.)
    
        // Respond with a simple success message for demonstration purposes
        res.send(`<h1>Thank you for your message, ${name}!</h1><p>We'll get back to you soon.</p>`);
    });
    app.get('/help'),(req,res)=>{
        res.render('help');
    };
// Start the server
app.listen(PORT, () => {
    console.log(`panel is running at http://localhost:${PORT}`);
});