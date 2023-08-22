import { LightningElement, api, track } from 'lwc';
import UtilityBaseElement from 'c/utilityBaseLwc';
import getLinkrecords from '@salesforce/apex/AssessmentController.getLinkrecords';
import getInit from '@salesforce/apex/AssessmentController.getSAFECDetails';
import handleSafetyPlan from '@salesforce/apex/AssessmentController.safetyPlanHandler';
import handleLinkrecords from '@salesforce/apex/AssessmentController.handleLinkrecords';
import handleEmail from '@salesforce/apex/AssessmentController.sendEmail';

import { NavigationMixin } from 'lightning/navigation';


const Influence1to16Fields = ['SAFEC_Caregiver_fails_to_protect__c', 'SAFEC_Caregiver_made_a_plausible_threat__c',
    'SAFEC_There_has_been_current_act__c', 'SAFEC_Child_sexual_abuse_is_suspected__c',
    'SAFEC_Caregiver_describes_the_child__c', 'SAFEC_Cargiver_s_suspected_or_observed__c',
    'SAFEC_Caregiver_s_emotional_instability__c', 'SAFEC_Caregiver_s_explanation__c',
    'SAFEC_Caregivers_justification_or_denial__c', 'SAFEC_Caregiver_does_not_or_refuse__c',
    'SAFEC_Domestic_violence_exists__c', 'SAFEC_Caregiver_does_not_meet_the_childs__c',
    'SAFEC_The_childs_whereabouts_are_unknown__c', 'SAFEC_The_child_has_special_needs__c',
    'SAFEC_The_child_is_extremely_anxious__c', 'SAFEC_The_child_is_unable_to_protect__c'
];



const Influence17to18Fields = ['SAFEC_Previous_services_to_the_caregiver__c', 'SAFEC_There_have_been_multiple_reports__c'];

const safetyListColumn = [
    { label: 'Danger Influence Number from the SAFE_C', fieldName: 'Question_Name__c', type: 'text', wrapText: 'true' },
    { label: 'Specific Danger Influence (Specifically Identify individuals and the issue)', fieldName: 'Specific_Danger_Influence__c', type: 'text', wrapText: 'true', editable: true },
    { label: 'Action Required (Clearly identify resourrces/individuals and/or actions that need to occur in order to help address the Danger influences)', fieldName: 'Action_Required__c', type: 'text', wrapText: 'true', editable: true },
    { label: 'Date to be completed', fieldName: 'Date_to_be_Completed__c', type: 'date', typeAttributes: { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: "true" }, editable: true },
    { label: 'Responsible Parties', fieldName: 'Responsible_Parties__c', type: 'text', wrapText: 'true', editable: true },
    { label: 'Re-evaluation Date', fieldName: 'Re_evaluation_Date__c', type: 'date', typeAttributes: { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: "true" }, editable: true }
];

