# Contact Form Email Setup Guide

## Overview
The contact form has been configured to send emails to `craftconnect49@gmail.com`. This guide will help you configure the email settings in your Laravel backend.

## What Has Been Implemented

### Backend
1. **ContactController** (`backend/app/Http/Controllers/ContactController.php`)
   - Handles contact form submissions
   - Validates input data
   - Sends email to craftconnect49@gmail.com

2. **ContactFormMail** (`backend/app/Mail/ContactFormMail.php`)
   - Mailable class that formats the email
   - Includes reply-to functionality

3. **Email Template** (`backend/resources/views/emails/contact-form.blade.php`)
   - Beautiful HTML email template
   - Displays all contact form information

4. **API Route** (`backend/routes/api.php`)
   - Public route: `POST /api/contact`
   - No authentication required

### Frontend
1. **Contact.jsx** updated with:
   - API integration using axios
   - Error handling
   - Success/failure messages
   - Email address changed to craftconnect49@gmail.com

## Email Configuration Setup

### Option 1: Gmail SMTP (Recommended for craftconnect49@gmail.com)

1. **Create/Update your `.env` file** in the `backend` directory:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=craftconnect49@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=craftconnect49@gmail.com
MAIL_FROM_NAME="CraftConnect"
```

2. **Generate Gmail App Password:**
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password
   - Use this password in `MAIL_PASSWORD` (without spaces)

### Option 2: Log Driver (For Testing)

If you want to test without sending real emails:

```env
MAIL_MAILER=log
MAIL_LOG_CHANNEL=stack
```

Emails will be saved to `backend/storage/logs/laravel.log`

### Option 3: Mailtrap (For Development Testing)

1. Sign up at https://mailtrap.io (free)
2. Get your credentials from Mailtrap inbox
3. Update `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=craftconnect49@gmail.com
MAIL_FROM_NAME="CraftConnect"
```

## Testing the Contact Form

### 1. Clear Laravel Cache
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

### 2. Test via Frontend
1. Navigate to the Contact Us page
2. Fill out the form with:
   - Name
   - Email
   - Subject
   - Message
3. Click "Send Message"
4. Check for success message

### 3. Test via API (Optional)
```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

## Troubleshooting

### Email Not Sending
1. Check `.env` configuration
2. Run `php artisan config:clear`
3. Check logs: `backend/storage/logs/laravel.log`
4. Verify Gmail app password is correct
5. Ensure 2-factor authentication is enabled on Gmail

### SMTP Errors
- **Error 535**: Wrong username/password
- **Error 534**: App password not generated
- **Connection timeout**: Check firewall/port 587

### Gmail Security
If using Gmail SMTP:
- Enable 2-factor authentication
- Use app-specific password (not your regular Gmail password)
- Allow less secure apps (if not using app password)

## Email Features

### What Gets Sent
- Sender's name
- Sender's email (with reply-to)
- Subject line
- Message content
- Submission timestamp

### Email Design
- Professional HTML template
- CraftConnect branding
- Easy-to-read format
- Reply functionality enabled

## Important Notes

1. **Production**: Always use SMTP with proper credentials
2. **Security**: Never commit `.env` file with real credentials
3. **Testing**: Use Mailtrap or log driver during development
4. **Rate Limiting**: Consider adding rate limiting to prevent spam
5. **Validation**: All inputs are validated server-side

## Next Steps (Optional Enhancements)

1. **Add Rate Limiting**: Prevent spam submissions
2. **Add CAPTCHA**: Protect against bots
3. **Email Queue**: Use Laravel queues for async email sending
4. **Auto-Reply**: Send confirmation email to user
5. **Admin Notification**: Store messages in database

## Support

If you encounter issues:
1. Check Laravel logs
2. Verify email configuration
3. Test with log driver first
4. Ensure proper Gmail app password setup

