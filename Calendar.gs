function test_calendarWrapper() {
  let cw = new CalendarWrapper();
}

const CALENDAR_TYPE = Object.freeze({
  FAMILY_EVENT_CAL: "FAMILY_EVENT_CAL",
  PRIVATE_EVENT_CAL: "PRIVATE_EVENT_CAL"
});

const EVENT_CREATE_PERMISSION_TYPE = Object.freeze({
  EMPTY: '',
  NO: 'No',
  PRIVATE: 'Yes - as a private event',
  FAMILY: 'Yes - in family calendar'
});

class CalendarEventTemplate {
  constructor(calendar, defaultDuration, defaultStartTime){
    this.calendar = calendar;
    this.defaultDuration = defaultDuration;
    this.defaultStartTime = defaultStartTime;
    this.event = null;
  }

  getEventUrl(){
    if(!this.calendar){
      console.log("Error: no valid calendar found");
      return;
    }

    if(!this.event || this.event === null){
      console.log("Error: no valid event found");
      return;
    }

    // console.log("calendarId = " + this.calendar.getId());
    // console.log("eventId = " + this.event.getId());

    var eventUrl = "https://www.google.com/calendar/event?eid=" +
                  Utilities.base64Encode(this.event.getId().split('@')[0] +
                  " " + 
                  this.event.getOriginalCalendarId())
                  .replace(/\=/g, '');
    // console.log("eventUrl = " + eventUrl);

    return "Invite to event sent! EventId=" + this.event.getId() + " Event url: " + eventUrl;
  }
}

class CalendarWrapper {
  constructor(mapper){
    this.mapper = mapper;

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let dataSheet = ss.getSheetByName(CONFIG_SHEET);

    let data = dataSheet.getRange(34, 1, 30, 4).getValues();
    this.calendarMap = new Map();

    for(var r=0; r<data.length; r++){

      let key = data[r][0];
      let calendarId = data[r][1];

      if(key.length === 0 || calendarId.length === 0){
        continue;
      }

      let calendar = CalendarApp.getCalendarById(calendarId);

      if(!this.calendarIsAccessible(calendar)){
        let msg = "Error: Unable to access calendar: " + calendarId + ". Skipping.";
        console.log(msg);
        continue;
      }

      this.calendarMap.set(key, new CalendarEventTemplate(calendar, data[r][2], data[r][3]));
    }

  }

  calendarIsAccessible(calendar){
    if(calendar === null){
      return false;
    }
    return true;
  }


  getEventTemplateForEventType(eventType){
    switch (eventType) {
      case EVENT_CREATE_PERMISSION_TYPE.EMPTY:
      case EVENT_CREATE_PERMISSION_TYPE.NO:
        console.log("Error: No event creation permission");
        return null;

      case EVENT_CREATE_PERMISSION_TYPE.FAMILY: {
        if(this.calendarMap.has(CALENDAR_TYPE.FAMILY_EVENT_CAL)){
          let calTemplate = this.calendarMap.get(CALENDAR_TYPE.FAMILY_EVENT_CAL);
          return new CalendarEventTemplate(calTemplate.calendar, calTemplate.defaultDuration, calTemplate.defaultStartTime);
        }
        console.log('calendarMap does not event template for eventType: EVENT_CREATE_PERMISSION_TYPE.FAMILY: ' + eventType);
        return null;
      }

      case EVENT_CREATE_PERMISSION_TYPE.PRIVATE: {
        if(this.calendarMap.has(CALENDAR_TYPE.PRIVATE_EVENT_CAL)){
          let calTemplate = this.calendarMap.get(CALENDAR_TYPE.PRIVATE_EVENT_CAL);
          return new CalendarEventTemplate(calTemplate.calendar, calTemplate.defaultDuration, calTemplate.defaultStartTime);
        }
        console.log('Error: calendarMap does not event template for eventType: EVENT_CREATE_PERMISSION_TYPE.PRIVATE: ' + eventType);
        return null;
      }

      default: {
        console.log('calendarMap does not event template for unknown eventType:'+ eventType);
        return null;
      }
    }
  }


  createEvent(dataRow){

    //create template
    let calendarEventTemplate = this.getEventTemplateForEventType(dataRow[this.mapper.getIndexFromKey(TASK_KEY.AUTO_CREATE_GCAL_EVENT)]);

    //return if template is not received
    if(calendarEventTemplate === null){
      console.log("Error: null calendarEventTemplate received");
      return;
    }

    //return if calendar is not accessible
    if(!this.calendarIsAccessible(calendarEventTemplate.calendar)){
      let msg = "Error: Don't have access to calendar: " + this.calendarId;
      console.log(msg);
      return;
    }

    /*
     * if endTime == empty 
     *    if startTime == midnight => all day event
     *    else => create event for defaultDuration starting at startTime
     * else
     *    // assuming that startTime will not be empty 
     *    create event for startTime to endTime
     */

    // console.log("SUCCESS!! Will create event for: " + dataRow[this.mapper.getIndexFromKey(TASK_KEY.TASK_NAME)]);
    // console.log("event will be created in calendar: " + calendarEventTemplate.calendar.getName());
    // console.log("event default duration:" + calendarEventTemplate.defaultDuration);
    // console.log("event default start time:" + calendarEventTemplate.defaultStartTime);

    let startTime = new Date(dataRow[this.mapper.getIndexFromKey(TASK_KEY.SCHEDULED)]);
    let endTime = new Date(dataRow[this.mapper.getIndexFromKey(TASK_KEY.SCHEDULED_END)]);

    // console.log("startTime="+startTime.toString());
    // console.log("endTime="+endTime.toString());

    if(!isValidDate(startTime)){
      console.log("Error: startTime is expected to be a valid date time");
      return;
    }

    let options = {};
      options.description = dataRow[this.mapper.getIndexFromKey(TASK_KEY.SUMMARY)];
      options.location = '';
      options.guests = convertOwnerIdToEmailString(dataRow[this.mapper.getIndexFromKey(TASK_KEY.OWNER_ID)], this.mapper.tem);
      options.sendInvites = true;
      // console.log("options="+JSON.stringify(options));

    if(!isValidDate(endTime)){

      //create all day event
      if(timeComponentsAreAllZeroes(startTime)){
        calendarEventTemplate.event = calendarEventTemplate.calendar
                .createAllDayEvent(dataRow[this.mapper.getIndexFromKey(TASK_KEY.TASK_NAME)], startTime, options);
      }
      else {
        //create event for defaultDuration starting at startTime
        console.log("creating single time bounded event");
        let endTime = new Date(startTime.getTime() + (calendarEventTemplate.defaultDuration * 60 * 1000));
        calendarEventTemplate.event = calendarEventTemplate.calendar
              .createEvent(dataRow[this.mapper.getIndexFromKey(TASK_KEY.TASK_NAME)], 
                            startTime, 
                            endTime,
                            options);
      }
    }
    else {
      calendarEventTemplate.event = calendarEventTemplate.calendar
              .createEvent(dataRow[this.mapper.getIndexFromKey(TASK_KEY.TASK_NAME)], 
                            startTime, 
                            endTime,
                            options);
    }

    // console.log("calendar eventId=" + calendarEventTemplate.event.getId());
    return calendarEventTemplate.getEventUrl();
  }

  
}