const fieldLabel = ['1. Caregiver fails to protect the child from serious harm or threatened harm by others.(This may include failure to protect the child from physical abuse,sexual abuse, or neglect)',
    '2. Caregiver made a plausible threat to cause serious physical harm to the child or HAS caused serious physical harm to the child as indicated by : verbal thread of serious injury to the child OR threat of retaliation against the child OR caregiver fears he/she will harm the child.',
    '3. There has been current act of maltreatment since the last SAFE-C, Where excessive discipline or Physical force against the child, in which a weapon or object (e.g., gun, knife, cord, hanger, etc.,,) was used to inflict or threaten harm to the child.',
    '4. Child sexual abuse is suspected and circumstances suggest that the childs safety may be of immediate concern.',
    '5. Cargiver describes the child in predominately negative terms or acts towards the child in negative way that result in the child being a danger to self or others, acting out aggressively, or being severely withdrawn and/or suicidal.',
    '6. Cargivers suspected or observed substance abuse/use seriously impairs his/her ability to supervise, protect or care for the child is a drug exposed newborn/infant and the caregiver is unable or unwilling to corporate with treatment for substance abuse/use.',
    '7. Caregivers emotional instability, developmental status, lack of knowledge, Skills or motivation to parent, cognitive deficiency or behaviors resulting from mental or physical illness or disability, seriously impairs his/her current ability to supervise,protect or care for the child.',
    '8. Caregivers explanation for an injury to the child is questionable or inconsistent with the type of injury and nature of the injury suggests that the childs safety may be of immediate concern.',
    '9. Caregivers justification or denial of his/her own harmful behavior or the harmful behavior of others, places the child in immediate danger.',
    '10. Caregiver does not or refuse to provide supervision to protect the child, based on the childs age and there is no substitute caregiver to adequately plan for the childs supervision. and this places the child in immediate danger.',
    '11. Domestic violence exists in the home and poses an imminent danger of serious physical and or emotional harm to the child.',
    '12. Caregiver does not meet the childs current/imminent environment need for food or clothing or adequate shelter and there are no substitue caregiver who are capable of obtaining resource to meet the needs.',
    '13. The childs whereabouts are unkonwn, the family refuses access to the child or there is reason to belive that the family is about to flee.',
    '14. The child has special needs, behaviors or medical concerns and the cargiver does not meet the childs need for current/immediate medical,dental or mental healthcare.',
    '15. The child is extermely anxious or fearful about the current home environment.',
    '16. The child is unable to protect self and conditiions in the home indicate immediate danger.',
    '17. Previous services to the caregiver regarding similar harmful behaviors. resulted in to change in the caregivers behavisors towards the child(ren).',
    '18. There have been multiple reports from the community or since the last SAFE-C regarding this family, Where ther were previous concerns about the safety of the child(ren).'];
export default class SafecDetailLwc extends NavigationMixin(UtilityBaseElement) {

    @api recordId;
    @api objectApiName;
    @api childList;
    @track safecRec = {};
    readOnly = false;
    @track safecCommentsObj = {};
    Influence1to16Fields = Influence1to16Fields;
    Influence17to18Fields = Influence17to18Fields;
    @track safeResult;
    safetyListColumn = safetyListColumn;
    @track safetyPlanQesList = [];
    @track draftValues = [];
    fieldLabel = fieldLabel;
    checkSAFECList = [];
    @track deletingSafetyPlanQuesList = [];
    assessmentRecordId;
    cargiverNamesPicklist = [];
    @track newLinkRecord = [];
    @track caregiverOldLinkRecord = [];
    @track newChildList = [];
    @track selectedCaregivers = [];
    @track removedLinkRecord = [];
    @track signature;
    showSigneditModal = false;
    signatureField = '';
    @track isCaregiver = false;
    @track index;
    @track caregivers = [];
    todayDate;

    get showPrintButton() {
        if (this.objectApiName == 'Assessment__c') {
            return true;
        } else {
            return false;
        }

    }

    get enableUnsafe() {
        if (this.safecRec.SAFEC_Child_is_conditionally_Safe__c == true || this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c == true || this.safecRec.SAFEC_Child_is_UnSafe__c == true) {
            return false;
        } else {
            return true;
        }
    }

    get enableQuestionCheckbox() {
        if (this.safecRec.SAFEC_Child_is_UnSafe__c == true) {
            return false;
        } else {
            this.safecRec.Safety_Plan_Decision__c = '';
            return true;
        }
    }

    get disableSign() {
        if (this.safecRec.Safety_Plan_Decision__c == 'Caregiver did not agree to a safety plan' || this.safecRec.Safety_Plan_Decision__c == 'Danger cannot be addressed via safety plan') {
            this.safecRec.Caseworker_Signature_Date__c = this.todayDate;
            this.safecRec.Case_Worker_Signature__c = '';
            this.safecRec.workerSign = '';
            this.caregivers.forEach(ele => {
                ele.Signature_Date__c = this.todayDate;
                ele.Signature__c = '';
                ele.Signature = '';
            })
            return true;
        } else {
            return false;
        }
    }


