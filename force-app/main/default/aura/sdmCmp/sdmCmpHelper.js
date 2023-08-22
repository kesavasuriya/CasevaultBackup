({
	handleTab1 : function(component) {
        
		var flow = component.find("flowData");
        var inputVariables1 = [
        { 
            name : 'intake_investigation_serviceCaseId',
            type : 'String',
            value : component.get('v.recordId')
        },
        {
            name : 'Showvictim',
            type : 'Boolean',
            value : true
        }
        ];
        if(flow) {
            flow.startFlow("SDM_Alleged_Victim_Maltreator", inputVariables1);
        }
        
        
        var flow2 = component.find("sdmAllegedVictimMaltreator2");
        var inputVariables2 = [
        {
            name : 'intake_investigation_serviceCaseId',
            type : 'String',
            value : component.get('v.recordId')
        },
        {
            name : 'Showvictim',
            type : 'Boolean',
            value : false
        }
        ];
        if(flow2) {
            flow2.startFlow("SDM_Alleged_Victim_Maltreator", inputVariables2);
        }
        
        var flow3 = component.find("sdmCreateFlow");
        var inputVariables3 = [
        {
            name : 'Intake_Investigation_ServiceCase',
            type : 'String',
            value : component.get('v.Intake_Investigation_ServiceCase')
        },
        {
            name : 'recordId',
            type : 'String',
            value : component.get('v.recordId')
        }
        ];
        if(flow3) {
            flow3.startFlow("SDM_Create_Flow", inputVariables3);
        }
	},
    
    handleTab2 : function(cmp) {
        
        var flow4 = cmp.find("SDMRecommendationandOverrides");
        var inputVariables4 = [
        {
            name : 'intake_investigation_serviceCase_Name',
            type : 'String',
            value : cmp.get('v.Intake_Investigation_ServiceCase')
        },
        {
            name : 'intake_investigation_servicecaseId',
            type : 'String',
            value : cmp.get('v.recordId')
        }
        ];
        if(flow4) {
            flow4.startFlow("SDM_Recommendation_and_Overrides", inputVariables4);
        }
        
    }, 

   
})