import { LightningElement, api, track } from 'lwc';
import getAllPersons from '@salesforce/apex/GenogramRelationshipController.getAllPersons';
import getRelationRecord from '@salesforce/apex/GenogramRelationshipController.getRelationRecord';
import UtilityBaseElement from 'c/utilityBaseLwc';
import saveRelationship from '@salesforce/apex/GenogramRelationshipController.saveRelationship';
import { NavigationMixin } from 'lightning/navigation';
import UNKNOWN_LOGO from '@salesforce/resourceUrl/unknownpersonImg';

import { subscribe, unsubscribe, onError } from 'lightning/empApi';
export default class RelationshipGenogramLwc extends NavigationMixin(UtilityBaseElement) {

    @track personRecordList = [];
    @api recordId;
    @api borderSize;
    @api activeColor;
    @api inactiveColor;
    @track subscription = {};
    contactChannel = '/event/Refresh_Person__e';
    @api objectApiName;
    loading = false;
    @track parentRecord = {};
    @track relationshipRecords = [];
    @track circleRecords = [];
    @track collateralRecords = [];
    @track otherRelationships = [];
    @track personIds = [];
    @track relationshipRecord = {};
    @track showModal = false;
    relationshipValues = [];
    @track loading = false;
    showAllRelationship = false;
    @track otherRelations = [];
    @track childRemovalRecords = [];
    unknownImg = UNKNOWN_LOGO;

    get showGenogram() {
        if (this.personRecordList.length) {
            return true;
        } else {
            return false;
        }
    }
    connectedCallback() {

        document.documentElement.style.setProperty('--border', this.borderSize);
        document.documentElement.style.setProperty('--activecolor', this.activeColor);
        document.documentElement.style.setProperty('--inactivecolor', this.inactiveColor);
        subscribe(this.contactChannel, -1, this.refreshValue).then(response => {
            this.subscription = response;
        });
        this.doInit();

    }

    refreshValue = (res) => {

        //this.doInit();

    }

    doInit() {
        this.loading = true;
        getAllPersons({ recordId: this.recordId })
            .then(result => {

                let res = JSON.parse(result);
                this.collateralRecords = res.collateralRecords;
                this.relationshipValues = res.relationshipPicklist;
                if (res.contactList) {

                    this.personRecordList = this.checkNamespaceApplicable(res.contactList, false);

                    for (let i = 0; i < this.personRecordList.length; i++) {
                        this.personIds.push(this.personRecordList[i].Id);
                        let foundPa = res.programAssignmentRecords.find(ele => ele.Contact__c == this.personRecordList[i].Id);
                        if (foundPa) {
                            this.personRecordList[i].status = 'Active';
                        } else {
                            this.personRecordList[i].status = 'Inactive';
                        }
                    }
                    this.parentRecord = {};
                    this.parentRecord = this.personRecordList[0];
                    this.circleRecords.push.apply(this.circleRecords, this.personRecordList);
                    this.circleRecords.shift();
                    this.getRelationship(this.parentRecord.Id);

                }

                this.loading = false;
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            })
    }

    handleError(error) {

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
    }