    conditionCount() {

        let fieldsList = this.Influence17to18Fields.concat(this.Influence1to16Fields);
        let yescount = 0;
        let noCount = 0;
        let oneYes1to16;
        let oneYes17to18;
        fieldsList.forEach(fieldName => {
            if (this.safecRec[fieldName] == true || this.safecRec[fieldName] == 'Yes') {
                yescount += 1;
            } else if (this.safecRec[fieldName] == false || this.safecRec[fieldName] == 'No') {
                noCount += 1;
            }
            if (this.safecRec[fieldName] == true || this.safecRec[fieldName] == 'Yes' && this.Influence1to16Fields.includes(fieldName)) {
                oneYes1to16 = true;
            }
            if (this.safecRec[fieldName] == true || this.safecRec[fieldName] == 'Yes' && this.Influence17to18Fields.includes(fieldName)) {
                oneYes17to18 = true;
            }

        });

        if (yescount == 18) {

            this.decisionRule('SAFEC_Child_is_UnSafe__c');

        } else if (noCount == 18) {

            this.decisionRule('SAFEC_Child_is_Safe_Influences_1_18__c');

        } else if (oneYes17to18) {

            this.decisionRule('SAFEC_Child_is_Conditionally_Safe_17_16__c');

        } else if (oneYes1to16) {

            this.decisionRule('SAFEC_Child_is_conditionally_Safe__c');

        }


    }

    connectedCallback() {


        this.doInit();

    }

    doInit() {


        if (this.objectApiName == 'Assessment__c') {
            this.assessmentRecordId = this.recordId;
            getLinkrecords({ parentId: this.recordId })
                .then(res => {
                    this.childList = JSON.parse(res).childInputWarpList;
                })
                .catch(error => { this.errorHandler(error); })

        } else {
            this.safecRec[this.objectApiName] = this.recordId;
        }

        getInit({ recordId: this.recordId, objectApiName: this.objectApiName })
            .then(result => {
                let res = JSON.parse(result);
                this.caregivers = [];
                this.todayDate = res.todayDate;
                this.checkSAFECList = res.conditionPicklist;
                this.safetyPlanQesList = res.assessmentSafetyPlanList;
                this.cargiverNamesPicklist = res.caregiverNames;
                this.selectedCaregivers = [];
                this.caregivers = [];

                if (res.caregiverRecords && res.caregiverRecords.length) {
                    this.selectedCaregivers = res.caregiverRecords;
                    this.caregivers = res.caregiverRecords;
                    this.caregivers.forEach(person => {
                        person.personName = person.Person__r.Name;
                        if (person.Signature__c) {
                            let removeImageTag = person.Signature__c.replaceAll("&amp;", "&");
                            person.Signature = removeImageTag.substring(10, removeImageTag.length - 8);
                        }

                    })
                } else {
                    this.selectedCaregivers = [];
                    this.caregivers = [];
                }

                if (res.caregiverRecords) {
                    this.caregiverOldLinkRecord = [];
                    res.caregiverRecords.forEach(linkRec => {
                        this.caregiverOldLinkRecord.push(linkRec.Person__c);
                    })
                }
                this.checkSAFECList.splice(0, 1);
                if (res.safecRecord) {
                    this.safecRec = res.safecRecord;

                    if (this.safecRec.Case_Worker_Signature__c) {
                        let removeImageTag = this.safecRec.Case_Worker_Signature__c.replaceAll("&amp;", "&");
                        this.safecRec.workerSign = removeImageTag.substring(10, removeImageTag.length - 8);
                    }
                    if (this.safecRec.CreatedBy) {
                        this.safecRec.caseworker = this.safecRec.CreatedBy.Name;
                    } else {
                        this.safecRec.caseworker = res.userName;
                    }

                    if (this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c) {
                        this.decisionRule('SAFEC_Child_is_Safe_Influences_1_18__c');
                    } else if (this.safecRec.SAFEC_Child_is_conditionally_Safe__c) {
                        this.decisionRule('SAFEC_Child_is_conditionally_Safe__c');
                    } else if (this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c) {
                        this.decisionRule('SAFEC_Child_is_Conditionally_Safe_17_16__c');
                    } else if (this.safecRec.SAFEC_Child_is_UnSafe__c) {
                        this.decisionRule('SAFEC_Child_is_UnSafe__c');
                    }
                    let fieldsList = this.Influence17to18Fields.concat(this.Influence1to16Fields);

                    fieldsList.forEach(fieldName => {
                        if (this.safecRec[fieldName] && this.safecRec[fieldName] == 'Yes') {
                            this.safecRec[fieldName] = true;
                        } else if (this.safecRec[fieldName]) {
                            this.safecRec[fieldName] = false;
                        }
                    });
                }
                //this.conditionCount();
            })
            .catch(error => {

                this.errorHandler(error);
            })
    }

