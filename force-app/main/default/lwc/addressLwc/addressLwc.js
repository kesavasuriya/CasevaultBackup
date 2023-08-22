import { LightningElement, api, track, wire } from 'lwc';
import getRecord from '@salesforce/apex/RelatedListController.getRecords';
import UtilityBaseElement from 'c/utilityBaseLwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAddress from '@salesforce/apex/AddressController.getAddress';
import getCounty from '@salesforce/apex/AddressController.getCounty';

const fields = ['Id', 'Name', 'Current_Address__c', 'Address_Line_2__c', 'Address_Line_1__c', 'City__c', 'County__c', 'Country__c','State__c', 'ZipCode__c', 'Start_Date__c', 'End_Date__c', 'Address_Type__c', 'Known_danger_at_address__c', 'Comments__c'];
const queryDetail = {
    fieldValue: fields,
    objectApiName: 'Contact_Address__c',
    filterValue: 'Contact__c='
};

const actions = [{ label: 'Edit', name: 'edit' },
{ label: 'Delete', name: 'delete' },
];

const columns =
    [
        // { label: 'Address Name', fieldName: 'name', type: 'string', wrapText: false },

        { label: 'Address Name', type: 'button', wrapText: true, typeAttributes: { label: { fieldName: 'address' }, name: 'edit', variant: 'base' } },
        { label: 'Current Address', fieldName: 'Current_Address__c', wrapText: true, type: 'boolean' },
        { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date', wrapText: true, typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
        { label: 'End  Date', fieldName: 'End_Date__c', type: 'date', wrapText: true, typeAttributes: { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" } },
        { type: 'action', typeAttributes: { rowActions: actions } }
    ];
export default class AddressLwc extends UtilityBaseElement {

    @api recordId;
    @api objectApiName;
    @track parentId;
    @track addressRecord = {};
    @track addressRecordList = [];
    @track response = [];
    @track showTable = false;
    @track addressId = '';
    columns = columns;
    @track showAddressModal = false;
    @track addressPickList = [];
    @track addressList = [];
    @track selectedAddress;
    isLoading = false;

    @track queryDetails = JSON.stringify(queryDetail);
    @wire(getRecord, { recordId: '$recordId', queryDetails: '$queryDetails' })
    relateRecords(response) {
        this.response = response;
        if (response.data) {
            this.addressRecordList = JSON.parse(JSON.stringify(response.data));
            for (let i = 0; i < this.addressRecordList.length; i++) {
                if (this.addressRecordList[i].Address_Line_1__c) {
                    this.addressRecordList[i].street = this.addressRecordList[i].Address_Line_1__c;
                }
                if (this.addressRecordList[i].Address_Line_2__c) {
                    this.addressRecordList[i].street += " " + this.addressRecordList[i].Address_Line_2__c;
                }
                if (this.addressRecordList[i].County__c) {
                    this.addressRecordList[i].street += " " + this.addressRecordList[i].County__c;
                }
                
                
            }


        } else if (response.error) {
            console.log(response.error);
            this.loading = false;
            this.title = "Error!";
            this.type = "error";
            this.message = response.error;
            this.fireToastMsg();
        }
    }

    connectedCallback() {

        if (window.location.href) {

            let decodedUrl = decodeURIComponent(window.location.href);
            let separatedParam = decodedUrl.split('/');
            if (separatedParam[separatedParam.indexOf('Case')]) {
                this.parentId = separatedParam[separatedParam.indexOf('Case') + 1];

            } else if (separatedParam[separatedParam.indexOf('Service_Case__c')]) {
                this.parentId = separatedParam[separatedParam.indexOf('Service_Case__c') + 1];

            } else if (separatedParam[separatedParam.indexOf('Investigation__c')]) {
                this.parentId = separatedParam[separatedParam.indexOf('Investigation__c') + 1];

            }
            this.doInit();
        }
    }

    doInit() {
        if (this.parentId) {
            this.isLoading = true;
            getAddress({ recordId: this.parentId, objectApiName: 'None' })
                .then(result => {
                    let res = JSON.parse(result);
                    this.addressList = res.addressList;
                    let address = '';
                    let addressRec = {};
                    for (let i = 0; i < this.addressList.length; i++) {
                        addressRec = {};
                        address = '';
                        address = this.addressList[i].Contact__r.Name;
                        address = (this.addressList[i].Address_Line_1__c ? address + ',' + this.addressList[i].Address_Line_1__c : address);
                        address = (this.addressList[i].Address_Line_2__c ? address + ',' + this.addressList[i].Address_Line_2__c : address);
                        address = (this.addressList[i].City__c ? address + ',' + this.addressList[i].City__c : address);
                        address = (this.addressList[i].State__c ? address + ',' + this.addressList[i].State__c : address);
                        address = (this.addressList[i].County__c ? address + ',' + this.addressList[i].County__c : address);
                        address = (this.addressList[i].Country__c ? address + ',' + this.addressList[i].Country__c : address);
                        address = (this.addressList[i].ZipCode__c ? address + ',' + this.addressList[i].ZipCode__c : address);
                        addressRec.label = address;
                        addressRec.value = i.toString();
                        this.addressPickList.push(addressRec);
                    }
                    this.isLoading = false;
                })
        }
    }


    addressInputChange(event) {


            this.addressRecord.Address_Line_1__c = event.target.street;
            this.addressRecord.City__c = event.target.city;
            this.addressRecord.State__c = event.target.province;
            this.addressRecord.Country__c = event.target.country;
            this.addressRecord.ZipCode__c = event.target.postalCode;

        let addressObj = { street : event.target.street,
                            city : event.target.city,
                            state : event.target.province,
                            candidates : 1

        };      
        let requestLst =  [];
        requestLst.push(addressObj);
        getCounty({addressRequest : JSON.stringify(requestLst)})
        .then(result =>{
            let res = JSON.parse(result);
            if(res[0].metadata.county_name) {
                this.addressRecord.County__c = res[0].metadata.county_name;
            } else {
                this.addressRecord.County__c ='';
            }
        })

       

    }

    handleSubmit(event) {

        if (!this.onValidate()) {
            this.isLoading = true;
            let fields = event.detail.fields;
            event.preventDefault();
            fields.Contact__c = this.recordId;
            fields.Address_Line_1__c = this.addressRecord.Address_Line_1__c;
            fields.City__c = this.addressRecord.City__c;
            fields.State__c = this.addressRecord.State__c;
            fields.County__c = this.addressRecord.County__c;
            fields.Country__c = this.addressRecord.Country__c;
            fields.ZipCode__c = this.addressRecord.ZipCode__c;
            fields.Start_Date__c = this.addressRecord.Start_Date__c;
            fields.End_Date__c = this.addressRecord.End_Date__c;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
            this.showAddressModal = false;
        } else {
            this.title = "Error!";
            this.type = "error";
            this.message = "Required fields are missing";
            this.fireToastMsg();
        }

    }

    handleSuccess(event) {

        this.title = 'Success!';
        this.type = 'success';
        this.message = 'Record Action Successfully';
        this.fireToastMsg();

        this.addressRecord = {};
        this.addressId = '';
        this.isLoading = false;
        refreshApex(this.response);
    }

    handleError(event) {

        this.title = "Error!";
        this.type = "error";
        this.message = event.detail.detail;
        this.fireToastMsg();
    }

    handleAddAddress(event) {

        this.addressRecord = {};
        this.addressId = '';
        this.showAddressModal = true;

    }

    closeAddressModal(event) {
        this.showAddressModal = false;
        this.addressRecord = {};
        this.addressId = '';
    }

    handleRowAction(event) {
        let action = event.currentTarget.dataset.action;
        let recId = event.currentTarget.dataset.id;
        let index = event.currentTarget.dataset.rownumber;
        switch (action) {
            case 'edit':
                this.addressId = recId;
                this.addressRecord = this.addressRecordList[index];
                this.showAddressModal = true;
                break;

            case 'delete':
                deleteRecord(recId)
                    .then(() => {
                        this.type = 'success';
                        this.title = 'Success!';
                        this.message = 'Record Deleted Successfully!';
                        this.fireToastMsg();
                        refreshApex(this.response);

                    })
                    .catch(error => {

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

                break;
        };
    }

    handleChange(event) {

        this.addressRecord[event.target.name] = event.target.value;
    }

    handleSelection(event) {
        let address = this.addressList[event.target.value];
        this.selectedAddress = event.target.value;

        this.addressRecord.Address_Line_1__c = address.Address_Line_1__c;
        this.addressRecord.Address_Line_2__c = address.Address_Line_2__c;
        this.addressRecord.City__c = address.City__c;
        this.addressRecord.State__c = address.State__c;
        this.addressRecord.County__c = address.County__c;
        this.addressRecord.Country__c = address.Country__c;
        this.addressRecord.ZipCode__c = address.ZipCode__c;
        this.addressRecord.Address_Type__c = address.Address_Type__c;
        this.addressRecord.Known_danger_at_address__c = address.Known_danger_at_address__c;
        this.addressRecord.Comments__c = address.Comments__c;

    }


}