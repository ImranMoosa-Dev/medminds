const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');
const app = express();
const upload = multer({dest: 'uploads/'});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static('uploads'));
app.use(session({ secret: 'medminds-secret', resave: true, saveUninitialized: true, cookie: { secure: false, httpOnly: true, sameSite: 'lax' } }));
const dbPromise = require('./MedMindsDB');
const port = 3000;

(async () => {
    const db = await dbPromise;
    await db.execute(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        loggedIn BOOLEAN DEFAULT FALSE,
        approved BOOLEAN DEFAULT FALSE
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        testName VARCHAR(255),
        testType VARCHAR(255),
        subject VARCHAR(255),
        chapter VARCHAR(255),
        question TEXT,
        opt1 TEXT,
        opt2 TEXT,
        opt3 TEXT,
        opt4 TEXT,
        correct INT,
        published BOOLEAN DEFAULT FALSE
    )`);
    await db.execute(`ALTER TABLE questions ADD COLUMN published BOOLEAN DEFAULT FALSE`).catch(() => {});
    await db.execute(`CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        date DATETIME,
        results JSON,
        quiz_id INT
    )`);
    await db.execute(`ALTER TABLE quizzes ADD COLUMN quiz_id INT`).catch(() => {});
    await db.execute(`CREATE TABLE IF NOT EXISTS quiz_definitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        subject VARCHAR(255),
        topics VARCHAR(255),
        duration INT,
        totalMcqs INT,
        questions JSON,
        start_time DATETIME,
        end_time DATETIME,
        testType VARCHAR(255)
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        token VARCHAR(255),
        expires DATETIME
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(255),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute(`ALTER TABLE updates ADD COLUMN published BOOLEAN DEFAULT 1`).catch(() => {});
    await db.execute(`ALTER TABLE updates CHANGE date created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN fatherName VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN district VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN whatsapp VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN status VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE questions ADD COLUMN chapter VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE questions ADD COLUMN image VARCHAR(255)`).catch(() => {});
    await db.execute(`ALTER TABLE questions ADD COLUMN explanation TEXT`).catch(() => {});
    await db.execute(`ALTER TABLE questions ADD COLUMN quiz_only BOOLEAN DEFAULT FALSE`).catch(() => {});
    await db.execute(`ALTER TABLE quiz_definitions ADD COLUMN start_time DATETIME`).catch(() => {});
    await db.execute(`ALTER TABLE quiz_definitions ADD COLUMN end_time DATETIME`).catch(() => {});
    await db.execute(`ALTER TABLE quiz_definitions ADD COLUMN testType VARCHAR(255)`).catch(() => {});
    await db.execute(`CREATE TABLE IF NOT EXISTS mistakes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        question TEXT,
        options JSON,
        correct INT,
        userAnswer INT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS q_bank_attempts (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), date DATE, UNIQUE KEY unique_attempt (email, date))`);
    await db.execute(`CREATE TABLE IF NOT EXISTS login_dates (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), date DATE, UNIQUE KEY unique_login (email, date))`);
    await db.execute(`CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(255) UNIQUE,
        value TEXT
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255),
        title VARCHAR(255),
        filename VARCHAR(255),
        originalname VARCHAR(255),
        mimetype VARCHAR(255),
        size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS q_bank_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        question_id INT,
        user_answer INT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_answer (email, question_id)
    )`);
    // Insert default values
    await db.execute('INSERT IGNORE INTO settings (key_name, value) VALUES (?, ?)', ['syllabus_file', 'sample-test.pdf']);

    // Database setup complete

    // Ensure admin users exist
    const adminEmails = ['biologia.info1@gmail.com', 'admin@medminds.com'];
    const adminPassword = '1234567B';
    for (const adminEmail of adminEmails) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (rows.length === 0) {
            await db.execute('INSERT INTO users (fullName, email, password, loggedIn, approved) VALUES (?, ?, ?, ?, ?)', ['Admin', adminEmail, adminPassword, false, true]);
        }
    }

    // Ensure guest user exists
    const guestEmail = 'guest@gmail.com';
    const guestPassword = 'Guest123';
    const [guestRows] = await db.execute('SELECT * FROM users WHERE email = ?', [guestEmail]);
    if (guestRows.length === 0) {
        await db.execute('INSERT INTO users (fullName, email, password, loggedIn, approved, fatherName, district, whatsapp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ['Guest', guestEmail, guestPassword, false, true, 'N/A', 'Badin', '12345678910', 'fresher']);
    }

    app.post('/signup', async (req, res) => {
        const { fullName, fatherName, district, whatsappNumber, status, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.json({ error: 'Passwords do not match.' });
        }
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return res.json({ error: 'Password must be at least 8 characters and contain at least one number and one letter.' });
        }
        try {
            await db.execute('INSERT INTO users (fullName, fatherName, district, whatsapp, status, email, password, loggedIn, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [fullName, fatherName, district, whatsappNumber, status, email, password, false, false]);
            res.json({ success: true, message: 'Signup successful. Your account is pending admin approval.', redirect: '/dashboard.html' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error signing up' });
        }
    });

   app.post('/login', async (req, res) => {
        const { email, password, returnUrl } = req.body;

       try {
           const [rows] = await db.execute(
               'SELECT * FROM users WHERE email = ?',
               [email.trim()]
           );

           if (rows.length === 0) {
               return res.json({ error: 'Invalid credentials' });
           }

           const user = rows[0];

           if (user.password !== password) {
               return res.json({ error: 'Invalid credentials' });
           }

           if (user.email !== 'biologia.info1@gmail.com' && user.email !== 'admin@medminds.com') {
               if (!user.approved) {
                   return res.json({ error: 'Your account is pending admin approval.' });
               }
           }

           await db.execute(
               'UPDATE users SET loggedIn=? WHERE email=?',
               [true, user.email]
           );

           req.session.user = user.email;

           // Record login date for streak calculation
           const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
           try {
               await db.execute(
                   'INSERT IGNORE INTO login_dates (email, date) VALUES (?, ?)',
                   [user.email, today]
               );
           } catch (err) {
               console.error('Error recording login date:', err);
           }

           let redirectUrl = '/home.html';
           if (
               user.email === 'biologia.info1@gmail.com' ||
               user.email === 'admin@medminds.com'
           ) {
               redirectUrl = '/admin-menu.html';
           }
           // Use returnUrl if provided and valid
           if (returnUrl && returnUrl.startsWith('/')) {
               redirectUrl = returnUrl;
           }

           res.json({ success: true, message: 'Login successful', redirect: redirectUrl });

       } catch (err) {
           console.error(err);
           res.status(500).json({ error: 'Error logging in' });
       }
   });

    app.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) {
                return res.send('If an account with that email exists, a reset link has been sent.');
            }
            const token = Math.random().toString(36).substr(2, 9);
            const expires = new Date(Date.now() + 3600000); // 1 hour
            await db.execute('INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)', [email, token, expires]);
            const resetLink = `http://localhost:3000/reset-password/${token}`;
            // Simulate email sending
            console.log(`Reset link for ${email}: ${resetLink}`);
            res.send('If an account with that email exists, a reset link has been sent.');
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });

    app.get('/reset-password/:token', async (req, res) => {
        const { token } = req.params;
        try {
            const [rows] = await db.execute('SELECT * FROM password_resets WHERE token = ? AND expires > NOW()', [token]);
            if (rows.length === 0) {
                return res.send('Invalid or expired token.');
            }
            const html = `
                <form action="/reset-password" method="post">
                    <input type="hidden" name="token" value="${token}">
                    <input type="password" name="newPassword" placeholder="New Password" required>
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
                    <button type="submit">Reset Password</button>
                </form>
            `;
            res.send(html);
        } catch (err) {
            res.status(500).send('Error');
        }
    });

    app.post('/reset-password', async (req, res) => {
        const { token, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.send('Passwords do not match.');
        }
        if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
            return res.send('Password must be at least 8 characters and contain at least one number and one letter.');
        }
        try {
            const [rows] = await db.execute('SELECT * FROM password_resets WHERE token = ? AND expires > NOW()', [token]);
            if (rows.length === 0) {
                return res.send('Invalid or expired token.');
            }
            const email = rows[0].email;
            await db.execute('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
            await db.execute('DELETE FROM password_resets WHERE token = ?', [token]);
            res.send('Password reset successfully. <a href="/dashboard.html">Login</a>');
        } catch (err) {
            res.status(500).send('Error resetting password');
        }
    });

    app.get('/admin-menu.html', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            let html = fs.readFileSync(path.join(__dirname, 'admin-menu.html'), 'utf8');
            if (req.session.user !== 'biologia.info1@gmail.com') {
                html = html.replace('<li><a href="/admin/students">Manage Students</a></li>', '');
            }
            let message = '';
            if (req.query.success === 'mdcat') {
                message = '<p style="color: green; font-weight: bold;">MDCAT date updated successfully!</p>';
            } else if (req.query.success === 'syllabus') {
                message = '<p style="color: green; font-weight: bold;">Syllabus uploaded successfully!</p>';
            } else if (req.query.error) {
                message = '<p style="color: red; font-weight: bold;">Error: ' + req.query.error + '</p>';
            }
            html = html.replace('<h2>Admin Menu</h2>', '<h2>Admin Menu</h2>' + message);
            res.send(html);
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin-questions.html', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            res.sendFile(path.join(__dirname, 'admin-questions.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin-quizzes.html', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            res.sendFile(path.join(__dirname, 'admin-quizzes.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin-updates.html', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            res.sendFile(path.join(__dirname, 'admin-updates.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin-notes.html', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            res.sendFile(path.join(__dirname, 'admin-notes.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin-students.html', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com') {
            res.sendFile(path.join(__dirname, 'admin-students.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin', (req, res) => {
        res.redirect('/admin-menu.html');
    });

    app.get('/admin/questions', (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            res.redirect('/admin-questions.html');
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/admin/students', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com') {
            try {
                const [users] = await db.execute('SELECT * FROM users');
                let html = fs.readFileSync(path.join(__dirname, 'admin-students.html'), 'utf8');
                let studentsHtml = '';
                users.forEach(user => {
                    if (user.email !== 'biologia.info1@gmail.com' && user.email !== 'admin@medminds.com') {
                        studentsHtml += `<div class="student">
                            <div class="student-info">
                                <p>Name: ${user.fullName}</p>
                                <p>Email: ${user.email}</p>
                                <p>Password: ${user.password}</p>
                            </div>
                            <div class="student-approval">
                                <form method="post" action="/approve">
                                    <input type="hidden" name="email" value="${user.email}">
                                    <input type="radio" name="status" value="approved" ${user.approved ? 'checked' : ''}> Login Approved<br>
                                    <input type="radio" name="status" value="disapproved" ${!user.approved ? 'checked' : ''}> Login Disapproved<br>
                                    <button type="submit">Update</button>
                                </form>
                            </div>
                        </div>`;
                    }
                });
                html = html.replace('<!-- Students will be inserted here -->', studentsHtml);
                res.send(html);
            } catch (err) {
                res.status(500).send('Error loading students');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });


    app.get('/admin/quizzes', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            try {
                const [quizDefs] = await db.execute('SELECT * FROM quiz_definitions');
                const [quizzes] = await db.execute('SELECT * FROM quizzes ORDER BY date DESC');
                const [users] = await db.execute('SELECT email, fullName FROM users');
                const userMap = {};
                users.forEach(u => userMap[u.email] = u.fullName);
                let html = fs.readFileSync(path.join(__dirname, 'admin-quizzes.html'), 'utf8');
                let quizDefsHtml = '<table border="1" style="width:100%; border-collapse:collapse;"><tr><th>Name</th><th>Subject</th><th>Topics</th><th>Duration</th><th>MCQs</th><th>Test Type</th><th>Actions</th></tr>';
                quizDefs.forEach(q => {
                    quizDefsHtml += `<tr><td>${q.name}</td><td>${q.subject}</td><td>${q.topics}</td><td>${q.duration} min</td><td>${q.totalMcqs}</td><td>${q.testType || 'N/A'}</td><td><a href="/edit-quiz/${q.id}">Edit</a> | <a href="/view-quiz-results/${q.id}">View Results</a> | <form method="post" action="/delete-quiz" style="display:inline;"><button type="submit" name="id" value="${q.id}">Delete</button></form></td></tr>`;
                });
                quizDefsHtml += '</table>';
                html = html.replace('<!-- Existing quizzes will be inserted here -->', quizDefsHtml);
                // Calculate ranks
                const studentAverages = {};
                quizzes.forEach(quiz => {
                    const results = JSON.parse(quiz.results);
                    let totalCorrect = 0;
                    let totalQuestions = 0;
                    Object.values(results).forEach(subject => {
                        totalCorrect += subject.correct;
                        totalQuestions += subject.total;
                    });
                    if (!studentAverages[quiz.email]) {
                        studentAverages[quiz.email] = { correct: 0, total: 0 };
                    }
                    studentAverages[quiz.email].correct += totalCorrect;
                    studentAverages[quiz.email].total += totalQuestions;
                });
                const averages = Object.entries(studentAverages).map(([email, data]) => ({
                    email,
                    average: data.total > 0 ? (data.correct / data.total) * 100 : 0
                })).sort((a, b) => b.average - a.average);
                const ranks = {};
                averages.forEach((student, index) => {
                    ranks[student.email] = index + 1;
                });
                let quizzesHtml = '';
                quizzes.forEach(quiz => {
                    const results = JSON.parse(quiz.results);
                    const name = userMap[quiz.email] || quiz.email;
                    let resultStr = Object.keys(results).map(subject => `${subject}: ${results[subject].correct}/${results[subject].total}`).join(', ');
                    quizzesHtml += `<li>${name} (Rank: ${ranks[quiz.email] || 'N/A'}) - ${new Date(quiz.date).toLocaleString()} - ${resultStr}</li>`;
                });
                html = html.replace('<!-- Quiz submissions will be inserted here -->', quizzesHtml);
                res.send(html);
            } catch (err) {
                res.status(500).send('Error loading quizzes');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/view-quiz-results/:id', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const quizId = req.params.id;
            const [quizResults] = await db.execute('SELECT * FROM quizzes WHERE quiz_id = ? ORDER BY date DESC', [quizId]);
            const [users] = await db.execute('SELECT email, fullName FROM users');
            const userMap = {};
            users.forEach(u => userMap[u.email] = u.fullName);
            const studentAverages = {};
            quizResults.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                if (!studentAverages[quiz.email]) {
                    studentAverages[quiz.email] = { correct: 0, total: 0 };
                }
                studentAverages[quiz.email].correct += totalCorrect;
                studentAverages[quiz.email].total += totalQuestions;
            });
            const averages = Object.entries(studentAverages).map(([email, data]) => ({
                email,
                average: data.total > 0 ? (data.correct / data.total) * 100 : 0
            })).sort((a, b) => b.average - a.average);
            const ranks = {};
            averages.forEach((student, index) => {
                ranks[student.email] = index + 1;
            });
            let html = `<h1>Results for Quiz ID ${quizId}</h1><ul>`;
            quizResults.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                const name = userMap[quiz.email] || quiz.email;
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 10000) / 100 : 0;
                let resultStr = Object.keys(results).map(subject => `${subject}: ${results[subject].correct}/${results[subject].total}`).join(', ');
                html += `<li>${name} (Score: ${score}%) - ${new Date(quiz.date).toLocaleString()} - ${resultStr}</li>`;
            });
            html += '</ul><a href="/admin">Back</a>';
            res.send(html);
        } else {
            res.redirect('/dashboard.html');
        }
    });

