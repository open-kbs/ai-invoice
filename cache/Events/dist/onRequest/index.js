/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __nccwpck_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "handler": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: ./actions.js
const getActions = (meta) => [
  // New action to handle invoice save requests
  [/\{"type":"SAVE_INVOICE_REQUEST"[\s\S]*\}/, async (match) => {
    try {
      // Parse the JSON content
      const requestData = JSON.parse(match[0]);
      
      // Simulate API call to store the invoice
      // In a real app, this would make an actual API call
      console.log("Saving invoice data:", requestData);
      
      // Demo API call simulation - would be replaced with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success response
      return {
        type: "SAVE_INVOICE_SUCCESS",
        message: "Invoice has been successfully saved",
        timestamp: new Date().toISOString(),
        invoiceId: "INV-" + Math.floor(Math.random() * 10000),
        ...meta
      };
    } catch (e) {
      console.error("Error saving invoice:", e);
      
      // Return error response
      return {
        type: "SAVE_INVOICE_FAILED",
        error: e.message || "Failed to save invoice",
        timestamp: new Date().toISOString(),
        ...meta
      };
    }
  }]
];
;// CONCATENATED MODULE: ./onRequest.js


const handler = async (event) => {
    const actions = getActions({});

    for (let [regex, action] of actions) {
        const lastMessage = event.payload.messages[event.payload.messages.length - 1].content;
        const match = lastMessage?.match(regex);
        if (match) return await action(match);
    }

    return { type: 'CONTINUE' }
};
module.exports = __webpack_exports__;
/******/ })()
;