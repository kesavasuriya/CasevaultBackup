({
    doInit: function(component, event, helper) {
        
        var pageRef = component.get("v.pageReference");
        var recordId = pageRef.state.c__recordId;
        var fileType = pageRef.state.c__fileType;
        component.set("v.recordId", recordId);
        component.set("v.fileType", fileType);
        var flow = component.find("flowData");
        var inputVariables = [
            { name: "recordId", type: "String", value: component.get("v.recordId") },
            { name: "fileType", type: "String", value: component.get("v.fileType") }
        ];
        flow.startFlow("Upload_files_in_Person", inputVariables);
        var workspaceAPI = component.find("workspace");
        workspaceAPI
        .getEnclosingTabId()
        .then(function(tabId) {
            
            workspaceAPI.setTabLabel({
                tabId: tabId,
                label: "Files & Documents"
            });
            workspaceAPI.setTabIcon({
                tabId: tabId,
                icon: "utility:file",
                iconAlt: "Files"
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    },
    
    handleStatusChange: function(component, event) {
        
        if (event.getParam("status") === "FINISHED") {
            var workspaceAPI = component.find("workspace");
            workspaceAPI
            .getFocusedTabInfo()
            .then(function(response) {
                var focusedTabId = response.tabId;
                workspaceAPI.closeTab({ tabId: focusedTabId });
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                    recordId: component.get("v.recordId"),
                    slideDevName: "detail"
                });
                navEvt.fire();
                $A.get('e.force:refreshView').fire();
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    }
});