app.get('/admin/updates', async (req, res) => {
    if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
        try {
            console.log('Fetching updates from database...');
            const [updates] = await db.execute(
                `SELECT id, title, content, image, created_at
                 FROM updates
                 ORDER BY created_at DESC`
            );
            console.log('Updates fetched successfully:', updates.length, 'records');

            let html = fs.readFileSync(path.join(__dirname, 'admin-updates.html'), 'utf8');

            let updatesHtml = '';
            updates.forEach(u => {
                updatesHtml += `
                    <li>
                        <strong>${u.title}</strong> – ${u.content}
                        <br>
                        <small>${new Date(u.created_at).toLocaleString()}</small>
                        <form method="post" action="/delete-update" style="display:inline;">
                            <button type="submit" name="id" value="${u.id}">Delete</button>
                        </form>
                    </li>
                `;
            });

            html = html.replace('<!-- Updates will be inserted here -->', updatesHtml);

            let message = '';
            if (req.query.success) message = '<p style="color:green;font-weight:bold">Update added!</p>';
            if (req.query.error) message = '<p style="color:red;font-weight:bold">' + req.query.error + '</p>';

            html = html.replace('<h2>Updates</h2>', '<h2>Updates</h2>' + message);

            res.send(html);
        } catch (err) {
            console.error('Error loading updates:', err);
            res.status(500).send('Error loading updates');
        }
    } else {
        res.redirect('/dashboard.html');
    }
});

    app.get('/admin/notes', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            try {
                const [notes] = await db.execute('SELECT * FROM notes ORDER BY uploaded_at DESC');
                let html = fs.readFileSync(path.join(__dirname, 'admin-notes.html'), 'utf8');
                let notesHtml = '';
                notes.forEach(n => {
                    notesHtml += `<li>${n.subject} - ${n.title} <a href="/uploads/${n.filename}" target="_blank">View</a> <form method="post" action="/delete-note" style="display:inline;"><button type="submit" name="id" value="${n.id}">Delete</button></form></li>`;
                });
                html = html.replace('<!-- Notes will be inserted here -->', notesHtml);
                res.send(html);
            } catch (err) {
                res.status(500).send('Error loading notes');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/delete-note', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                const [note] = await db.execute('SELECT filename FROM notes WHERE id = ?', [id]);
                if (note.length > 0) {
                    const filePath = path.join(__dirname, 'uploads', note[0].filename);
                    fs.unlinkSync(filePath);
                }
                await db.execute('DELETE FROM notes WHERE id = ?', [id]);
                res.redirect('/admin/notes');
            } catch (err) {
                res.status(500).send('Error deleting note');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

app.get('/api/updates', async (req, res) => {
try {
    const [updates] = await db.execute(
        `SELECT id, title, content, image, created_at as date
         FROM updates
         ORDER BY created_at DESC`
    );

    res.json(updates);
} catch (err) {
    console.error("Student updates error:", err);
    res.status(500).json({ error: 'Failed to load updates' });
}
});


    app.post('/add-update', upload.single('image'), async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { title, content } = req.body;
            if (!req.file) {
                return res.redirect('/admin/updates?error=Image is required');
            }
            const image = req.file.filename;
            try {
                await db.execute('INSERT INTO updates (title, content, image) VALUES (?, ?, ?)', [title, content, image]);
                res.redirect('/admin/updates?success=1');
            } catch (err) {
                console.error(err);
                res.redirect('/admin/updates?error=' + encodeURIComponent(err.message));
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/delete-update', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                await db.execute('DELETE FROM updates WHERE id = ?', [id]);
                res.redirect('/admin/updates');
            } catch (err) {
                res.status(500).send('Error deleting update');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/update-mdcat-date', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { mdcat_date } = req.body;
            try {
                await db.execute('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', ['mdcat_date', mdcat_date, mdcat_date]);
                res.redirect('/admin-menu.html?success=mdcat');
            } catch (err) {
                res.status(500).send('Error updating MDCAT date');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/upload-syllabus', upload.single('syllabus'), async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            if (!req.file) {
                return res.redirect('/admin-menu.html?error=No file uploaded');
            }
            const filename = req.file.filename;
            try {
                await db.execute('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', ['syllabus_file', filename, filename]);
                res.redirect('/admin-menu.html?success=syllabus');
            } catch (err) {
                res.redirect('/admin-menu.html?error=' + encodeURIComponent(err.message));
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/upload-notes', upload.single('file'), async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            if (!req.file) {
                return res.redirect('/admin/notes?error=No file uploaded');
            }
            const { subject, title } = req.body;
            const { filename, originalname, mimetype, size } = req.file;
            try {
                await db.execute('INSERT INTO notes (subject, title, filename, originalname, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)', [subject, title, filename, originalname, mimetype, size]);
                res.redirect('/admin/notes?success=Note uploaded successfully');
            } catch (err) {
                res.redirect('/admin/notes?error=' + encodeURIComponent(err.message));
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/api/notes', async (req, res) => {
        try {
            const [notes] = await db.execute('SELECT id, subject, title, filename, uploaded_at FROM notes ORDER BY uploaded_at DESC');
            const notesWithUrl = notes.map(note => {
                const filePath = path.join(__dirname, 'uploads', note.filename);
                let fileSize = 0;
                try {
                    const stats = fs.statSync(filePath);
                    fileSize = stats.size;
                } catch (err) {
                    console.error('Error getting file size:', err);
                }

                return {
                    id: note.id,
                    subject: note.subject,
                    title: note.title,
                    filename: note.filename,
                    url: `/note-content/${note.id}`,
                    uploaded_at: note.uploaded_at,
                    fileSize: fileSize,
                    formattedSize: formatFileSize(fileSize),
                    formattedDate: new Date(note.uploaded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                };
            });
            res.json(notesWithUrl);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching notes' });
        }
    });

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    app.get('/note-content/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const [note] = await db.execute('SELECT filename, mimetype FROM notes WHERE id = ?', [id]);
            if (note.length === 0) {
                return res.status(404).send('Note not found');
            }
            const filePath = path.join(__dirname, 'uploads', note[0].filename);

            // Security headers to prevent downloading and printing
            res.setHeader('Content-Type', note[0].mimetype);
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Download-Options', 'noopen');
            res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

            fs.createReadStream(filePath).pipe(res);
        } catch (err) {
            res.status(500).send('Error serving note');
        }
    });

    app.delete('/api/notes/:id', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.params;
            try {
                const [note] = await db.execute('SELECT filename FROM notes WHERE id = ?', [id]);
                if (note.length > 0) {
                    const filePath = path.join(__dirname, 'uploads', note[0].filename);
                    fs.unlinkSync(filePath); // Delete file
                }
                await db.execute('DELETE FROM notes WHERE id = ?', [id]);
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: 'Error deleting note' });
            }
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    });


    app.post('/approve', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com') {
            const { email, status } = req.body;
            const approved = status === 'approved';
            try {
                await db.execute('UPDATE users SET approved = ? WHERE email = ?', [approved, email]);
                res.redirect('/admin/students');
            } catch (err) {
                res.status(500).send('Error updating user');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/api/students', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [students] = await db.execute('SELECT id, fullName, fatherName, district, whatsapp, status, email FROM users WHERE approved = ? AND email NOT IN (?, ?)', [false, 'biologia.info1@gmail.com', 'admin@medminds.com']);
            res.json(students);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching students' });
        }
    });

    app.post('/api/students/approve', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updates = req.body;
        try {
            for (const update of updates) {
                const approved = update.action === 'approve';
                await db.execute('UPDATE users SET approved = ? WHERE id = ?', [approved, update.id]);
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Error updating approvals' });
        }
    });

    app.get('/api/approved-students', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [approvedUsers] = await db.execute('SELECT id, fullName, fatherName, district, whatsapp, status, email FROM users WHERE approved = ? AND email NOT IN (?, ?)', [true, 'biologia.info1@gmail.com', 'admin@medminds.com']);
            // Calculate scores
            const [allQuizzes] = await db.execute('SELECT email, results FROM quizzes');
            const userScores = {};
            allQuizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                if (!userScores[quiz.email]) userScores[quiz.email] = { correct: 0, total: 0 };
                userScores[quiz.email].correct += totalCorrect;
                userScores[quiz.email].total += totalQuestions;
            });
            const leaderboard = approvedUsers.map(user => ({
                id: user.id,
                fullName: user.fullName,
                fatherName: user.fatherName,
                district: user.district,
                whatsapp: user.whatsapp,
                status: user.status,
                email: user.email,
                score: userScores[user.email] ? Math.round((userScores[user.email].correct / userScores[user.email].total) * 10000) / 100 : 0
            })).sort((a, b) => b.score - a.score);
            // Assign ranks
            leaderboard.forEach((student, index) => {
                student.rank = index + 1;
            });
            res.json(leaderboard);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching approved students' });
        }
    });

    app.get('/api/settings', async (req, res) => {
        try {
            const [mdcatDateSetting] = await db.execute('SELECT value FROM settings WHERE key_name = ?', ['mdcat_date']);
            const [syllabusSetting] = await db.execute('SELECT value FROM settings WHERE key_name = ?', ['syllabus_file']);
            const mdcatDate = mdcatDateSetting[0]?.value || '';
            const syllabusFile = syllabusSetting[0]?.value || '';
            res.json({ mdcatDate, syllabusFile });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching settings' });
        }
    });

    app.get('/api/dashboard', async (req, res) => {
        try {
            const [signedUpUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE email NOT IN (?, ?)', ['biologia.info1@gmail.com', 'admin@medminds.com']);
            const signedUpCount = signedUpUsers[0].count;
            const [quizzes] = await db.execute('SELECT results FROM quizzes');
            let totalScore = 0;
            let totalQuizzes = 0;
            quizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                Object.values(results).forEach(subject => {
                    totalScore += (subject.correct / subject.total) * 100;
                    totalQuizzes++;
                });
            });
            const averageScore = totalQuizzes > 0 ? (totalScore / totalQuizzes).toFixed(2) : 0;
            const [updates] = await db.execute('SELECT * FROM updates ORDER BY created_at DESC LIMIT 5');
            const updatesData = updates.map(u => ({
                title: u.title,
                content: u.content,
                date: u.created_at,
                image: u.image
            }));
            const [mdcatDateSetting] = await db.execute('SELECT value FROM settings WHERE key_name = ?', ['mdcat_date']);
            const [syllabusSetting] = await db.execute('SELECT value FROM settings WHERE key_name = ?', ['syllabus_file']);
            const mdcatDate = mdcatDateSetting[0]?.value || '';
            const syllabusFile = syllabusSetting[0]?.value || '';
            res.json({ signedUpCount, averageScore, updates: updatesData, mdcatDate, syllabusFile });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching dashboard data' });
        }
    });

  app.get('/api/q-bank', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const email = req.session.user;

        // Load only published questions
        const [questions] = await db.execute(
            'SELECT id, subject, question, opt1, opt2, opt3, opt4, correct, image FROM questions WHERE published = 1 AND (quiz_only IS NULL OR quiz_only = 0)'
        );

        // Load user's answers
        const [answers] = await db.execute(
            'SELECT question_id, user_answer FROM q_bank_answers WHERE email = ?',
            [email]
        );

        const answerMap = {};
        answers.forEach(a => {
            answerMap[a.question_id] = a.user_answer;
        });

        const subjects = {};

        questions.forEach(q => {
            if (!subjects[q.subject]) subjects[q.subject] = [];

            const userAnswer = answerMap[q.id];
            const status =
                userAnswer === undefined
                    ? "unattempted"
                    : userAnswer == q.correct
                    ? "correct"
                    : "wrong";

            // Only include questions that are not wrong
            if (status !== "wrong") {
                subjects[q.subject].push({
                    id: q.id,
                    question: q.question,
                    opt1: q.opt1,
                    opt2: q.opt2,
                    opt3: q.opt3,
                    opt4: q.opt4,
                    image: q.image,
                    status: status
                });
            }
        });

        // Sort inside each subject:
        // Unattempted → Wrong → Correct
        Object.keys(subjects).forEach(subject => {
            const order = { unattempted: 0, wrong: 1, correct: 2 };
            subjects[subject].sort((a, b) => order[a.status] - order[b.status]);
        });

        res.json({
            subjects,
            userEmail: email
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching Q-Bank data' });
    }
});

