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