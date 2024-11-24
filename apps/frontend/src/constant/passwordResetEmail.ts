export const PasswordResetEmail = (resetUrl:string) => {


    return `




<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        /* General reset styles */
        body, table, td, a {
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #333333;
            text-decoration: none;
            margin: 0;
            padding: 0;
            line-height: 1.5;
        }

        body {
            background-color: #f4f4f4;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        /* Responsive styles */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 20px !important;
            }

            .email-header, .email-footer {
                padding: 20px !important;
            }

            .button {
                padding: 12px 20px !important;
                font-size: 14px !important;
            }

            .content p {
                font-size: 14px !important;
            }
        }
    </style>
</head>

<body>
    <table role="presentation">
        <tr>
            <td align="center" style="padding: 20px;">
                <table role="presentation" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td class="email-header" style="background-color: #FFD700; text-align: center; padding: 30px;">
                            <h1 style="margin: 0; font-size: 24px; color: #ffffff;">RankMarg Password Reset</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td class="content" style="padding: 30px;">
                            <p>Hello,</p>
                            <p>We received a request to reset the password for your RankMarg account. If you didn’t make this request, you can safely ignore this email.</p>
                            <p>To reset your password, click the button below:</p>
                            <table role="presentation" style="width: 100%; text-align: center; margin: 20px 0;">
                                <tr>
                                    <td>
                                        <a href="${resetUrl}" target="_blank" class="button"
                                            style="display: inline-block; padding: 14px 30px; background-color: #FFD700; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            <p>If the button doesn’t work, copy this link into your browser:</p>
                            <p><a href="${resetUrl}" target="_blank" style="color: #FFD700;">${resetUrl}</a></p>
                            <p>This link will expire in 24 hours for security reasons.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td class="email-footer" style="background-color: #f8f9fa; text-align: center; font-size: 14px; padding: 20px;">
                            <p style="margin: 0;">&copy; 2023 RankMarg. All rights reserved.</p>
                            <p style="margin: 0;">RankMarg | Powered by Passion for Learning</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>

`
}