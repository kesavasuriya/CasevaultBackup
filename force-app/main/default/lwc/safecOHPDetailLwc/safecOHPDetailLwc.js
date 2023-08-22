import { LightningElement, api, track } from 'lwc';
import UtilityBaseElement from 'c/utilityBaseLwc';
import linkrecords from '@salesforce/apex/AssessmentController.handleLinkrecords';
import getLinkrecords from '@salesforce/apex/AssessmentController.getLinkrecords';

export default class SafecOHPDetailLwc extends UtilityBaseElement {

    @api recordId;
    @api objectApiName;
    @api childList;
    @track assessmentRecord = {};
    @track removedLinkRecord = [];
    @track newChildList = [];

    readOnly = false;

    get assessmentRecordId() {
        if (this.objectApiName == 'Assessment__c') {
            return this.recordId;
        } else {
            this.assessmentRecord[this.objectApiName] = this.recordId;
            return '';
        }

    }

    connectedCallback() {
        this.doInit();

    }

    doInit() {

        if (this.objectApiName == 'Assessment__c') {
            getLinkrecords({ parentId: this.recordId })
                .then(res => {
                    this.childList = JSON.parse(res).childInputWarpList;
                })
        }
    }

    handleSubmit(event) {

        event.preventDefault();

        if (!this.onValidate()) {
            let fields = event.detail.fields;
            fields.Assessment_Type__c = 'SAFE-C-OHP';
            fields.OHP_Safety_Decision__c = this.assessmentRecord.OHP_Safety_Decision__c;
            fields.OHP_Signature_Obtained_Date__c = this.assessmentRecord.OHP_Signature_Obtained_Date__c;
            if (this.objectApiName != 'Assessment__c') {
                fields.Service_Case__c = this.recordId;
            }
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        } else {
            this.title = "Error!";
            this.type = "error";
            this.message = "Please complete the required fields!";
            this.fireToastMsg();
        }



    }

    handleSuccess(event) {

        this.title = "Success!";
        this.type = 'success';
        let linkRecordList = [];
        let deleteLinkRecordList = [];
        let jnLst = [];

        if (this.objectApiName == 'Assessment__c') {
            this.message = 'Record Updated Successfully!';
        } else {
            this.message = 'Record Created Successfully!';
            let linkRec;
            let linkRecordList = [];
            console.log('child',this.childList);
            for (let i = 0; i < this.childList.length; i++) {
                linkRec = {};
                linkRec.Assessment__c = event.detail.id;
                linkRec.Person__c = this.childList[i].childId;
                jnLst.push(linkRec);
            }

        }
        if (this.removedLinkRecord.length) {
            for (let i = 0; i < this.removedLinkRecord.length; i++) {

                if (this.removedLinkRecord[i].linkRecordId) {
                    let rec = {};
                    rec.Id = this.removedLinkRecord[i].linkRecordId;
                    deleteLinkRecordList.push(rec);
                }
            }
        }
        linkrecords({ createLinkRecords: JSON.stringify(jnLst), deleteLinkRecords: JSON.stringify(deleteLinkRecordList) })
            .then(res => {

            })

        this.fireToastMsg();

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);

    }

    handleLoad(event) {

        if (this.objectApiName == 'Assessment__c') {
            var record = event.detail.records;
            var fields = record[this.recordId].fields;
            if (fields.OHP_Safety_Decision__c) {
                this.assessmentRecord.OHP_Safety_Decision__c = fields.OHP_Safety_Decision__c.value;
            }
            if (fields.OHP_Signature_Obtained_Date__c) {
                this.assessmentRecord.OHP_Signature_Obtained_Date__c = fields.OHP_Signature_Obtained_Date__c.value;
            }

        }

    }

    handleChange(event) {

        this.assessmentRecord[event.target.name] = event.target.value;
    }

    handleChildChange(event) {

        this.newChildList = event.detail.addedChild;
        this.removedLinkRecord = event.detail.removedchild;
    }

    handleCancel() {

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);
    }

}