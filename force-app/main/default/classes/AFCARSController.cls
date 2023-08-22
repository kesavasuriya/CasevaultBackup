public with sharing class AFCARSController {
    
    @AuraEnabled
    Public static String getPersons(String recordId) {
        
        if(!String.isBlank(recordId)) {
        
        Set<Id> personIds = new Set<Id>();
        
        for(Program_Assignment__c assignmentIns : [SELECT Id, Program_Area__c, Contact__c 
                                                   FROM Program_Assignment__c 
                                                   WHERE (Service_Case__c = :recordId OR Investigation__c =:recordId)
                                                   AND Program_Sub_Area__c = 'Out of Home - Child'
                                                   AND Program_Area__c = 'Out of Home'
                                                   ORDER BY Program_Area__c ASC]) 
            {
                if(assignmentIns.Program_Area__c == 'Out of Home') {
                    personIds.add(assignmentIns.Contact__c);
                } 
            }
        
        List<Person__c> persons = [SELECT Id, Person__c, Person__r.Name, Person__r.Date_of_Birth__c, 
                                  Person__r.Gender__c, Person__r.Race__c, Person__r.Hispanic_Latino_Origin__c,
                                  Person__r.Child_a_member_in_federal_Tribe__c
                                  FROM Person__c
                                  WHERE Person__c IN:personIds
                                  AND (Service_Case__c = :recordId OR Investigation__c =:recordId)
                                  AND Person__r.RecordType.Name ='Persons Involved'
                                  AND Person_Role__c INCLUDES ('Biological Child','Other Child (Not in Household)','Private Adoptive Child')];
        
       
        return JSON.serialize(persons);
        } else {
            return NULL;
        }
    }

}