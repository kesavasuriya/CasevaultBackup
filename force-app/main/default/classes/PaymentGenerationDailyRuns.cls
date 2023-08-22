public class PaymentGenerationDailyRuns implements Schedulable {
    
     public static Map<String,Decimal> publicProviderRateMap;
     public static List<Payment_Summary__c > paymentSummaryList;
     public static List<Public_Provider_Rate__mdt> publicProviderRate;
     public static Map<Id,Placement__c> placementMap;
     public void execute(SchedulableContext sc) {
        
        generatePayment();
    }
    
    public static void generatePayment() {
        
        publicProviderRate = new List<Public_Provider_Rate__mdt>();
        publicProviderRate = [SELECT Id, Estimated_Rate_Value__c, Placement_Structure__c 
                                                              FROM Public_Provider_Rate__mdt];
        
        //Iterate public provider and put in map placementstructure,ratevalue;
        publicProviderRateMap = new Map<String,Decimal>();
        paymentSummaryList = new  List<Payment_Summary__c>();
        for(Public_Provider_Rate__mdt publicRate : publicProviderRate) {
            
            publicProviderRateMap.put(publicRate.Placement_Structure__c,publicRate.Estimated_Rate_Value__c);
        }
        
        //initialization of beginDateChangedRecord list;
        List<Placement__History> beginDateChangedRecord = new List<Placement__History>();
        //initialization of endDateChangedRecord list;
        List<Placement__History> endDateChangedRecord = new List<Placement__History>();
        //initialization of placementIds set;
        Set<Id> placementIds = new Set<Id>();
        //Query placementHistoryRecords;
        List<Placement__History> placementHistoryRecord =  [SELECT Id, ParentId, OldValue, NewValue, Field 
                                                            FROM Placement__History 
                                                            WHERE CreatedDate = TODAY]; 
        
        //Iterate placement History Record to separate begin date or end date changed record;
        for(Placement__History ph : placementHistoryRecord) {
            
            //Check for begin date changed;
            if(ph.OldValue != NULL && ph.Field == 'Begin_Date__c') {
                
                beginDateChangedRecord.add(ph);
                placementIds.add(ph.ParentId);
            
            //Check for end date changed;
            } else if(ph.OldValue != NULL && ph.Field == 'End_Date__c') {
                
                endDateChangedRecord.add(ph);
                placementIds.add(ph.ParentId);
            }
        }
            
        Date monthStartDate = System.today().toStartOfMonth();
        //Query placement record and put in map Id,Placement
        placementMap = new Map<Id,Placement__c>([SELECT Id, Provider__r.RecordType.DeveloperName, Placement_Approval_Status__c, 
                                                                      Child__c, Placement_Structure__c, Provider__c
                                                                      FROM Placement__c 
                                                                      WHERE Id IN:placementIds 
                                                                      AND Begin_Date__c < :monthStartDate 
                                                                      AND (End_Date__c < :monthStartDate OR End_Date__c=NULL)
                                                                      AND Placement_Living_Arrangement_Type__c ='Placement'
                                                                      ORDER BY CreatedDate DESC]);

        //initialization paymentRec object
        Payment_Summary__c paymentRec = new Payment_Summary__c();
        
        //Iterate beginDateChangedRecord
        for(Placement__History beginDateRec : beginDateChangedRecord){
            
            paymentRec = new Payment_Summary__c();
            
            //Check for Begin date added;
            if(DATE.valueOf(beginDateRec.OldValue) > DATE.valueOf(beginDateRec.NewValue)) {
                
                Date startDate = DATE.valueOf(beginDateRec.NewValue);
                Date endDate = DATE.valueOf(beginDateRec.OldValue);
                createPayments(startDate, endDate, beginDateRec, 'Payment Summary');
                
            } else if(DATE.valueOf(beginDateRec.OldValue) < DATE.valueOf(beginDateRec.NewValue)) {
                
                Date startDate = DATE.valueOf(beginDateRec.OldValue);
                Date endDate = DATE.valueOf(beginDateRec.NewValue);
                createPayments(startDate, endDate, beginDateRec, 'Receivable Summary');
            }
                
                
        }
        
        for(Placement__History endDateRec : endDateChangedRecord){
            
            paymentRec = new Payment_Summary__c();
            //Check for Begin date added;
            if (DATE.valueOf(endDateRec.OldValue) < DATE.valueOf(endDateRec.NewValue)) {
                
                Date startDate = DATE.valueOf(endDateRec.OldValue);
                Date endDate = DATE.valueOf(endDateRec.NewValue);
                createPayments(startDate, endDate, endDateRec, 'Payment Summary');
          
            } else if(DATE.valueOf(endDateRec.OldValue) > DATE.valueOf(endDateRec.NewValue)) {
                
                Date startDate = DATE.valueOf(endDateRec.NewValue);
                Date endDate = DATE.valueOf(endDateRec.OldValue);
                createPayments(startDate, endDate, endDateRec, 'Receivable Summary');
                
            }
        }
        
        if(paymentSummaryList.size() > 0) {
            
            insert paymentSummaryList;
        }
        
        
    }
    
    public static void createPayments(Date startDate, Date endDate, Placement__History historyRecord, String paymentType) {
        
        Integer totalMonths = startDate.monthsBetween(endDate)+1;
        Payment_Summary__c paymentRec = new Payment_Summary__c();
        
        if(startDate.monthsBetween(endDate) !=0) {
                    
                    for(Integer i=0; i<totalMonths; i++) {
                        paymentRec = new Payment_Summary__c();
                       
                        if(i == 0) {
                           
                            paymentRec.Start_Date__c = startDate;
                            paymentRec.End_Date__c = (Date.newInstance(startDate.year(), startDate.month() , 1).addMonths(1)) - 1;
                            
                        } else if(i == totalMonths-1) {
                             
                            paymentRec.Start_Date__c = endDate.toStartOfMonth();
                            paymentRec.End_Date__c = endDate;
                            
                        } else {
                            
                            paymentRec.End_Date__c = (Date.newInstance(startDate.year(), startDate.month() , 1).addMonths(i+1)) - 1;
                    		paymentRec.Start_Date__c = (startDate.addMonths(i)).toStartOfMonth();
                           
                    		
                        }
                        
                            paymentRec.Person__c = placementMap.get(historyRecord.ParentId).Child__c;
                    		paymentRec.Provider__c = placementMap.get(historyRecord.ParentId).Provider__c;
                    		paymentRec.Payment_Generated__c = true;
                        	paymentRec.Type__c = paymentType;
                    		paymentRec.Service_Type__c = placementMap.get(historyRecord.ParentId).Placement_Structure__c;
                    		paymentRec.Per_Diem_Rate__c = publicProviderRateMap.get(paymentRec.Service_Type__c);
                    		paymentSummaryList.add(paymentRec);
                        
                    }
                    
                  
                } else {
                    
                    paymentRec.Start_Date__c = startDate;
                    paymentRec.End_Date__c = endDate;
                    paymentRec.Person__c = placementMap.get(historyRecord.ParentId).Child__c;
                    paymentRec.Provider__c = placementMap.get(historyRecord.ParentId).Provider__c;
                    paymentRec.Payment_Generated__c = true;
                    paymentRec.Type__c = paymentType;
                    paymentRec.Service_Type__c = placementMap.get(historyRecord.ParentId).Placement_Structure__c;
                    paymentRec.Per_Diem_Rate__c = publicProviderRateMap.get(paymentRec.Service_Type__c);
                    paymentSummaryList.add(paymentRec);
                    
                } 
        
    }
    
}