    handleChildChange(event) {

        this.newChildList = event.detail.addedChild;
        this.removedLinkRecord = event.detail.removedchild;
    }


    handleSubmit(event) {

        event.preventDefault();


        if (!this.onValidate()) {

            let fieldsList = this.Influence17to18Fields.concat(this.Influence1to16Fields);
            fieldsList.forEach(fieldName => {
                if (this.safecRec[fieldName] == true) {
                    this.safecRec[fieldName] = 'Yes';
                } else if (this.safecRec[fieldName] == false) {
                    this.safecRec[fieldName] = 'No';
                }
            });


            let fields = event.detail.fields;
            fields.Assessment_Type__c = 'SAFE-C';

            if (this.objectApiName == 'Service_Case__c') {
                fields.Service_Case__c = this.recordId;
            } else if (this.objectApiName == 'Investigation__c') {
                fields.Investigation__c = this.recordId;
            }

            fields.SAFEC_Date_Time_Assessment_Initiated__c = this.safecRec.SAFEC_Date_Time_Assessment_Initiated__c;
            fields.SAFEC_Date_Time_of_Last_Safety_Plan__c = this.safecRec.SAFEC_Date_Time_of_Last_Safety_Plan__c;
            fields.Safety_Assessment_Approval_Date_Time__c = this.safecRec.Safety_Assessment_Approval_Date_Time__c;
            fields.Safety_Assessment_Completion_Date_Time__c = this.safecRec.Safety_Assessment_Completion_Date_Time__c;
            fields.SAFEC_Decision_Check__c = this.safecRec.SAFEC_Decision_Check__c;
            fields.SAFEC_Head_of_Household__c = this.safecRec.SAFEC_Head_of_Household__c;
            fields.SAFEC_CPS_Case_ID__c = this.safecRec.SAFEC_CPS_Case_ID__c;
            fields.Case_Worker_Signature__c = this.safecRec.Case_Worker_Signature__c;
            fields.Caseworker_Signature_Date__c = this.safecRec.Caseworker_Signature_Date__c;
            fields.SAFEC_Child_is_Safe_Influences_1_18__c = this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c;
            fields.SAFEC_Child_is_conditionally_Safe__c = this.safecRec.SAFEC_Child_is_conditionally_Safe__c;
            fields.SAFEC_Child_is_Conditionally_Safe_17_16__c = this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c;
            fields.SAFEC_Child_is_UnSafe__c = this.safecRec.SAFEC_Child_is_UnSafe__c;
            fields.Safety_Plan_Decision__c = this.safecRec.Safety_Plan_Decision__c;

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
        let linkRec;
        let linkRecordList = [];
        let updateLinkRecords = [];
        let deleteLinkRecordList = [];

        if (this.objectApiName == 'Assessment__c') {

            this.message = 'Record Updated Successfully!';
        } else {

            this.message = 'Record Created Successfully!';

            for (let i = 0; i < this.childList.length; i++) {
                linkRec = {};
                linkRec.Assessment__c = event.detail.id;
                linkRec.Person__c = this.childList[i].childId;
                linkRecordList.push(linkRec);
            }
        }

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);

        if (this.caregivers.length) {

            this.caregivers.forEach(object => {
                delete object['personName'];
                delete object['Signature'];
                if (object.Id) {
                    updateLinkRecords.push(object);
                } else {
                    object.Assessment__c = event.detail.id;
                    linkRecordList.push(object);
                }
            });
        }

        if (this.selectedCaregivers.length) {

            this.selectedCaregivers.forEach(selected => {
                let found = this.caregivers.find(ele => ele.Person__c == selected.Person__c);
                if (!found) {
                    deleteLinkRecordList.push(selected);
                }
            });
        }

        if (this.removedLinkRecord.length) {
            let rec = {};
            this.removedLinkRecord.forEach(element => {
                rec = {};
                rec.Id = element.linkRecordId
                deleteLinkRecordList.push(rec);
            });
        }
        handleLinkrecords({ createLinkRecords: JSON.stringify(linkRecordList), deleteLinkRecords: JSON.stringify(deleteLinkRecordList), updateLinkRecords: JSON.stringify(updateLinkRecords) })
            .then(res => {
                handleSafetyPlan({ assessmentId: event.detail.id, safetyPlanQesDataJSON: JSON.stringify(this.checkNamespaceApplicable(this.safetyPlanQesList, true)), deletingSafetyPlanJSON: JSON.stringify(this.checkNamespaceApplicable(this.deletingSafetyPlanQuesList, true)) }).then(result => {
                    this.doInit();

                    this.fireToastMsg();
                })
                    .catch(error => {

                        this.errorHandler(error);
                    })
            }).catch(error => {

                this.errorHandler(error);
            })




    }



