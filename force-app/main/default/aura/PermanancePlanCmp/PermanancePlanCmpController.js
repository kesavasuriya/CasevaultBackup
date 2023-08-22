({

    getInitialInfos: function(component, event, helper) {
        var columns = [
            { label: 'Name', fieldName: 'ChildName', type: 'string', cellAttributes: { alignment: 'left' } },
            { label: 'Person Role', fieldName: 'Role', type: 'string' },
            { label: 'Age', fieldName: 'Age', type: 'number', cellAttributes: { alignment: 'left' } },
            { label: 'DOB', fieldName: 'DOB', type: 'date', typeAttributes: { month: "2-digit", day: "2-digit", year: "numeric" } },
        ];
        component.set("v.columns", columns);
        var url = window.location.href; // get the current url  
        var newUrl = url.replaceAll('%2F', '/');
        var lastIndex = newUrl.lastIndexOf('Service_Case__c');
        var serviceCaseId = newUrl.substring(lastIndex + 16, lastIndex + 34); // get the servicecase recordid from current page url
        component.set("v.serviceCaseId", serviceCaseId);
        var permancyRec = component.get("v.permanancyPlanRec");
        permancyRec.Service_Case__c = component.get("v.serviceCaseId");

        component.set("v.permanancyPlanRec", permancyRec);
        var action = component.get("c.getInitialInformation");
        action.setParams({
            'serviceCaseRecordId': component.get("v.serviceCaseId"),
            'permanencyPlanRecordId': component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                if (JSON.parse(storeResponse).permanencyInst) {
                    component.set("v.permanancyPlanRec", JSON.parse(storeResponse).permanencyInst);
                }
                if (JSON.parse(storeResponse).approvedPlacementChildList.length == 0) {
                    component.set("v.childErrorMessage", true);
                } else {
                    component.set("v.childErrorMessage", false);
                }
                var approvedChildPlacements = component.find("utils").checkNameSpace(JSON.parse(storeResponse).approvedPlacementChildList, false);
                for (var i = 0; i < approvedChildPlacements.length; i++) {

                    var row = approvedChildPlacements[i];


                    if (row.Child__r) {
                        row.childId = row.Child__c;
                        row.ChildName = row.Child__r.Name;
                        row.Role = row.Child__r.Intake_Person_Role__c;
                        row.Age = row.Child__r.Age__c;
                        row.DOB = row.Child__r.Date_of_Birth__c;
                    }

                }
                component.set("v.childList", approvedChildPlacements);

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

    handleRowSelection: function(component, event, helper) {
        var selectedChildPlacementRec = event.getParam('selectedRows')[0];
        var permancyRec = component.get("v.permanancyPlanRec");
        permancyRec.Contact__c = selectedChildPlacementRec.childId;
        permancyRec.Placement__c = selectedChildPlacementRec.Id;
        component.set("v.permanancyPlanRec", permancyRec);
    },

    onFormValidate: function(component, event, helper) {
        helper.onValidate(component, event, helper);
    },

    handleSuccess: function(component, event, helper) {
        helper.showToast(component, event, helper, "success", "Record saved successfully!", "Success!");
        var record = event.getParam("response");
        var navLink = component.find("navLink");
            var pageRef = {
                type: 'standard__recordPage',
                attributes: {
                    actionName: 'view',
                    recordId : record.id
                },
            };
            navLink.navigate(pageRef,true);
    },

    handleSubmit: function(component, event, helper) {

        event.preventDefault();
        let record = component.get("v.permanancyPlanRec");
        var fields = event.getParam('fields');
        fields.Service_Case__c = record.Service_Case__c;
        fields.Placement__c = record.Placement__c;
        fields.Contact__c = record.Contact__c;
        component.find('recordForm').submit(fields);
    },
    handleError: function(component, event, helper) {
        helper.showToast(component, event, helper, "error", event.getParam("detail"), "Error!");
    },

});