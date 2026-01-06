def get_delay_alert_template(username, flight_number, destination, delay_minutes, dashboard_url="https://neurasky.click/dashboard"):
    """
    Returns a formatted HTML email string for flight delay alerts.
    """
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Delay Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <tr>
            <td style="background-color: #1e3a8a; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">NEURASKY</h1>
                <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Flight Intelligence</p>
            </td>
        </tr>
        
        <!-- Alert Banner -->
        <tr>
            <td style="background-color: #fee2e2; padding: 16px; text-align: center; border-bottom: 1px solid #fecaca;">
                <p style="color: #991b1b; margin: 0; font-weight: bold; font-size: 16px;">⚠️ Flight Delay Detected</p>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 32px 24px;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 24px;">Dear <strong>{username}</strong>,</p>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                    Our AI monitoring system has detected a delay for your upcoming flight. Please review the details below:
                </p>

                <!-- Flight Details Box -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <table width="100%" border="0">
                        <tr>
                            <td style="padding-bottom: 12px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Flight Number</td>
                            <td style="padding-bottom: 12px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Destination</td>
                        </tr>
                        <tr>
                            <td style="font-size: 20px; font-weight: bold; color: #0f172a;">{flight_number}</td>
                            <td style="font-size: 20px; font-weight: bold; color: #0f172a; text-align: right;">{destination}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border-top: 1px dashed #cbd5e1; margin: 12px 0;"></td>
                        </tr>
                        <tr>
                            <td style="padding-top: 12px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delay</td>
                            <td style="padding-top: 12px; color: #ef4444; font-size: 18px; font-weight: bold; text-align: right;">+{delay_minutes} Minutes</td>
                        </tr>
                    </table>
                </div>

                <p style="color: #475569; font-size: 14px; margin-bottom: 32px; text-align: center;">
                    We recommend checking the live monitor for the most up-to-date arrival estimates.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="{dashboard_url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.2s;">View Dashboard</a>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
                    &copy; {datetime.now().year} NeuraSky. All rights reserved.
                </p>
                <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                    You received this email because you have enabled flight alerts in your account settings.<br>
                    <a href="{dashboard_url}/settings" style="color: #64748b; text-decoration: underline;">Manage Preferences</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    """
