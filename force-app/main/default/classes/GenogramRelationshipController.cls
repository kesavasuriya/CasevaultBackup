public class GenogramRelationshipController {
    
    @AuraEnabled
    public static String getAllPersons(String recordId) {
        
        getInitialWrapper initWrap = new getInitialWrapper ();
        Id personInvolvedRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Persons Involved').getRecordTypeId();
        
        initWrap.relationshipPicklist = Utility.getPicklistinfo('Relationship__c','Relationship_Values__c',false);
        FieldLevelSecurity.checkFieldAccessByCriteria('Name, Age__c,Gender__c,Date_of_Birth__c, Casevault_PID__c', 'view', 'Contact',  Boolean.valueOf(Label.HasNamespace));
        List<String> jnObjFields = new List<String>{'Id', 'Person__c','Is_Caregiver__c'};
            String jnObjCondition = 'Person__r.RecordTypeId = \''+ String.escapeSingleQuotes(personInvolvedRecordTypeId)+ '\''+'AND (Intake__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
            'Investigation__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
            'Service_Case__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 'Person__c = \'' + String.escapeSingleQuotes(recordId) + '\')';
        List<Person__c> jnObjList = DataService.performQueryOperation(jnObjFields, 'Person__c', jnObjCondition, Utility.queryLimit);        
        initWrap.jnObjectRecords = (List<Person__c>)jnObjList;
        
        String contactCondition = '';
        
        
        String conIds='';
        if(jnObjList.size() > 0) {
            conIds +=' IN (';
            
            for(Person__c rec : jnObjList) {
                conIds +='\''+String.escapeSingleQuotes(rec.Person__c)+'\',';
            }
            conIds = conIds.removeEnd(',');
            conIds +=')';
            
        }
        else{
            conIds +=' IN('+'\''+'\')';
        }
        contactCondition += ' Id  '+ conIds;     
        
        
        
        List<String> contactFields = new List<String>{'Id','Name', 'Age__c','Gender__c','Date_of_Birth__c', 'Casevault_PID__c','Person_Image_URL__c','Date_of_Death__c'};
            /* String contactCondition = 'Service_Case__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
'Intake__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 'Investigation__c = \'' + String.escapeSingleQuotes(recordId) + '\'';*/
            List<SObject> sObjListcontact = DataService.performQueryOperation(contactFields, 'Contact', contactCondition, Utility.queryLimit);        
        if(sObjListcontact.size() > 0) {
            initWrap.contactList = (List<Contact>) sObjListcontact;
        }
        
        List<String> relationFields = new List<String>{'Person__c', 'Person_Related_To__c', 'Person_Related_To__r.Name', 'Relationship_Values__c', 'Is_Caregiver__c'};
            String relationCondition = ' Person__c '+conIds;
        
        List<SObject> sObjListrelation = DataService.performQueryOperation(relationFields, 'Relationship__c', relationCondition, Utility.queryLimit);
        initWrap.allRelationshipRecords = (List<Relationship__c>)sObjListrelation;
        
        Set<Id> personIds = new Set<Id>();
        for(Person__c rec : initWrap.jnObjectRecords) {
            personIds.add(rec.Person__c);
        }
        
        
        initWrap.programAssignmentRecords = [SELECT Id, Name, Contact__c 
                                             FROM Program_Assignment__c
                                             WHERE Contact__c IN: personIds
                                             AND End_Date__c =NULL
                                             AND (Service_Case__c =:recordId OR Investigation__c =: recordId)];
        
        initWrap.collateralRecords = [SELECT Id, Collateral_Full_Name__c 
                                      FROM Collateral__c 
                                      WHERE (Service_Case__c =:recordId OR Investigation__c =: recordId)];
        return JSON.serialize(initWrap);
    }
    
    @AuraEnabled
    public static String getRelationRecord(String personId, String recordId, List<String> personIds) {
        
        if(String.isNotBlank(personId)) {
            
            getRelationshipWrapper initWrap = new getRelationshipWrapper ();
            
            initWrap.relationshipRecords = [SELECT Id, Person__c, Person_Related_To__c, Person_Related_To__r.Name ,Relationship_Values__c,
                                            Person_Related_To__r.Person_Image_URL__c
                                            FROM Relationship__c
                                            WHERE Person__c =:personId
                                            AND (Service_Case__c =:recordId OR Investigation__c =: recordId OR Victim__c =: recordId)];
            initWrap.otherRelationshipRecords = [SELECT Id, Person__c, Person_Related_To__c, Person_Related_To__r.Name ,
                                                 Relationship_Values__c, Service_Case__c, Service_Case__r.Name, Investigation__c,
                                                 Investigation__r.Name,Person_Related_To__r.Person_Image_URL__c, Victim__c, Victim__r.CaseNumber 
                                            	 FROM Relationship__c
                                           		 WHERE Person__c =:personId 
                                                 AND Person_Related_To__c NOT IN :personIds
                                           		 AND (Service_Case__c !=:recordId OR Investigation__c !=: recordId OR Victim__c !=: recordId)
                                                 AND (Service_Case__c != NULL OR Investigation__c != NULL OR Victim__c != NULL)];
           Set<Id> otherPersonId = new Set<Id>();
           for(Relationship__c rec: initWrap.otherRelationshipRecords) {
                otherPersonId.add(rec.Person_Related_To__c);
           }
           initWrap.childRemovalRecords = [SELECT Id, Child__c, Removal_End_Date_Time__c, Service_Case__c 
                                           FROM Child_Removal__c
                                           WHERE (Service_Case__c =:recordId OR Investigation__c =: recordId)
                                           OR Child__c IN :otherPersonId];
            return JSON.serialize(initWrap);
        } else {
            return null;
        }
    }
    
    @AuraEnabled
    public static String saveRelationship(String relationshipJSON, String recordId) {
        
        if (String.isNotBlank(relationshipJSON)) {
            
            Relationship__c relationship = (Relationship__c)JSON.deserialize(relationshipJSON,Relationship__c.class);
                        
            if (String.isBlank(relationship.Id)) {
                FieldLevelSecurity.checkFieldAccessByCriteria('Person__c, Person_Related_To__c, Relationship_Values__c, Is_Caregiver__c', 'create', 'Relationship__c',  Boolean.valueOf(Label.HasNamespace));
                insert relationship;
            } else {
                FieldLevelSecurity.checkFieldAccessByCriteria('Person__c, Person_Related_To__c, Relationship_Values__c, Is_Caregiver__c', 'update', 'Relationship__c',  Boolean.valueOf(Label.HasNamespace));
                update relationship;
            }
            return relationship.Id;
        } else {
            return null;
        }
        
    }
    
    
    public class getInitialWrapper { 
        
        @AuraEnabled
        public List<Utility.pickListWrap> relationshipPicklist;
        @AuraEnabled
        public List<Contact> contactList;
        @AuraEnabled
        public List<Person__c> jnObjectRecords;
        @AuraEnabled
        public List<Relationship__c> allRelationshipRecords;
        @AuraEnabled
        public List<Program_Assignment__c> programAssignmentRecords;
        @AuraEnabled
        public List<Collateral__c> collateralRecords;
        
    }
    Public class getRelationshipWrapper {
        @AuraEnabled
        public List<Relationship__c> relationshipRecords;
        @AuraEnabled
        public List<Relationship__c> otherRelationshipRecords;
        @AuraEnabled
        public List<Program_Assignment__c> programAssignmentRecords;
        @AuraEnabled
        public List<Child_Removal__c > childRemovalRecords;
        
    }
    
}