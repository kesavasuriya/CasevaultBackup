trigger assignmentTrigger on Assignment__c (before insert, before update) {

    Set<Id> serviceCaseIds = new Set<Id>();
    Set<Id> investigationIds = new Set<Id>();
    Set<Id> intakeIds = new Set<Id>();
    String errorMessage;
    Set<Id> recordIds = new Set<Id>();
    List<String> serInvCondition = new List<String>();
    Map<Id, Assignment__c> familyWorkerMap = new Map<Id, Assignment__c>();
	Map<Id, List<Id>> childWorkerMap = new Map<Id, List<Id>>();
    Map<Id, List<Id>> adminWorkerMap = new Map<Id, List<Id>>();
    Map<Id, List<Id>> workersMap = new Map<Id, List<Id>>();

    for(Assignment__c assignmentIns : Trigger.New) {
                
        if(String.isNotBlank(assignmentIns.Service_Case__c)) {
            
            serviceCaseIds.add(assignmentIns.Service_Case__c);
            
        } else if(String.isNotBlank(assignmentIns.Investigation__c)) {
            
            investigationIds.add(assignmentIns.Investigation__c);
            
        } else if(String.isNotBlank(assignmentIns.Intake__c)) {
            
            intakeIds.add(assignmentIns.Intake__c);
        }
    }
    
    String assignmentQuery = 'SELECT '+
        						' Id, Service_Case__c, Service_Case__r.Name, Investigation__c, Investigation__r.Name, Assign_End_Date__c, Responsibility__c, '+
        						' Select_a_Social_Worker__c, Select_a_Social_Worker__r.Name, Child__c, Intake__c, Intake__r.CaseNumber '  +
        					' FROM Assignment__c ' + 
        					' WHERE (Assign_End_Date__c > TODAY OR Assign_End_Date__c = null) ' ;
        					
    if(Trigger.isUpdate) {
        
        recordIds.addAll(Trigger.newMap.keySet());
        assignmentQuery += ' AND Id NOT IN :recordIds ';
    }
    

    if(serviceCaseIds.size() > 0) {
        
        serInvCondition.add(' Service_Case__c IN :serviceCaseIds ');
        //assignmentQuery += ' AND Service_Case__c IN :serviceCaseIds ';
    }
    
    if(investigationIds.size() > 0) {
        
        serInvCondition.add(' Investigation__c IN :investigationIds ');
        //assignmentQuery += ' AND Investigation__c IN :investigationIds ';
    }
    
    if(intakeIds.size() > 0 ) {
        
        serInvCondition.add(' Intake__c IN :intakeIds ');
    }
    
    if(serInvCondition.size() > 0 ) {
        assignmentQuery += ' AND ' + (String.join(serInvCondition, 'OR'));
    }
    
	System.debug('query==='+assignmentQuery);
    List<Id> recIds;
    for(Assignment__c assignmentIns : Database.query(assignmentQuery)) {
                
        if( String.isNotBlank(assignmentIns.Service_Case__c) ) {
            
            //Family worker
            if( assignmentIns.Responsibility__c == 'Family') {
                
            	familyWorkerMap.put(assignmentIns.Service_Case__c, assignmentIns);
                
        	} else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c)) { //Child worker
            
                if( !childWorkerMap.containsKey(assignmentIns.Service_Case__c) )  {
                    
                    recIds = new List<Id>();
                    recIds.add(assignmentIns.Child__c);
                    childWorkerMap.put(assignmentIns.Service_Case__c, recIds);

                }  else {
                    
                    recIds = childWorkerMap.get(assignmentIns.Service_Case__c);
                    recIds.add(assignmentIns.Child__c);    
                    childWorkerMap.put(assignmentIns.Service_Case__c, recIds);
                } 
                
        	} else if( assignmentIns.Responsibility__c == 'Administrative' && assignmentIns.Select_a_Social_Worker__c != null) {
            
                 if( !adminWorkerMap.containsKey(assignmentIns.Service_Case__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        adminWorkerMap.put(assignmentIns.Service_Case__c, recIds);
    
                 }  else {
                     
                     recIds = adminWorkerMap.get(assignmentIns.Service_Case__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     adminWorkerMap.put(assignmentIns.Service_Case__c, recIds);
                 }
        	}
            
            if( assignmentIns.Select_a_Social_Worker__c != null) {
            
                 if( !workersMap.containsKey(assignmentIns.Service_Case__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        workersMap.put(assignmentIns.Service_Case__c, recIds);
    
                 }  else {
                     
                     recIds = workersMap.get(assignmentIns.Service_Case__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     workersMap.put(assignmentIns.Service_Case__c, recIds);
                 }
        	}
            
        } else if( String.isNotBlank(assignmentIns.Investigation__c) ) {
            
            if( assignmentIns.Responsibility__c == 'Family') {
                
            	familyWorkerMap.put(assignmentIns.Investigation__c, assignmentIns);
                
        	} else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c)) { //Child worker
            
                if( !childWorkerMap.containsKey(assignmentIns.Investigation__c) )  {
                    
                    recIds = new List<Id>();
                    recIds.add(assignmentIns.Child__c);
                    childWorkerMap.put(assignmentIns.Investigation__c, recIds);

                }  else {
                    
                    recIds = childWorkerMap.get(assignmentIns.Investigation__c);
                    recIds.add(assignmentIns.Child__c);    
                    childWorkerMap.put(assignmentIns.Investigation__c, recIds);
                } 
                
        	} else if( assignmentIns.Responsibility__c == 'Administrative') {
            
                 if( !adminWorkerMap.containsKey(assignmentIns.Investigation__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        adminWorkerMap.put(assignmentIns.Investigation__c, recIds);
    
                 }  else {
                     
                     recIds = adminWorkerMap.get(assignmentIns.Investigation__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     adminWorkerMap.put(assignmentIns.Investigation__c, recIds);
                 }
        	}
            
            if( assignmentIns.Select_a_Social_Worker__c != null) {
            
                 if( !workersMap.containsKey(assignmentIns.Investigation__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        workersMap.put(assignmentIns.Investigation__c, recIds);
    
                 }  else {
                     
                     recIds = workersMap.get(assignmentIns.Investigation__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     workersMap.put(assignmentIns.Investigation__c, recIds);
                 }
        	}
            
        } else if( String.isNotBlank(assignmentIns.Intake__c) ) {
            
            if( assignmentIns.Responsibility__c == 'Family') {
                
            	familyWorkerMap.put(assignmentIns.Intake__c, assignmentIns);
                
        	} else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c)) { //Child worker
            
                if( !childWorkerMap.containsKey(assignmentIns.Intake__c) )  {
                    
                    recIds = new List<Id>();
                    recIds.add(assignmentIns.Child__c);
                    childWorkerMap.put(assignmentIns.Intake__c, recIds);

                }  else {
                    
                    recIds = childWorkerMap.get(assignmentIns.Intake__c);
                    recIds.add(assignmentIns.Child__c);    
                    childWorkerMap.put(assignmentIns.Intake__c, recIds);
                } 
                
        	} else if( assignmentIns.Responsibility__c == 'Administrative') {
            
                 if( !adminWorkerMap.containsKey(assignmentIns.Intake__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        adminWorkerMap.put(assignmentIns.Intake__c, recIds);
    
                 }  else {
                     
                     recIds = adminWorkerMap.get(assignmentIns.Intake__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     adminWorkerMap.put(assignmentIns.Intake__c, recIds);
                 }
        	}
            
            if( assignmentIns.Select_a_Social_Worker__c != null) {
            
                 if( !workersMap.containsKey(assignmentIns.Intake__c) )  {
                        
                        recIds = new List<Id>();
                        recIds.add(assignmentIns.Select_a_Social_Worker__c);
                        workersMap.put(assignmentIns.Intake__c, recIds);
    
                 }  else {
                     
                     recIds = workersMap.get(assignmentIns.Intake__c);
                     recIds.add(assignmentIns.Select_a_Social_Worker__c);    
                     workersMap.put(assignmentIns.Intake__c, recIds);
                 }
        	}
            
        }
                
    }
    
    for(Assignment__c assignmentIns : Trigger.New) {
        
        if( String.isNotBlank(assignmentIns.Service_Case__c) ) {
            
            if( assignmentIns.Responsibility__c == 'Family' && familyWorkerMap.containsKey(assignmentIns.Service_Case__c)  ) {
                
                errorMessage = familyWorkerMap.get(assignmentIns.Service_Case__c).Service_Case__r.Name + ' has already family worker';
                assignmentIns.addError(errorMessage);
                
            } else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c) && 
               	childWorkerMap.containsKey(assignmentIns.Service_Case__c) && 
                childWorkerMap.get(assignmentIns.Service_Case__c).contains(assignmentIns.Child__c) ) {
                
                    errorMessage = 'Child has already assigned to another worker';
                	assignmentIns.addError(errorMessage);
                    
           } else if( assignmentIns.Responsibility__c == 'Administrative' && String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      adminWorkerMap.containsKey(assignmentIns.Service_Case__c) && adminWorkerMap.get(assignmentIns.Service_Case__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this service case';
                assignmentIns.addError(errorMessage);
                          
           } else if( String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      workersMap.containsKey(assignmentIns.Service_Case__c) && workersMap.get(assignmentIns.Service_Case__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this service case';
                assignmentIns.addError(errorMessage);
           }
            
        } else if( String.isNotBlank(assignmentIns.Investigation__c) ) {
            
            if( familyWorkerMap.containsKey(assignmentIns.Investigation__c) && assignmentIns.Responsibility__c == 'Family' ) {
                
                errorMessage = familyWorkerMap.get(assignmentIns.Investigation__c).Investigation__r.Name + ' has already family worker';
                assignmentIns.addError(errorMessage);
                
            } else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c) && 
               	childWorkerMap.containsKey(assignmentIns.Investigation__c) && 
                childWorkerMap.get(assignmentIns.Investigation__c).contains(assignmentIns.Child__c) ) {
                
                    errorMessage = 'Child has already assigned to another worker';
                	assignmentIns.addError(errorMessage);
                    
           } else if( assignmentIns.Responsibility__c == 'Administrative' && String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      adminWorkerMap.containsKey(assignmentIns.Investigation__c) && adminWorkerMap.get(assignmentIns.Investigation__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this investigation';
                assignmentIns.addError(errorMessage);
                          
           } else if( String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      workersMap.containsKey(assignmentIns.Investigation__c) && workersMap.get(assignmentIns.Investigation__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this investigation';
                assignmentIns.addError(errorMessage);
           }
            
        } else if( String.isNotBlank(assignmentIns.Intake__c) ) {
            
            if( familyWorkerMap.containsKey(assignmentIns.Intake__c) && assignmentIns.Responsibility__c == 'Family' ) {
                
                errorMessage = familyWorkerMap.get(assignmentIns.Intake__c).Intake__r.CaseNumber + ' has already family worker';
                assignmentIns.addError(errorMessage);
                
            } else if( assignmentIns.Responsibility__c == 'Child' && String.isNotBlank(assignmentIns.Child__c) && 
               	childWorkerMap.containsKey(assignmentIns.Intake__c) && 
                childWorkerMap.get(assignmentIns.Intake__c).contains(assignmentIns.Child__c) ) {
                
                    errorMessage = 'Child has already assigned to another worker';
                	assignmentIns.addError(errorMessage);
                    
           } else if( assignmentIns.Responsibility__c == 'Administrative' && String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      adminWorkerMap.containsKey(assignmentIns.Intake__c) && adminWorkerMap.get(assignmentIns.Intake__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this intake';
                assignmentIns.addError(errorMessage);
                          
           } else if( String.isNotBlank(assignmentIns.Select_a_Social_Worker__c) && 
                      workersMap.containsKey(assignmentIns.Intake__c) && workersMap.get(assignmentIns.Intake__c).contains(assignmentIns.Select_a_Social_Worker__c) ) {
                    
                errorMessage = 'This worker has already been assigned to this intake';
                assignmentIns.addError(errorMessage);
           }
            
        }
           
    }
}