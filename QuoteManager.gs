function getTodaysQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(QUOTE_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  let threshold = dataSheet.getRange(1,2).getValue();
  let data = dataSheet.getRange(5,1,totalRows-5+1,3).getValues();

  let idArray = new Array();
  
  data.forEach(function(row){
    // console.log(row[0]+":::"+row[1]);
    if(row[1].length === 0 || row[1]==="" || satisfiesThresholdCondition(row[1],threshold)){
      idArray.push(row[0]);
    }
  });

  // console.log("idArray length="+idArray.length);

  let selectedArrayIdx = Math.floor(Math.random() * idArray.length);
  // console.log("selectedArrayIdx="+selectedArrayIdx);
  let selectedQuoteId = idArray[selectedArrayIdx];

  // console.log("selectedQuoteId="+selectedQuoteId);

  //get the row corresponding to the id
  let numberOfColumns = data[selectedQuoteId-1][2] === "" ? 0 : data[selectedQuoteId-1][2];
  // console.log("numberOfColumns="+numberOfColumns);
  let quoteRowRange = dataSheet.getRange(selectedQuoteId+4, 1, 1, numberOfColumns+5+1);
  let quoteRowValues = quoteRowRange.getValues();

  // console.log("quote="+quoteRowValues[0][3]);
  // console.log("author="+quoteRowValues[0][4]);

  let todaysQuote = {};
  todaysQuote.quote = quoteRowValues[0][3];
  todaysQuote.author = quoteRowValues[0][4];

  let currentDate = new Date();
  //update date
  quoteRowValues[0][1] = currentDate;
  //count
  quoteRowValues[0][2] = numberOfColumns+1;
  //latest used
  quoteRowValues[0][quoteRowValues[0].length-1] = currentDate;

  quoteRowRange.setValues(quoteRowValues);

  return todaysQuote;
}

function satisfiesThresholdCondition(date, threshold){

  let currDate = new Date();
  let prevDate = new Date(date);

  currDate.setHours(0,0,0,0);
  prevDate.setHours(0,0,0,0);

  let diff = (currDate - prevDate)/(1000*60*60*24);

  return diff>threshold;
}
