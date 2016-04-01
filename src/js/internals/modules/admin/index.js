module.exports = function (controller) {
    require("./autocomplete")(controller);
    require("./instant-search")(controller);
    require("./create-company")(controller);
    require("./view-company")(controller);
    require("./change-password")(controller);
    require("./change-address")(controller);
    require("./change-contract")(controller);
    require("./change-company")(controller);
};
