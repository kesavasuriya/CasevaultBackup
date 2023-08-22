import { LightningElement, api } from 'lwc';
import getCounty from '@salesforce/apex/AddressController.getCounty';

export default class AddressValidationLwc extends LightningElement {

    @api address1;
    @api address2;
    @api street;
    @api county;
    @api state;
    @api zipcode;
    @api city;
    @api postalcode;
    @api country;

    handleChange(event) {

        if (event.target.name == 'address') {
            this.address1 = event.target.street;
            this.city = event.target.city;
            this.country = event.target.country;
            this.state = event.target.province;
            this.postalcode = event.target.postalCode;
            this.zipcode = event.target.postalCode;

            let addressObj = {
                street: event.target.street,
                city: event.target.city,
                state: event.target.province,
                candidates: 1

            };
            let requestLst = [];
            requestLst.push(addressObj);
            getCounty({ addressRequest: JSON.stringify(requestLst) })
                .then(result => {
                    let res = JSON.parse(result);
                    this.county = res[0].metadata.county_name;
                })

        } else if(event.target.name == 'county') {
            this.county = event.target.value;
            
        } else {
            this.address2 = event.target.value;
        }
    }
}