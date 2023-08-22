({
	//show toast error message
    showToast : function(component, event, helper, type, msg, title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": msg,
            "type":type
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
        return isValid;
    }
})