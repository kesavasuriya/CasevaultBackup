({
    getInitialInfos : function(component, event, helper) {
        
        helper.getInitialInformations(component, event, helper , true);
    },
    
    handleUploadFinished: function (event) {

        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);  
        // Get the file name
    },
    
    showModal:function(component){
        component.set("v.showCompletionModal",true);
    },
    
    closeCompletionModel: function(component){
        component.set("v.showCompletionModal",false);
    },
    
    onPicklistChange : function(component,event) {
        component.set("v.receivedTCA", event.getSource().get('v.value'));    
    },

    onAgreementChange : function(component,event,helper){
        component.set("v.agreementDate", event.getSource().get('v.value'));    
    },

    onFormValidate: function (component,event,helper) {
        component.set("v.openApprovalScreen", false);
        helper.onValidate(component,event,helper);
    },

    handleOnSubmitApprovalAndSave : function (component,event,helper) {

        component.set("v.openApprovalScreen",true);
        helper.onValidate(component,event,helper);
    },

    handleOnSuccess : function(component, event, helper) {

        var startDate = component.get("v.agreementDate");
        var beginDate = component.get("v.RateRec").Rate_Begin_Date__c;
        var rateRecIns = component.get("v.RateRec");
        if (rateRecIns && rateRecIns.Rate_End_Date__c != null) {
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds Agreement_Start_Date__c
            const firstDate = new Date(rateRecIns.Rate_Begin_Date__c);
            const secondDate = new Date(rateRecIns.Rate_End_Date__c);
            const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
            if(beginDate > startDate) {
                if (diffDays == 365) {
                    rateRecIns.Permanency_Plan__c = component.get("v.recordId");
                    //rateRecIns.Provider__c = component.get("v.providerId");
                    component.set("v.RateRec",rateRecIns);
                    var action = component.get("c.upsertRate");
                    action.setParams({
                        'rateDataJSON': JSON.stringify(component.find("utils").checkNameSpace(component.get("v.RateRec"), true))
                    });
                    action.setCallback(this, function(response) {
                        // hide spinner when response coming from server 
                        var state = response.getState();
                        if (state === "SUCCESS") {
                            var storeResponse = response.getReturnValue();
                            helper.showToast(component, event, helper, "success", "Permanancy record updated successfully!", "Success!");
                            component.set("v.openRateModal", false);
                            helper.getInitialInformations(component, event, helper, false);
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
                                        value : 'Permanancy_Aggrement_Approval_Process'
                                    },
                                    {
                                        name : 'OnClickedStage',
                                        type : 'Number',
                                        value : component.get("v.onClickCurrentStage")
                                    },
                                    {
                                        name : 'RateId',
                                        type : 'String',
                                        value : storeResponse
                                    },]
                                
                                flow.startFlow("Permanency_Plan_Proceed_Approval_Flow", inputVariables);
                            }
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
                } else {
                    var errMsg = 'Rate end date and begin date difference should be 365 days. But actual days difference: '+ diffDays;
                    helper.showToast(component, event, helper, "error", errMsg, "Error!");    
                }
            } else {
                helper.showToast(component, event, helper, "error", "Rate begin Date should not be less than agreement start date", "Error!");  
            }
        } else {
            helper.showToast(component, event, helper, "error", "Please add the Rate record", "Error!");
        }
    },

    handleOnError: function(component, event, helper) {
        helper.showToast(component, event, helper, "error", event.getParam("detail"), "Error!");
    },

    closeModel: function (component, event, helper) {
        component.set("v.openModal",false);
    },
    
    handleStatusChange : function (component, event) {
        if(event.getParam("status") === "FINISHED") {
            component.set("v.openModal",false);
        }
    },
    
    addRate : function (component, event, helper) {
        
        if (!component.get("v.openRateModal")) {
            var action = component.get("c.addRateAnnualRec");
            action.setParams({'permanencyPlanId': component.get("v.recordId")});
            action.setCallback(this, function(response) { 
                var state = response.getState();
                if (state === "SUCCESS") {
                    var storeResponse = response.getReturnValue();
                    var existingRateRec =  component.find("utils").checkNameSpace(JSON.parse(storeResponse).rateRec, false);
                    var existingAnnualReviewRec = component.find("utils").checkNameSpace( JSON.parse(storeResponse).annualReviewRec, false);
                    if (existingRateRec && existingRateRec.length) {
                        
                        if(existingRateRec[0].Approval_Status__c == 'Approved') {
                            if (existingAnnualReviewRec && existingAnnualReviewRec.length) {
                                if (existingAnnualReviewRec[0].Approval_Status__c == 'Approved') {
                                    component.set("v.RateRec", {});
                                    var rateRec = component.get("v.RateRec");
                                    rateRec.Provider__c = component.get("v.providerId");
                                    component.set("v.RateRec", rateRec);
                                    component.set("v.openRateModal", true);    
                                } else {
                                    helper.showToast(component, event, helper, "warning", "Annual Review approval must be completed to continue adding a new Rate Agreement.", "Warning!");
                                }
                                
                            } else {
                                helper.showToast(component, event, helper, "warning", "Annual Review must be completed to continue adding a new Rate Agreement.", "Warning!"); 
                            }
                        } else {
                            helper.showToast(component, event, helper, "warning", "Current Rate approval must be completed to continue adding a new Rate Agreement.", "Warning!");   
                        }
                    } else {
                        component.set("v.RateRec", {});
                        var rateRec = component.get("v.RateRec");
                        rateRec.Provider__c = component.get("v.providerId");
                        component.set("v.RateRec", rateRec);
                        component.set("v.openRateModal", true); 
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
        }
    },    
    
    handleRowAction : function (cmp, event, helper) {
        
        var row = event.getParam('row');
        cmp.set("v.RateViewRec", row);
        cmp.set("v.showRateModal", true);
    },
    
    closeRateModal : function (cmp, event, helper) {
    	cmp.set("v.showRateModal", false);    
    },    
    
})