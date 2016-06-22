/* USER CASE of CMC7Validator */

import { CMC7Validator } from './cmc7-validator';

module.exports = (controller) => {

    controller.registerCall("debug::CMC7Validator", () => {
        let validator = new CMC7Validator('341026200184356765450006083914');
        // Verify if validator is valid
        console.log('cmc7 is valid?', validator.isValid());
        debugger;
    });

    controller.call("debug::CMC7Validator");

};
