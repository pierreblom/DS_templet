# Google Sheets Contact Form Webhook Setup

This guide will help you set up a Google Apps Script webhook to log contact form submissions to Google Sheets.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Contact Form Submissions" (or any name you prefer)
4. In the first row, add the following headers:
   - Column A: **Timestamp**
   - Column B: **Name**
   - Column C: **Email**
   - Column D: **Phone**
   - Column E: **Comment**
   - Column F: **Source IP**
   - Column G: **Trace ID**

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the following code:

```javascript
/**
 * Contact Form Webhook Handler
 * Receives POST requests and logs them to the spreadsheet
 */
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.email) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Name and email are required'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare row data
    const timestamp = new Date();
    const rowData = [
      timestamp,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.comment || '',
      data.sourceIp || '',
      data.traceId || ''
    ];
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Contact form submission logged successfully',
        timestamp: timestamp.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error and return error response
    Logger.log('Error: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 * You can run this from the Apps Script editor
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '0123456789',
        comment: 'This is a test submission',
        sourceIp: '127.0.0.1',
        traceId: 'test-trace-id-123'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

## Step 3: Deploy the Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: Contact Form Webhook (optional)
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Click **Authorise access** and grant the necessary permissions
6. **Copy the Web App URL** - it should look like:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

## Step 4: Test the Webhook (Optional)

You can test the webhook using curl:

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "comment": "This is a test",
    "sourceIp": "127.0.0.1",
    "traceId": "test-123"
  }'
```

You should see a new row appear in your spreadsheet!

## Step 5: Add the URL to Your Environment Variables

Add the webhook URL to your `.env` file:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXX/exec
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Public Webhook**: This webhook is publicly accessible. Anyone with the URL can submit data.
2. **Rate Limiting**: Consider implementing rate limiting in your backend to prevent abuse.
3. **Data Validation**: The backend validates all data before sending to Google Sheets.
4. **No Sensitive Data**: Never send passwords or sensitive information through this form.

### Optional: Add Secret Token Authentication

For additional security, you can modify the Apps Script to require a secret token:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Verify secret token
    const SECRET_TOKEN = 'your-secret-token-here';
    if (data.secretToken !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Unauthorised'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Rest of the code...
  }
}
```

Then add to your `.env`:
```env
GOOGLE_SHEETS_SECRET_TOKEN=your-secret-token-here
```

## Troubleshooting

### Submissions not appearing in sheet
- Check that the Apps Script is deployed as a web app
- Verify "Who has access" is set to "Anyone"
- Check the Apps Script logs: **Extensions** → **Apps Script** → **Executions**

### 403 Forbidden errors
- Ensure you've authorised the script with your Google account
- Redeploy the web app

### Data in wrong columns
- Verify your spreadsheet headers match exactly:
  `Timestamp, Name, Email, Phone, Comment, Source IP, Trace ID`

## Data Privacy & GDPR Compliance

Remember to:
- Update your Privacy Policy to mention Google Sheets data storage
- Implement data retention policies
- Provide a way for users to request data deletion
- Ensure compliance with POPI Act (South Africa) and GDPR (if applicable)

---

**Need Help?** Check the Apps Script documentation: https://developers.google.com/apps-script
