public with sharing class InHomeChecklistController {
    
    @AuraEnabled
    Public static String getChildRecords(String recordId, String objectApiName) {
        
        WrapperClass initWrap = new WrapperClass();
        DateTime createdDate;
        if(objectApiName == 'Service_Case__c') {
            
            initWrap.serviceCaseRecord = [SELECT Id, CreatedDate
                                     	  FROM Service_Case__c
                                      	  WHERE Id = :recordId];
            initWrap.initialDate = initWrap.serviceCaseRecord.CreatedDate+7;
        	initWrap.riskAssessmentInitialDueDate = initWrap.serviceCaseRecord.CreatedDate+30;
            createdDate = initWrap.serviceCaseRecord.CreatedDate;
        } else if(objectApiName == 'Investigation__c') {
            
            initWrap.investigationRecord = [SELECT Id, CreatedDate
                                     	  FROM Investigation__c
                                      	  WHERE Id = :recordId];
            initWrap.initialDate = initWrap.investigationRecord.CreatedDate+7;
        	initWrap.riskAssessmentInitialDueDate = initWrap.investigationRecord.CreatedDate+30;
            createdDate = initWrap.investigationRecord.CreatedDate;
        }
        
        initWrap.todayDate = DateTime.now();
        

        Set<Id> personIds = new Set<Id>();
        
        for(Program_Assignment__c assignmentIns : [SELECT Id, Program_Area__c, Contact__c FROM Program_Assignment__c WHERE (Service_Case__c = :recordId OR Investigation__c =:recordId)
                                                   AND (Program_Area__c = 'In Home' OR Program_Area__c = 'Out of Home') ORDER BY Program_Area__c ASC]) 
            {
                if(assignmentIns.Program_Area__c == 'In Home') {
                    personIds.add(assignmentIns.Contact__c);
                } else if(assignmentIns.Program_Area__c == 'Out of Home' && personIds.contains(assignmentIns.Contact__c)) {
                    personIds.remove(assignmentIns.Contact__c);
                }
            }

        Notes__c notesRecord = getNotesDetails(recordId, personIds, initWrap.initialDate, createdDate);
        if(notesRecord != null) {
            
            initWrap.notesRecord = notesRecord;
            initWrap.workerName = notesRecord.CreatedBy.Name;
            initWrap.completedDate = notesRecord.CreatedDate;
        } else {
            
            initWrap.notesRecord = new Notes__c();
            initWrap.workerName = null;
            initWrap.completedDate = null;
        }
        
        Assessment__c safecRecord = getSAFECDetails(recordId, personIds);
        
        if(safecRecord !=null) {
            
            initWrap.safecAssessmentRecord = safecRecord;
        } else {
            
            initWrap.safecAssessmentRecord = new Assessment__c();
        }
        
        Assessment__c riskRecord = getRiskAssessmentDetails(recordId, personIds);
        
        if(riskRecord !=null) {
            
            initWrap.riskAssessmentRecord = riskRecord;
        } else {
            
            initWrap.riskAssessmentRecord = new Assessment__c();
        }
        
        return JSON.serialize(initWrap);
        
    }
    
    
    Public static Notes__c getNotesDetails(String recordId, Set<Id> personIds,DateTime initialdate,DateTime createddate) {
        
        Map<Id, Notes__c> notesMap = new Map<Id, Notes__c>([SELECT Id, Contact_Type__c, CreatedBy.Name, Contact_Date__c, CreatedDate 
                                    FROM Notes__c  
                                    WHERE Contact_Purpose__c INCLUDES('Worker Visit','Case Management','Family Assessment') 
                                    AND (Contact_Type__c = 'Face to Face' 
                                         OR Contact_Type__c = 'Initial Face to Face')
                                    AND Contact_was_initiated_received__c = 'Initiated'
                                    AND Contact_was_Attempted_Completed__c  = 'Completed'
                                    AND (Service_Case__c = :recordId OR Investigation__c =:recordId)
                                    AND (Contact_Date__c >= :Date.valueOf(createddate))
                                    AND (Contact_Date__c <= :Date.valueOf(initialdate)) ORDER BY CreatedDate DESC]);
        
       
        Set<Id> personsInvolved = new Set<Id>();
        Set<Id> personsNotInvolved = new Set<Id>();
        List<Person_Involved__c> getPersonsInvolved = [SELECT Id, Notes__c, Person__c FROM Person_Involved__c WHERE Notes__c IN:notesMap.keySet()];
          system.debug('dd '+getPersonsInvolved);
        for(Person_Involved__c involvedRec : getPersonsInvolved) {
            personsInvolved.add(involvedRec.Person__c);
        }
        for(Id recId : personIds) {
            if(!personsInvolved.contains(recId)) {
                personsNotInvolved.add(recId);
            } 
        }
        if(personsNotInvolved.isEmpty() && notesMap.size()>0) {
            system.debug('res '+notesMap.values());
            return notesMap.values()[0];
        } else {
            return null;
        }
        
        
    }
    
    Public static Assessment__c getSAFECDetails(String recordId, Set<Id> personIds) {
        
        Map<Id, Assessment__c> safecMap = new Map<Id, Assessment__c>([SELECT Id, Assessment_Type__c, Case_Worker_Name__c, Supervisor_Name__c,CreatedBy.Name,CreatedDate,
                                            Safety_Assessment_Approval_Date_Time__c, Supervisor_Approver__r.Name,
                                            Workers_Name__c,Submitted_Date__c 
                                            FROM Assessment__c  
                                            WHERE Assessment_Type__c ='SAFE-C'
                                            AND (Service_Case__c = :recordId OR Investigation__c =:recordId)
                                            AND Approval_Status__c ='Approved']);
        
        
        Set<Id> personsInvolved = new Set<Id>();
        Set<Id> personsNotInvolved = new Set<Id>();
        List<Person_Involved__c> getPersonsInvolved = [SELECT Id, Assessment__c, Person__c FROM Person_Involved__c WHERE Assessment__c IN:safecMap.keySet()];
        for(Person_Involved__c involvedRec : getPersonsInvolved) {
            personsInvolved.add(involvedRec.Person__c);
        }
        
        for(Id recId : personIds) {
            if(!personsInvolved.contains(recId)) {
                personsNotInvolved.add(recId);
            } 
        }
        if(personsNotInvolved.isEmpty() && safecMap.size() > 0) {
            return safecMap.values()[0];
        } else {
            return null;
        }
        
        
    }
    
    Public static Assessment__c getRiskAssessmentDetails(String recordId, Set<Id> personIds) {
        
        Map<Id, Assessment__c> riskAssessmentMap = new Map<Id, Assessment__c>([SELECT Id, Assessment_Type__c, Case_Worker_Name__c, Supervisor_Name__c,CreatedBy.Name,CreatedDate,
                                                     Safety_Assessment_Approval_Date_Time__c, Supervisor_Approver__r.Name,
                                                     Workers_Name__c,Submitted_Date__c 
                                                     FROM Assessment__c  
                                                     WHERE (Assessment_Type__c ='Family risk Reassessment' OR Assessment_Type__c ='Family Initial Risk Assessment')
                                                     AND (Service_Case__c = :recordId OR Investigation__c =:recordId) 
                                                     AND Approval_Status__c ='Approved']);
        

		Set<Id> personsInvolved = new Set<Id>();
        Set<Id> personsNotInvolved = new Set<Id>();
        List<Person_Involved__c> getPersonsInvolved = [SELECT Id, Assessment__c, Person__c FROM Person_Involved__c WHERE Assessment__c IN:riskAssessmentMap.keySet()];
         for(Person_Involved__c involvedRec : getPersonsInvolved) {
            personsInvolved.add(involvedRec.Person__c);
        }
        
        for(Id recId : personIds) {
            if(!personsInvolved.contains(recId)) {
                personsNotInvolved.add(recId);
            } 
        }
        if(personsNotInvolved.isEmpty() && riskAssessmentMap.size() > 0) {
            return riskAssessmentMap.values()[0];
        } else {
            return null;
        }        
        
    }
    
    public class WrapperClass { 
        
        @AuraEnabled
        public List<Person__c> personRecords;
        @AuraEnabled
        public Service_Case__c  serviceCaseRecord;
        @AuraEnabled
        public Investigation__c investigationRecord;
        @AuraEnabled
        public datetime  initialDate;
        @AuraEnabled
        public datetime  riskAssessmentInitialDueDate;
        @AuraEnabled
        public datetime  todayDate;
        @AuraEnabled
        public String workerName;
        @AuraEnabled
        public datetime completedDate;
        @AuraEnabled
        public Assessment__c safecAssessmentRecord;
        @AuraEnabled
        public Assessment__c riskAssessmentRecord;
        @AuraEnabled
        public Notes__c notesRecord;
    }
    
}