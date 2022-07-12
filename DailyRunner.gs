function getCoreData(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  let coreData = {};
  coreData.raw = dataSheet.getRange(1,1,totalRows, totalColumns).getValues();
  coreData.richText = dataSheet.getRange(1,1,totalRows, totalColumns).getRichTextValues();

  return coreData;
}

function updateColumn(colIdx, dataGrid){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET);

  let data = new Array();
  for(var r=0; r<dataGrid.length; r++){
    // data[r][0] = dataGrid[r][colIdx];
    data.push(new Array(dataGrid[r][colIdx]));
  }
  
  dataSheet.getRange(1, colIdx+1, data.length, 1).setValues(data);

  SpreadsheetApp.flush();
}

function hourlyRunner(){
  let coreData = getCoreData();
  let data = coreData.raw;
  let richTextData = coreData.richText;

  let mapper = new Mapper();

  let calendar = CalendarApp.getCalendarById('nbrd5l2ltdhbcqcetme8eecusg@group.calendar.google.com');
  let calendarWrapper = new CalendarWrapper(mapper);

  let numberOfEventsCreated = 0;

  for(var r=1; r<data.length; r++){
    
    if(data[r][mapper.getIndexFromKey(TASK_KEY.PAGE_ID)].length == 0){
      break;
    }

    //console.log(data[r][mapper.getIndexFromKey(TASK_KEY.AUTO_CREATE_GCAL_EVENT)] + "---" + data[r][mapper.getIndexFromKey(TASK_KEY.GCAL_EVENT_LINK)].length);

    if(data[r][mapper.getIndexFromKey(TASK_KEY.AUTO_CREATE_GCAL_EVENT)] !== EVENT_CREATE_PERMISSION_TYPE.EMPTY &&
       data[r][mapper.getIndexFromKey(TASK_KEY.AUTO_CREATE_GCAL_EVENT)] !== EVENT_CREATE_PERMISSION_TYPE.NO    && 
       data[r][mapper.getIndexFromKey(TASK_KEY.GCAL_EVENT_LINK)].length === 0  ){

        console.log("Creating event for: " + data[r][mapper.getIndexFromKey(TASK_KEY.TASK_NAME)]);
        data[r][mapper.getIndexFromKey(TASK_KEY.GCAL_EVENT_LINK)] = calendarWrapper.createEvent(data[r]);
        ++numberOfEventsCreated;
    } 
  }

  console.log("Number of events created = " + numberOfEventsCreated);

  if(numberOfEventsCreated > 0){
    updateColumn(mapper.getIndexFromKey(TASK_KEY.GCAL_EVENT_LINK), data);
  }
}



