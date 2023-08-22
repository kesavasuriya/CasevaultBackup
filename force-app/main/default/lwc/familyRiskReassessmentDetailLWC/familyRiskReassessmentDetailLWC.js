import { LightningElement, api, track } from 'lwc';
import initInfo from '@salesforce/apex/AssessmentController.getFamilyRiskReassessmentInfo';
import savefamilyRiskReassessment from '@salesforce/apex/AssessmentController.upsertfamilyRiskReassessments';
import UtilityBaseElement from 'c/utilityBaseLwc';

const columns = [ {label : 'Final Risk Level', fieldName : 'finalRiskLevel'},{label : 'Recommendation', fieldName : 'recommendation'}]
const childColumns = [ {label : 'Name' , fieldName : 'Name'},{label : 'Age' , fieldName : 'Age__c'},{label : 'Client ID' , fieldName : 'Casevault_PID__c'},
                {label : ' ', type: 'button' , typeAttributes : {label :' ', iconName : 'utility:close' , name : 'close', disabled : { fieldName : 'disableCancel'}}}];

export default class FamilyRiskReassessmentDetailLWC extends UtilityBaseElement {

    @api recordId;
    @api objectApiName;
    @track familyRiskReassessmentRec = {};
    @track serviceCaseInvestigationRec = {};
    @track childList = [];
    @track RR1options = [];
    @track RR2options = [];
    @track RR3options = [];
    @track RR4options = [];
    @track RR5options = [];
    @track RR6options = [];
    @track RR7options = [];
    @track RR7Yesoptions = [];
    @track RR8options = [];
    @track RR9options = [];
    @track riskLevelOptions = [];
    @track x1options = [];
    @track x2options = [];
    @track x3options = [];
    @track x4options = [];
    @track x5options = [];
    @track finalriskleveloptions = [];
    @track plannedActionOptions = [];
    @track approvalOptions = [];
    @track routeToSupervisorOptions = [];
    @track selectedRR4 = [];
    @track selectedValueRR4 = [];
    showRR7Yesoptions = false;
    @track selectedRR7Yesoptions = [];
    @track selectedValueRR7Yesoptions = [];
    showOverride = false;
    @track recommendedDecisionList = [{'id' : '1' , 'finalRiskLevel' : 'Low' , 'recommendation' : 'Close*'},{'id' : '2' , 'finalRiskLevel' : 'Moderate' , 'recommendation' : 'Close*'},{'id' : '3' , 'finalRiskLevel' : 'High' , 'recommendation' : 'Continue Services'},{'id' : '4' , 'finalRiskLevel' : 'Very High' , 'recommendation' : 'Continue Services'}];
    columns = columns;
    childColumns = childColumns;
    @track createList = [];
    @track deleteList = [];


    connectedCallback() {

        this.doInit();
    }

