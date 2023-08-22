({
	invoke : function(component, event, helper) {
		
        var navService = component.find("navService");
        var pageReference = {
            type: 'standard__recordPage',
            attributes : {
                recordId : component.get("v.contentDocumentID"),
                actionName : 'view'
            }
        };
        navService.navigate(pageReference);
	}
})