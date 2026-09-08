
export function verificationEmailTemplate(
    firstName: string,
    verificationCode: string,
): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
    </head>

    <body style="
    margin: 0;
    padding: 0;
    background-color: #F5F3FF;
    font-family: Arial, Helvetica, sans-serif;
    color: #18181B;
    ">
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="padding: 40px 20px;"
    >
        <tr>
        <td align="center">

            <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
                max-width: 500px;
                background-color: #FFFFFF;
                border-radius: 16px;
                overflow: hidden;
            "
            >

            <!-- Header -->
            <tr>
                <td
                align="center"
                style="
                    background-color: #7C3AED;
                    padding: 32px 20px;
                "
                >
                <h1 style="
                    margin: 0;
                    color: #FFFFFF;
                    font-size: 28px;
                    font-weight: 700;
                ">
                    Gastador
                </h1>

                <p style="
                    margin: 8px 0 0;
                    color: #EDE9FE;
                    font-size: 14px;
                ">
                    Smart Expense Tracking
                </p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 36px 32px;">

                <h2 style="
                    margin: 0 0 16px;
                    font-size: 22px;
                    color: #18181B;
                ">
                    Verify your email
                </h2>

                <p style="
                    margin: 0 0 16px;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #52525B;
                ">
                    Hi ${firstName},
                </p>

                <p style="
                    margin: 0 0 24px;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #52525B;
                ">
                    Thanks for creating your Gastador account.
                    Use the verification code below to verify
                    your email address.
                </p>

                <!-- Verification Code -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="margin-bottom: 24px;"
                >
                    <tr>
                    <td
                        align="center"
                        style="
                        background-color: #F5F3FF;
                        border: 1px solid #DDD6FE;
                        border-radius: 12px;
                        padding: 20px;
                        "
                    >
                        <p style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #7C3AED;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        ">
                        Verification Code
                        </p>

                        <div style="
                        font-size: 32px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        color: #6D28D9;
                        ">
                        ${verificationCode}
                        </div>
                    </td>
                    </tr>
                </table>

                <p style="
                    margin: 0 0 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #71717A;
                ">
                    This verification code will expire in
                    <strong style="color: #52525B;">
                    15 minutes
                    </strong>.
                </p>

                <p style="
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #71717A;
                ">
                    If you didn't create a Gastador account,
                    you can safely ignore this email.
                </p>

                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td
                align="center"
                style="
                    padding: 24px 32px;
                    background-color: #FAFAFA;
                    border-top: 1px solid #E4E4E7;
                "
                >
                <p style="
                    margin: 0 0 6px;
                    font-size: 12px;
                    color: #71717A;
                ">
                    © 2026 Gastador. All rights reserved.
                </p>

                <p style="
                    margin: 0;
                    font-size: 12px;
                    color: #A1A1AA;
                ">
                    This is an automated message. Please do not reply.
                </p>
                </td>
            </tr>

            </table>

        </td>
        </tr>
    </table>
    </body>
    </html>
  `;
}