    doInit() {

        this.initializeValues();
        initInfo({ recordId:this.recordId, objectApiName : this.objectApiName})
        .then(result => {

            let res = JSON.parse(result);
            this.RR1options = res.RR1options.splice(1);
            this.RR2options = res.RR2options.splice(1);
            this.RR3options = res.RR3options.splice(1);
            this.RR4options = res.RR4options;
            this.RR5options = res.RR5options.splice(1);
            this.RR6options = res.RR6options.splice(1);
            this.RR7options = res.RR7options.splice(1);
            this.RR7Yesoptions = res.RR7Yesoptions;
            this.RR8options = res.RR8options.splice(1);
            this.RR9options = res.RR9options.splice(1);
            this.riskLevelOptions = res.riskLevelOptions.splice(1);
            this.x1options = res.x1options.splice(1);
            this.x2options = res.x2options.splice(1);
            this.x3options = res.x3options.splice(1);
            this.x4options = res.x4options.splice(1);
            this.x5options = res.x5options.splice(1);
            this.finalriskleveloptions = res.finalriskleveloptions.splice(1);
            this.plannedActionOptions = res.plannedActionOptions.splice(1);
            this.approvalOptions = res.approvalOptions;
            this.routeToSupervisorOptions = res.routeToSupervisorOptions;
            if(this.objectApiName == 'Service_Case__c') {
                this.serviceCaseInvestigationRec = this.checkNamespaceApplicable(res.serviceCaseRec,false);
            } else if(this.objectApiName == 'Investigation__c') {
                this.serviceCaseInvestigationRec = this.checkNamespaceApplicable(res.investigationRec,false);
            } else if(this.objectApiName == 'Assessment__c' && res.assessmentRec ) {
                this.familyRiskReassessmentRec = res.assessmentRec;
                if(this.familyRiskReassessmentRec.Characteristics_of_children_household__c != null){
                    this.selectedValueRR4 = this.familyRiskReassessmentRec.Characteristics_of_children_household__c.split(';');
                }
                if(this.familyRiskReassessmentRec.Yes_problems_with_adult_r__c != null) {
                    this.selectedValueRR7Yesoptions = this.familyRiskReassessmentRec.Yes_problems_with_adult_r__c.split(';');
                }
                if(this.familyRiskReassessmentRec.Adult_relationships_since_the_MFIRA__c == 'Yes, problems with adult relationships (select all that apply) (1)') {
                    this.showRR7Yesoptions = true;
                }
                if(this.familyRiskReassessmentRec.X5_If_yes_override_risk_level__c == 'Yes') {
                    this.showOverride = true;
                }
                if(this.familyRiskReassessmentRec.Service_Case__c) {
                    this.serviceCaseInvestigationRec = this.checkNamespaceApplicable(res.serviceCaseRec,false);
                } else if(this.familyRiskReassessmentRec.Investigation__c) {
                    this.serviceCaseInvestigationRec = this.checkNamespaceApplicable(res.investigationRec,false);
                }
            }
            this.childList = this.checkNamespaceApplicable(res.conactList,false);
            this.createList = [...this.childList];
            /*if(this.childList.length>0) {
                for(let i=0;i<this.childList.length;i++){
                    this.childList[i].Date_of_Birth__c = moment(this.childList[i].Date_of_Birth__c).format('MM/DD/YYYY');
                }
            }*/
            if(this.serviceCaseInvestigationRec.Head_of_Household__c != null) {
                this.serviceCaseInvestigationRec.headOfHousehold = this.serviceCaseInvestigationRec.Head_of_Household__r.Name;
            }

        }).catch(error => {

            this.loading = false;
            let errorMsg;
            this.title ="Error!";
            this.type ="error";
            if(error) {
                let errors = this.reduceErrors(error);
                errorMsg = errors.join('; ');
            } else {
                errorMsg = 'Unknown Error';
            }
            this.message = errorMsg;
            this.fireToastMsg();
         })
    }

    handleRowAction(event) {

        var selectedrow = event.detail.row;
        var row = this.childList.find(element => element.Id == selectedrow.Id);
        let rows = [...this.childList];
        rows.splice(this.childList.indexOf(row), 1);
        this.childList = rows;         
    }

    

