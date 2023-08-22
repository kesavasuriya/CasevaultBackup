({

    onFormValidate: function (component,event,helper) {
        component.set("v.openApprovalScreen", false);
        component.find("utils").onFormValidate(component.find("requiredFields"));
    },

    handleOnSubmitApprovalAndSave : function (component,event,helper) {

        component.set("v.openApprovalScreen", true);
        component.find("utils").onFormValidate(component.find("requiredFields"));
    },

    handleOnSuccess : function(component, event, helper) {
        
        helper.showToast(component, event, helper, "success", "Permanancy record updated successfully!", "Success!");
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
                    value : 'Permanancy_Application_Approval_Process'
                },
                {
                    name : 'OnClickedStage',
                    type : 'Number',
                    value : component.get("v.onClickCurrentStage")
                },
            ]
                            
            flow.startFlow("Permanency_Plan_Proceed_Approval_Flow", inputVariables);
        }
    },
     
    handleOnError: function(component, event, helper) {
        helper.showToast(component, event, helper, "error", event.getParam("detail"), "Error!");
    },

    closeModel : function(component,event,helper) {
        component.set("v.openModal",false);
    },
    
    handleStatusChange : function (component, event) {
        
        if(event.getParam("status") === "FINISHED") {
            component.set("v.openModal",false);
        }
    },
    
    getInitialInfos :function (component,event,helper) {
        var action = component.get("c.getApplicationInitialInformation");
        action.setParams({'permanencyPlanId': component.get("v.recordId")});
        action.setCallback(this, function(response) { 
            var state = response.getState();
            if (state === "SUCCESS") {
                
                var storeResponse = response.getReturnValue();
                var applicationInfos =  JSON.parse(storeResponse);
                var utilityBase = component.find("utils");
                var permanencyRec = utilityBase.checkNameSpace(applicationInfos.permanencyPlanRecord, false);
                var applCoAppls = utilityBase.checkNameSpace(applicationInfos.applicantCoApplList, false);
                var cpaProviderId = applicationInfos.cpaProviderId;
                component.set("v.cpaProvider", cpaProviderId);
                if (applCoAppls.length) {
                    for(var i = 0;i < applCoAppls.length;i++) {
                        if (applCoAppls[i].Applicant_or_Co_Applicant__c == 'Applicant') {
                            permanencyRec.Guardian_One_Name__c = applCoAppls[i].Name;
                            permanencyRec.Guardian_One_SSN__c = applCoAppls[i].SSN__c;
                            permanencyRec.Guardian_One_DOB__c = applCoAppls[i].Date_of_Birth__c;
                        } else {
                            permanencyRec.Guardian_Two_Name__c = applCoAppls[i].Name;
                            permanencyRec.Guardian_Two_SSN__c = applCoAppls[i].SSN__c;
                            permanencyRec.Guardian_Two_DOB__c = applCoAppls[i].Date_of_Birth__c;
                        }    
                    }    
                }
                component.set("v.permanancyPlanRec", permanencyRec);
                if (permanencyRec.Guardianship_Planing__c == '6') {
                    component.set("v.isReadOnly", true);    
                } else if (component.get("v.onClickCurrentStage") < permanencyRec.Guardianship_Planing__c) {
  
                    component.set("v.isReadOnly", true);
                }     
            } else if (state === "INCOMPLETE") {
                helper.showToast(component, event, helper, "error", "Response is Incompleted", "Error!");
                
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