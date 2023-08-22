({
    getCPSResponseWrapper: function(component, helper) {

        var action = component.get("c.getCPSResponse");
        console.log('helper========');
        action.setParams({ SDMId: component.get("v.recordId"), responseIdMap: component.get('v.CPSResponseMap') });
        // Add callback behavior for when response is received
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.showModal", "False");
                var responseList = response.getReturnValue();
                if (responseList) {
                    var CPSResponseObj = JSON.parse(responseList);
                    component.set("v.responseOptions", CPSResponseObj.responseWrapperList);
                    component.set("v.SDMRuleId", CPSResponseObj.responseWrapperList[0].SDMRuleId);
                    component.set("v.CPSResponseType", CPSResponseObj.CPSResponseType);
                    var responseList = component.get('v.responseOptions');
                    var disQualifiedValueChecked = false;
                    for(let i = 0; i < responseList.length; i++ ) {
                        if(responseList[i].type == component.get('v.MandatoryDisqualifiers') && responseList[i].checked == true) {
                      	
                            disQualifiedValueChecked = true;
                            break;
                            
                        }
                    }
                    if(disQualifiedValueChecked == true) {
                        component.set("v.CPSResType", 'CPS-IR');
                    } else {
                        component.set("v.CPSResType", CPSResponseObj.CPSResponseType);
                    }
                    component.set("v.CPSResponseType", CPSResponseObj.CPSResponseType);
                    component.set("v.showModal", "True");
                    component.set("v.recordId", component.get("v.invID"));
                    console.log('1========',component.get("v.recordId"));
                } else {
                    component.set("v.responseOptions", null);
                    helper.showToast(component, event, helper, 'warning', 'We didn\'t select any abuse value', 'Error!');
                    component.set("v.recordId", component.get("v.invID"));
                    console.log('2========',component.get("v.recordId"));
                }
            } else if (state === "INCOMPLETE") {
                helper.showToast(component, event, helper, "error", "Response is Incomplete.", "Error!");
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
            component.set("v.isSpinner", "false");
        });
        // Send action off to be executed
        $A.enqueueAction(action);
    },

    //show toast error message
    showToast: function(component, event, helper, type, msg, title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": msg,
            "type": type
        });
        toastEvent.fire();
    }
})