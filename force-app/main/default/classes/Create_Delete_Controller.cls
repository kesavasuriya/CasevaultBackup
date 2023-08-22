public class Create_Delete_Controller {
    
    @InvocableMethod
    public static void getIds(List<Create_Delete_Wrapper_Class> wrapperLst) {
        
        doCreateDelete(wrapperLst);
        
    }
    
    public static void doCreateDelete(List<Create_Delete_Wrapper_Class> wrapperLst) {
        
        if(wrapperLst.size() > 0  && 
           String.isNotBlank(wrapperLst[0].objectName) && String.isNotBlank(wrapperLst[0].relationshipObjectName) && String.isNotBlank(wrapperLst[0].parentId)) {
            
            System.debug('method enters===');   
            String query = 'SELECT Id, '+ wrapperLst[0].relationshipObjectName + ', ' + wrapperLst[0].primaryObjectName + ' FROM ' + wrapperLst[0].objectName + ' WHERE ' + wrapperLst[0].relationshipObjectName + ' = \''+ String.escapeSingleQuotes(wrapperLst[0].parentId)+'\'';
            Map<Id,SObject> totalRecords = new Map<Id,SObject>(Database.query(query)); //Person Involved List
            Map<Id, sObject> previous_selected_recordMap = new Map<Id, sObject>(); 
            Map<Id, sObject> current_selected_recordMap = new Map<Id, sObject>();  
            Set<Id> deleteChildId = new Set<Id>(); 
               
            if(wrapperLst[0].previous_selected_records != null && wrapperLst[0].previous_selected_records.size() > 0 ) {
                
                previous_selected_recordMap = new Map<Id, sObject>( wrapperLst[0].previous_selected_records );
            } 
            if(wrapperLst[0].current_selected_records != null && wrapperLst[0].current_selected_records.size() > 0) {
                
            	current_selected_recordMap = new Map<Id, sObject>( wrapperLst[0].current_selected_records );
                   
            }   
            List<SObject> createList = new List<SObject>();
            List<SObject> deleteList = new List<SObject>();   
            
            if(previous_selected_recordMap != null) {
                   
                for( Id mapKeyId : previous_selected_recordMap.keySet()) {
                    
                    if(current_selected_recordMap != null &&  current_selected_recordMap.containsKey(mapKeyId) ) {
                        
                        current_selected_recordMap.remove(mapKeyId);
                        previous_selected_recordMap.remove(mapKeyId);
                        
                    } else {
                        deleteChildId.add(mapKeyId);
                    }
                        
                } 
            } 
               
            for(SObject objIns : totalRecords.values() ) {
                   
                if(deleteChildId.contains((Id)objIns.get(wrapperLst[0].primaryObjectName))) {
                    deleteList.add(objIns);      
                }
            }   
             
            SObject createIns; 
            for(Id mapKeyId : current_selected_recordMap.keySet()) {
                	
                createIns = (SObject)Type.forName(wrapperLst[0].objectName).newInstance();
            	createIns.put(wrapperLst[0].primaryObjectName, mapKeyId);
                createIns.put(wrapperLst[0].relationshipObjectName, wrapperLst[0].parentId);
                createList.add(createIns);
            }    
            
            if(deleteList != null) {
                   
                delete deleteList;   // Person Involved delete list
            }
               
            if(createList != null) {
                   
                insert createList;   // Person Involved create list
            }                            
        }
        
    }
    
    public class Create_Delete_Wrapper_Class {
        
        @InvocableVariable
        public List<sObject> previous_selected_records;
        @InvocableVariable
        public List<sObject> current_selected_records;
        @InvocableVariable
        public String relationshipObjectName;  // Placement__c
        @InvocableVariable
        public String objectName; // Person Involved
        @InvocableVariable
        public String parentId; // placementId - relationshipObjectName Id
        @InvocableVariable
        public String primaryObjectName; //Person__c
        
        public Create_Delete_Wrapper_Class() {
            
            previous_selected_records = new List<sObject>();
            current_selected_records = new List<sObject>();
        }
    }

}