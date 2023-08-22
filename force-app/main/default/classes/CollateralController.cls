public with sharing class CollateralController {
    
    @AuraEnabled
    public static string getCollaterals(Id recordId){
        
        List<Collateral__c> collaterals = [SELECT Name, First_Name__c, Middle_Name__c, Last_Name__c 
                                           FROM Collateral__c 
                                           WHERE Service_Case__c = :recordId 
                                           ORDER BY LastModifiedDate DESC];
        return JSON.serialize(collaterals);
    }
    
    @AuraEnabled
    public static string getCollateral(Id collateralId, String objectName){
        
        CollateralWrapper initWrap = new CollateralWrapper();
        String parentId;
        
        if(String.isNotBlank(collateralId) && objectName == 'Collateral__c') {
            
            
            initWrap.collateral = [SELECT Name, Date_of_Birth__c , End_Date__c , Start_Date__c, Service_Case__c,
                                   Investigation__c , Intake__c 
                                   FROM Collateral__c 
                                   WHERE Id =:collateralId];
            
            initWrap.relationshipRecords = [SELECT Id, Person__c, Role__c , Relationship_Values__c 
                                            FROM Relationship__c
                                            WHERE Collateral__c =:collateralId];
            
            if(String.isNotBlank(initWrap.collateral.Service_Case__c)) {
                
                parentId = initWrap.collateral.Service_Case__c;
                
            } else if(String.isNotBlank(initWrap.collateral.Investigation__c)){
                
                parentId = initWrap.collateral.Investigation__c;
                
            } else if(String.isNotBlank(initWrap.collateral.Intake__c)){
                
                parentId = initWrap.collateral.Intake__c;
                
            }
            
        } else {
            
            parentId = collateralId;       
            
        }
        
        Set<Id> personIds = new Set<Id>();
        List<Program_Assignment__c> programAssignmentLst = [SELECT Id, Contact__c 
                                                            FROM Program_Assignment__c
                                                            WHERE(Investigation__c =:parentId OR Service_Case__c =:parentId)
                                                            AND End_Date__c =NULL];
        
        for(Program_Assignment__c paRecord : programAssignmentLst) {
            personIds.add(paRecord.Contact__c);
        }
        
        initWrap.persons = [SELECT Id, Name 
                            FROM Contact 
                            WHERE Id IN:personIds];
        
        
        return JSON.serialize(initWrap);
    }
    
    public class CollateralWrapper {
        
        @AuraEnabled
        Public Collateral__c collateral;
        @AuraEnabled
        Public List<Contact> persons;
        @AuraEnabled
        Public List<Relationship__c> relationshipRecords;
    }
    
    
}