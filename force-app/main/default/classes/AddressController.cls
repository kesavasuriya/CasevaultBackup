public with sharing class AddressController {
    
    @AuraEnabled
    public static String getAddress(String recordId, String objectApiName) {
        
        AddressWrapper initWrap = new AddressWrapper();
        
        if(String.isNotBlank(recordId) && String.isNotBlank(objectApiName)) {
            
            Set<Id> personIds = new Set<Id>();
            List<Person__c> jnPerson = [SELECT Id, Person__c 
                                        FROM Person__c
                                        WHERE Service_Case__c =: recordId
                                        OR Intake__c =: recordId
                                        OR Investigation__c =: recordId];
            
            for(Person__c rec : jnPerson) {
                
                personIds.add(rec.Person__c);
            }
            
            initWrap.addressList = [SELECT Id, Address_Line_1__c , Address_Line_2__c ,
                                    City__c , County__c ,Contact__r.Name, Country__c,
                                    State__c , ZipCode__c, Address_Type__c,
                                    Comments__c, Known_danger_at_address__c
                                    FROM Contact_Address__c
                                    WHERE Contact__c IN:personIds
                                    AND Current_Address__c =true];
            return JSON.serialize(initWrap);
        } else {
            return NULL;
        }
        
    }
    
    @AuraEnabled
    public static String getCounty(String addressRequest) {
        
        List<RequestWrapper> requestBody = (List<RequestWrapper>) JSON.deserialize(addressRequest, List<RequestWrapper>.class);
        String bodyContent = JSON.serialize(requestBody);
        String endpoint = 'https://us-street.api.smartystreets.com/street-address?auth-id=a3159c2b-6647-da07-c735-7bf244fc6224&auth-token=VXAomXgLVYGEZ6ISAvhK&license=us-core-cloud&plugins=us-extras';
        HttpRequest req = new HttpRequest();
		req.setEndpoint(endpoint);
		req.setMethod('POST');
        req.setHeader('Content-Type','application/json');
        req.setBody(bodyContent);
        system.debug('req '+req.getBody());
        Http http = new Http();
		HTTPResponse response = http.send(req);
        system.debug(response.getBody());
       	List<Object> jsonArray = (List<Object>) JSON.deserializeUntyped(response.getBody());
        system.debug('1 '+jsonArray);
		Map<String, Object> objectMap = (Map<String, Object>) jsonArray[0];
        system.debug('2 '+objectMap);
		String name = (String) objectMap.get('county_name');
        system.debug('resp '+name);
        return response.getBody();
    }
        
    
    Public class AddressWrapper {
        
        @AuraEnabled
        Public List<Contact_Address__c> addressList;
    }
    
    Public class RequestWrapper {
        
        @AuraEnabled
        Public String street;
        @AuraEnabled
        Public String city;
        @AuraEnabled
        Public String state;
        @AuraEnabled
        Public Integer candidates;
    }
    
    
    
}