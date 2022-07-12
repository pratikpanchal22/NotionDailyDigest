class Mapper {
  constructor(){
    this.tkm = this.createTaskKeyMap();            //taskKeyMap
    
    this.tim = this.createTaskKeyIndexMap();       //taskIndexMap
    
    //this.tum
    //this.tem
    this.createTaskUserMap();                      //taskUserMap && taskUserEmailMap
    
    this.tcm = this.createTemplateComponentMap();  //templateComponentMap
  }

  createTaskKeyMap(){
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

  createTaskKeyIndexMap(){
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

  createTaskUserMap(){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(CONFIG_SHEET);

    let totalRows = 30; //dataSheet.getLastRow();
    let totalColumns = dataSheet.getLastColumn();

    var data = dataSheet.getRange(1,1,totalRows, 3).getValues();

    var taskUserMap = new Map();
    var taskUserEmailMap = new Map();
    for(var r=1; r<data.length; r++) if(data[r][0].length != 0) {
      //taskUserMap[data[r][0]] 
      taskUserMap.set(data[r][0], data[r][1]);
      taskUserEmailMap.set(data[r][0], data[r][2]);
    }

    this.tum = taskUserMap;
    this.tem = taskUserEmailMap;
  }

  createTemplateComponentMap(){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName(TEMPLATE_SHEET);

    let totalRows = dataSheet.getLastRow();
    let totalColumns = dataSheet.getLastColumn();

    var data = dataSheet.getRange(11,2,totalRows-11+1, 3).getValues();

    let tcm = new TemplateComponentMap(data);
    return tcm;
  }

  getIndexFromKey(key){
    if(!this.tkm.has(key)){
      throw ("Error: tkm does not contain key: " + key);
    }

    let tkmVal = this.tkm.get(key);
    if(!this.tim.has(tkmVal)){
      throw ("Error: tim does not contain key: " + tkmVal);
    }

    return this.tim.get(tkmVal);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
class TemplateComponentMap {
  
  constructor(data){
    this.data = data;
    let tcm = new Map();
    this.data.forEach(function(row){
      let key = row[0];
      let value = new Array();
      value.push(row[1]);
      value.push(row[2]);

      tcm.set(key, value);
    });

    this.tcm = tcm;
  }

  getHtml(component, fragment){

    if(!fragment){
      fragment = HTML_COMPONENT_FRAGMENT.OPEN;
    }

    if(this.tcm.has(component)){
      if(fragment === HTML_COMPONENT_FRAGMENT.OPEN){
        return this.tcm.get(component)[0];
      }
      else if(fragment === HTML_COMPONENT_FRAGMENT.CLOSE){
        return this.tcm.get(component)[1];
      }
    }
    
    console.log("Error: tcm does not contain component:"+component.toString()+ ". Returning empty string.");
    return "";
  }
}