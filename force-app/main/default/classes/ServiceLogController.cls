public with sharing class ServiceLogController {

    @AuraEnabled
    public static String getInitInfo(Id serviceCaseId) {
        
        ServiceLogWrapper wrapperIns = new ServiceLogWrapper();
        wrapperIns.contacts = [SELECT Person__c, Person__r.Name FROM Person__c WHERE Service_Case__c = :serviceCaseId];
        wrapperIns.servicePicklists = Utility.getPicklistinfo('ServiceLog__c', 'Service__c', false);
        return JSON.serialize(wrapperIns);
    }
    
    @AuraEnabled
    public static String getSearchList(String services) {
        
        SearchResultWrapper resultWrapperIns = new SearchResultWrapper();
       	List<String> structServiceFields = new List<String>{'Id','Name','Provider__c','Provider__r.Name','Provider__r.Casevault_ProID__c',
             													'Provider__r.Tax_ID__c','Provider__r.BillingStreet',
             													'Provider__r.BillingCountry','Provider__r.BillingPostalCode','Structure_Service_Name__c'};
       
        String structServiceCondition = 'Structure_Service_Name__c LIKE \''+'%'+String.escapeSingleQuotes(services)+'\'';
       	resultWrapperIns.structureServices = (List<Structure_Services__c>)DataService.performQueryOperation(structServiceFields, 'Structure_Services__c', structServiceCondition, Utility.queryLimit);
        
        List<String> vendorFields = new List<String>{'Id', 'Name', 'First_Name__c', 'Last_Name__c', 'Business_Name__c', 'SSN__c', 'FEIN__c'};
        String vendorCondition = 'Service__c INCLUDES (\''+String.escapeSingleQuotes(services)+'\')';
        resultWrapperIns.vendors = (List<Vendor__c>)DataService.performQueryOperation(vendorFields, 'Vendor__c', vendorCondition, Utility.queryLimit);
        return JSON.serialize(resultWrapperIns);
    }
    
    public Purchase_Authorization__c authorizationRecord { get; set; }

    public ServiceLogController(ApexPages.StandardController controller) {

        Id currentRecordId  = ApexPages.CurrentPage().getparameters().get('id');
        List<String> purchageAuthFields = new List<String>{'Id','Name','Service__r.Name','Service__r.Provider__r.Casevault_ProID__c','Service__r.Provider__r.Tax_ID__c',
                                                           'Service__r.Provider__r.Name','Service__r.Provider__r.Phone','Service__r.Provider__r.BillingStreet',
                                                            'Service__r.Client__r.Name','Service__r.Client__r.Casevault_PID__c','Service__r.Client__r.Service_Case__r.Name','Service__r.Structure_Services__r.Structure_Service_Name__c',
                                                            'Justification__c','Fiscal_Category_Description__c','Cost_not_be_exceed__c','Start_Date__c','End_Date__c','Voucher_Requested__c','Select_Approver__r.Name'};
        String purchageAuthCondition = 'Id = \''+ String.escapeSingleQuotes(currentRecordId) +'\' ORDER BY CreatedDate DESC';
        List<SObject> sObjList = DataService.performQueryOperation(purchageAuthFields, 'Purchase_Authorization__c', purchageAuthCondition, 1);
        Purchase_Authorization__c  authorizationRecord = new Purchase_Authorization__c();
        if (sObjList != null && sObjList.size() > 0) {
            this.authorizationRecord = (Purchase_Authorization__c)sObjList[0];
        }
    }
    
    public class SearchItem {
        
        public String ProviderID;
        public String ProviderName;
        public String TaxID;
        public String Zipcode;
        public String Services;
   }
    
    public class ServiceLogWrapper {
        
        public List<Person__c> contacts;
        public List<Utility.pickListWrap> servicePicklists;
    }
    
    public class SearchResultWrapper {
        
        public List<Vendor__c> vendors;
        public List<Structure_Services__c> structureServices;
    }
}