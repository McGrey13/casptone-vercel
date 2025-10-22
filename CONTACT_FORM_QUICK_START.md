# Contact Form - Quick Start Guide

## ✅ What's Done
- ✅ Backend API endpoint created
- ✅ Email template designed
- ✅ Frontend form connected to API
- ✅ Email address changed to craftconnect49@gmail.com

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Email (Choose One Option)

#### Option A: Test Without Sending Emails (Fastest)
```bash
cd backend
```

Add to your `.env` file:
```env
MAIL_MAILER=log
```

Emails will be saved to `backend/storage/logs/laravel.log` instead of being sent.

#### Option B: Send Real Emails via Gmail
1. Generate Gmail App Password:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to "App passwords"
   - Create password for "Mail"
   - Copy the 16-character password

2. Add to your `.env` file:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=craftconnect49@gmail.com
MAIL_PASSWORD=your_16_char_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=craftconnect49@gmail.com
MAIL_FROM_NAME="CraftConnect"
```

### Step 2: Clear Laravel Cache
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### Step 3: Test It
1. Start your Laravel backend (if not running):
   ```bash
   cd backend
   php artisan serve
   ```

2. Start your React frontend (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open the Contact page in your browser
4. Fill out the form and submit
5. Check for success message!

### Step 4: Verify Email Was Sent

**If using log driver (Option A):**
- Check: `backend/storage/logs/laravel.log`
- Look for the email content at the end of the file

**If using Gmail SMTP (Option B):**
- Check inbox of craftconnect49@gmail.com
- Look for email with subject: "Contact Form Submission: [subject]"

## 🔍 Troubleshooting

### "Failed to send message" Error
1. Make sure `.env` is configured correctly
2. Run: `php artisan config:clear`
3. Check: `backend/storage/logs/laravel.log` for errors

### Gmail Not Sending
- Verify app password is correct (no spaces)
- Ensure 2-factor authentication is enabled
- Check if "Less secure app access" is enabled (if needed)

### Route Not Found (404)
- Make sure backend is running on port 8000
- Check: `http://localhost:8000/api/contact` in browser
- Verify route was added to `backend/routes/api.php`

## 📧 What You'll Receive

When someone submits the contact form, you'll receive an email with:
- Sender's name
- Sender's email address (you can reply directly)
- Subject line
- Full message
- Submission timestamp

## 🎨 Email Preview

The email has a professional design with:
- CraftConnect branding (#a47c68 color)
- Clean, organized layout
- Reply-to functionality
- Timestamp

## 📝 Test Data

Use this to test the form:

**Name:** John Doe  
**Email:** john@example.com  
**Subject:** Test Contact Form  
**Message:** This is a test message to verify the contact form is working correctly.

## 💡 Tips

1. **For Development:** Use `MAIL_MAILER=log` to avoid sending real emails
2. **For Production:** Use Gmail SMTP or a service like SendGrid/Mailgun
3. **Security:** Never commit your `.env` file with real credentials
4. **Testing:** Check Laravel logs if emails aren't sending

## ✨ Features You Have

- ✅ Form validation (client + server side)
- ✅ Loading state during submission
- ✅ Success/error messages
- ✅ Professional email template
- ✅ Reply-to functionality
- ✅ Error handling
- ✅ Mobile responsive

## 🎯 That's It!

Your contact form is ready to use. Just configure the email settings and start receiving messages at craftconnect49@gmail.com!

---

**Need help?** Check `CONTACT_FORM_EMAIL_SETUP.md` for detailed configuration options.

