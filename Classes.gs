class Task {
  constructor(mapper){
    this.mapper = mapper;

    this.taskName = "Task";
    this.taskUrl = "";
    this.projectName = "Project";
    this.projectUrl = "";
    this.ownerId = "OwnerId";
  }

  populateFields(dataRow, richTextDataRow){
    this.taskName = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.TASK_NAME)]);
    this.taskUrl = String(richTextDataRow[this.mapper.getIndexFromKey(TASK_KEY.PAGE_ID)].getLinkUrl());
    this.projectName = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.PROJECT_NAME)]);
    this.projectUrl = String(richTextDataRow[this.mapper.getIndexFromKey(TASK_KEY.PROJECT)].getLinkUrl());
    this.ownerId = dataRow[this.mapper.getIndexFromKey(TASK_KEY.OWNER_ID)];
  }

  toString(){
    return "taskName="+this.taskName + "\n" +
    " taskUrl=" + this.taskUrl + "\n" +
    " projectName="+this.projectName + "\n" +
    " projectUrl="+this.projectUrl + "\n" +
    " ownerId="+this.ownerId + "\n";
  }
}

    class TaskWithDeadline extends Task {
      constructor(mapper){
        super(mapper);
        this.deadline = "Deadline";
      }

      populateFields(dataRow, richTextDataRow){
        super.populateFields(dataRow, richTextDataRow);
        this.deadline = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.DEADLINE_START)]);
      }

      toString(){
        return super.toString() + 
        " deadline="+this.deadline + "\n";
      }
    }

        class IncompleteTask extends TaskWithDeadline {
          constructor(mapper){
            super(mapper);
            this.owner = "Owner(s)";
          }

          populateFields(dataRow, richTextDataRow){
            super.populateFields(dataRow, richTextDataRow);
            this.owner = convertOwnerIdToString(dataRow[this.mapper.getIndexFromKey(TASK_KEY.OWNER_ID)], this.mapper.tum);
          }

          toString(){
            return super.toString() +
            " owner="+this.owner+ "\n";
          }
        }

        class YesterdaysIncompleteTask extends TaskWithDeadline {
          constructor(mapper){
            super(mapper);
            this.status = "Status";
          }

          populateFields(dataRow, richTextDataRow){
            super.populateFields(dataRow, richTextDataRow);
            this.status = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.STATUS)]);
          }

          toString(){
            return super.toString() +
            " status="+this.status+ "\n";
          }
        }

        class UnscheduledTask extends TaskWithDeadline {
          constructor(mapper){
            super(mapper);
            this.age = "Age";
          }

          populateFields(dataRow, richTextDataRow){
            super.populateFields(dataRow, richTextDataRow);

            let dateDiffObj = new DateDiff(new Date(dataRow[this.mapper.getIndexFromKey(TASK_KEY.CREATED)]));
            this.age = dateDiffObj.getDateDiffString();
          }

          toString(){
            return super.toString() +
            " age="+this.age+ "\n";
          }
        }

            class OwnerlessTask extends UnscheduledTask {
              constructor(mapper){
                super(mapper);
                this.createdBy = "Created By";
              }

              populateFields(dataRow, richTextDataRow){
                super.populateFields(dataRow, richTextDataRow);
                this.createdBy = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.CREATED_BY)]);
              }

              toString(){
                return super.toString() +
                " createdBy="+this.createdBy + "\n";
              }
            }

    class YesterdaysCompletedTask extends Task {
      constructor(mapper){
        super(mapper);
        this.age = "Age";
      }
      
      populateFields(dataRow, richTextDataRow){
        super.populateFields(dataRow, richTextDataRow);

        let dateDiffObj = new DateDiff(new Date(dataRow[this.mapper.getIndexFromKey(TASK_KEY.CREATED)]));
        this.age = dateDiffObj.getDateDiffString();
      }

      toString(){
        return super.toString() +
        " age="+this.age + "\n";
      }
    }

        class TodayTask extends YesterdaysCompletedTask {
          constructor(mapper){
            super(mapper);
            this.owner = "Owner";
            this.nextStep = "Next Step";
          }

          populateFields(dataRow, richTextDataRow){
            super.populateFields(dataRow, richTextDataRow);
            this.owner = convertOwnerIdToString(dataRow[ this.mapper.getIndexFromKey(TASK_KEY.OWNER_ID)],this.mapper.tum);
            this.nextStep = String(dataRow[this.mapper.getIndexFromKey(TASK_KEY.NEXT_STEP)]);
          }

          toString(){
            return super.toString() +
            " owner="+this.owner +
            " nextStep="+this.nextStep + "\n";
          }
        }    












