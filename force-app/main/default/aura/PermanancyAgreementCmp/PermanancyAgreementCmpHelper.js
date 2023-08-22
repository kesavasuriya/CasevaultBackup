({
    getInitialInformations : function(component, event, helper, initial) {
        
        var columns = [
            {label: 'PROVIDER ID', fieldName: 'Provider_Id__c', type: 'number', cellAttributes: { alignment: 'left' }}, 
            {label: 'RATE BEGIN DATE', fieldName: 'Rate_Begin_Date__c', type: 'date', typeAttributes:{year: "numeric",month: "2-digit",day: "2-digit"}},
            {label: 'RATE END DATE', fieldName: 'Rate_End_Date__c', type: 'date', typeAttributes:{year: "numeric",month: "2-digit",day: "2-digit"}},
            {label: 'PAYMENT AMOUNT', fieldName: 'Negotiated_Amount__c', type: 'currency', typeAttributes: { currencyCode: 'USD'}},
            {label: 'STATUS', fieldName: 'Approval_Status__c', type: 'text'},
            {label: 'ACTION', type: 'button', initialWidth: 135, typeAttributes: { label: 'View', name: 'view', title: 'Click to View'}}
        ];
        component.set("v.columns",columns);
        var action = component.get("c.getAgreementInitialInformation");
        action.setParams({'permanencyPlanId': component.get("v.recordId")});
        action.setCallback(this, function(response) { 
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                var permanencyNsRecIns = component.find("utils").checkNameSpace(JSON.parse(storeResponse), false);
                var cpaProviderId = JSON.parse(storeResponse).cpaProviderId;
                component.set("v.cpaProvider",cpaProviderId);
                component.set("v.rateTypePicklistOption", permanencyNsRecIns.rateTypePicklist);
                var permanencyRec = permanencyNsRecIns.permanencyPlanRecord;
                if (permanencyRec.Placement__r.End_Date__c != null) {
                    permanencyRec.All_Placements_and_Removal_have_been_End__c = true;
                } else {
                    permanencyRec.All_Placements_and_Removal_have_been_End__c = false;
                }
                component.set("v.permanancyPlanRec", permanencyRec);
                component.set("v.providerId", permanencyRec.Placement__r.Provider__c); 
                if (permanencyRec.Guardianship_Planing__c == '6') {
                    component.set("v.isReadOnly", true);
                    component.set("v.isAllReadOnly", true);
                } else if (component.get("v.onClickCurrentStage") < permanencyRec.Guardianship_Planing__c) {
                    component.set("v.isReadOnly", true);
                }
                var existingNotApprovedRate = permanencyNsRecIns.existingRateRec;
                
                if (existingNotApprovedRate.length) {
                    component.set("v.RateRec",existingNotApprovedRate[0]);
                    if (initial) {
                        component.set("v.openRateModal", true);
                    }
                } 
                component.set("v.RateList",permanencyNsRecIns.rateRecList);
                component.set("v.agreementDate", permanencyRec.Agreement_Start_Date__c);
            } else if (state === "INCOMPLETE") {
                helper.showToast(component, event, helper, "error", "Response is Incompleted", "Error!");                
            } else if (state === "ERROR") {
                
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        helper.showToast(component, event, helper, "error", errors[0].message, "Error!");
                    }
                } else {
                    helper.showToast(component, event, helper, "error", "Unknown error", "Error!");
                }
            }
        });
        $A.enqueueAction(action);
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
})