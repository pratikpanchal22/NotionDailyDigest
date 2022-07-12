function convertOwnerIdToString(ownerId, taskUserMap) {
  
  ownerId = Number(ownerId);
  var ownerString = "";

  for (const [key, value] of taskUserMap.entries()) {
    if((ownerId & key) == key){
      ownerString += ownerString.length == 0 ? "" : ", ";
      ownerString += value;
    }
  }

  return ownerString;
}

function test_OwnerIdToString(){
   let tum = createTaskUserMap();
   for(var i = 0; i<16; i++){
     console.log("id=" + i + " value=" + convertOwnerIdToString(i,tum));
   }
}

function convertOwnerIdToEmailString(ownerId, taskUserEmailMap) {
  
  ownerId = Number(ownerId);
  var emailString = "";

  for (const [key, value] of taskUserEmailMap.entries()) {
    if((ownerId & key) == key){
      emailString += emailString.length == 0 ? "" : ", ";
      emailString += value;
    }
  }

  return emailString;
}

function test_OwnerIdToEmailString(){
   let mapper = new Mapper();
   for(var i = 0; i<16; i++){
     console.log("id=" + i + " value=" + convertOwnerIdToString(i,mapper.tem));
   }
}

function getFirstSubStringBeforeTheFirstSpace(s){
  return s.split(' ')[0];
}

//////////////////////////////////////////////////////////////
/// DATE & TIME UTILITY FUNCTIONS
//////////////////////////////////////////////////////////////

function getDaysDelta(date){
  let currDate = new Date();
  let prevDate = new Date(date);

  currDate.setHours(0,0,0,0);
  prevDate.setHours(0,0,0,0);

  return (prevDate-currDate)/(1000*60*60*24);
}

function test_getDaysDelta(){
  console.log(getDaysDelta("2022-5-25 4:54:23"));
  console.log(getDaysDelta("2022-6-14 4:54:23"));
  console.log(getDaysDelta("2022-6-15 4:54:23"));
  console.log(getDaysDelta("2022-6-16 4:54:23"));
  console.log(getDaysDelta("2022-6-17 4:54:23"));
  console.log(getDaysDelta("2022-6-18 4:54:23"));
}

function convertNumberOfDaysToAgeString(days){
  return days;
}

function timeComponentsAreAllZeroes(dt){
  return (dt.getHours() === 0 && dt.getMinutes() === 0 && dt.getSeconds() === 0 && dt.getMilliseconds() === 0);
}

function getFormattedDateTime(d, format){

  if(isNaN(d) || !Object.prototype.toString.call(d) === "[object Date]"){
    return "";
  }

  date = new Date(d);

  switch(format){
    case DT_FORMAT.DDD_MMM_DD_YYYY: {
      return date.toLocaleDateString('en-us', { weekday:"short", year:"numeric", month:"short", day:"numeric"})
    }

    case DT_FORMAT.DDDDD_MMM_DD_YYYY: {
      return date.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
    }

    case DT_FORMAT.HH_MM: {
      return date.toLocaleTimeString('en-us', {hour:"2-digit", minute:"2-digit"});
    }

    default: {
      return date.toDateString();
    }
  }
}

const DT_FORMAT = Object.freeze({
  DDD_MMM_DD_YYYY: "DDD_MMM_DD_YYYY",
  DDDDD_MMM_DD_YYYY: 'DDDDD_MMM_DD_YYYY',
  HH_MM: "HH_MM"
});

function test_getFormattedDateTime(){
  console.log(getFormattedDateTime("DDD_MMM_DD_YYYY: "+new Date(), DT_FORMAT.DDD_MMM_DD_YYYY));
  console.log(getFormattedDateTime("DDDDD_MMM_DD_YYYY: "+ new Date(), DT_FORMAT.DDDDD_MMM_DD_YYYY));
  console.log(getFormattedDateTime("HH_MM: " + new Date(), DT_FORMAT.HH_MM));
  console.log(getFormattedDateTime("default: " + new Date()));

  let d = "Sat Jun 25 2022 00:00:00 GMT-0600 (Mountain Daylight Time)";
  console.log(getFormattedDateTime(new Date(d), DT_FORMAT.DDD_MMM_D_YYYY));
  console.log("should be empty:"+getFormattedDateTime(new Date("df"), DT_FORMAT.DDD_MMM_D_YYYY));
}

function isUserIdPartOfOwnerId(ownerId, userId){
  return isBitSet(ownerId, userId);
}

function isBitSet(value, bit){
  return ((value & bit) === bit);
}


class DateDiff {
  constructor(pDate){
    if(!isValidDate(pDate)){
      console.log("DateDiff: pDate="+pDate+" is expected to be a object of type Date but is either Nan or of type: " + Object.prototype.toString.call(pDate));
      return;
    }
    this.pDate = pDate;
  }

  overwriteCurrDate(cDate){
    this.cDate = cDate;
  }

  compute(){
    if(!this.cDate){
      this.cDate = new Date();
    }
    

    //pDate is always expected to be in past
    this.yearCount = this.cDate.getFullYear() - this.pDate.getFullYear();

    if(this.cDate.getDate() >= this.pDate.getDate()){
      this.monthCount = this.cDate.getMonth() - this.pDate.getMonth();
      this.dayCount = this.cDate.getDate() - this.pDate.getDate();

      if(this.cDate.getMonth() < this.pDate.getMonth()){
        this.yearCount -= 1;
        this.monthCount += 12;
      }
    }
    else {
      this.monthCount = this.cDate.getMonth() - this.pDate.getMonth() - 1;

      if(this.cDate.getMonth() <= this.pDate.getMonth()){
        this.yearCount -= 1;
        this.monthCount += 12;
      }

      this.dayCount = getNumberOfDaysForMonth(this.pDate.getMonth() + this.monthCount) - (this.pDate.getDate() - this.cDate.getDate());
    }

    //convert days to weeks
    if(this.dayCount > 7){
      this.weekCount = Math.round(this.dayCount / 7);
      this.dayCount %= 7;
    }
  }