//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
///
///      FORMATTED EMAIL
///
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

class FormattedReport{
  constructor(report, tcm){
    this.report = report;
    this.tcm = tcm;

    // generate all common components
    this.ownerlessTasksComponent = this.generateComponentForReport(REPORT_TYPE.OWNERLESS_TASKS);
    this.incompleteTasksComponent = this.generateComponentForReport(REPORT_TYPE.INCOMPLETE_TASKS);

  }

  getEmailSubject(){
    return "Notion Tasks Daily Digest - " + getFormattedDateTime(new Date(), DT_FORMAT.DDD_MMM_DD_YYYY);
  }

  //construct user components on demand
  generateForUserId(userId){
    let html = new Array();
    if(!this.report.userReports.has(userId)){
      return html;
    }

    html.push(this.tcm.getHtml(HTML_COMPONENT.HTML_METADATA));
    html.push(this.tcm.getHtml(HTML_COMPONENT.HTML_HEAD));
    html.push(this.tcm.getHtml(HTML_COMPONENT.HTML_BODY, HTML_COMPONENT_FRAGMENT.OPEN));

      html.push(this.tcm.getHtml(HTML_COMPONENT.CAPTION_HEADER, HTML_COMPONENT_FRAGMENT.OPEN));
        html.push(fill(this.tcm.getHtml(HTML_COMPONENT.GREETING_PRIMARY), getFirstSubStringBeforeTheFirstSpace(this.report.userReports.get(userId).name)));
      html.push(this.tcm.getHtml(HTML_COMPONENT.CAPTION_HEADER, HTML_COMPONENT_FRAGMENT.CLOSE));

      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

      html.push(this.tcm.getHtml(HTML_COMPONENT.CAPTION_HEADER, HTML_COMPONENT_FRAGMENT.OPEN));
        html.push(fill(this.tcm.getHtml(HTML_COMPONENT.GREETING_SECONDARY), getFormattedDateTime(new Date(), DT_FORMAT.DDD_MMM_DD_YYYY)));
      html.push(this.tcm.getHtml(HTML_COMPONENT.CAPTION_HEADER, HTML_COMPONENT_FRAGMENT.CLOSE));

      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //TodaysTasks
      html.push(this.generateComponentForReport(REPORT_TYPE.TODAYS_TASKS, userId));

      //section divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //ownerless tasks
      html.push(this.ownerlessTasksComponent);

      //section divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //yesterdaysCompletedTasks
      html.push(this.generateComponentForReport(REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS, userId));

      //section divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //yesterdaysIncompleteTasks
      html.push(this.generateComponentForReport(REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS, userId));

      //section divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //unscheduledTasks
      html.push(this.generateComponentForReport(REPORT_TYPE.UNSCHEDULED_TASKS, userId));

      //section divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.SECTION_DIVIDER));

      //incomplete tasks
      html.push(this.incompleteTasksComponent)

      //report divider
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));
      html.push(this.tcm.getHtml(HTML_COMPONENT.HORIZONTAL_LINE));
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

      //quote of the day
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.OPEN));
        let todaysQuote = this.report.todaysQuote;
        html.push(fill(this.tcm.getHtml(HTML_COMPONENT.SPAN_QUOTE), todaysQuote.quote));
        html.push(fill(this.tcm.getHtml(HTML_COMPONENT.SPAN_QUOTE_AUTHOR), todaysQuote.author));
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.CLOSE));

      //line break
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

      //date & time
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.OPEN));
        html.push(fill(this.tcm.getHtml(HTML_COMPONENT.SPAN_DATE_TIME), 
                    new Array(getFormattedDateTime(new Date(), DT_FORMAT.DDD_MMM_DD_YYYY), 
                              getFormattedDateTime(new Date(), DT_FORMAT.HH_MM),
                              this.report.getCurrentAgeInMs())));
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.CLOSE));

      //line break
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

      //bot info
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.OPEN));
        html.push(this.tcm.getHtml(HTML_COMPONENT.SPAN_INFO));
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.CLOSE));

      //line break
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

      //copyright
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.OPEN));
        html.push(this.tcm.getHtml(HTML_COMPONENT.SPAN_COPYRIGHT));
      html.push(this.tcm.getHtml(HTML_COMPONENT.DIV_FOOTER_INFO, HTML_COMPONENT_FRAGMENT.CLOSE));

    html.push(this.tcm.getHtml(HTML_COMPONENT.HTML_BODY, HTML_COMPONENT_FRAGMENT.CLOSE));

    return html.join('\n');
  }


  generateComponentForReport(reportType, userId){

    let html = new Array();

    let tasks = new Array();
    switch(reportType){

      case REPORT_TYPE.TODAYS_TASKS:
        tasks = this.report.userReports.get(userId).todaysTasks;
        break;

      case REPORT_TYPE.OWNERLESS_TASKS:
        tasks = this.report.ownerlessTasks;
        break;

      case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS:
        tasks = this.report.userReports.get(userId).yesterdaysCompletedTasks;
        break;

      case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS:
        tasks = this.report.userReports.get(userId).yesterdaysIncompleteTasks;
        break;

      case REPORT_TYPE.UNSCHEDULED_TASKS:
        tasks = this.report.userReports.get(userId).unscheduledTasks;
        break;

      case REPORT_TYPE.INCOMPLETE_TASKS:
        tasks = this.report.incompleteTasks;
        break;

      default:
        console.log("ERROR: unknown reportType:"+reportType);
        break;
    }

    //line break
    html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));
    html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));

    let h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE, HTML_COMPONENT_FRAGMENT.OPEN), new Array(reportType));
    html.push(h);
      html.push(this.tcm.getHtml(HTML_COMPONENT.LINE_BREAK));
      html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_CAPTION, HTML_COMPONENT_FRAGMENT.OPEN));
  
        let title = this.report.getTitleForReport(reportType, userId);
        
        h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_CAPTION_PRIMARY), new Array(title.primary));
        html.push(h);

        h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_CAPTION_SECONDARY), new Array(title.secondary));
        html.push(h);
      html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_CAPTION, HTML_COMPONENT_FRAGMENT.CLOSE));


      if(tasks.length > 1) {
        html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_ROW, HTML_COMPONENT_FRAGMENT.OPEN));

          let headerRowTask = tasks[0];         
          h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), new Array(headerRowTask.taskName));
          html.push(h);
          h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), new Array(headerRowTask.projectName));
          html.push(h);

          switch(reportType) {

            case REPORT_TYPE.TODAYS_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.owner);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.nextStep);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.age);
              html.push(h);
              break;
            }

            case REPORT_TYPE.OWNERLESS_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.deadline);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.createdBy);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.age);
              html.push(h);
              break;
            }

            case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.age);
              html.push(h);
              break;
            }
            
            case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.status);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.deadline);
              html.push(h);
              break;
            }

            case REPORT_TYPE.UNSCHEDULED_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.deadline);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.age);
              html.push(h);
              break;
            }

            case REPORT_TYPE.INCOMPLETE_TASKS: {
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.owner);
              html.push(h);
              h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_CELL), headerRowTask.deadline);
              html.push(h);
              break;
            }

            default : {
              console.log("Unknown reportType:" + reportType);
              break;
            }
          }

        html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_HEADER_ROW, HTML_COMPONENT_FRAGMENT.CLOSE));

        html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_BODY, HTML_COMPONENT_FRAGMENT.OPEN));
        for(var i=1; i<tasks.length; i++){
          let dataRow = tasks[i];

          html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_DATA_ROW, HTML_COMPONENT_FRAGMENT.OPEN));

            h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.taskName,dataRow.taskUrl, dataRow.taskName));
            html.push(h);

            h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.projectName,dataRow.projectUrl, dataRow.projectName));
            html.push(h);

            switch(reportType) {

              case REPORT_TYPE.TODAYS_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.owner, dataRow.owner));
                html.push(h);
                
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.nextStep, dataRow.nextStep));
                html.push(h);

                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.age, dataRow.age));
                html.push(h);
                break;
              }

              case REPORT_TYPE.OWNERLESS_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.deadline, getFormattedDateTime(new Date(dataRow.deadline), DT_FORMAT.DDD_MMM_DD_YYYY)));
                html.push(h);
                
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.createdBy, dataRow.createdBy));
                html.push(h);

                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.age, dataRow.age));
                html.push(h);
                break;
              }

              case REPORT_TYPE.YESTERDAYS_COMPLETED_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.age, dataRow.age));
                html.push(h);
                break;
              }

              case REPORT_TYPE.YESTERDAYS_INCOMPLETE_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.status, dataRow.status));
                html.push(h);

                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.deadline, dataRow.deadline));
                html.push(h);
                break;
              }

              case REPORT_TYPE.UNSCHEDULED_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.deadline, dataRow.deadline));
                html.push(h);

                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.age, dataRow.age));
                html.push(h);
                break;
              }

              case REPORT_TYPE.INCOMPLETE_TASKS: {
                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                        new Array(headerRowTask.owner, dataRow.owner));
                html.push(h);

                h = fill(this.tcm.getHtml(HTML_COMPONENT.TABLE_NON_HYPERLINKED_CELL), 
                                    new Array(headerRowTask.deadline, dataRow.deadline));
                html.push(h);
                break;
              }

              default : {
                console.log("Unknown reportType:" + reportType);
                break;
              }
            }

            

          html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_DATA_ROW, HTML_COMPONENT_FRAGMENT.CLOSE));
        }
        html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE_BODY, HTML_COMPONENT_FRAGMENT.CLOSE));
      }

    html.push(this.tcm.getHtml(HTML_COMPONENT.TABLE, HTML_COMPONENT_FRAGMENT.CLOSE));

    // console.log(html.join('\n'));

    // if(reportType == REPORT_TYPE.INCOMPLETE_TASKS){
    //   console.log(html.join('\n'));
    // }

    return html.join('\n');
  }

}