app.get('/api/mistake-corner', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const email = req.session.user;

        // Load only published questions that the user got wrong
        const [questions] = await db.execute(
            `SELECT q.id, q.subject, q.question, q.opt1, q.opt2, q.opt3, q.opt4, q.correct, q.image, q.explanation, qa.user_answer
             FROM questions q
             JOIN q_bank_answers qa ON q.id = qa.question_id
             WHERE q.published = 1 AND qa.email = ? AND qa.user_answer != q.correct`,
            [email]
        );

        const subjects = {};

        questions.forEach(q => {
            if (!subjects[q.subject]) subjects[q.subject] = [];

            subjects[q.subject].push({
                id: q.id,
                question: q.question,
                opt1: q.opt1,
                opt2: q.opt2,
                opt3: q.opt3,
                opt4: q.opt4,
                correct: q.correct,
                image: q.image,
                explanation: q.explanation,
                userAnswer: q.user_answer
            });
        });

        res.json({
            subjects,
            userEmail: email
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching Mistake Corner data' });
    }
});

    app.get('/api/quizzes', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }
        // Check if user is approved (except admins)
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            const [user] = await db.execute('SELECT approved FROM users WHERE email = ?', [req.session.user]);
            if (!user.length || !user[0].approved) {
                return res.status(403).json({ error: 'Your account is not approved by admin.' });
            }
        }
        try {
            const [quizzes] = await db.execute(
                'SELECT * FROM quiz_definitions WHERE start_time <= NOW() AND (end_time IS NULL OR end_time >= NOW())'
            );
            res.json(quizzes);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching quizzes' });
        }
    });
    
    app.get('/api/questions/:subject', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }
        try {
            const [questions] = await db.execute('SELECT id, question FROM questions WHERE subject = ? AND published = 1 AND (quiz_only IS NULL OR quiz_only = 0) ORDER BY id DESC', [req.params.subject]);
            res.json(questions);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching questions' });
        }
    });
    
    

