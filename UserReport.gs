function test_userReport(){
  let userReport = new UserReport();
  console.log(userReport.getTitleForReport(REPORT_TYPE.TODAYS_TASKS));
  console.log(userReport.getTitleForReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS));
}

class UserReport {
  constructor(userId, name, email){
    this.userId = userId;
    this.name = name;
    this.email = email;

    this.todaysTasks = new Array();
    this.todaysTasks.push(new TodayTask());

    this.yesterdaysCompletedTasks = new Array();
    this.yesterdaysCompletedTasks.push(new YesterdaysCompletedTask());

    this.yesterdaysIncompleteTasks = new Array();
    this.yesterdaysIncompleteTasks.push(new YesterdaysIncompleteTask());

    this.unscheduledTasks = new Array();
    this.unscheduledTasks.push(new UnscheduledTask());
  }

  toString(){
    return "instance of Class UserReport " + 
    " userId:::"+this.userId + " name="+this.name + " email="+this.email + "\n" +
    " todaysTasks:::"+this.todaysTasks.toLocaleString() +  "\n" +
    " yesterdaysCompletedTasks:::"+this.yesterdaysCompletedTasks.toLocaleString() + "\n" +
    " yesterdaysIncompleteTasks:::"+this.yesterdaysIncompleteTasks.toString() + "\n" +
    " unscheduledTasks:::"+this.unscheduledTasks.toString() + "\n";
  }

  getTitleForReport(reportType){

    let title = {};
    title.primary = "Unknown primary title";
    title.secondary = "Unknown secondary title";

    switch(reportType){
      case REPORT_TYPE.TODAYS_TASKS: {
        if(this.todaysTasks.length == 1){
          title.primary = "You have no tasks scheduled for today.";
          title.secondary = "You can either pick some from future or add new. 👨‍🏭";
        }
        else if(this.todaysTasks.length == 2){
          title.primary = "You have 1 task scheduled for today.";
          title.secondary = "Happy tasking! 👩‍🏭📝👨‍🏭";
        }
        else {
          title.primary = "Today, you have " + (this.todaysTasks.length-1) + " scheduled tasks.";
          title.secondary = "Please mark them as complete as you get them done. Happy tasking! 👩‍🏭📝👨‍🏭";
        }
        return title;
      }

      case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS: {
        if(this.yesterdaysCompletedTasks.length == 1){
          title.primary = "You did not complete any tasks yesterday.";
          title.secondary = "Oh well; some days are like that. 🤷‍♂️";
        }
        else if(this.yesterdaysCompletedTasks.length == 2){
          title.primary = "You completed this 1 task yesterday.";
          title.secondary = "That's 1 less thing to worry about! 👍👏🎉";
        }
        else {
          title.primary = "Yesterday, you completed these" + this.yesterdaysCompletedTasks.length-1 + " tasks.";
          title.secondary = "Awesome! Those are " + (this.yesterdaysCompletedTasks.length-1) + " less things to worry about! 👍👏🎉";
        }
        return title;
      }

      case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS: {
        if(this.yesterdaysIncompleteTasks.length == 1){
          title.primary = "You don't have any incomplete tasks from yesterday.";
          title.secondary = "🎊🎉🍹";
        }
        else if(this.yesterdaysIncompleteTasks.length == 2){
          title.primary = "You have 1 incompleted task from yesterday.";
          title.secondary = "See if you can reschedule it. 📝📆";
        }
        else {
          title.primary = "From yesterday, you have " + (this.yesterdaysIncompleteTasks.length-1) + " incompleted tasks.";
          title.secondary = "See if you can reschedule them. 📆📝";
        }
        return title;
      }

      case REPORT_TYPE.UNSCHEDULED_TASKS: {
        if(this.unscheduledTasks.length == 1){
          title.primary = "You don't have any unscheduled tasks.";
          title.secondary = "Nice work!";
        }
        else if(this.unscheduledTasks.length == 2){
          title.primary = "You have 1 unscheduled task.";
          title.secondary = "See if you can schedule it. 📆📝";
        }
        else {
          title.primary = "There are " + (this.unscheduledTasks.length-1) + " unscheduled tasks, and you own them.";
          title.secondary = "See if you can schedule some of them. 📝📆";
        }
        return title;
      }

      default: {
        title.primary += " for reportType=" + reportType;
        title.secondary += " for reportType=" + reportType;
        return title;
      }
    }
  }
}