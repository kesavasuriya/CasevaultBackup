trigger contactTrigger on Contact (before insert, before update) {
    
    
    if(Trigger.isBefore) {
        
        if(Trigger.isInsert) {
            
            ContactTriggerHandler.onBeforeInsert(Trigger.New);
        }
        
        if(Trigger.isUpdate) {
             
            System.debug('New====='+Trigger.New[0].RecordTypeId);
            System.debug('Name======='+Trigger.New[0].LastName);
            System.debug('Old====='+Trigger.Old[0].RecordTypeId); 
            ContactTriggerHandler.onBeforeUpdate(Trigger.New, Trigger.OldMap);
        }
    }   
}