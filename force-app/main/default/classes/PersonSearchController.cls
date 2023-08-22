public without sharing class PersonSearchController {
    
    @AuraEnabled
    public static String getContacts(String searchJSON, String recordId) {
        
        if(String.isNotBlank(searchJSON)) {
            
            List<Contact> contactList = new List<Contact> ();
            SearchInputWrapper inputWrap = (SearchInputWrapper) JSON.deserialize(searchJSON, SearchInputWrapper.class);
            Date personDOB = inputWrap.dob;
                        
            Id recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Persons Involved').getRecordTypeId();
            String contactJSON = 'SELECT Id, Name, FirstName, LastName, Address_Line_1__c, Address_Line_2__c, Address_City__c,Address_State__c,County_Address__c, Address_ZipCode__c, Casevault_PID__c,'+
                'SSN__c,Date_of_Birth__c, Gender__c, State_Id_Drivers_License__c,Intake_Person_Role__c, SSN_Encrypted__c  FROM Contact'; 
            contactJSON += ' WHERE LastName != null AND RecordTypeId = \'' + recordTypeId + '\'' ;
            
            if(String.isNotBlank(recordId)) {
                
                List<String> jnObjFields = new List<String>{'Id', 'Person__c'};
                String jnObjCondition = 'Intake__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
                						'Investigation__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 
                						'Service_Case__c = \'' + String.escapeSingleQuotes(recordId) + '\'' + ' OR ' + 'Person__c = \'' + String.escapeSingleQuotes(recordId) + '\'';
            
        		List<Person__c> jnObjList = DataService.performQueryOperation(jnObjFields, 'Person__c', jnObjCondition, Utility.queryLimit);  
         		if(jnObjList.size() > 0) {
                    
                    String conIds='';
            		conIds +=' NOT IN (';
       				for(Person__c rec : jnObjList) {
                		conIds +='\''+String.escapeSingleQuotes(rec.Person__c)+'\',';
            		}
            		conIds = conIds.removeEnd(',');
            		conIds +=')';
                    contactJSON += ' AND Id  '+ conIds; 

         		}
                
            }
            
            if( String.isNotBlank(inputWrap.casevaultPid) ) {

                contactJSON +=  ' AND Casevault_PID__c = \'PE-'+ String.escapeSingleQuotes(inputWrap.casevaultPid) +'\'';
                
            } else {
                
                if( String.isNotBlank(inputWrap.firstName) ) {
				
                    String firstNameSoundexCode = Soundex_Algorithm.calculateSoundexCode(inputWrap.firstName);
                    if(String.isNotBlank(firstNameSoundexCode)) {
                        contactJSON += ' AND Firstname_soundex_keycode__c = \''+ String.escapeSingleQuotes(firstNameSoundexCode)+ '\'';
                    }
                }
                if( String.isNotBlank(inputWrap.lastName) ) {
                    
                    String lastNameSoundexCode = Soundex_Algorithm.calculateSoundexCode(inputWrap.lastName);
                    if(String.isNotBlank(lastNameSoundexCode)) {
                        contactJSON += ' AND Lastname_soundex_keycode__c = \''+ String.escapeSingleQuotes(lastNameSoundexCode)+ '\'';
                    } 
                }
                if( inputWrap.dob != NULL ) {
    
                    DateTime startDT = DateTime.newInstance(inputWrap.dob.addYears(-3).year(),inputWrap.dob.addYears(-3).month(),inputWrap.dob.addYears(-3).day());
                    DateTime endDT = DateTime.newInstance(inputWrap.dob.addYears(3).year(),inputWrap.dob.addYears(3).month(),inputWrap.dob.addYears(3).day());
                    contactJSON +=  ' AND Date_of_Birth__c >= ' + startDT.format('yyyy-MM-dd') + ' AND Date_of_Birth__c <= ' +  endDT.format('yyyy-MM-dd');
                }
                if( String.isNotBlank(inputWrap.ssn) ) {
                
                    contactJSON +=  ' AND SSN__c = \''+ String.escapeSingleQuotes(inputWrap.ssn) +'\'';
            	}
                if( String.isNotBlank(inputWrap.dlNo) ) {
    
                    contactJSON +=  ' AND State_Id_Drivers_License__c = \''+ String.escapeSingleQuotes(inputWrap.dlNo) +'\'';
                }
                if( String.isNotBlank(inputWrap.addressLine1) ) {
    
                    contactJSON +=  ' AND Address_Line_1__c LIKE \'%'+ String.escapeSingleQuotes(inputWrap.addressLine1) +'%\'';
                }
                if( String.isNotBlank(inputWrap.addressLine2) ) {
    
                    contactJSON +=  ' AND Address_Line_2__c LIKE \'%'+ String.escapeSingleQuotes(inputWrap.addressLine2) +'%\'';
                }
                if( String.isNotBlank(inputWrap.state) ) {
                
                    contactJSON +=  ' AND Address_State__c = \''+ String.escapeSingleQuotes(inputWrap.state) +'\'';
            	}
                if( String.isNotBlank(inputWrap.city) ) {
                
                    contactJSON +=  ' AND Address_City__c = \''+ String.escapeSingleQuotes(inputWrap.city) +'\'';
            	}
                if( String.isNotBlank(inputWrap.county) ) {
                
                    contactJSON +=  ' AND County_Address__c = \''+ String.escapeSingleQuotes(inputWrap.county) +'\'';
            	}
                if( String.isNotBlank(inputWrap.zipcode) ) {
                
                    contactJSON +=  ' AND Address_ZipCode__c = \''+ String.escapeSingleQuotes(inputWrap.zipcode) +'\'';
            	}
            } 
            contactJSON +=' ORDER BY Date_of_Birth__c ASC  LIMIT 500';
            System.debug('Query:::'+contactJSON);
            contactList = Database.query(contactJSON);            
            return JSON.serialize(contactList);
            
        } else {
            return null;
        }
    }

    @AuraEnabled
    public static String personsIntakeInvSC(String selectedPersonJSON) {
       
        if(String.isNotBlank(selectedPersonJSON)) {

            Contact selectedPerson = (Contact)JSON.deserialize(selectedPersonJSON, Contact.class);
            List <Person__c> jnObjRec = [SELECT Id, Intake__c, Investigation__c, Person__c, Service_Case__c FROM Person__c WHERE Person__c = :selectedPerson.Id];
            Set<Id> intakeSet = new Set<Id> ();
            Set<Id> investigationSet = new Set<Id> ();
            Set<Id> serviceSet = new Set<Id> ();
            for(Person__c personRec : jnObjRec){
                if(String.isNotBlank(personRec.Intake__c))
                    intakeSet.add(personRec.Intake__c);
                else if(String.isNotBlank(personRec.Investigation__c))
                    investigationSet.add(personRec.Investigation__c);
                else if(String.isNotBlank(personRec.Service_Case__c))
                    serviceSet.add(personRec.Service_Case__c);
            }
            PersonsWrapper wrapperIns = new PersonsWrapper();
            if(intakeSet.size()>0) {
                
                wrapperIns.intake = [SELECT Id, CaseNumber, Origin, Jurisdiction__c FROM Case WHERE Id IN :intakeSet]; 
            }
            if(investigationSet.size()>0) {
                
                wrapperIns.investigation = [SELECT Id, Name, CPS_Response_Type__c FROM Investigation__c WHERE Id IN :investigationSet];
            }
           if(serviceSet.size()>0) {
                
                wrapperIns.serviceCase = [SELECT Id, Name, Status__c, Number_of_days__c FROM Service_Case__c WHERE Id IN :serviceSet];
            }
            return JSON.serialize(wrapperIns);
        } else {
            return null;
        }
    }
    
    /*public static String findDuplicateRecord(String firstName, String lastName) {

        String inQuery = '';
        Contact contactIns = new Contact();

        if(String.isNotBlank(firstName)) {
            contactIns.FirstName = firstName;
        }
        if(String.isNotBlank(lastName)) {
            contactIns.LastName = lastName;
        }

        List<Datacloud.FindDuplicatesResult> results = Datacloud.FindDuplicates.findDuplicates(new List<Contact>{contactIns});
        if(results.size() > 0) {

            for (Datacloud.DuplicateResult dr : results[0].getDuplicateResults()) { 

                if (dr.matchResults.size() > 0 && dr.getMatchResults()[0].matchRecords.size() > 0 && dr.getMatchResults()[0].getMatchRecords()[0].getRecord() != null) { 
                
                    Contact duplicateContact = (Contact) dr.getMatchResults()[0].getMatchRecords()[0].getRecord();
                    inQuery += '\''+ String.escapeSingleQuotes(duplicateContact.Id) +'\'' +' ,';
                }            
            } 
            inQuery =  inQuery.removeEnd(' ,');
        }
        return inQuery;
    }*/

    @AuraEnabled
    public static String getPicklistValues() {

        PicklistWrapper picklistWrapIns = new PicklistWrapper();
        picklistWrapIns.statePicklist = Utility.getPicklistinfo('Contact', 'Address_State__c', false);
        picklistWrapIns.countyPicklist = Utility.getPicklistinfo('Contact', 'County_Address__c', false);
        return JSON.serialize(picklistWrapIns);
    }

    public class PicklistWrapper {

        @AuraEnabled
        public List<Utility.pickListWrap> statePicklist;
        @AuraEnabled
        public List<Utility.pickListWrap> countyPicklist;
    }
    
    public class SearchInputWrapper {
        
        public String firstName; 
        public String lastName;
        public Date dob;
        public String ssn;
        public String casevaultPid;
        public String dlNo; 
        public String addressLine1; 
        public String addressLine2;
        public String city;
        public String state;
        public String county;
        public String zipcode;
    }

    public class PersonsWrapper {

        public List<Case> intake;
        public List<Investigation__c> investigation;
        public List<Service_Case__c> serviceCase;
        
        public PersonsWrapper() {
            
        }
    }
    
}