  getDateDiffString(){
    this.compute();
    
    let strArray = new Array();
    if(this.yearCount > 0){
      if(this.yearCount == 1){
        strArray.push(this.yearCount + " year");
      }
      else {
        strArray.push(this.yearCount + " years");
      }
    }

    if(this.monthCount > 0){
      if(this.monthCount == 1){
        strArray.push(this.monthCount + " month");
      }
      else {
        strArray.push(this.monthCount + " months");
      }
    }

    if(this.weekCount > 0){
      if(this.weekCount == 1){
        strArray.push(this.weekCount + " week");
      }
      else {
        strArray.push(this.weekCount + " weeks");
      }
    }

    if(this.dayCount > 0){
      if(this.dayCount == 1){
        strArray.push(this.dayCount + " day");
      }
      else {
        strArray.push(this.dayCount + " days");
      }
    }

    if(strArray.length > 0){
      return strArray.join(', ');
    }

    return "0 days";
  }
}

function test_dateDiff() {
    console.log("testDateDiff");

    let t1 = new Date("test");
    console.log(isValidDate(t1));

    let t2 = new Date("May 1, 2022 11:22 AM");
    console.log(isValidDate(t2));

    let dateDiffObj1 = new DateDiff(new Date("May 1, 2022 11:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    dateDiffObj1 = new DateDiff(new Date("Sep 2, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 1, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    dateDiffObj1 = new DateDiff(new Date("Dec 31, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jan 1, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    dateDiffObj1 = new DateDiff(new Date("Jul 15, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 12, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    dateDiffObj1 = new DateDiff(new Date("Feb 28, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Feb 01, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());


    // cDate = 07/01/2022 pDate = 06/30/2021
    dateDiffObj1 = new DateDiff(new Date("Jun 30, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 1, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 12/02/2022  pDate = 01/22/2022
    dateDiffObj1 = new DateDiff(new Date("Jan 22, 2022 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Dec 02, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 07/02/2022 pDate = 08/02/2021
    dateDiffObj1 = new DateDiff(new Date("Aug 02, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 01/30/2022 pDate = 12/30/2021
    dateDiffObj1 = new DateDiff(new Date("Dec 30, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jan 30, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 07/12/2022 pDate = 07/12/2022
    dateDiffObj1 = new DateDiff(new Date("Jul 12, 2022 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 12, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 02/13/2022 pDate = 02/13/2021
    dateDiffObj1 = new DateDiff(new Date("Feb 13, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Feb 13, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 07/01/2022  pDate = 06/01/2021
    dateDiffObj1 = new DateDiff(new Date("Jun 1, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("Jul 1, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 12/02/2022  pDate = 01/02/2022
    dateDiffObj1 = new DateDiff(new Date("jan 2, 2022 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("dec 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());


    // cDate = 07/02/2022  pDate = 08/01/2021
    dateDiffObj1 = new DateDiff(new Date("aug 1, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("jul 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 01/30/2022 pDate = 12/1/2021
    dateDiffObj1 = new DateDiff(new Date("dec 1, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("jan 30, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());


    //cDate = 07/02/2022 pDate = 07/01/2022
    dateDiffObj1 = new DateDiff(new Date("jul 1, 2022 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("jul 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 02/02/2022  pDate = 02/01/2021
    dateDiffObj1 = new DateDiff(new Date("feb 1, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("feb 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());


    //cDate = 07/02/2022 pDate = 06/01/2021
    dateDiffObj1 = new DateDiff(new Date("jun 1, 2021 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("jul 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    //cDate = 02/02/2022 pDate = 01/01/2022
    dateDiffObj1 = new DateDiff(new Date("jan 1, 2022 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("feb 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

    dateDiffObj1 = new DateDiff(new Date("apr 1, 2020 11:22 AM"));
    dateDiffObj1.overwriteCurrDate(new Date("feb 2, 2022 01:22 AM"));
    console.log(dateDiffObj1.getDateDiffString());

}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function test_isValidDate(){
  let d1 = "";
  console.log("d1="+d1 + "  isValidDate? "+ isValidDate(d1));

  d1 = "Hello";
  console.log("d1="+d1 + "  isValidDate? "+ isValidDate(d1));

  d1 = "Hello";
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = "January";
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = "January 12";
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = 12;
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = 2020;
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = '12';
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = "January 12, 2008";
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));
  
  d1 ='12:23 PM';
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));

  d1 = 'January 12, 2008, 12:23 AM';
  console.log("d1="+d1.toString() + "  isValidDate? "+ isValidDate(new Date(d1)));
}

function getNumberOfDaysForMonth(month){

  //trim
  month = month%12;

  //convert js month to calendar month
  month += 1;

  switch (month){
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;

    case 4:
    case 6:
    case 9:
    case 11:
      return 30;

    case 2:
      //todo: support leap year computation
      return 28;

    default:
      throw ("Unsupported month:"+ month);
  }
}