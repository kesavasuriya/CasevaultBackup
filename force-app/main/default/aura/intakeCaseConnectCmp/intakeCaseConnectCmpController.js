({
	 recordUpdated : function(component, event, helper) {
        
         var eventParams = event.getParams();
         if(eventParams.changeType === "CHANGED") {
             var changedFields = eventParams.changedFields;
             console.log('changedFields===',changedFields);
             if(changedFields && Object.keys(changedFields).includes("Intake_Approval_Status__c") && 
               	changedFields.Intake_Approval_Status__c.value == "Approved") {
            	component.set("v.openModal", true);
                var flow = component.find("flowData");
                var inputVariables = [
                        {
                            name : "callFromCmp",
                            type : "Boolean",
                            value : true
                            
                        },
                        {
                            name : "intakeId",
                            type : "String",
                            value : component.get("v.recordId")
                            
                        }
                ];
                flow.startFlow("Intake_after_approval",inputVariables);
        	}
         }
		
    },
    
    closeModal : function(component) {
        component.set("v.openModal", false);
    },
    
    handleStatusChange : function(component, event, helper) {
        if(event.getParam("status") === "FINISHED" || event.getParam("status") === "FINISHED_SCREEN") {
            component.set("v.openModal", false);
        }
    }
})