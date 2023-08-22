global class batchAccountUpdate implements Database.Batchable<sObject> {
	
	global Database.QueryLocator start(Database.BatchableContext BC) {
			
        return Database.getQueryLocator([SELECT Id, Casevault_PID__c, Age__c FROM Contact]);
	}
	
	global void execute(Database.BatchableContext BC, List<Contact> scope) {
		    
        for(Contact con : scope) {
            con.Suffix = '('+con.Casevault_PID__c;
            if(con.Age__c !=null) {
                con.Suffix += ', Age-'+con.Age__c;
            }
           con.Suffix +=')';
        }
        Database.update(scope, false);
	}
	
	global void finish(Database.BatchableContext BC) {
	}
}