    handleChange(event) {

        let targetName = event.target.name;
        let targetValue = event.target.value;
        let targetType = event.target.type;
        //this.familyRiskReassessmentRec.FINAL_RISK_LEVEL__c = this.familyRiskReassessmentRec.RISK_LEVEL__c;   
        
        if(targetName != 'Characteristics_of_children_household__c' && targetName != 'Yes_problems_with_adult_r__c' && targetType != 'checkbox') {
            this.familyRiskReassessmentRec[targetName] = targetValue;
        }

        if(targetType == 'checkbox') {
            this.familyRiskReassessmentRec[targetName] = event.target.checked;
        }
        
        if(targetName == 'Household_previously_received_CPS__c') {

            if(targetValue == 'None(0)') {
                this.familyRiskReassessmentRec.RR1_Score__c = 0;
            } else if(targetValue == 'One(1)') {
                this.familyRiskReassessmentRec.RR1_Score__c = 1;
            }     
        }

        if(targetName == 'Prior_CPS_response_IR_AR__c') {

            if(targetValue == 'None(0)') {
                this.familyRiskReassessmentRec.RR2_Score__c = 0;
            } else if(targetValue == 'One(1)') {
                this.familyRiskReassessmentRec.RR2_Score__c = 1;
            } else if(targetValue == 'Two or More(2)') {
                this.familyRiskReassessmentRec.RR2_Score__c = 2;
            }      
        }

        if(targetName == 'Primary_caregiver_has_a_history_of_abuse__c') {

            if(targetValue == 'No(0)') {
                this.familyRiskReassessmentRec.RR3_Score__c = 0;
            } else if(targetValue == 'Yes(1)') {
                this.familyRiskReassessmentRec.RR3_Score__c = 1;
            }     
        }

        if(targetName == 'Characteristics_of_children_household__c') {
            this.selectedRR4 = targetValue;
            this.familyRiskReassessmentRec.RR4changed = true;
            if(this.selectedRR4.includes('None of the above (0)')) {
                this.selectedValueRR4 = ['None of the above (0)'];
                this.selectedRR4 = ['None of the above (0)'];
                this.familyRiskReassessmentRec.RR4_Score__c = 0;
            } else {
                this.familyRiskReassessmentRec.RR4_Score__c = this.selectedRR4.length;
            }
        }

        if(targetName == 'New_CPS_response_of_abuse_or_neglect__c') {

            if(targetValue == 'No(0)') {
                this.familyRiskReassessmentRec.RR5_Score__c = 0;
            } else if(targetValue == 'Yes(1)') {
                this.familyRiskReassessmentRec.RR5_Score__c = 1;
            }     
        }

        if(targetName == 'Primary_caregiver_alcohol_or_substance__c') {

            if(targetValue == 'Yes, alcohol or substance abuse problem; problem is not being addressed(1)') {
                this.familyRiskReassessmentRec.RR6_Score__c = 1;
            } else {
                this.familyRiskReassessmentRec.RR6_Score__c = 0;
            }     
        }

        if(targetName == 'Adult_relationships_since_the_MFIRA__c') {

            this.selectedRR7Yesoptions = targetValue;
            if(targetValue == 'Yes, problems with adult relationships (select all that apply) (1)') {
                this.showRR7Yesoptions = true;
            } else {
                this.showRR7Yesoptions = false;
                this.selectedRR7Yesoptions = [];
                this.selectedValueRR7Yesoptions = [];
                this.familyRiskReassessmentRec.RR7_Score__c = 0;
            }     
        }

        if(targetName == 'Yes_problems_with_adult_r__c') {

            this.selectedRR7Yesoptions = targetValue;
            this.familyRiskReassessmentRec.RR7changed = true;
            if(this.selectedRR7Yesoptions.length > 0) {
                this.familyRiskReassessmentRec.RR7_Score__c = 1;
            }       
        }

        if(targetName == 'Primary_caregiver_mental_health__c') {

            if(targetValue == 'Yes, mental health problem; problem is NOT being addressed (1)') {
                this.familyRiskReassessmentRec.RR8_Score__c = 1;
            } else {
                this.familyRiskReassessmentRec.RR8_Score__c = 0;
            }     
        }

        if(targetName == 'Primary_caregiver_provides_physical_care__c') {

            if(targetValue == 'Yes (0)') {
                this.familyRiskReassessmentRec.RR9_Score__c = 0;
            } else {
                this.familyRiskReassessmentRec.RR9_Score__c = 1;
            }     
        }

        if(this.familyRiskReassessmentRec.Does_not_Demonstrate_Primary_Caregiver__c == true || this.familyRiskReassessmentRec.Does_not_Demonstarte_Secondary_Caregiver__c == true) {

            this.familyRiskReassessmentRec.Does_not_demonstrate_Score__c = 1;
        } else if(!(this.familyRiskReassessmentRec.Does_not_Demonstrate_Primary_Caregiver__c == true || this.familyRiskReassessmentRec.Does_not_Demonstarte_Secondary_Caregiver__c == true)) {
            this.familyRiskReassessmentRec.Does_not_demonstrate_Score__c = 0;
        }

        this.familyRiskReassessmentRec.Total_Score__c = parseInt(this.familyRiskReassessmentRec.RR1_Score__c) + parseInt(this.familyRiskReassessmentRec.RR2_Score__c) + parseInt(this.familyRiskReassessmentRec.RR3_Score__c) + parseInt(this.familyRiskReassessmentRec.RR4_Score__c) + parseInt(this.familyRiskReassessmentRec.RR5_Score__c) +
                                                        parseInt(this.familyRiskReassessmentRec.RR6_Score__c) + parseInt(this.familyRiskReassessmentRec.RR7_Score__c) + parseInt(this.familyRiskReassessmentRec.RR8_Score__c) + parseInt(this.familyRiskReassessmentRec.RR9_Score__c) + parseInt(this.familyRiskReassessmentRec.RR10_Score__c) +
                                                        parseInt(this.familyRiskReassessmentRec.Does_not_demonstrate_Score__c) + parseInt(this.familyRiskReassessmentRec.No_Secondary_Score__c) ;

        if(this.familyRiskReassessmentRec.Total_Score__c >= 0) {
            if(this.familyRiskReassessmentRec.Total_Score__c >= 8) {
                this.familyRiskReassessmentRec.RISK_LEVEL__c = 'Very High';
            } else if(this.familyRiskReassessmentRec.Total_Score__c >= 5) {
                this.familyRiskReassessmentRec.RISK_LEVEL__c = 'High';
            } else if(this.familyRiskReassessmentRec.Total_Score__c >= 2) {
                this.familyRiskReassessmentRec.RISK_LEVEL__c = 'Moderate';
            } else {
                this.familyRiskReassessmentRec.RISK_LEVEL__c = 'Low';
            }
        }  
          
        
        if(targetName == 'X5_If_yes_override_risk_level__c') {
            if(targetValue == 'Yes') {
                this.showOverride = true;
            } else {
                this.familyRiskReassessmentRec.FINAL_RISK_LEVEL__c = this.familyRiskReassessmentRec.RISK_LEVEL__c;
                this.familyRiskReassessmentRec.FIRA_Discretionary_override_reason__c = ''; 
                this.showOverride = false;
            }
        }

    }

