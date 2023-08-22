import { LightningElement, api, track } from 'lwc';
import getInit from '@salesforce/apex/AssessmentController.getFamilyInitialRiskAssessmentStageInfo';
import UtilityBaseElement from 'c/utilityBaseLwc';
import deleteAssessment from '@salesforce/apex/AssessmentController.deleteAssessment';
import { NavigationMixin } from 'lightning/navigation';

const actions = [
    { label: 'Delete', name: 'delete'}   
];
const dataColumn = [{ label: 'Assessment Name', type:  'button',typeAttributes: { 
                        variant :'base', name : 'name',
                                label:   { 
                            fieldName: 'Name' 
                        } }},
                    {label: 'Date Assessment Initiated', fieldName:'FRRE_Date_Assessment_Initiated__c',type: "date",
                    typeAttributes:{
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                    }},{label:'Approval Status',fieldName:'Approval_Status__c'},
                    { type: 'action', typeAttributes: { rowActions: actions} }];

export default class FamilyInitialRiskAssessmentListLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    @track visibleData = [];
    @track assessmentList = [];
    dataColumn = dataColumn;
    loading = false;
    showMsg = false;
    showChild = false;
    showCmp = false;


    get heading() {
        if(this.assessmentList) {
            return 'FAMILY INITIAL RISK ASSESSMENTS ('+this.assessmentList.length+')';
        } else {
            return 'FAMILY INITIAL RISK ASSESSMENTS';
        }
    }

    connectedCallback() {

        this.doInit();
    }

    doInit() {

        this.loading = true;
        this.showChild = false;
        getInit({recordId:this.recordId})
        .then(result => {

            let res = JSON.parse(result);
           
            if(res.familyRiskReassessmentRec.length > 0) {
                this.assessmentList = this.checkNamespaceApplicable(res.familyRiskReassessmentRec, false);
                this.showMsg = false;
                
            } else if(res.familyRiskReassessmentRec.length <= 0) {
                this.assessmentList = [];
                this.showMsg = true;
            }
            this.showChild = true;
            this.loading = false;

        }).catch(error => {

            this.loading = false;
            let errorMsg;
            this.title = "Error!";
            this.type = "error";
            if (error) {
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


    paginationHandler(event) {

        this.visibleData = [...event.detail.records]; 

    }

    closeModal() {
        this.showCmp = false;
    }

    handleSave(event) {

        console.log('List Event===');
        this.doInit();
        if(event.detail == 'Approval') {
            this.closeModal();
        }
        //this.closeModal();
    }

    handleRow(event) {

       
        if(event.detail.action.name == 'delete') {

            var deleteRow = event.detail.row;
            if(deleteRow.Approval_Status__c == 'Approved') {

                this.title = "Error!";
                this.message = "Record Already Approved";
                this.type = "error";
                this.fireToastMsg();
            } else {

                this.loading = true;
                deleteAssessment({recordId:deleteRow.Id})
                .then(result => {
    
                    this.title = "Success!";
                    this.type = "success";
                    this.message = 'Record deleted successfully';
                    this.fireToastMsg();
                    this.doInit();
                    this.loading = false;
                }).catch(error => {

                    this.loading = false;
                    let errorMsg;
                    this.title = "Error!";
                    this.type = "error";
                    if (error) {
                        let errors = this.reduceErrors(error);
                        errorMsg = errors.join('; ');
                    } else {
                        errorMsg = 'Unknown Error';
                    }
                    this.message = errorMsg;
                    this.fireToastMsg();
                })
            }
           
        } else if(event.detail.action.name == 'name') {

            console.log('rowId===',event.detail.row.Id);
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.detail.row.Id,
                    actionName: 'view'
                }
            });
        }
    }

}