    getRelationship(id) {

        const uniqueList = [...new Set(this.personIds)];
        getRelationRecord({ personId: id, recordId: this.recordId, personIds: uniqueList })
            .then(result => {

                let res = JSON.parse(result);

                this.relationshipRecords = [];
                this.childRemovalRecords = res.childRemovalRecords;

                let filterRemovals = [];
                filterRemovals = this.childRemovalRecords.filter(ele => ele.Service_Case__c == this.recordId);

                for (let r = 0; r < this.circleRecords.length; r++) {

                    if (this.circleRecords[r].Person_Image_URL__c) {

                        this.circleRecords[r].showImg = true;

                    } else {

                        this.circleRecords[r].showImg = false;
                    }

                    if (this.objectApiName == 'Case' || this.objectApiName == 'Investigation__c') {

                        this.circleRecords[r].border = 'relatedcircle inActivecolor';
                    } else {

                        let found = filterRemovals.find(ele => ele.Child__c == this.circleRecords[r].Id);

                        if (found && found.Removal_End_Date_Time__c == null) {

                            this.circleRecords[r].border = 'relatedcircle activecolor';

                        } else {

                            this.circleRecords[r].border = 'relatedcircle inActivecolor';
                        }

                    }

                    if (this.circleRecords[r].Date_of_Death__c) {

                        this.circleRecords[r].border = 'relatedcircle death';

                    }

                }
                if (res.otherRelationshipRecords) {

                    this.otherRelationships = res.otherRelationshipRecords;
                    console.log('ff',this.otherRelationships);

                    let relationLst = [];

                    for (let i = 0; i < this.otherRelationships.length; i++) {

                        let findEle = relationLst.find(ele => ele.Person_Related_To__c == this.otherRelationships[i].Person_Related_To__c);

                        let obj = {};

                        if (this.otherRelationships[i].Investigation__c) {

                            obj.Id = this.otherRelationships[i].Investigation__c;
                            obj.Name = this.otherRelationships[i].Investigation__r.Name;

                        } else if (this.otherRelationships[i].Service_Case__c) {

                            obj.Id = this.otherRelationships[i].Service_Case__c;
                            obj.Name = this.otherRelationships[i].Service_Case__r.Name;

                        } else if(this.otherRelationships[i].Victim__c){

                            obj.Id = this.otherRelationships[i].Victim__c;
                            obj.Name = this.otherRelationships[i].Victim__r.CaseNumber;

                        }

                        console.log('76767',this.otherRelationships[i]);

                        obj.Relationship_Values__c = this.otherRelationships[i].Relationship_Values__c;

                        if (this.objectApiName == 'Case' || this.objectApiName == 'Investigation__c') {

                            this.otherRelationships[i].circle = 'othercircle inActivecolor';

                        } else {

                            let findre = this.childRemovalRecords.find(ele => ele.Child__c == this.otherRelationships[i].Person_Related_To__c);

                            if (findre && findre.Removal_End_Date_Time__c == null) {

                                this.otherRelationships[i].circle = 'othercircle activecolor';

                            } else {

                                this.otherRelationships[i].circle = 'othercircle inActivecolor';

                            }
                        }

                        if (findEle) {

                            let index = relationLst.indexOf(findEle);

                            if (relationLst[index].hasOwnProperty('caseList')) {

                                relationLst[index].caseList.push(obj);

                            } else {

                                relationLst[index].caseList = [];
                                relationLst[index].caseList.push(obj);

                            }

                        } else {

                            let rec = this.otherRelationships[i];
                            rec.caseList = [];
                            rec.caseList.push(obj);
                            relationLst.push(rec);

                        }
                    }

                    this.otherRelations = relationLst;

                }



                if (res.relationshipRecords) {

                    this.relationshipRecords = res.relationshipRecords;


                    for (let i = 0; i < this.circleRecords.length; i++) {

                        for (let j = 0; j < this.relationshipRecords.length; j++) {

                            if (this.circleRecords[i].Id == this.relationshipRecords[j].Person_Related_To__c) {

                                this.circleRecords[i].Relationship_Values__c = this.relationshipRecords[j].Relationship_Values__c;

                            }

                        }

                    }
                }

                const uniqueSet = new Set(this.circleRecords.map(JSON.stringify));
                this.circleRecords = [];
                this.circleRecords = Array.from(uniqueSet).map(JSON.parse);

                let findCr = this.childRemovalRecords.find(ele => ele.Child__c == this.parentRecord.Id);

                if (findCr && findCr.Removal_End_Date_Time__c == null) {

                    this.parentRecord.border = 'parentcircle activecolor';

                } else {

                    this.parentRecord.border = 'parentcircle inActivecolor';

                }
                if (this.parentRecord.Date_of_Death__c) {

                    this.parentRecord.border = 'parentcircle death';

                }

            })
        this.loading = false;
    }

    handleRelationship(id) {


        let found = this.personRecordList.find(ele => ele.Id == id);
        this.parentRecord = {};

        this.parentRecord = found;
        this.circleRecords = [];

        this.circleRecords.push.apply(this.circleRecords, this.personRecordList);

        this.personRecordList.forEach(object => {
            delete object['Relationship_Values__c'];

        });

        this.circleRecords.splice(this.circleRecords.indexOf(found), 1);

        this.getRelationship(id);

    }

    handleClick(event) {

        this.loading = true;
        let id = event.currentTarget.dataset.id;
        this.handleRelationship(id);

    }

    handleSave() {

        this.relationshipRecord.Person__c = this.parentRecord.Id;

        if (this.objectApiName == 'Case') {

            this.relationshipRecord.Victim__c = this.recordId;

        } else {

            this.relationshipRecord[this.objectApiName] = this.recordId;

        }

        saveRelationship({ relationshipJSON: JSON.stringify(this.checkNamespaceApplicable(this.relationshipRecord, true)), recordId: this.recordId })
            .then(result => {

                this.showModal = false;
                this.title = 'Success!';
                this.type = 'success';
                this.message = 'Relationship saved';
                this.fireToastMsg();
                this.relationshipRecord = {};
                this.handleRelationship(this.parentRecord.Id);

            }).catch(error => {

                this.loading = false;
                this.handleError(error);

            })
    }

    handleError(error) {

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

    }

    hideModal() {

        this.showModal = false;

    }

    handleChange(event) {

        this.relationshipRecord[event.target.name] = event.target.value;

    }

    handleEdit(event) {

        let id = event.currentTarget.dataset.id;
        let found = this.relationshipRecords.find(ele => ele.Person_Related_To__c == id);
        this.relationshipRecord = {};
        this.relationshipRecord.Person_Related_To__c = id;
        if (found) {
            this.relationshipRecord = found;
        } else {
            this.relationshipRecord.Relationship_Values__c = '';
        }
        this.showModal = true;

    }

    handleViewAll(event) {

        this.showAllRelationship = event.target.checked;

    }

    handleNavigate(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.id,
                actionName: 'view'
            },
        });
    }

}