// Public route to get quiz details for shared links
app.get('/api/public/quiz/:id', async (req, res) => {
    const quizId = req.params.id;
    try {
        const [quizDef] = await db.execute(
            'SELECT id, name, subject, topics, duration, totalMcqs, questions, start_time, end_time, testType FROM quiz_definitions WHERE id = ?',
            [quizId]
        );

        if (!quizDef.length) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const questionIds = JSON.parse(quizDef[0].questions || '[]');

        if (!questionIds.length) {
            return res.status(404).json({ error: 'This quiz has no questions.' });
        }

        const placeholders = questionIds.map(() => '?').join(',');

        // Fetch questions
        const [questions] = await db.execute(
            `SELECT * FROM questions
             WHERE id IN (${placeholders}) AND (published = TRUE OR quiz_only = TRUE)`,
            questionIds
        );

        const quizData = {
            id: quizDef[0].id,
            name: quizDef[0].name,
            subject: quizDef[0].subject,
            topics: quizDef[0].topics,
            duration: quizDef[0].duration,
            totalMcqs: quizDef[0].totalMcqs,
            start_time: quizDef[0].start_time,
            end_time: quizDef[0].end_time,
            testType: quizDef[0].testType,
            questions: questions
        };

        res.json(quizData);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching quiz' });
    }
});

