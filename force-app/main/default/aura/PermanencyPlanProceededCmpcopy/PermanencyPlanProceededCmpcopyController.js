({
	stageAction : function(component, event, helper) {
        var currentOnStageValue = event.getSource().get('v.value');
        var currentStageValue = component.get("v.currentStage");
        var map = component.get("v.map");
        
        	component.set("v.onCurrentStage",currentOnStageValue);    
        
	},
    
    getInitialInfos: function(component, event, helper) {
         
       var action = component.get("c.getInitialPermanancyDetails");
        action.setParams({'permanancyPlanId':component.get("v.id")});
        action.setCallback(this, function(response) { 
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                var guardianshipPicklist = JSON.parse(storeResponse).guardianshipPlaningPicklist;
                guardianshipPicklist.splice(0, 1); // for remove new value
                guardianshipPicklist.splice(guardianshipPicklist.length - 1, 1);// for remove Completed value in path
                component.set("v.guardianshipPlaningList", guardianshipPicklist);
                var utilityBaseCmp = component.find("utils");
                var permanencyPlanNsIns = utilityBaseCmp.checkNameSpace(JSON.parse(storeResponse).permanencyInst, false)
                component.set("v.currentStage", permanencyPlanNsIns.Guardianship_Planing__c);
                component.set("v.onCurrentStage", permanencyPlanNsIns.Guardianship_Planing__c);
                component.set("v.permanencyRec", permanencyPlanNsIns);
                var clientDob = new Date();
                clientDob=  component.get("v.permanencyRec").D_O_B__c;

            }else if (state === "INCOMPLETE") {
                helper.showToast(component, event, helper, "error", "Response is Incompleted", "Error!");
                //alert('Response is Incompleted');
            }else if (state === "ERROR") {
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
})