    handleInputFieldChange(event) {

        let fieldName = event.currentTarget.dataset.name;

        if (event.target.value === 'Yes') {

            this.safecRec[fieldName] = true;
            let safetyPlanQesListData = Object.assign([], this.safetyPlanQesList);

            safetyPlanQesListData.push({
                Danger_Influence_Qeustion__c: fieldName,
                Question_Name__c: this.fieldLabel[event.target.dataset.index - 1],
                Index__c: event.target.dataset.index
            });
            this.safetyPlanQesList = safetyPlanQesListData;

        } else if (event.target.value === 'No') {

            this.safecRec[fieldName] = false;
            if (this.safetyPlanQesList) {
                let foundSafetyDecision = this.safetyPlanQesList.find(ele => ele.Index__c == event.currentTarget.dataset.index);
                if (foundSafetyDecision) {
                    const rowIndex = this.safetyPlanQesList.indexOf(foundSafetyDecision);
                    this.safetyPlanQesList.splice(rowIndex, 1);
                    this.safetyPlanQesList = [...this.safetyPlanQesList];
                    if (foundSafetyDecision.Id) {
                        this.deletingSafetyPlanQuesList.push(foundSafetyDecision);
                    }
                }
            }

        } else {

            this.safecRec[fieldName] = false;
            let foundSafetyDecision = this.safetyPlanQesList.find(ele => ele.Index__c == event.currentTarget.dataset.index);
            if (foundSafetyDecision) {
                const rowIndex = this.safetyPlanQesList.indexOf(foundSafetyDecision);
                this.safetyPlanQesList.splice(rowIndex, 1);
                this.safetyPlanQesList = [...this.safetyPlanQesList];
                this.deletingSafetyPlanQuesList.push(foundSafetyDecision);
                if (foundSafetyDecision.Id) {
                    this.deletingSafetyPlanQuesList.push(foundSafetyDecision);
                }
            }
        }
        this.conditionCount();

    }

    handlePlanChange(event) {
        let index = event.currentTarget.dataset.index;
        this.safetyPlanQesList[index][event.target.name] = event.target.value;
    }



    checkSafetyListRequired() {

        let returnValue = true;
        if (this.safecRec.SAFEC_Decision_Check__c == 'Child is Safe (Influences 1-18 Marked No)' || this.safecRec.SAFEC_Child_currently_has_Out_of_Home__c == true || this.safecRec.SAFEC_Caregiver_did_not_agree_to_safety__c == true || this.safecRec.SAFEC_Danger_cannot_be_addressed_via__c == true) {

            returnValue = true;

        } else if (this.safetyPlanQesList.length == 0) {
            returnValue = true;

        } else {

            for (let i = 0; i < this.safetyPlanQesList.length; i++) {
                const currentIteration = this.safetyPlanQesList[i];
                if (returnValue == true && currentIteration.Question_Name__c && currentIteration.Specific_Danger_Influence__c && currentIteration.Action_Required__c &&
                    currentIteration.Date_to_be_Completed__c && currentIteration.Responsible_Parties__c && currentIteration.Re_evaluation_Date__c) {
                    returnValue = true;
                } else {
                    returnValue = false;
                }
            }
        }

        return returnValue;
    }

