({
	doInit : function (component,event,helper) {
        
        component.set("v.activeTab",'one');
        helper.handleTab1(component);
  	},
    
    tabSelected : function(cmp,event,helper) {
        
        console.log('recordId======',cmp.get('v.recordId'));
        if(cmp.get("v.activeTab") == 'one') {
            
            helper.handleTab1(cmp);
            
        } else if(cmp.get("v.activeTab") == 'two') {
           
            helper.handleTab2(cmp);
        } 
    },
    
    statusChange1 : function (cmp, event, helper) {
        
        console.log('recordId======',cmp.get('v.recordId'));
        if (event.getParam('status') === "FINISHED") {
        	 
            cmp.set('v.activeTab','two');
            helper.handleTab2(cmp); 
    
        }
    },
    
    statusChange2 : function (cmp, event, helper) {

        console.log('recordId======',cmp.get('v.recordId'));
        if (event.getParam('status') === "FINISHED") {
        	
            cmp.set('v.activeTab','three');
        }
    }
})