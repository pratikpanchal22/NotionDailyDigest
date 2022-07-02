class Report {
  constructor(){
    this.userReports = new Map();

    this.incompleteTasks = new Array();
    this.incompleteTasks.push(new IncompleteTask());

    this.ownerlessTasks = new Array();
    this.ownerlessTasks.push(new OwnerlessTask());

    this.reportCreationStartTime = new Date();

    this.todaysQuote = getTodaysQuote();
  }

  addReport(reportType, task){
    switch(reportType){
      case REPORT_TYPE.TODAYS_TASKS: {
        this.userReports.forEach(function(userReport, userId){
          // console.log("addUserReport userId="+userId + " value="+userReport.toString());
          if(isUserIdPartOfOwnerId(task.ownerId, userId)){
            userReport.todaysTasks.push(task);
          }
        });
        break;
      }

      case REPORT_TYPE.UNSCHEDULED_TASKS: {
        this.userReports.forEach(function(userReport, userId){
          // console.log("addUserReport userId="+userId + " value="+userReport.toString());
          if(isUserIdPartOfOwnerId(task.ownerId, userId)){
            userReport.unscheduledTasks.push(task);
          }
        });
        break;
      }

      case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS: {
        this.userReports.forEach(function(userReport, userId){
          // console.log("addUserReport userId="+userId + " value="+userReport.toString());
          if(isUserIdPartOfOwnerId(task.ownerId, userId)){
            userReport.yesterdaysCompletedTasks.push(task);
          }
        });
        break;
      }

      case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS: {
        this.userReports.forEach(function(userReport, userId){
          // console.log("addUserReport userId="+userId + " value="+userReport.toString());
          if(isUserIdPartOfOwnerId(task.ownerId, userId)){
            userReport.yesterdaysIncompleteTasks.push(task);
          }
        });
        break;
      }

      case REPORT_TYPE.INCOMPLETE_TASKS: {
        this.incompleteTasks.push(task);
        break;
      }

      case REPORT_TYPE.ONWERLESS_TASKS: {
        this.ownerlessTasks.push(task);
        break;
      }

      default: {
        console.log("ERROR: Unable to process addReport: reportType="+reportType + " task="+task.toString());
      }
    }
  }

  getLogBundle(){
    let p = "*** REPORT ***\n" + 
    "-> number of user reports:" + this.userReports.size + "\n";

    this.userReports.forEach(function(v, k){
      p+= "  -> userId(key)="+k + " userId(value)="+v.userId + " name="+v.name+ " email="+v.email+"\n";
      p+= "    ->1. todaysTasks: length=" + v.todaysTasks.length + "\n";
      p+= "         title: "+v.getTitleForReport(REPORT_TYPE.TODAYS_TASKS).primary;
      p+= "                "+v.getTitleForReport(REPORT_TYPE.TODAYS_TASKS).secondary;
      v.todaysTasks.forEach(function(task){
        p+="      ->"+task.toString()+"\n";
      });
      
      p+= "    ->2. yesterdaysCompletedTasks: length=" + v.yesterdaysCompletedTasks.length + "\n";
      p+= "         title: "+v.getTitleForReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS).primary;
      p+= "                "+v.getTitleForReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS).secondary;
      v.yesterdaysCompletedTasks.forEach(function(task){
        p+="      ->"+task.toString()+"\n";
      });

      p+= "    ->3. yesterdaysIncompleteTasks: length=" + v.yesterdaysIncompleteTasks.length + "\n";
      p+= "         title: "+v.getTitleForReport(REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS).primary;
      p+= "                "+v.getTitleForReport(REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS).secondary;
      v.yesterdaysIncompleteTasks.forEach(function(task){
        p+="      ->"+task.toString()+"\n";
      });

      p+= "    ->4. unscheduledTasks: length=" + v.unscheduledTasks.length + "\n";
      p+= "         title: "+v.getTitleForReport(REPORT_TYPE.UNSCHEDULED_TASKS).primary;
      p+= "                "+v.getTitleForReport(REPORT_TYPE.UNSCHEDULED_TASKS).secondary;
      v.unscheduledTasks.forEach(function(task){
        p+="      ->"+task.toString()+"\n";
      });
    });

    p+= "\n->Common report:  incompleteTasks: length=" + this.incompleteTasks.length + "\n";
    p+= "  title: "+this.getTitleForReport(REPORT_TYPE.INCOMPLETE_TASKS).primary;
    p+= "  "+this.getTitleForReport(REPORT_TYPE.INCOMPLETE_TASKS).secondary;
    this.incompleteTasks.forEach(function(task){
      p+="      ->"+task.toString()+"\n";
    });

    p+= "\n->Common report:  ownerlessTasks: length=" + this.ownerlessTasks.length + "\n";
    p+= "  title: "+this.getTitleForReport(REPORT_TYPE.ONWERLESS_TASKS).primary;
    p+= "  "+this.getTitleForReport(REPORT_TYPE.ONWERLESS_TASKS).secondary;
    this.ownerlessTasks.forEach(function(task){
      p+="      ->"+task.toString()+"\n";
    });

    p+= "\nreportCreationStartTime="+this.reportCreationStartTime+"\n";
    p+= "\nreportCreationStartTime="+this.reportCreationStartTime+"\n";

    p+= "\nToday's quote: \""+ this.todaysQuote.quote+'"';
    p+="Author:"+ this.todaysQuote.author+"\n";
    
    return p;
  }

  getCurrentReportAgeString(){
    let ms = new Date() - this.reportCreationStartTime;
    return "It took " + ms + " milliseconds to generate this report.";
  }

  getCurrentAgeInMs(){
    let ms = new Date() - this.reportCreationStartTime;
    return ms + " milliseconds";
  }

  getTitleForReport(reportType, userId){

    let title = {};
    title.primary = "Unknown primary title";
    title.secondary = "Unknown secondary title";

    switch(reportType){
      case REPORT_TYPE.INCOMPLETE_TASKS: {
        if(this.incompleteTasks.length == 1){
          title.primary = "There are no other incomplete tasks.";
          title.secondary = "Everyone is on top of their things! 👌👌👌"
        }
        else if(this.incompleteTasks.length == 2){
          title.primary = "There is 1 incomplete task from past.";
          title.secondary = "It needs to be looked at. 👀"
        }
        else {
          title.primary = "There are " + (this.incompleteTasks.length-1) + " other tasks that were scheduled in past but are still not completed.";
          title.secondary = "These needs some attention. 👀🧐🔎";
        }
        return title;
      }

      case REPORT_TYPE.OWNERLESS_TASKS: {
        if(this.ownerlessTasks.length == 1){
          title.primary = "There are no unassigned tasks!";
          title.secondary = "Amazing! 🤩🥳🍻";
        }
        else if(this.ownerlessTasks.length == 2){
          title.primary = "There is 1 ownerless task.";
          title.secondary = "See if you can pick it up. 🏋️";
        }
        else {
          title.primary = "There are " + (this.ownerlessTasks.length-1) + " ownerless tasks.";
          title.secondary = "See if you can pick some of them up. 🏋️🏋️"
        }
        return title;
      }

      case REPORT_TYPE.TODAYS_TASKS:
      case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS:
      case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS:
      case REPORT_TYPE.UNSCHEDULED_TASKS:
        return this.userReports.get(userId).getTitleForReport(reportType);
        break;

      default: {
        title.primary += " for reportType=" + reportType;
        title.secondary += " for reportType=" + reportType;
        return title;
      }
    }
  }
}