    handleChange(event) {

        if (event.target.name == 'link_object') {
            let value = [];
            value = event.target.value;
            this.caregivers = [];
            for (let i = 0; i < value.length; i++) {
                let foundElement = this.selectedCaregivers.find(ele => ele.Person__c == value[i]);
                let foundInCaregiver = this.caregivers.find(ele => ele.Person__c == value[i]);

                if (!foundElement && !foundInCaregiver) {
                    let linkRec = {};
                    linkRec.Person__c = value[i];
                    linkRec.Is_Caregiver__c = true;
                    linkRec.Signature = '';
                    linkRec.personName = (this.cargiverNamesPicklist.find(ele => ele.value == value[i])).label;
                    this.caregivers.push(linkRec);

                } else if (foundElement) {
                    this.caregivers.push(foundElement);
                }
            }

        } else {

            this.safecRec[event.target.name] = event.target.value;
            if (event.target.value == 'Danger cannot be addressed via safety plan') {
                this.safetyPlanQesList.forEach(rec => {
                    if (rec.Id) {
                        this.deletingSafetyPlanQuesList.push(rec);
                    }
                })
                this.safetyPlanQesList = [];
            }

        }

    }

    errorHandler(error) {

        let errorMsg;
        this.title = "Error!";
        this.type = "error";
        if (error) {
            let errors = this.reduceErrors(error);
            errorMsg = errors.join('; ');
        } else {
            errorMsg = 'Unknown Error';
        }
        this.loading = false;
        this.message = errorMsg;
        this.fireToastMsg();
    }
    handleCancel() {

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);
    }
    handlePrint() {
        const urlWithParameters = '/apex/SafetyPlanPdf?id=' + this.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: urlWithParameters
            }
        }, false);
    }

    handleSend() {
        handleEmail({ personList: this.caregiverOldLinkRecord, assessmentId: this.recordId })
            .then(res => {
                this.title = "Success!";
                this.type = "success";
                this.message = "Email was send to Client";
                this.fireToastMsg();

            })


    }

    handleSignature(event) {
        this.signature = event.detail;

    }

    closeSignatureModal() {
        this.showSigneditModal = false;
        this.signature = '';
        this.signatureField = '';
    }

    handleEdit(event) {
        this.showSigneditModal = true;
        this.signature = '';
        this.isCaregiver = event.currentTarget.dataset.caregiver;
        this.signatureField = event.currentTarget.dataset.name;
        this.index = event.currentTarget.dataset.index;


    }

    handleAddSign() {

        this.template.querySelector('c-signature-lwc').handleSign();
        if (this.isCaregiver == 'false') {
            this.safecRec[this.signatureField] = this.signature;
            this.safecRec.workerSign = this.signature.substring(10, this.signature.length - 2);
            this.safecRec.Caseworker_Signature_Date__c = this.todayDate;
        } else {
            this.caregivers[this.index][this.signatureField] = this.signature;
            this.caregivers[this.index]['Signature'] = this.signature.substring(10, this.signature.length - 2);
            this.caregivers[this.index]['Signature_Date__c'] = this.todayDate;
        }

        this.signature = '';
        this.signatureField = '';
        this.showSigneditModal = false;
    }

    handleDecision(event) {
        this.safecRec[event.target.name] = event.target.checked;
        this.decisionRule(event.target.name);

    }

    decisionRule(fieldName) {

        if (fieldName == 'SAFEC_Child_is_UnSafe__c') {
            this.safecRec.SAFEC_Child_is_UnSafe__c = true;
            this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c = false;
            this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c = false;
            this.safecRec.SAFEC_Child_is_conditionally_Safe__c = false;
        } else if (fieldName == 'SAFEC_Child_is_Safe_Influences_1_18__c') {
            this.safecRec.SAFEC_Child_is_UnSafe__c = false;
            this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c = true;
            this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c = false;
            this.safecRec.SAFEC_Child_is_conditionally_Safe__c = false;
        } else if (fieldName == 'SAFEC_Child_is_Conditionally_Safe_17_16__c') {
            this.safecRec.SAFEC_Child_is_UnSafe__c = false;
            this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c = false;
            this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c = true;
            this.safecRec.SAFEC_Child_is_conditionally_Safe__c = false;
        } else if (fieldName == 'SAFEC_Child_is_conditionally_Safe__c') {
            this.safecRec.SAFEC_Child_is_UnSafe__c = false;
            this.safecRec.SAFEC_Child_is_Safe_Influences_1_18__c = false;
            this.safecRec.SAFEC_Child_is_Conditionally_Safe_17_16__c = false;
            this.safecRec.SAFEC_Child_is_conditionally_Safe__c = true;
        }
    }
}