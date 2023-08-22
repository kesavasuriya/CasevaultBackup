import { LightningElement, api, track } from 'lwc';
import UtilityBaseElement from 'c/utilityBaseLwc';
import getInit from '@salesforce/apex/IntakeCustomController.getApprovalOverride';

export default class ApprovalOverrideLwc extends UtilityBaseElement {

    @api recordId;
    @track intakeRec = {};
    @track UserDetails = {};
    @track currentDateTime;
    @track todayDate;
    @track county = '';
    disableFields = false;
    @track reasonpicklist = [];
    @track reasonValue = [];



    connectedCallback() {
        getInit({ intakeId: this.recordId })
            .then(result => {
                let res = JSON.parse(result);
                this.intakeRec = res.intakeRec;
                this.UserDetails = res.userDetails;
                this.currentDateTime = res.currentDateTime;
                this.reasonpicklist = res.reasonpicklist;
                this.todayDate = res.todayDate;
                this.reasonpicklist.splice(0, 1);
                if (this.intakeRec.Reason_for_intake_override__c) {
                    this.reasonValue = this.intakeRec.Reason_for_intake_override__c.split(';');
                }
                if (this.intakeRec.Override_User__c && this.intakeRec.Override_User__r.county__c) {
                    this.county = this.intakeRec.Override_User__r.county__c;
                }
                if (this.intakeRec.Approved_Date__c && (res.numberOfDays <= 5 || this.todayDate == this.intakeRec.Approved_Date__c) && this.UserDetails.Profile.Name != 'Casevault User') {
                    this.disableFields = false;
                } else {
                    this.disableFields = true;
                }
            })
    }

    handleSubmit(event) {

        event.preventDefault();
        const fields = event.detail.fields;

        fields.Override_User__c = this.UserDetails.Id;
        fields.Override_DatetTime__c = this.currentDateTime;
        fields.Reason_for_intake_override__c = this.intakeRec.Reason_for_intake_override__c;
        this.template.querySelector('lightning-record-edit-form').submit(fields);

    }

    handleSuccess(event) {

        this.title = 'Success!';
        this.type = 'success';
        this.message = 'Record Action Successfully';
        this.fireToastMsg();
    }

    handleChange(event) {
        let value = event.target.value;
        this.intakeRec.Reason_for_intake_override__c = value.join(';');
    }


}