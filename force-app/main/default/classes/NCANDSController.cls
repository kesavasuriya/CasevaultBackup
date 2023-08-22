public with sharing class NCANDSController {
    
    @AuraEnabled
    Public static String getPersons(String recordId) {
        
        if(!String.isBlank(recordId)) {
        List<String> personFields = new List<String>{'Id','Person__c','Person__r.Name','Person__r.Date_of_Birth__c', 
            						'Person__r.Gender__c','Person__r.Race__c','Person__r.Hispanic_Latino_Origin__c',
            						'Person_Role__c'};
                String personCondition = '(Service_Case__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
                'Intake__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 'Investigation__c = \'' + String.escapeSingleQuotes(recordId)+ '\') AND Person__r.RecordType.Name ='+'\''+'Persons Involved'+'\'AND Person_Role__c INCLUDES('+
                +'\''+'Alleged Victim'+'\')';
        List<SObject> sObjListcontact = DataService.performQueryOperation(personFields, 'Person__c', personCondition, Utility.queryLimit);       
        List<Person__c> persons = (List<Person__c>)sObjListcontact;
        
        return JSON.serialize(persons);
        } else {
            return NULL;
        }
        
    }


}