function testTableCreation(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName(TEMPLATE_SHEET);

  let totalRows = dataSheet.getLastRow();
  let totalColumns = dataSheet.getLastColumn();

  var data = dataSheet.getRange(11,2,totalRows-11+1, 3).getValues();

  let tcm = new TemplateComponentMap(data);

  // tcm.forEach(function(value, key){
  //   console.log("key="+key + "  value=" + value.toString());
  // });

  generateOwnerlessTasksComponent(tcm, "");
}

const HTML_COMPONENT = Object.freeze({
  HTML_METADATA: 'HTML_METADATA',
  HTML_HEAD: 'HTML_HEAD',
  HTML_BODY: 'HTML_BODY',

  CAPTION_HEADER: 'CAPTION_HEADER',
  GREETING_PRIMARY: 'GREETING_PRIMARY',
  GREETING_SECONDARY: 'GREETING_SECONDARY',

  SECTION_DIVIDER: 'SECTION_DIVIDER',

  LINE_BREAK: "LINE_BREAK",
  HORIZONTAL_LINE: "HORIZONTAL_LINE",
  TABLE: "TABLE",
  TABLE_CAPTION: "TABLE_CAPTION",
  TABLE_CAPTION_PRIMARY: "TABLE_CAPTION_PRIMARY",
  TABLE_CAPTION_SECONDARY: 'TABLE_CAPTION_SECONDARY',
  TABLE_HEADER_ROW: 'TABLE_HEADER_ROW',
  TABLE_HEADER_CELL: 'TABLE_HEADER_CELL',
  TABLE_BODY: 'TABLE_BODY',
  TABLE_HYPERLINKED_CELL: 'TABLE_HYPERLINKED_CELL',
  TABLE_NON_HYPERLINKED_CELL: 'TABLE_NON_HYPERLINKED_CELL',
  TABLE_DATA_ROW: 'TABLE_DATA_ROW',

  DIV_FOOTER_INFO: 'DIV_FOOTER_INFO',
  SPAN_QUOTE: 'SPAN_QUOTE',
  SPAN_QUOTE_AUTHOR: 'SPAN_QUOTE_AUTHOR',
  SPAN_DATE_TIME: 'SPAN_DATE_TIME',
  SPAN_INFO: 'SPAN_INFO',
  SPAN_COPYRIGHT: 'SPAN_COPYRIGHT'
});

const HTML_COMPONENT_FRAGMENT = Object.freeze({
  OPEN: "OPEN",
  CLOSE: "CLOSE",
});

function fill(component, values){

    if(values.constructor.name.toString().toLowerCase() != 'array'){
      values = new Array(values);
    }

    let count = (component.match(/{}/g) || []).length;
    // console.log("fill.count="+count);
    // console.log("values.length="+values.length);
    if(count != values.length){
      let msg = "\nERROR! component does not have the same number of positions to fill as the number of values\n"
      msg+= "component positions="+count + "\n";
      msg+= "values.length="+values.length + "\n";
      msg += "component:" + component + "\n";
      msg += "values="+values.toString();
      throw msg;
    }

    values.forEach(function(value){
      component = component.replace('{}', value);
    });
    return component;
  }