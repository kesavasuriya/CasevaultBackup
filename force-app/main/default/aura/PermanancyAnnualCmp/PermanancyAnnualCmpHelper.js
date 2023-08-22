({
    getInitialInformations : function(component, event, helper, initial) {
        
        var columns = [
            {label: 'REVIEW DATE', fieldName: 'Review_Date__c', type: 'date', typeAttributes:{year: "numeric",month: "2-digit",day: "2-digit"}},
            {label: 'APPROVAL STATUS', fieldName: 'Approval_Status__c', type: 'text'}
        ];
        
        component.set("v.columns",columns);
        var action = component.get("c.getAnnuvalReviewsInitialInformation");
        action.setParams({'permanencyPlanId': component.get("v.recordId")});
        action.setCallback(this, function(response) { 
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                var utilityBase = component.find("utils");
                var permanencyRec = component.get("v.permanancyPlanRec");
                if (permanencyRec.Guardianship_Planing__c == '6') {
                	component.set("v.isReadOnly", true);
                    component.set("v.isAllReadOnly", true);
                } else if (component.get("v.onClickCurrentStage") < permanencyRec.Guardianship_Planing__c) {
                    component.set("v.isReadOnly", true);
                }
                component.set("v.annualReviewList", utilityBase.checkNameSpace(JSON.parse(storeResponse).annualReviewsList, false));
                var existingNotApprovedAnnual =  utilityBase.checkNameSpace(JSON.parse(storeResponse).existingAnnualReviewRec, false);

                if (existingNotApprovedAnnual.length) {
                    component.set("v.annualReviewsRec",existingNotApprovedAnnual[0]);
                    if (initial) {
                        component.set("v.openAnnualReviewModal", true);
                    }
                }
            } else if (state === "INCOMPLETE") {
                
                helper.showToast(component, event, helper, "error", "Response is Incompleted", "Error!");
                //alert('Response is Incompleted');
                
            } else if (state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        helper.showToast(component, event, helper, "error", errors[0].message, "Error!");
                        /*alert("Error message: " + 
                              errors[0].message);*/
                    }
                } else {
                    
                    helper.showToast(component, event, helper, "error", "Unknown error", "Error!");
                    //alert("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    onValidate : function(component, event, helper) {

        var requiredInputField = component.find("requiredFields");
        
        var isValid = true;
        if(Array.isArray(requiredInputField)) {
            for(var i = 0;i < requiredInputField.length;i++) {
                if(!requiredInputField[i].get("v.value")) {
                    $A.util.addClass(requiredInputField[i], 'slds-has-error'); 
                    isValid = false;
                } else {   
                    $A.util.removeClass(requiredInputField[i], 'slds-has-error');
                }
            }
        } else {
            
            if(!requiredInputField.get("v.value")) {
                
                $A.util.addClass(requiredInputField, 'slds-has-error');
                isValid = false;
            } else {
                
                $A.util.removeClass(requiredInputField, 'slds-has-error');
            }
        }
        if (!isValid) {
            helper.showToast(component, event, helper, "error", "Please complete the required field(s).", "Error!");
        }
    },

    showToast : function(component, event, helper, type, msg, title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": msg,
            "type":type,
            "duration": 8000
        });
        toastEvent.fire();
    },
})