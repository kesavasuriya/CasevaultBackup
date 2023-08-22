({
    getInitialInfos : function(component, event, helper) {
        
        helper.getInitialInformations(component, event, helper, true);
    },
        
    onFormValidate: function (component,event,helper) {
        component.set("v.openApprovalScreen", false);
        helper.onValidate(component, event, helper);
    },

    handleOnSubmitApprovalAndSave : function (component,event,helper) {

        component.set("v.openApprovalScreen",true);
        helper.onValidate(component, event, helper);
    },

    handleSubmit: function(component, event, helper) {
        event.preventDefault();
        const fields = event.getParam('fields');
        fields.Permanency_Plan__c = component.get("v.recordId");
        component.find('editForm').submit(fields);
    },

    handleOnSuccess : function(component, event, helper) {

        var annualRec = event.getParam("response");
        helper.showToast(component, event, helper, "success", "Annual Review record created successfully!", "Success!");
        if (component.get("v.openApprovalScreen")) {
            component.set("v.openApprovalScreen", false);
            component.set("v.openModal",true);
            var flow = component.find("flowData");
            var inputVariables = [
                {
                    name : 'PermanencyPlanId',
                    type : 'String',
                    value : component.get("v.recordId")
                },
                {
                    name : 'ApprovalProcessName',
                    type : 'String',
                    value : 'Permanancy_Annual_Approval_Process'
                },
                {
                    name : 'OnClickedStage',
                    type : 'Number',
                    value : component.get("v.onClickCurrentStage")
                },
                {
                    name : 'AnnualReviewId',
                    type : 'String',
                    value : annualRec.id
                }]
            
            flow.startFlow("Permanency_Plan_Proceed_Approval_Flow", inputVariables);
        }
    }, 

    closeModel: function (component, event, helper) {
        component.set("v.openModal",false);
    },
    
    handleStatusChange : function (component, event, helper) {
        if(event.getParam("status") === "FINISHED") {
            component.set("v.openModal",false);
            component.set("v.openAnnualReviewModal", false);
            helper.getInitialInformations(component, event, helper, false);
        }
    },
    
    addAnnualReview : function (component, event, helper) {
        
        //component.set("v.openAnnualReviewModal",true);
        var action = component.get("c.addRateAnnualRec");
        action.setParams({'permanencyPlanId': component.get("v.recordId")});
        action.setCallback(this, function(response) { 
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                var existingRateRec = component.find("utils").checkNameSpace(JSON.parse(storeResponse).rateRec, false);
                var existingAnnualReviewRec = component.find("utils").checkNameSpace(JSON.parse(storeResponse).annualReviewRec, false);
                if (existingRateRec && existingRateRec.length) {
                    
                    if(existingRateRec[0].Approval_Status__c == 'Approved') {
                        if (existingAnnualReviewRec && existingAnnualReviewRec.length) {
                            if (existingAnnualReviewRec[0].Approval_Status__c == 'Approved') {
                                helper.showToast(component, event, helper, "warning", "Annual Review is Completed. If you want to create an annual review create a new rate under agreement Tab.", "Warning!");
                            } else {
                                helper.showToast(component, event, helper, "warning", "Current Annual Review approval must be complete to continue the create new Annual Review.", "Warning!");
                            }
                            
                        } else {
                            //Set default rate end date value set review Date in Annual Review 
                            component.set("v.annualReviewsRec",{});
                            var annualRecIns = component.get("v.annualReviewsRec");
                            annualRecIns.Review_Date__c = existingRateRec[0].Rate_End_Date__c;
            				component.set("v.annualReviewsRec",annualRecIns);
                            component.set("v.openAnnualReviewModal",true);   
                        }
                    } else {
                        helper.showToast(component, event, helper, "warning", "Rate approval must be completed to continue adding a new Annual Review.", "Warning!"); 
                    }
                } else {
                    helper.showToast(component, event, helper, "warning", "There is no existing Rate record found.", "Warning!");  
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
})