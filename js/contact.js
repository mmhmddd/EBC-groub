const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'mohamed.m.mahmoud29@gmail.com', pass: 'your-app-specific-password' }
});
app.post('/send-email', (req, res) => {
  const { name, email, subject, message } = req.body;
  const mailOptions = {
    from: email,
    to: 'mohamed.m.mahmoud29@gmail.com',
    subject,
    text: `الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالرسالة:\n${message}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send(error);
    res.status(200).send('Email sent');
  });
});