function dailyRunner() {

  let coreData = getCoreData();
  let data = coreData.raw;
  let richTextData = coreData.richText;

  let mapper = new Mapper();
  let report = initializeReport();         //Report Object

  // console.log(data[0][0]);
  // console.log(data[0][data[0].length-1]);

  for(var r=1; r<data.length; r++){

    if(data[r][mapper.getIndexFromKey(TASK_KEY.PAGE_ID)].length == 0){
      break;
    }

    /*
    if(noOwner){
      //populate: OwnerlessTasks
    }
    else {
      if(scheduledDate is null or empty && status!=COMPLETED && status !=CANCELLED){
        //populate: UnscheduledTasks
      }
      else if(scheduledDate == today){
        //populate: TodayTasks
      }
      else if(scheduledDate == yesterday){
        if(status == completed){
          //populate: YesterdayCompletedTasks
        }
        else {
          //populate: YesterdayIncompleteTasks
        }
      }
      else if(scheduledDate < yesterday && status != completed){
        //populate: IncompleteTasks
      }
    }

    if(deadline == today){

    }
    else if (deadline == tomorrow){

    }
    else if (deadline == dayAfterTomorrow){

    }
    */

    //OwnerlessTasks
    if(data[r][mapper.getIndexFromKey(TASK_KEY.OWNER_ID)].length == 0 || 
       data[r][mapper.getIndexFromKey(TASK_KEY.OWNER_ID)] == 0 ){
      
      let ownerlessTask = new OwnerlessTask(mapper);
      // console.log("r="+r+" "+data[r][mapper.getIndexFromKey(TASK_KEY.CREATED)]);
      ownerlessTask.populateFields(data[r], richTextData[r]);
      report.addReport(REPORT_TYPE.ONWERLESS_TASKS, ownerlessTask);
      // console.log("\n ownerlessTask:::" + ownerlessTask);
    }
    else {
      //UnscheduledTasks
      if((data[r][mapper.getIndexFromKey(TASK_KEY.SCHEDULED)].length === 0 || 
          data[r][mapper.getIndexFromKey(TASK_KEY.SCHEDULED)] === 0) &&
         data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] != TASK_VALUE.COMPLETED && 
         data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] != TASK_VALUE.CANCELLED ){
          
        // console.log("UNSCHEDULED TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
        // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
        let unscheduledTask = new UnscheduledTask(mapper);
        unscheduledTask.populateFields(data[r], richTextData[r]);
        report.addReport(REPORT_TYPE.UNSCHEDULED_TASKS, unscheduledTask);
        // console.log("\n unscheduledTask:::" + unscheduledTask);
      }
      else {
        let scheduledDate = data[r][mapper.getIndexFromKey(TASK_KEY.SCHEDULED)];
        let schDateDelta = getDaysDelta(scheduledDate);

        switch(schDateDelta){

          //TodayTasks
          case 0: {
            //TodaysTask
            // console.log("TODAY'S TASK:::"+ ++tt +" task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
            // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
            let todaysTask = new TodayTask(mapper);
            todaysTask.populateFields(data[r], richTextData[r]);
            report.addReport(REPORT_TYPE.TODAYS_TASKS, todaysTask);
            // console.log("\n todaysTask:::" + todaysTask);
            break;
          }

          case -1: {
            //YesterdayCompletedTasks
            if(data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] === TASK_VALUE.COMPLETED){
              // console.log("YESTERDAY'S COMPLETED TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
              // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let yesterdaysCompletedTask = new YesterdaysCompletedTask(mapper);
              yesterdaysCompletedTask.populateFields(data[r], richTextData[r]);
              report.addReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS, yesterdaysCompletedTask);
              // console.log("\n yesterdaysCompletedTask:::" + yesterdaysCompletedTask);
            }
            //YesterdayIncompleteTasks
            else if (data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] != TASK_VALUE.CANCELLED){
              // console.log("YESTERDAY'S INCOMPLETE TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]+"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let yesterdaysIncompleteTask = new YesterdaysIncompleteTask(mapper);
              yesterdaysIncompleteTask.populateFields(data[r], richTextData[r]);
              report.addReport(REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS, yesterdaysIncompleteTask);
              // console.log("\n yesterdaysIncompleteTask:::" + yesterdaysIncompleteTask);
            }

            //todo: YesterdaysCancelledTasks
            else {

            }
          }

          default: {
            //IncompleteTasks
            if(schDateDelta < -1 && 
                data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] != TASK_VALUE.COMPLETED && 
                data[r][mapper.getIndexFromKey(TASK_KEY.STATUS)] != TASK_VALUE.CANCELLED ){
              // console.log("OTHER INCOMPLETE TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]+"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let incompleteTask = new IncompleteTask(mapper);
              incompleteTask.populateFields(data[r], richTextData[r]);
              report.addReport(REPORT_TYPE.INCOMPLETE_TASKS, incompleteTask);
              // console.log("\n incompleteTask:::" + incompleteTask);
            }
          }
        }
      }
    }
    
    //taskUrl
    // console.log(richTextData[r][0].getLinkUrl());

    //project

  }

  /*
  * REPORT EXTRACTION IS NOW COMPLETE
  */
  console.log("Report Extraction: " + report.getCurrentReportAgeString());

  let log = report.getLogBundle();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Log").getRange(1,1).setValue(log);
  SpreadsheetApp.flush();

  //Formatted Report
  let formattedReport = new FormattedReport(report, mapper.tcm);


  report.userReports.forEach(function(userReport, userId){
    // console.log("addUserReport userId="+userId + " value="+userReport.toString());
    let formattedEmail = formattedReport.generateForUserId(userId);
    console.log("Sending email to " +  userReport.name + ", "+ userReport.email + " with subject: " + formattedReport.getEmailSubject());
    emailReports(userReport.email, formattedReport.getEmailSubject(), formattedEmail);
  });
}

function initializeReport(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(CONFIG_SHEET);

  let totalRows = 30; //dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(1,1,totalRows, totalColumns).getValues();

  let report = new Report();
  for(var r=1; r<data.length; r++) if(data[r][0].length != 0) {
    // console.log("data[r][3]="+data[r][3]);

    //Only initialize those user reports that are enabled to receive report in configuration sheet
    if(data[r][3]){
      // console.log("configuring: userId="+data[r][0] + " user="+data[r][1]);
      report.userReports.set(data[r][0], new UserReport(data[r][0], data[r][1], data[r][2]));  
    }
  }

  // console.log("report.userReports.size = " + report.userReports.size);
  // report.userReports.forEach(function(value, key){
  //   console.log("userId="+key + " value="+value.toString());
  // });

  return report;
}
