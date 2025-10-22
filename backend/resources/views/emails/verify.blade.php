<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
</head>
<body>
    <h2>Email Verification</h2>
    <p>Thank you for registering! Please use the following verification code to verify your email address:</p>
    
    <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center;">
        <h1 style="color: #333; margin: 0;">{{ $code }}</h1>
    </div>
    
    <p>This code will expire in 24 hours.</p>
    
    <p>If you did not request this verification, please ignore this email.</p>
    
    <p>Best regards,<br>CraftConnect Team</p>
</body>
</html> 