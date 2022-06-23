function dailyRunner() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  let mappings = {};
  mappings.tkm = createTaskKeyMap();       //taskKeyMap
  mappings.tim = createTaskKeyIndexMap();  //taskIndexMap
  mappings.tum = createTaskUserMap();      //taskUserMap

  let report = initializeReport();         //Report Object

  var data = dataSheet.getRange(1,1,totalRows, totalColumns).getValues();
  var richTextData = dataSheet.getRange(1,1,totalRows, totalColumns).getRichTextValues();

  // console.log(data[0][0]);
  // console.log(data[0][data[0].length-1]);

  for(var r=1; r<data.length; r++){

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
    if(data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.OWNER_ID))].length == 0 || 
       data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.OWNER_ID))] == 0 ){
      
      let ownerlessTask = new OwnerlessTask(mappings);
      ownerlessTask.populateFields(data[r], richTextData[r]);
      report.addReport(REPORT_TYPE.ONWERLESS_TASKS, ownerlessTask);
      // console.log("\n ownerlessTask:::" + ownerlessTask);
    }
    else {
      //UnscheduledTasks
      if((data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.SCHEDULED))].length === 0 || 
          data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.SCHEDULED))] === 0) &&
         data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] != TASK_VALUE.COMPLETED && 
         data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] != TASK_VALUE.CANCELLED ){
          
        // console.log("UNSCHEDULED TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
        // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
        let unscheduledTask = new UnscheduledTask(mappings);
        unscheduledTask.populateFields(data[r], richTextData[r]);
        report.addReport(REPORT_TYPE.UNSCHEDULED_TASKS, unscheduledTask);
        // console.log("\n unscheduledTask:::" + unscheduledTask);
      }
      else {
        let scheduledDate = data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.SCHEDULED))];
        let schDateDelta = getDaysDelta(scheduledDate);

        switch(schDateDelta){

          //TodayTasks
          case 0: {
            //TodaysTask
            // console.log("TODAY'S TASK:::"+ ++tt +" task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
            // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
            let todaysTask = new TodayTask(mappings);
            todaysTask.populateFields(data[r], richTextData[r]);
            report.addReport(REPORT_TYPE.TODAYS_TASKS, todaysTask);
            // console.log("\n todaysTask:::" + todaysTask);
            break;
          }

          case -1: {
            //YesterdayCompletedTasks
            if(data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] === TASK_VALUE.COMPLETED){
              // console.log("YESTERDAY'S COMPLETED TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]
              // +"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let yesterdaysCompletedTask = new YesterdaysCompletedTask(mappings);
              yesterdaysCompletedTask.populateFields(data[r], richTextData[r]);
              report.addReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS, yesterdaysCompletedTask);
              // console.log("\n yesterdaysCompletedTask:::" + yesterdaysCompletedTask);
            }
            //YesterdayIncompleteTasks
            else if (data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] != TASK_VALUE.CANCELLED){
              // console.log("YESTERDAY'S INCOMPLETE TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]+"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let yesterdaysIncompleteTask = new YesterdaysIncompleteTask(mappings);
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
                data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] != TASK_VALUE.COMPLETED && 
                data[r][mappings.tim.get(mappings.tkm.get(TASK_KEY.STATUS))] != TASK_VALUE.CANCELLED ){
              // console.log("OTHER INCOMPLETE TASK::: task="+data[r][tim.get(tkm.get(TASK_KEY.TASK_NAME))]+"ownerId="+data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))]+"  owners:"+convertOwnerIdToString(data[r][tim.get(tkm.get(TASK_KEY.OWNER_ID))],tum));
              let incompleteTask = new IncompleteTask(mappings);
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
  ss.getSheetByName("Log").getRange(1,1).setValue(log);
  // SpreadsheetApp.flush();

  //Formatted Report
  let tcm = createTemplateComponentMap();
  let formattedReport = new FormattedReport(report, tcm);


  report.userReports.forEach(function(userReport, userId){
    // console.log("addUserReport userId="+userId + " value="+userReport.toString());
    let formattedEmail = formattedReport.generateForUserId(userId);
    console.log("Sending email to " +  userReport.name + ", "+ userReport.email + " with subject: " + formattedReport.getEmailSubject());
    emailReports(userReport.email, formattedReport.getEmailSubject(), formattedEmail);
  });

  // let finalReport1 = formattedReport.generateForUserId(1);
  // // console.log(finalReport1);
  // ss.getSheetByName("Log").getRange(1,2).setValue(finalReport1);
  // SpreadsheetApp.flush();
}

function userReportInitializer(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(CONFIG_SHEET);

  let totalRows = configSheet.getLastRow();
  let totalColumns = 3;

  var data = configSheet.getRange(2,1,totalRows, totalColumns).getValues();

  var userReports = {};
  
  data.forEach(function(row){
    userReports[row[0]] = new UserReport(row[1], row[2]);
  });

  // console.log(Object.keys(userReports).length);

  return userReports;
}

function createTaskKeyIndexMap(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(DATA_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(1,1,1, totalColumns).getValues();

  var taskIndexMap = new Map();
  for(var c=0; c<data[0].length; c++){
    taskIndexMap.set(data[0][c], c);
  }

  return taskIndexMap;
}

function createTaskKeyMap(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(TASK_KEY_MAPPING_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(1,1,totalRows, 2).getValues();

  var taskKeyMap = new Map();
  for(var r=1; r<data.length; r++) if(data[r][0] != ""){
    taskKeyMap.set(data[r][0], data[r][1]);
  }

  return taskKeyMap;
}

function createTaskUserMap(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(CONFIG_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(1,1,totalRows, 2).getValues();

  var taskUserMap = new Map();
  for(var r=1; r<data.length; r++) if(data[r][0].length != 0) {
    //taskUserMap[data[r][0]] 
    taskUserMap.set(data[r][0], data[r][1]);
  }

  return taskUserMap;
}

function initializeReport(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(CONFIG_SHEET);

  let totalRows = dataSheet.getLastRow();
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

function createTemplateComponentMap(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(TEMPLATE_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(11,2,totalRows-11+1, 3).getValues();

  let tcm = new TemplateComponentMap(data);
  return tcm;
}
