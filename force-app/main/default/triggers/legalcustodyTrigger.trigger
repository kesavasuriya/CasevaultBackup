trigger legalcustodyTrigger on Legal_Custody__c (before insert, before update) {

    Set<Id> childIds = new Set<Id>();
    Set<Id> existChildIds = new Set<Id>();
    for(Legal_Custody__c legalRec : Trigger.new) {
        childIds.add(legalRec.Child_Name__c);
    }
    
    List<Legal_Custody__c> legalLst = new List<Legal_Custody__c>();
    legalLst = [SELECT Id, Child_Name__c, End_Date__c FROM Legal_Custody__c WHERE Child_Name__c IN:childIds AND End_Date__c=NULL AND Child_Name__c != NULL];
    for(Legal_Custody__c legalcustody : legalLst) {
        existChildIds.add(legalcustody.Child_Name__c);
    }
    
    if(Trigger.isInsert) {
        
        for(Legal_Custody__c legalRecord : Trigger.new) {
            
            if(existChildIds.contains(legalRecord.Child_Name__c)) {
                
               // legalRecord.addError('Legal Custody records can only be active/open for one child at a time.');
            }
        }
    }
    
    /*if(Trigger.isUpdate) {
        
        for(Legal_Custody__c legalRecord : Trigger.old) {
            
            if(existChildIds.contains(legalRecord.Child_Name__c)) {
                
                legalRecord.addError('Legal Custody records can only be active/open for one child at a time.');
            }
        }
        
    }*/
    

}