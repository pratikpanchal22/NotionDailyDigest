function emailReports(address, subject, body){
  MailApp.sendEmail({
    to: address,
    subject: subject,
    htmlBody: body});
}

function emailTemplate(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Log"); 
  
  var emailBody = sheet.getRange(4,1).getValue();
  
  MailApp.sendEmail({
    to: "pp423@cornell.edu",
    subject: "Notion Daily Digest - template check",
    htmlBody: emailBody}); 
}