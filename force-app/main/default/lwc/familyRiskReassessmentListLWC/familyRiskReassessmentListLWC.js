import { LightningElement, track, api } from 'lwc';
import initInfo from '@salesforce/apex/AssessmentController.getReassessments';
import deleteAssessment from '@salesforce/apex/AssessmentController.deleteAssessment';
import { NavigationMixin } from 'lightning/navigation';
import UtilityBaseElement from 'c/utilityBaseLwc';

const actions = [
    { label: 'Delete', name: 'delete'}   
];
const dataColumn = [{ label: 'Assessment Name', type:  'button',typeAttributes: { 
   variant :'base', name : 'name',
            label:   { 
       fieldName: 'Name' 
   } }},
   {label: 'Date Assessment Initiated', fieldName:'FRRE_Date_Assessment_Initiated__c',type:'date',typeAttributes:{day:"numeric",month:"numeric",year:"numeric",hour:"numeric",minute:"numeric",hour12:"true"}},
   {label:'Approval Status',fieldName:'Approval_Status__c'},
                   { type: 'action', typeAttributes: { rowActions: actions} }];


export default class FamilyRiskReassessmentListLWC extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    @track assessmentList = [];
    showCmp = false;
    dataColumn = dataColumn;
    showMsg = false;
    @track visibleData = [];
    loading = false;

    get heading() {
        if(this.assessmentList) {
            return 'FAMILY RISK REASSESSMENTS ('+this.assessmentList.length+')';
        } else {
            return 'FAMILY RISK REASSESSMENTS';
        }
    }

    connectedCallback() {

        this.doInit();
    }

    doInit() {

        this.loading = true;
        this.showChild = false;
        initInfo({ recordId:this.recordId, objectApiName : this.objectApiName})
        .then(result => {

            let response = JSON.parse(result);
            if(response.familyRiskReassessmentRec && response.familyRiskReassessmentRec.length > 0) {
                this.assessmentList = response.familyRiskReassessmentRec;
                this.showMsg = false;
            } else {
                this.showMsg = true;
            }  
            this.showChild = true;       
            this.loading = false;

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

    handleNew() {

        this.showCmp = true;
    }

    handleRow(event) {

        if(event.detail.action.name == 'name') {

            console.log('rowId===',event.detail.row.Id);
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.detail.row.Id,
                    actionName: 'view'
                }
            });
        } else if(event.detail.action.name == 'delete') {

            let selectedRow = event.detail.row;
            //this.familyRiskReassessmentRec = event.detail.row;
            if(selectedRow.Approval_Status__c == 'Approved') {

                this.title = "Error!";
                this.message = "Family Risk Reassessment Already Approved";
                this.type = "error";
                this.fireToastMsg();
            } else {

                this.loading = true;
                deleteAssessment({recordId : event.detail.row.Id})
                .then(result => {
                    this.loading = false;
                    this.title = 'Success!';
                    this.type = 'success';
                    this.message = 'Family Risk Reassessment record deleted successfully';
                    this.fireToastMsg();
                    this.doInit();
                    
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
            
        }
    }

    closeModal() {

        this.showCmp = false;
    }

    paginationHandler(event) {

        this.visibleData = [...event.detail.records];     
    }

    handleSave() {

        this.doInit();
        this.showCmp = false;
    }


}