    initializeValues() {

        this.familyRiskReassessmentRec = {};
        this.selectedRR4 = [];
        this.selectedValueRR4 = [];
        this.selectedRR7Yesoptions = [];
        this.selectedValueRR7Yesoptions = [];
        this.familyRiskReassessmentRec.RR1_Score__c = 0;
        this.familyRiskReassessmentRec.RR2_Score__c = 0;
        this.familyRiskReassessmentRec.RR3_Score__c = 0;
        this.familyRiskReassessmentRec.RR4_Score__c = 0;
        this.familyRiskReassessmentRec.RR5_Score__c = 0;
        this.familyRiskReassessmentRec.RR6_Score__c = 0;
        this.familyRiskReassessmentRec.RR7_Score__c = 0;
        this.familyRiskReassessmentRec.RR8_Score__c = 0;
        this.familyRiskReassessmentRec.RR9_Score__c = 0;
        this.familyRiskReassessmentRec.RR10_Score__c = 0;
        this.familyRiskReassessmentRec.Does_not_demonstrate_Score__c = 0;
        this.familyRiskReassessmentRec.No_Secondary_Score__c = 0;
        this.familyRiskReassessmentRec.Total_Score__c = 0;
        this.showRR7Yesoptions = false;
        this.showOverride = false;
    }

    handleSave() {

        this.familyRiskReassessmentRec[this.objectApiName] = this.recordId;
        this.familyRiskReassessmentRec.Assessment_Type__c = 'Family risk Reassessment';
        this.familyRiskReassessmentRec.Characteristics_of_children_household__c = this.familyRiskReassessmentRec.RR4changed == true ?  this.selectedRR4.join(';') : this.selectedValueRR4.join(';');
        this.familyRiskReassessmentRec.Yes_problems_with_adult_r__c =this.familyRiskReassessmentRec.RR7changed == true ? this.selectedRR7Yesoptions.join(';') : this.selectedValueRR7Yesoptions.join(';');
        if(!this.onValidate()) {

            this.loading = true;
            if(!this.familyRiskReassessmentRec.Id) {
                this.createList = [];
            }
            
            savefamilyRiskReassessment({ familyRiskReassessmentJSON : JSON.stringify(this.checkNamespaceApplicable(this.familyRiskReassessmentRec,true)), previousSelectedPersonJSON : JSON.stringify(this.createList), currentSelectedPersonJSON : JSON.stringify(this.childList)})
            .then( result => {

                console.log('result===',result);
                this.loading = false;
                this.title = 'Success!';
                this.type = 'success';
                this.message = 'Record saved successfully';
                this.fireToastMsg();
                
                const saveEvent = new CustomEvent('save');
                this.dispatchEvent(saveEvent);
               /* if(result) {
                    
                    
                    
                    doCreateDelete({previousSelectedPersonJSON : JSON.stringify(this.createList), currentSelectedPersonJSON : JSON.stringify(this.childList), assessmentId : result})
                    .then(response => {
                        
                        console.log('response===',response);
                        this.title = 'Success!';
                        this.type = 'success';
                        this.message = 'Record saved successfully';
                        this.fireToastMsg();
                        
                        const saveEvent = new CustomEvent('save');
                        this.dispatchEvent(saveEvent);

                    }).catch(error => {

                        this.loading = false;
                        let errorMsg;
                        this.title ="Error!";
                        this.type ="error";
                        if(error) {
                            let errors = this.reduceErrors(error);
                            errorMsg = errors.join('; ');
                        } else {
                            errorMsg = 'Unknown Error';
                        }
                        this.message = errorMsg;
                        this.fireToastMsg();
                    })
                }*/
               
                //this.doInit();
            }).catch(error => {

                this.loading = false;
                let errorMsg;
                this.title ="Error!";
                this.type ="error";
                if(error) {
                    let errors = this.reduceErrors(error);
                    errorMsg = errors.join('; ');
                } else {
                    errorMsg = 'Unknown Error';
                }
                this.message = errorMsg;
                this.fireToastMsg();
            })
            
        } else {

            this.title = "Error!";
            this.message = "Required fields are missing";
            this.type = "error";
            this.fireToastMsg();
        
        }

    }

    handleChildChange(event) {

        this.childList = event.detail;
    }
}