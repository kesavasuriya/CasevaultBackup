({
    doInit : function(component, event, helper) {
     
        var flow = component.find("intakeFlow");
        var workspaceAPI = component.find("workspace");
        
       /*var navService = component.find("navService");
        var pageReference = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'home'
            }
        };
        component.set("v.pageReference", pageReference);*/
        
        
        flow.startFlow("New_Intake");
        
        workspaceAPI.getEnclosingTabId()
        .then(function(tabId) {
          
            component.set("v.tabId",tabId);
            workspaceAPI.setTabLabel({tabId: tabId,label: "New Intake"});
            workspaceAPI.setTabIcon({tabId: tabId,icon: "utility:case",iconAlt: "Intake"});    
        }).catch(function(error) {});
        
    },
    
    statusChange : function(component, event, helper) {
        
        if (event.getParam('status') === "FINISHED") {
            
            var outputVariables = event.getParam("outputVariables");
            var workspaceAPI = component.find("workspace");
            workspaceAPI.getFocusedTabInfo()
            .then(function(response) {
               
                workspaceAPI.openTab({
                	url: '/lightning/r/Case/'+outputVariables[0].value+'/view',
                }).then(function(response) {
                    workspaceAPI.focusTab({tabId : response});
                    workspaceAPI.closeTab({ tabId: component.get("v.tabId") });
                })     
            })
             
        }
    }
})