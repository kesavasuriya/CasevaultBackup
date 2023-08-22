public with sharing class OutOfHomeChecklistController {
    
    @AuraEnabled
    Public static String getChildRecords(String recordId) {
        
        WrapperClass initWrap = new WrapperClass();
        initWrap.todayDate = DateTime.now();

        Set<Id> personIds = new Set<Id>();
        List<Child_Removal__c> childRemovalRecord = [SELECT Id, Child__c  FROM Child_Removal__c WHERE (Service_Case__c =:recordId 
                                                     OR Investigation__c =:recordId) AND Removal_End_Date_Time__c = NULL ];
        
        for(Child_Removal__c removalRecord : childRemovalRecord) {
            personIds.add(removalRecord.Child__c);
        }
        
        initWrap.personRecords = [SELECT Id, Name FROM Contact WHERE Id IN:personIds];
        
        return JSON.serialize(initWrap);
        
    }
    
    @AuraEnabled
    Public static String getTableDetails(String recordId, String personId) {
        
        DetailWrapper initWrap = new DetailWrapper();
        List<Child_Removal__c>  removalRecords = [SELECT Id, Removal_Date_of_DT_F__c  
                                                  FROM Child_Removal__c 
                                                  WHERE Removal_End_Date_Time__c = NULL 
                                                  AND Service_Case__c = :recordId 
                                                  AND Child__c =:personId];
        
        System.debug(removalRecords);
        if(removalRecords.size() > 0) {
            initWrap.initialDueDate = removalRecords[0].Removal_Date_of_DT_F__c + 5;
            initWrap.nextDueDate = removalRecords[0].Removal_Date_of_DT_F__c + 60;
            Date firstDayOfMonth = System.today().toStartOfMonth();
            initWrap.lastDayOfMonth = firstDayOfMonth.addDays(Date.daysInMonth(firstDayOfMonth.year(), 
                                                                               firstDayOfMonth.month()) - 1);
            
        }
        system.debug('ide '+personId+'t '+recordId);
        List<Person_Involved__c> assessmentList = [SELECT Id, Assessment__r.Assessment_Type__c, Assessment__r.Case_Worker_Name__c, 
                                                       Assessment__r.Supervisor_Name__c,Assessment__r.Workers_Name__c,
                                                       Assessment__r.Safety_Assessment_Approval_Date_Time__c, Assessment__r.Supervisor_Approver__r.Name,
                                                       Assessment__r.Submitted_Date__c,Person__c 
                                                       FROM Person_Involved__c 
                                                       WHERE Assessment__r.Assessment_Type__c ='SAFE-C-OHP'
                                                       AND Assessment__r.Service_Case__c = :recordId AND Person__c =:personId];
        
        if(assessmentList.size() > 0) {
            initWrap.assessmentRecord = assessmentList[0];
        }
        
       
        
        List<Examination__c> examinationRecords = [SELECT Id, CreatedBy.Name, CreatedDate, Nature_of_Exam__c
                                                   FROM Examination__c 
                                                   WHERE (Contact__c = :personId
                                                          AND Appoinment_Information__c ='Kept') AND (Nature_of_Exam__c = 'Initial Health Examination'
                                                                                                      OR Nature_of_Exam__c = 'Comprehensive Health Examination' OR Nature_of_Exam__c ='Annual Health Examination')
                                                   ORDER BY CreatedDate DESC];
        
        if(examinationRecords.size() > 0) {
            
            for(Examination__c examRec : examinationRecords) {
                
                if(examRec.Nature_of_Exam__c == 'Initial Health Examination') {
                    initWrap.initialExamRecord = examRec;
                } else if(examRec.Nature_of_Exam__c == 'Comprehensive Health Examination') {
                    initWrap.comprehensiveExamRecord = examRec;
                } else if(examRec.Nature_of_Exam__c == 'Annual Health Examination') {
                    initWrap.annualExamRecord = examRec;
                }
            }
        }
        
      
        
        List<Person_Involved__c > notesList = [SELECT Id, Notes__c, Notes__r.Contact_Type__c, Notes__r.CreatedBy.Name, Notes__r.Contact_Date__c 
                                                    FROM Person_Involved__c  
                                                    WHERE Notes__r.Contact_Purpose__c INCLUDES('Monthly Visit') 
                                                    AND (Notes__r.Contact_Type__c = 'Face to Face' 
                                                         OR Notes__r.Contact_Type__c = 'Initial Face to Face')
                                                    AND Notes__r.Service_Case__c = :recordId AND Person__c =:personId ORDER BY CreatedDate DESC
                                                    LIMIT 1];
        system.debug('notes '+notesList);
        if(notesList.size() > 0) {
            initWrap.notesRecord = notesList[0];
            
        }
        
        return JSON.serialize(initWrap);
        
    }
    
    
    public class WrapperClass { 
        
        @AuraEnabled
        public List<Contact> personRecords;
        @AuraEnabled
        public datetime  todayDate;
        
    }
    
    
    public class DetailWrapper {
        
        @AuraEnabled
        public date initialDueDate;
        @AuraEnabled
        public date nextDueDate;
        @AuraEnabled
        public date lastDayOfMonth;
        @AuraEnabled
        public Person_Involved__c assessmentRecord;
        @AuraEnabled
        public Examination__c initialExamRecord;
        @AuraEnabled
        public Examination__c comprehensiveExamRecord;
        @AuraEnabled
        public Examination__c annualExamRecord;
        @AuraEnabled
        public Person_Involved__c  notesRecord;
    }
    
}