import { LightningElement, api, track } from 'lwc';
import getServicecasePaymentInfo from '@salesforce/apex/ServiceCaseController.getServicecasePayment';

const paymentColumns = [
    { label: 'Type of payments', fieldName: 'typeofpayment', type: 'string', tabIndex : '-1' },
    { label: 'Name the vendor or provider paid ', fieldName: 'Name', type: 'string', fixedWidth: 250 },
    {
        label: "Date of payment", fieldName: "dateofpayment", type: "date-local",
        typeAttributes: {
            month: "2-digit",
            day: "2-digit"
        }
    },
    { label: 'Payment purpose', fieldName: 'paymentpurpose', type: 'string' },
    { label: 'Total amount', fieldName: 'totalamount', type: 'number' },
    { label: 'Worker Name', fieldName: 'worker', type: 'string' }
];

export default class ServicecasePaymentLwc extends LightningElement {

    @api recordId;
    @track servicecaseRecord = {};
    @track personsRecord = [];
    @track payments = [];
    paymentColumns = paymentColumns;
    @track placementRecords = [];
    todayDate;
    @track totalAmount = 0;

    connectedCallback() {
        getServicecasePaymentInfo({ recordId: this.recordId })
            .then(result => {
                let res = JSON.parse(result);
                console.log('resklk555', res);
                this.servicecaseRecord = res.serviceCaseRecord;
                this.personsRecord = res.personRecords;
                this.placementRecords = res.placementRecords;
                this.payments = res.paymentRecords;
                if (this.servicecaseRecord.Head_of_Household__c) {
                    this.servicecaseRecord.headofhousehold = this.servicecaseRecord.Head_of_Household__r.Name;
                }
                this.todayDate = res.todayDate;
                if (res.personRecords) {
                    if (res.placementRecords) {
                        //let paymentRec = {};
                        for (let i = 0; i < this.personsRecord.length; i++) {
                            //paymentRec = {};
                            let foundPlacement = {};
                            foundPlacement = this.placementRecords.find(ele => ele.Child__c == this.personsRecord[i].Person__c);
                            if (foundPlacement) {
                                let foundpayment = [];
                                foundpayment = this.payments.filter(ele => ele.Placement__c == foundPlacement.Id);
                                if (foundpayment) {
                                    for(let j=0; j<foundpayment.length;j++) {
                                        let paymentRec = {};
                                        paymentRec.typeofpayment = 'Provider';
                                        paymentRec.paymentpurpose = foundPlacement.Placement_Structure__c;
                                        paymentRec.Name = foundPlacement.Provider__r.Name;
                                        paymentRec.worker = foundPlacement.CreatedBy.Name;

                                        paymentRec.totalamount = foundpayment[j].Payment_Amount__c;
                                        paymentRec.dateofpayment = foundpayment[j].Payment_Date__c;
                                        this.totalAmount += foundpayment[j].Payment_Amount__c;
                                        this.totalAmount = Math.floor(this.totalAmount*100)/100;
                                        if(this.personsRecord[i].hasOwnProperty('childPayment')) {
                                            this.personsRecord[i].childPayment += foundpayment[j].Payment_Amount__c;
                                            this.personsRecord[i].childPayment = Math.floor(this.personsRecord[i].childPayment*100)/100
                                        } else {
                                            this.personsRecord[i].childPayment = 0;
                                            this.personsRecord[i].childPayment = foundpayment[j].Payment_Amount__c;
                                            this.personsRecord[i].childPayment = Math.floor(this.personsRecord[i].childPayment*100)/100

                                        }

                                        if (this.personsRecord[i].hasOwnProperty('paymentsLst')) {

                                            this.personsRecord[i].paymentsLst.push(paymentRec);
                                        } else {
                                            this.personsRecord[i].paymentsLst = [];
                                            this.personsRecord[i].paymentsLst.push(paymentRec);
                                        }
                                    }
                                   

                                }

                            }
                                                        
                        }

                    }
                    console.log('result',this.personsRecord);
                }

            })
    }

}