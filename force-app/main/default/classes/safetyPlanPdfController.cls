public class safetyPlanPdfController {
    
    public string assessmentId{get; set;}
    public Assessment__c assessmentRecord {get; set;}
    public list<Assessment_Safety_Plan__c> safetyPlanList {get; set;}
    public list<Person_Involved__c > personList {get; set;}
    
    Public  safetyPlanPdfController(){
        
        assessmentId  = ApexPages.CurrentPage().getparameters().get('id');
        safetyPlanList = new List<Assessment_Safety_Plan__c>();
        
        assessmentRecord = [SELECT Id, Name, CreatedBy.Name, Supervisor_Approver__r.Name ,
                            Case_Worker_Signature__c, Caseworker_Signature_Date__c ,
                            SAFEC_Date_Time_Assessment_Initiated__c 
                            FROM Assessment__c 
                            WHERE Id =:assessmentId];
        
        String removeImageTag;
        if(assessmentRecord.Case_Worker_Signature__c != NULL) {
        removeImageTag = assessmentRecord.Case_Worker_Signature__c.replaceAll('&amp;','&');
        assessmentRecord.Case_Worker_Signature__c = removeImageTag.substring(10,removeImageTag.length()-8);
        }
        safetyPlanList = [SELECT Id, Question_Name__c, Specific_Danger_Influence__c, 
                          Action_Required__c, Date_to_be_Completed__c, Responsible_Partie__r.Name,
                          Re_evaluation_Date__c  
                          FROM Assessment_Safety_Plan__c 
                          WHERE Assessment__c =: assessmentId];
        
        List<Person_Involved__c> linkRecords = [SELECT Id, Person__r.Name, Signature__c ,Signature_Date__c 
                                                FROM Person_Involved__c 
                                                WHERE Assessment__c =:assessmentId 
                                                AND Is_Caregiver__c =true];
        
        personList = new List<Person_Involved__c>();
        for(Person_Involved__c link : linkRecords) {
            if(link.Signature__c != NULL) {
                String removeTag = link.Signature__c.replaceAll('&amp;','&');
                link.Signature__c = removeTag.substring(10,removeTag.length()-8);
                personList.add(link);
            }
            
        }
        
    }
    
    
}