app.get('/api/quiz/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    // Check if user is approved (except admins)
    if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
        const [user] = await db.execute('SELECT approved FROM users WHERE email = ?', [req.session.user]);
        if (!user.length || !user[0].approved) {
            return res.status(403).json({ error: 'Your account is not approved by admin.' });
        }
    }

    const quizId = req.params.id;

    try {
        // Check if user has already attempted this quiz
        const [existingAttempt] = await db.execute(
            'SELECT * FROM quizzes WHERE email = ? AND quiz_id = ?',
            [req.session.user, quizId]
        );

        if (existingAttempt.length > 0) {
            return res.json({ error: 'You have already attempted this quiz. Only one attempt is allowed.', attempted: true, results: existingAttempt[0] });
        }

        // Only allow ACTIVE quizzes
        const [quizDef] = await db.execute(
            `SELECT * FROM quiz_definitions
             WHERE id = ?
              AND start_time <= NOW()
              AND (end_time IS NULL OR end_time >= NOW())`,
            [quizId]
        );

        if (!quizDef.length) {
            return res.status(404).json({ error: 'Quiz not active or not found' });
        }

        const questionIds = JSON.parse(quizDef[0].questions || '[]');

        if (!questionIds.length) {
            // Check if user is admin
            if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
                return res.json({ error: 'This quiz has no questions assigned. Please add questions to this quiz from the admin panel.' });
            } else {
                return res.json({ error: 'This quiz is not available yet. Please try again later.' });
            }
        }

        const placeholders = questionIds.map(() => '?').join(',');

        // Fetch questions
        const [questions] = await db.execute(
            `SELECT * FROM questions
             WHERE id IN (${placeholders}) AND (published = TRUE OR quiz_only = TRUE)`,
            questionIds
        );

        const quizData = {
            name: quizDef[0].name,
            topics: quizDef[0].topics,
            totalMcqs: quizDef[0].totalMcqs,
            duration: quizDef[0].duration,
            questions: questions.map(q => ({
                id: q.id,
                question: q.question,
                opt1: q.opt1,
                opt2: q.opt2,
                opt3: q.opt3,
                opt4: q.opt4,
                image: q.image,
                correct: q.correct + 1 // Convert from 0-based to 1-based
            }))
        };

        res.json(quizData);

    } catch (err) {
        console.error('Quiz load error:', err);
        res.status(500).json({ error: 'Error fetching quiz' });
    }
});


    app.get('/api/mistakes', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }
        try {
            const [mistakes] = await db.execute('SELECT * FROM mistakes WHERE email = ? ORDER BY date DESC', [req.session.user]);
            const mistakesData = mistakes.map(m => ({
                question: m.question,
                options: JSON.parse(m.options),
                correct: m.correct,
                userAnswer: m.userAnswer,
                date: m.date
            }));
            res.json(mistakesData);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching mistakes' });
        }
    });

    app.get('/api/statics', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }
        try {
            const [userQuizzes] = await db.execute('SELECT * FROM quizzes WHERE email = ?', [req.session.user]);
            const totalQuizzes = userQuizzes.length;
            let totalQuestions = 0;
            let totalCorrect = 0;
            const subjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'];
            const subjectStats = {};
            subjects.forEach(s => subjectStats[s] = { correct: 0, total: 0 });
            userQuizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                Object.keys(results).forEach(subject => {
                    subjectStats[subject].correct += results[subject].correct;
                    subjectStats[subject].total += results[subject].total;
                });
                totalQuestions += Object.values(results).reduce((sum, s) => sum + s.total, 0);
                totalCorrect += Object.values(results).reduce((sum, s) => sum + s.correct, 0);
            });
            const averageAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : 0;

            // Calculate login streak
            const [loginDates] = await db.execute('SELECT date FROM login_dates WHERE email = ? ORDER BY date DESC', [req.session.user]);
            const loginDateStrings = [...new Set(loginDates.map(l => l.date))].sort();
            let streak = 0;
            let currentDate = new Date().toISOString().split('T')[0];
            while (loginDateStrings.includes(currentDate)) {
                streak++;
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 1);
                currentDate = d.toISOString().split('T')[0];
            }

            // Q-Bank streak
            const [qBankAttempts] = await db.execute('SELECT date FROM q_bank_attempts WHERE email = ? ORDER BY date DESC', [req.session.user]);
            const qDates = [...new Set(qBankAttempts.map(a => a.date))].sort();
            let qBankStreak = 0;
            let currentDateQBank = new Date().toISOString().split('T')[0];
            while (qDates.includes(currentDateQBank)) {
                qBankStreak++;
                const d = new Date(currentDateQBank);
                d.setDate(d.getDate() - 1);
                currentDateQBank = d.toISOString().split('T')[0];
            }

            // Weak areas
            const weakAreas = [];
            subjects.forEach(subject => {
                const acc = subjectStats[subject].total > 0 ? ((subjectStats[subject].correct / subjectStats[subject].total) * 100) : 0;
                if (acc < 60 && subjectStats[subject].total > 0) {
                    weakAreas.push(`${subject}: ${acc.toFixed(2)}%`);
                }
            });

            // Q-Bank stats
            const [qBankAnswers] = await db.execute('SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?', [req.session.user]);
            const subjectAttempted = {};
            const subjectCorrect = {};
            qBankAnswers.forEach(answer => {
                const subject = answer.subject;
                if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
                if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
                subjectAttempted[subject]++;
                if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
            });
            const totalQBankAttempted = qBankAnswers.length;

            // Leaderboard
            const [allQuizzes] = await db.execute('SELECT email, results FROM quizzes');
            const userScores = {};
            allQuizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                if (!userScores[quiz.email]) userScores[quiz.email] = { correct: 0, total: 0, quizzes: 0 };
                userScores[quiz.email].correct += totalCorrect;
                userScores[quiz.email].total += totalQuestions;
                userScores[quiz.email].quizzes += 1;
            });
            const [users] = await db.execute('SELECT * FROM users WHERE email NOT IN (?, ?)', ['biologia.info1@gmail.com', 'admin@medminds.com']);
            const userMap = {};
            users.forEach(u => userMap[u.email] = u);
            const attemptedUsers = users.filter(user => userScores[user.email] && userScores[user.email].quizzes > 0);
            const fullLeaderboard = attemptedUsers.map(user => ({
                email: user.email,
                name: user.fullName,
                district: user.district || 'N/A',
                quizzes: userScores[user.email]?.quizzes || 0,
                totalMcqs: userScores[user.email]?.total || 0,
                correctMcqs: userScores[user.email]?.correct || 0,
                score: userScores[user.email] ? Math.round((userScores[user.email].correct / userScores[user.email].total) * 10000) / 100 : 0
            })).sort((a, b) => b.quizzes - a.quizzes);

            fullLeaderboard.forEach((entry, index) => {
                entry.overallRank = index + 1;
            });

            const districtGroups = {};
            fullLeaderboard.forEach(entry => {
                if (!districtGroups[entry.district]) districtGroups[entry.district] = [];
                districtGroups[entry.district].push(entry);
            });
            Object.keys(districtGroups).forEach(district => {
                districtGroups[district].sort((a, b) => b.quizzes - a.quizzes);
                districtGroups[district].forEach((entry, index) => {
                    entry.districtRank = index + 1;
                });
            });

            const leaderboard = fullLeaderboard.slice(0, 10);

            const user = userMap[req.session.user];
            const userEntry = fullLeaderboard.find(entry => entry.email === req.session.user);
            const userRank = userEntry ? userEntry.overallRank : 'N/A';
            const userDistrictRank = userEntry ? userEntry.districtRank : 'N/A';

            res.json({
                totalQuizzes,
                totalQuestions,
                totalCorrect,
                averageAccuracy,
                streak,
                qBankStreak,
                weakAreas,
                subjectAttempted,
                subjectCorrect,
                totalQBankAttempted,
                subjectStats,
                leaderboard,
                userProfile: {
                    name: user.fullName,
                    fatherName: user.fatherName || 'N/A',
                    district: user.district || 'N/A',
                    overallRank: userRank,
                    districtRank: userDistrictRank
                }
            });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching statics' });
        }
    });

    app.get('/api/admin/students', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [users] = await db.execute('SELECT * FROM users');
            const students = users.filter(u => u.email !== 'biologia.info1@gmail.com' && u.email !== 'admin@medminds.com').map(u => ({
                fullName: u.fullName,
                email: u.email,
                password: u.password,
                approved: u.approved
            }));
            res.json(students);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching students' });
        }
    });

    app.get('/api/admin/questions', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [questions] = await db.execute('SELECT * FROM questions');
            res.json(questions);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching questions' });
        }
    });

    app.get('/api/admin/quizzes', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [quizDefs] = await db.execute('SELECT * FROM quiz_definitions');
            const [quizzes] = await db.execute('SELECT * FROM quizzes ORDER BY date DESC');
            const [users] = await db.execute('SELECT email, fullName FROM users');
            const userMap = {};
            users.forEach(u => userMap[u.email] = u.fullName);
            // Calculate ranks
            const studentAverages = {};
            quizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                if (!studentAverages[quiz.email]) {
                    studentAverages[quiz.email] = { correct: 0, total: 0 };
                }
                studentAverages[quiz.email].correct += totalCorrect;
                studentAverages[quiz.email].total += totalQuestions;
            });
            const averages = Object.entries(studentAverages).map(([email, data]) => ({
                email,
                average: data.total > 0 ? (data.correct / data.total) * 100 : 0
            })).sort((a, b) => b.average - a.average);
            const ranks = {};
            averages.forEach((student, index) => {
                ranks[student.email] = index + 1;
            });
            const quizSubmissions = quizzes.map(quiz => {
                const results = JSON.parse(quiz.results);
                const name = userMap[quiz.email] || quiz.email;
                let resultStr = Object.keys(results).map(subject => `${subject}: ${results[subject].correct}/${results[subject].total}`).join(', ');
                return {
                    name,
                    rank: ranks[quiz.email] || 'N/A',
                    date: quiz.date,
                    resultStr,
                    quizId: quiz.quiz_id
                };
            });
            res.json({ quizDefs, quizSubmissions });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching admin quizzes' });
        }
    });

    app.get('/api/admin/quiz-list', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [quizzes] = await db.execute('SELECT * FROM quiz_definitions ORDER BY id DESC');
            res.json(quizzes);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching quizzes' });
        }
    });

    app.get('/api/quiz-submissions/:quizId', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const quizId = req.params.quizId;
        try {
            const [submissions] = await db.execute(
                'SELECT q.email, q.score, q.total, q.date, u.fullName FROM quizzes q JOIN users u ON q.email = u.email WHERE q.quiz_id = ? ORDER BY q.date DESC',
                [quizId]
            );
            res.json(submissions);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching submissions' });
        }
    });

    app.get('/api/admin/quiz-results/:id', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const quizId = req.params.id;
        try {
            const [quizResults] = await db.execute('SELECT * FROM quizzes WHERE quiz_id = ? ORDER BY date DESC', [quizId]);
            const [users] = await db.execute('SELECT email, fullName FROM users');
            const userMap = {};
            users.forEach(u => userMap[u.email] = u.fullName);
            const studentAverages = {};
            quizResults.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(results).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                if (!studentAverages[quiz.email]) {
                    studentAverages[quiz.email] = { correct: 0, total: 0 };
                }
                studentAverages[quiz.email].correct += totalCorrect;
                studentAverages[quiz.email].total += totalQuestions;
            });
            const averages = Object.entries(studentAverages).map(([email, data]) => ({
                email,
                average: data.total > 0 ? (data.correct / data.total) * 100 : 0
            })).sort((a, b) => b.average - a.average);
            const ranks = {};
            averages.forEach((student, index) => {
                ranks[student.email] = index + 1;
            });
            const results = quizResults.map(quiz => {
                const resultsParsed = JSON.parse(quiz.results);
                const name = userMap[quiz.email] || quiz.email;
                let totalCorrect = 0;
                let totalQuestions = 0;
                Object.values(resultsParsed).forEach(subject => {
                    totalCorrect += subject.correct;
                    totalQuestions += subject.total;
                });
                const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 10000) / 100 : 0;
                let resultStr = Object.keys(resultsParsed).map(subject => `${subject}: ${resultsParsed[subject].correct}/${resultsParsed[subject].total}`).join(', ');
                return {
                    name,
                    score,
                    date: quiz.date,
                    resultStr
                };
            });
            res.json({ quizId, results });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching quiz results' });
        }
    });

  app.get('/api/admin/updates', async (req, res) => {
    if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const [updates] = await db.execute(
            `SELECT id, title, content, image, published, created_at
             FROM updates
             ORDER BY created_at DESC`
        );

        res.json(updates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching updates' });
    }
});

    app.get('/api/admin/notes', async (req, res) => {
        if (req.session.user !== 'biologia.info1@gmail.com' && req.session.user !== 'admin@medminds.com') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const [notes] = await db.execute('SELECT * FROM notes ORDER BY uploaded_at DESC');
            res.json(notes);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching notes' });
        }
    });

    app.get('/get-question/:id', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.params;
            try {
                const [questions] = await db.execute('SELECT * FROM questions WHERE id = ?', [id]);
                if (questions.length > 0) {
                    res.json({ success: true, question: questions[0] });
                } else {
                    res.status(404).json({ success: false, message: 'Question not found' });
                }
            } catch (err) {
                res.status(500).json({ success: false, message: 'Error fetching question' });
            }
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized', sessionUser: req.session.user });
        }
    });

    app.post('/add-question', upload.single('image'), async (req, res) => {
      console.log('Session user:', req.session.user);
      if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {

        let { id, subject, otherSubject, chapter, question, opt1, opt2, opt3, opt4, correct, explanation, quiz_only } = req.body;

        explanation = explanation || '';

        if (!subject || !chapter || !question || !opt1 || !opt2 || !opt3 || !opt4 || !correct) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (isNaN(parseInt(correct)) || parseInt(correct) < 1 || parseInt(correct) > 4) {
            return res.status(400).json({ success: false, message: 'Correct option must be 1-4' });
        }

        if (subject === 'Other') {
            subject = otherSubject;
        }

        const image = req.file ? req.file.filename : null;

        try {
            if (id) {
                // UPDATE QUESTION (do NOT delete image if no new one uploaded)
                const isQuizOnly = quiz_only === 'true' || quiz_only === true;
                if (image) {
                    await db.execute(
                        'UPDATE questions SET subject = ?, chapter = ?, question = ?, opt1 = ?, opt2 = ?, opt3 = ?, opt4 = ?, correct = ?, image = ?, explanation = ?, quiz_only = ? WHERE id = ?',
                        [subject, chapter, question, opt1, opt2, opt3, opt4, parseInt(correct) - 1, image, explanation, isQuizOnly, id]
                    );
                } else {
                    await db.execute(
                        'UPDATE questions SET subject = ?, chapter = ?, question = ?, opt1 = ?, opt2 = ?, opt3 = ?, opt4 = ?, correct = ?, explanation = ?, quiz_only = ? WHERE id = ?',
                        [subject, chapter, question, opt1, opt2, opt3, opt4, parseInt(correct) - 1, explanation, isQuizOnly, id]
                    );
                }

                res.json({ success: true, message: 'Question updated successfully' });

            } else {
                // INSERT NEW QUESTION (AUTO-PUBLISH)
                const isQuizOnly = quiz_only === 'true' || quiz_only === true;
                const [result] = await db.execute(
                    'INSERT INTO questions (subject, chapter, question, opt1, opt2, opt3, opt4, correct, image, explanation, published, quiz_only) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [subject, chapter, question, opt1, opt2, opt3, opt4, parseInt(correct) - 1, image, explanation, true, isQuizOnly]
                );

                res.json({ success: true, message: 'Question added successfully', id: result.insertId });
            }

        } catch (err) {
            console.error('Error saving question:', err);
            res.status(500).json({ success: false, message: err.message });
        }

    } else {
        res.status(403).json({ success: false, message: 'Unauthorized' });
    }
});


    app.post('/delete-question', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                await db.execute('DELETE FROM questions WHERE id = ?', [id]);
                res.redirect('/admin-questions.html');
            } catch (err) {
                res.status(500).send('Error deleting question');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/publish-question', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                await db.execute('UPDATE questions SET published = ? WHERE id = ?', [true, id]);
                res.redirect('/admin-questions.html');
            } catch (err) {
                res.status(500).send('Error publishing question');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/unpublish-question', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                await db.execute('UPDATE questions SET published = ? WHERE id = ?', [false, id]);
                res.redirect('/admin-questions.html');
            } catch (err) {
                res.status(500).send('Error unpublishing question');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.post('/create-quiz', async (req, res) => {
     if (req.session.user) {

        let { name, subject, topics, duration, totalMcqs, questions: selectedQuestions, startTime, endTime, testType } = req.body;

        // Normalize questions array
        let questionsArray = [];
        if (Array.isArray(selectedQuestions)) {
            questionsArray = selectedQuestions.map(Number);
        } else if (selectedQuestions) {
            questionsArray = [Number(selectedQuestions)];
        }

        // Safety defaults (PREVENT undefined crash)
        name = name || '';
        subject = subject || '';
        topics = topics || '';
        duration = parseInt(duration) || 0;
        totalMcqs = parseInt(totalMcqs) || questionsArray.length;
        startTime = startTime || new Date();
        endTime = endTime || new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 day
        testType = testType || 'General';

        if (!questionsArray.length) {
            return res.status(400).json({ success: false, message: 'No questions selected' });
        }

        if (questionsArray.length !== totalMcqs) {
            return res.status(400).json({
                success: false,
                message: `You selected ${questionsArray.length} questions but total MCQs is ${totalMcqs}`
            });
        }

        try {
            await db.execute(
                `INSERT INTO quiz_definitions 
                 (name, subject, topics, duration, totalMcqs, questions, start_time, end_time, testType) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    subject,
                    topics,
                    duration,
                    totalMcqs,
                    JSON.stringify(questionsArray),
                    startTime,
                    endTime,
                    testType
                ]
            );

            res.json({ success: true, message: 'Quiz created successfully' });

        } catch (err) {
            console.error('Error creating quiz:', err);
            res.status(500).json({ success: false, message: err.message });
        }

    } else {
        res.status(403).json({ success: false, message: 'Unauthorized' });
    }
});


    app.post('/delete-quiz', async (req, res) => {
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            const { id } = req.body;
            try {
                await db.execute('DELETE FROM quiz_definitions WHERE id = ?', [id]);
                res.redirect('/admin/quizzes');
            } catch (err) {
                res.status(500).send('Error deleting quiz');
            }
        } else {
            res.redirect('/dashboard.html');
        }
    });


    app.get('/home.html', (req, res) => {
        if (req.session.user) {
            res.sendFile(path.join(__dirname, 'home.html'));
        } else {
            res.redirect('/dashboard.html');
        }
    });

    app.get('/dashboard.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    });

    app.get('/Q-Bank.html', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        res.sendFile(path.join(__dirname, 'Q-Bank.html'));
    });

    app.get('/quiz.html', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        res.sendFile(path.join(__dirname, 'quiz.html'));
    });

    app.get('/quiz/:id', (req, res) => {
        // Allow access to quiz page even if not logged in for shared links
        // Access control will be handled by the API
        res.sendFile(path.join(__dirname, 'quiz.html'));
    });

    app.get('/student-notes.html', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        res.sendFile(path.join(__dirname, 'student-notes.html'));
    });

    app.get('/MistakeCorner.html', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        res.sendFile(path.join(__dirname, 'MistakeCorner.html'));
    });

    app.get('/statics.html', async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        let html = fs.readFileSync(path.join(__dirname, 'statics.html'), 'utf8');
        const [userQuizzes] = await db.execute('SELECT * FROM quizzes WHERE email = ?', [req.session.user]);
        const totalQuizzes = userQuizzes.length;
        let totalQuestions = 0;
        let totalCorrect = 0;
        const subjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'];
        const subjectStats = {};
        subjects.forEach(s => subjectStats[s] = { correct: 0, total: 0 });
        userQuizzes.forEach(quiz => {
            const results = JSON.parse(quiz.results);
            Object.keys(results).forEach(subject => {
                subjectStats[subject].correct += results[subject].correct;
                subjectStats[subject].total += results[subject].total;
            });
            totalQuestions += Object.values(results).reduce((sum, s) => sum + s.total, 0);
            totalCorrect += Object.values(results).reduce((sum, s) => sum + s.correct, 0);
        });
        const averageAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : 0;

        // Calculate streak
        const dates = [...new Set(userQuizzes.map(q => new Date(q.date).toISOString().split('T')[0]))].sort();
        let streak = 0;
        let currentDate = new Date().toISOString().split('T')[0];
        while (dates.includes(currentDate)) {
            streak++;
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 1);
            currentDate = d.toISOString().split('T')[0];
        }

        // Calculate Q-Bank streak
        const [qBankAttempts] = await db.execute('SELECT date FROM q_bank_attempts WHERE email = ? ORDER BY date DESC', [req.session.user]);
        const qDates = [...new Set(qBankAttempts.map(a => a.date))].sort();
        let qBankStreak = 0;
        let currentDateQBank = new Date().toISOString().split('T')[0];
        while (qDates.includes(currentDateQBank)) {
            qBankStreak++;
            const d = new Date(currentDateQBank);
            d.setDate(d.getDate() - 1);
            currentDateQBank = d.toISOString().split('T')[0];
        }

        // Calculate longest Q-Bank streak
        let longestQBankStreak = 0;
        if (qDates.length > 0) {
            let tempStreak = 1;
            for (let i = 1; i < qDates.length; i++) {
                const prev = new Date(qDates[i - 1]);
                const curr = new Date(qDates[i]);
                const diff = (prev - curr) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    tempStreak++;
                    longestQBankStreak = Math.max(longestQBankStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
            longestQBankStreak = Math.max(longestQBankStreak, 1); // at least 1 if any
        }

        // Weak areas: subjects with accuracy < 60%
        const weakAreas = [];
        subjects.forEach(subject => {
            const acc = subjectStats[subject].total > 0 ? ((subjectStats[subject].correct / subjectStats[subject].total) * 100) : 0;
            if (acc < 60 && subjectStats[subject].total > 0) {
                weakAreas.push(`${subject}: ${acc.toFixed(2)}%`);
            }
        });

        // Calculate Q-Bank stats
        const [qBankAnswers] = await db.execute('SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?', [req.session.user]);
        const subjectAttempted = {};
        const subjectCorrect = {};
        qBankAnswers.forEach(answer => {
            const subject = answer.subject;
            if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
            if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
            subjectAttempted[subject]++;
            if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
        });
        const totalQBankAttempted = qBankAnswers.length;
        const overallAverage = averageAccuracy;
        const totalCorrectAnswers = totalCorrect;

        let statsHtml = `<p>Total Quizzes Attempted: ${totalQuizzes}</p>
            <p>Total Questions Attempted: ${totalQuestions}</p>
            <p>Average Accuracy: ${averageAccuracy}%</p>
            <p>Current Streak: ${streak} days</p>
            <p>Current Q-Bank Streak: ${qBankStreak} days</p>
            <p>Total Q-Bank Questions Attempted: ${totalQBankAttempted}</p>
            <p>Overall Average Accuracy: ${overallAverage}%</p>
            <p>Total Correct Answers: ${totalCorrectAnswers}</p>
            <p>Subject-wise Q-Bank Attempts:</p>`;
        Object.keys(subjectAttempted).forEach(subject => {
            const attempted = subjectAttempted[subject];
            const bar = '|'.repeat(Math.min(attempted, 20));
            statsHtml += `<p>${subject}: [${bar}] ${attempted}</p>`;
        });
        statsHtml += '<p>Q-Bank Weak Areas:</p><ul>';
        Object.keys(subjectAttempted).forEach(subject => {
            const acc = subjectCorrect[subject] ? ((subjectCorrect[subject] / subjectAttempted[subject]) * 100) : 0;
            if (acc < 60) {
                statsHtml += `<li>${subject}: ${acc.toFixed(2)}%</li>`;
            }
        });
        statsHtml += '</ul><p>Weak Areas:</p><ul>';
        if (weakAreas.length > 0) {
            weakAreas.forEach(area => statsHtml += `<li>${area}</li>`);
        } else {
            statsHtml += `<li>No weak areas detected.</li>`;
        }
        statsHtml += '</ul>';
        subjects.forEach(subject => {
            const acc = subjectStats[subject].total > 0 ? ((subjectStats[subject].correct / subjectStats[subject].total) * 100).toFixed(2) : 0;
            statsHtml += `<p>${subject} Accuracy: ${acc}% (${subjectStats[subject].correct}/${subjectStats[subject].total})</p>`;
        });

        // Generate combined subject performance bar chart
        let totalSubjectQuestions = subjects.reduce((sum, subject) => sum + subjectStats[subject].total, 0);
        let combinedBarHtml = '<div class="combined-bar-container">';
        combinedBarHtml += '<div class="combined-progress-bar">';

        const subjectColors = {
            'Biology': '#10b981',
            'Chemistry': '#f59e0b',
            'Physics': '#ef4444',
            'English': '#8b5cf6',
            'Logical Reasoning': '#06b6d4'
        };

        subjects.forEach(subject => {
            if (subjectStats[subject].total > 0) {
                const percentage = (subjectStats[subject].total / totalSubjectQuestions) * 100;
                const accuracy = ((subjectStats[subject].correct / subjectStats[subject].total) * 100).toFixed(1);
                combinedBarHtml += `<div class="subject-segment" style="width: ${percentage}%; background: ${subjectColors[subject] || '#6b7280'};" title="${subject}: ${accuracy}%"></div>`;
            }
        });

        combinedBarHtml += '</div><div class="legend">';

        subjects.forEach(subject => {
            if (subjectStats[subject].total > 0) {
                const accuracy = ((subjectStats[subject].correct / subjectStats[subject].total) * 100).toFixed(1);
                combinedBarHtml += `<div class="legend-item">
                    <span class="legend-color" style="background: ${subjectColors[subject] || '#6b7280'};"></span>
                    <span>${subject}: ${accuracy}%</span>
                </div>`;
            }
        });

        combinedBarHtml += '</div></div>';

        // Calculate leaderboard based on best individual quiz score
        const [allQuizzes] = await db.execute('SELECT email, results FROM quizzes');
        const userScores = {};
        allQuizzes.forEach(quiz => {
            const results = JSON.parse(quiz.results);
            let totalCorrect = 0;
            let totalQuestions = 0;
            Object.values(results).forEach(subject => {
                totalCorrect += subject.correct;
                totalQuestions += subject.total;
            });
            const quizScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 10000) / 100 : 0;

            if (!userScores[quiz.email]) {
                userScores[quiz.email] = {
                    bestScore: quizScore,
                    totalCorrect: totalCorrect,
                    totalQuestions: totalQuestions,
                    quizzes: 1
                };
            } else {
                // Update if this quiz score is better
                if (quizScore > userScores[quiz.email].bestScore) {
                    userScores[quiz.email].bestScore = quizScore;
                    userScores[quiz.email].totalCorrect = totalCorrect;
                    userScores[quiz.email].totalQuestions = totalQuestions;
                }
                userScores[quiz.email].quizzes += 1;
            }
        });
        const [users] = await db.execute('SELECT * FROM users WHERE email NOT IN (?, ?)', ['biologia.info1@gmail.com', 'admin@medminds.com']);
        const userMap = {};
        users.forEach(u => userMap[u.email] = u);
        const attemptedUsers = users.filter(user => userScores[user.email] && userScores[user.email].quizzes > 0);
        const fullLeaderboard = attemptedUsers.map(user => ({
            email: user.email,
            name: user.fullName,
            district: user.district || 'N/A',
            quizzes: userScores[user.email]?.quizzes || 0,
            totalMcqs: userScores[user.email]?.totalQuestions || 0,
            correctMcqs: userScores[user.email]?.totalCorrect || 0,
            score: userScores[user.email]?.bestScore || 0
        })).sort((a, b) => b.score - a.score);

        // Assign overall ranks
        fullLeaderboard.forEach((entry, index) => {
            entry.overallRank = index + 1;
        });

        // Calculate district ranks
        const districtGroups = {};
        fullLeaderboard.forEach(entry => {
            if (!districtGroups[entry.district]) districtGroups[entry.district] = [];
            districtGroups[entry.district].push(entry);
        });
        Object.keys(districtGroups).forEach(district => {
            districtGroups[district].sort((a, b) => b.score - a.score);
            districtGroups[district].forEach((entry, index) => {
                entry.districtRank = index + 1;
            });
        });

        const leaderboard = fullLeaderboard.slice(0, 10); // Top 10 for display

        let leadershipHtml = '';
        leaderboard.forEach((entry, index) => {
            leadershipHtml += `<tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.district}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.districtRank}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.score}%</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.quizzes}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${entry.totalMcqs}</td>
            </tr>`;
        });

        let leaderboardHtml = '';
        leaderboard.forEach((entry, index) => {
            leaderboardHtml += `<div class="leaderboard-card">
                <h3>${entry.name}</h3>
                <p class="rank">Rank: ${index + 1}</p>
                <p>District: ${entry.district}</p>
                <p>Quizzes Attempted: <span class="count" data-target="${entry.quizzes}">0</span></p>
                <p>Total MCQs: <span class="count" data-target="${entry.totalMcqs}">0</span></p>
                <p>Correct MCQs: <span class="count" data-target="${entry.correctMcqs}">0</span></p>
                <p>Average Score: <span class="count" data-target="${entry.score}">0</span>%</p>
            </div>`;
        });
        html = html.replace('<div id="stats-content">\n        <!-- Stats will be inserted here -->\n    </div>', `<div id="stats-content">${statsHtml}</div>`);
        const user = userMap[req.session.user];
        const userEntry = fullLeaderboard.find(entry => entry.email === req.session.user);
        const userRank = userEntry ? userEntry.overallRank : 'N/A';
        const userDistrictRank = userEntry ? userEntry.districtRank : 'N/A';
        html = html.replace('<body>', '<body><section class="profile"><h2>Your Profile</h2><p>Name: ' + user.fullName + '</p><p>Father Name: ' + (user.fatherName || 'N/A') + '</p><p>District: ' + (user.district || 'N/A') + '</p><p>Overall Rank: ' + userRank + '</p><p>District Rank: ' + userDistrictRank + '</p></section>');
        html = html.replace('<!-- Leadership chart will be dynamically inserted here -->', leadershipHtml);
        html = html.replace('<!-- Detailed stats cards will be dynamically inserted here -->', leaderboardHtml);
        // Update streak data
        html = html.replace('data-target="7"', `data-target="${qBankStreak}"`);
        html = html.replace('data-target="14"', `data-target="${longestQBankStreak}"`);
        html = html.replace('7-day streak: <span class="achievement">✓</span>', `7-day streak: <span class="achievement">${longestQBankStreak >= 7 ? '✓' : '✗'}</span>`);
        html = html.replace('14-day streak: <span class="achievement">✗</span>', `14-day streak: <span class="achievement">${longestQBankStreak >= 14 ? '✓' : '✗'}</span>`);
        html = html.replace('30-day streak: <span class="achievement">✗</span>', `30-day streak: <span class="achievement">${longestQBankStreak >= 30 ? '✓' : '✗'}</span>`);

        // Replace subject performance section with dynamic combined bar chart
        const subjectPerformancePattern = /<h2>Subject Performance<\/h2>\s*<div id="subject-performance">[\s\S]*?<\/div>/;
        html = html.replace(subjectPerformancePattern, `<h2>Subject Performance</h2>\n    <div id="subject-performance">\n        ${combinedBarHtml}\n    </div>`);

        res.send(html);
    });

    app.post('/submit-quiz', async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/dashboard.html');
        }
        const { quizId, timeTaken, ...answers } = req.body;
        const [quizDef] = await db.execute('SELECT * FROM quiz_definitions WHERE id = ?', [quizId]);
        if (quizDef.length === 0) {
            return res.redirect('/quiz.html');
        }
        const questionIds = JSON.parse(quizDef[0].questions);
        const placeholders = questionIds.map(() => '?').join(',');
        const [questions] = await db.execute(`SELECT * FROM questions WHERE id IN (${placeholders})`, questionIds);
        // Check if all questions are answered
        if (Object.keys(answers).length !== questions.length) {
            return res.send('<h1>Please answer all questions before submitting.</h1><a href="/quiz/' + quizId + '">Go back to quiz</a>');
        }
        const results = {};
        questions.forEach((q, index) => {
            const answer = answers[`q${index}`];
            if (!results[q.subject]) results[q.subject] = { correct: 0, total: 0 };
            results[q.subject].total++;
            if (parseInt(answer) === (q.correct + 1)) { // Convert DB 0-based to 1-based
                results[q.subject].correct++;
            }
        });
        let wrongQuestions = [];
        questions.forEach((q, index) => {
            const answer = answers[`q${index}`];
            const userAns = answer ? parseInt(answer) : null;
            const correctAns = q.correct + 1; // Convert to 1-based
            if (userAns !== correctAns) {
                wrongQuestions.push({
                    question: q.question,
                    options: [q.opt1, q.opt2, q.opt3, q.opt4],
                    correct: correctAns,
                    userAnswer: userAns
                });
            }
        });
        results.timeTaken = parseInt(timeTaken) || 0;
        req.session.wrongQuestions = wrongQuestions;
        // Insert wrong questions into mistakes table
        for (const wq of wrongQuestions) {
            await db.execute('INSERT INTO mistakes (email, question, options, correct, userAnswer) VALUES (?, ?, ?, ?, ?)', [req.session.user, wq.question, JSON.stringify(wq.options), wq.correct, wq.userAnswer]);
        }
        await db.execute('INSERT INTO quizzes (email, date, results, quiz_id) VALUES (?, ?, ?, ?)', [req.session.user, new Date(), JSON.stringify(results), quizId]);

        // Send notification to admin
        const totalCorrect = Object.values(results).reduce((sum, subj) => sum + (subj.correct || 0), 0);
        const totalQuestions = Object.values(results).reduce((sum, subj) => sum + (subj.total || 0), 0);
        const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // Simulate email to admin
        console.log(`Quiz completed notification:`);
        console.log(`Student: ${req.session.user}`);
        console.log(`Quiz ID: ${quizId}`);
        console.log(`Score: ${totalCorrect}/${totalQuestions} (${score}%)`);
        console.log(`Time taken: ${results.timeTaken || 0} seconds`);
        console.log(`Date: ${new Date().toISOString()}`);

        res.redirect('/statics.html');
    });
    
    // API endpoint for dynamic statistics
    app.get('/api/user-stats', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        try {
            const [userQuizzes] = await db.execute('SELECT * FROM quizzes WHERE email = ?', [req.session.user]);
            const totalQuizzes = userQuizzes.length;
            let totalQuestions = 0;
            let totalCorrect = 0;
            const subjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'];
            const subjectStats = {};
            subjects.forEach(s => subjectStats[s] = { correct: 0, total: 0 });
            userQuizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                Object.keys(results).forEach(subject => {
                    subjectStats[subject].correct += results[subject].correct;
                    subjectStats[subject].total += results[subject].total;
                });
                totalQuestions += Object.values(results).reduce((sum, s) => sum + s.total, 0);
                totalCorrect += Object.values(results).reduce((sum, s) => sum + s.correct, 0);
            });
            const averageAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : 0;

            // Calculate login streak
            const [loginDates] = await db.execute('SELECT date FROM login_dates WHERE email = ? ORDER BY date DESC', [req.session.user]);
            const loginDateStrings = [...new Set(loginDates.map(l => l.date))].sort();
            let streak = 0;
            let currentDate = new Date().toISOString().split('T')[0];
            while (loginDateStrings.includes(currentDate)) {
                streak++;
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 1);
                currentDate = d.toISOString().split('T')[0];
            }

            // Calculate Q-Bank stats
            const [qBankAnswers] = await db.execute('SELECT qa.question_id, qa.user_answer, q.subject, q.correct FROM q_bank_answers qa JOIN questions q ON qa.question_id = q.id WHERE qa.email = ?', [req.session.user]);
            const subjectAttempted = {};
            const subjectCorrect = {};
            qBankAnswers.forEach(answer => {
                const subject = answer.subject;
                if (!subjectAttempted[subject]) subjectAttempted[subject] = 0;
                if (!subjectCorrect[subject]) subjectCorrect[subject] = 0;
                subjectAttempted[subject]++;
                if (answer.user_answer == answer.correct) subjectCorrect[subject]++;
            });
            const totalQBankAttempted = qBankAnswers.length;

            // Calculate leaderboard data
            const [allQuizzes] = await db.execute('SELECT email, results FROM quizzes');
            const userScores = {};
            allQuizzes.forEach(quiz => {
                const results = JSON.parse(quiz.results);
                let totalCorrectQuiz = 0;
                let totalQuestionsQuiz = 0;
                Object.values(results).forEach(subject => {
                    totalCorrectQuiz += subject.correct;
                    totalQuestionsQuiz += subject.total;
                });
                const quizScore = totalQuestionsQuiz > 0 ? Math.round((totalCorrectQuiz / totalQuestionsQuiz) * 10000) / 100 : 0;

                if (!userScores[quiz.email]) {
                    userScores[quiz.email] = {
                        bestScore: quizScore,
                        totalCorrect: totalCorrectQuiz,
                        totalQuestions: totalQuestionsQuiz,
                        quizzes: 1
                    };
                } else {
                    if (quizScore > userScores[quiz.email].bestScore) {
                        userScores[quiz.email].bestScore = quizScore;
                        userScores[quiz.email].totalCorrect = totalCorrectQuiz;
                        userScores[quiz.email].totalQuestions = totalQuestionsQuiz;
                    }
                    userScores[quiz.email].quizzes += 1;
                }
            });

            const [users] = await db.execute('SELECT * FROM users WHERE email NOT IN (?, ?)', ['biologia.info1@gmail.com', 'admin@medminds.com']);
            const userMap = {};
            users.forEach(u => userMap[u.email] = u);
            const attemptedUsers = users.filter(user => userScores[user.email] && userScores[user.email].quizzes > 0);
            const fullLeaderboard = attemptedUsers.map(user => ({
                email: user.email,
                name: user.fullName,
                district: user.district || 'N/A',
                quizzes: userScores[user.email]?.quizzes || 0,
                totalMcqs: userScores[user.email]?.totalQuestions || 0,
                correctMcqs: userScores[user.email]?.totalCorrect || 0,
                score: userScores[user.email]?.bestScore || 0
            })).sort((a, b) => b.score - a.score);

            fullLeaderboard.forEach((entry, index) => {
                entry.overallRank = index + 1;
            });

            const districtGroups = {};
            fullLeaderboard.forEach(entry => {
                if (!districtGroups[entry.district]) districtGroups[entry.district] = [];
                districtGroups[entry.district].push(entry);
            });
            Object.keys(districtGroups).forEach(district => {
                districtGroups[district].sort((a, b) => b.score - a.score);
                districtGroups[district].forEach((entry, index) => {
                    entry.districtRank = index + 1;
                });
            });

            const leaderboard = fullLeaderboard.slice(0, 10);

            res.json({
                streak: streak,
                totalQuizzes: totalQuizzes,
                totalQuestions: totalQuestions,
                totalCorrect: totalCorrect,
                averageAccuracy: averageAccuracy,
                totalQBankAttempted: totalQBankAttempted,
                subjectStats: subjectStats,
                subjectAttempted: subjectAttempted,
                subjectCorrect: subjectCorrect,
                leaderboard: leaderboard
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ error: 'Error fetching statistics' });
        }
    });

    // API endpoint to check user login and approval status
    app.get('/api/user-status', async (req, res) => {
        if (!req.session.user) {
            return res.json({ loggedIn: false, approved: false });
        }

        // Check if user is approved (except admins)
        if (req.session.user === 'biologia.info1@gmail.com' || req.session.user === 'admin@medminds.com') {
            return res.json({ loggedIn: true, approved: true, email: req.session.user });
        }

        try {
            const [user] = await db.execute('SELECT approved FROM users WHERE email = ?', [req.session.user]);
            const approved = user.length > 0 && user[0].approved;
            res.json({ loggedIn: true, approved: approved, email: req.session.user });
        } catch (error) {
            console.error('Error checking user status:', error);
            res.status(500).json({ error: 'Error checking user status' });
        }
    });

    app.get('/quiz-review', async (req, res) => {
       if (!req.session.user) {
           return res.redirect('/dashboard.html');
       }
       // Fetch the latest quiz result for the user
       const [latestQuiz] = await db.execute('SELECT * FROM quizzes WHERE email = ? ORDER BY date DESC LIMIT 1', [req.session.user]);
       let results = {};
       let timeTaken = 0;
       let totalCorrect = 0;
       let totalQuestions = 0;
       if (latestQuiz.length > 0) {
           results = JSON.parse(latestQuiz[0].results);
           timeTaken = results.timeTaken || 0;
           Object.values(results).forEach(subject => {
               if (typeof subject === 'object' && subject.correct !== undefined) {
                   totalCorrect += subject.correct;
                   totalQuestions += subject.total;
               }
           });
       }
       const wrongQuestions = req.session.wrongQuestions || [];
       let html = `<html><head><title>Quiz Review</title><style>body{font-family:Arial,sans-serif;margin:20px;}.correct{color:green;}.wrong{color:red;}</style></head><body><h1>Quiz Results</h1>`;
       html += `<p><strong>Total Questions:</strong> ${totalQuestions}</p>`;
       html += `<p><strong>Correct Answers:</strong> ${totalCorrect}</p>`;
       html += `<p><strong>Score:</strong> ${totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%</p>`;
       html += `<p><strong>Time Taken:</strong> ${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}</p>`;
       html += '<h2>Wrong Questions</h2>';
       if (wrongQuestions.length === 0) {
           html += '<p>Congratulations! You got all questions correct.</p>';
       } else {
           wrongQuestions.forEach((q, index) => {
               html += `<div style="margin-bottom:20px;"><h3>${index + 1}. ${q.question}</h3>`;
               q.options.forEach((opt, i) => {
                   let className = '';
                   if (i === q.correct) className = 'correct';
                   else if (q.userAnswer !== null && i === q.userAnswer) className = 'wrong';
                   html += `<p class="${className}">${String.fromCharCode(65 + i)}. ${opt}</p>`;
               });
               html += '</div>';
           });
       }
       html += '<a href="/statics.html">View Statistics</a></body></html>';
       res.send(html);
   });

    app.post('/submit-answer', async (req, res) => {
       if (!req.session.user) {
           return res.status(401).json({ success: false, message: 'Not logged in' });
       }
       const { questionId, answer } = req.body;
       const userAnswer = parseInt(answer);
       try {
           // Check if already answered
           const [existing] = await db.execute('SELECT * FROM q_bank_answers WHERE email = ? AND question_id = ?', [req.session.user, questionId]);
           if (existing.length > 0) {
               return res.json({ success: false, message: 'Already answered' });
           }
           await db.execute('INSERT INTO q_bank_answers (email, question_id, user_answer) VALUES (?, ?, ?)', [req.session.user, questionId, userAnswer]);
           // Check if correct
           const [question] = await db.execute('SELECT * FROM questions WHERE id = ?', [questionId]);
           const q = question[0];
           const isCorrect = q.correct == userAnswer;
           if (!isCorrect) {
               await db.execute('INSERT INTO mistakes (email, question, options, correct, userAnswer) VALUES (?, ?, ?, ?, ?)', [req.session.user, q.question, JSON.stringify([q.opt1, q.opt2, q.opt3, q.opt4]), q.correct, userAnswer]);
           }
           res.json({ success: true, correct: isCorrect, correctAnswer: q.correct, explanation: q.explanation });
       } catch (err) {
           console.error(err);
           res.status(500).json({ success: false, message: 'Error submitting answer' });
       }
    });

    app.get('/logout', async (req, res) => {
        const email = req.session.user;
        if (email) {
            await db.execute('UPDATE users SET loggedIn = ? WHERE email = ?', [false, email]);
        }
        req.session.destroy();
        res.redirect('/dashboard.html');
    });

    app.get('/check-session', (req, res) => {
        res.json({ user: req.session.user });
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();