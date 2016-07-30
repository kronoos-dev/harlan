/* global module */

var validChecks = [
    /^218/,
    /^237/,
    /^756/,
    /^748/,
    /^003/,
    /^456/,
    /^001/,
    /^037/,
    /^004/,
    /^341/,
    /^643/,
    /^041/,
    /^422/,
    /^033/,
    /^634/,
    /^655/,
    /^021/,
    /^069/,
    /^104/,
    /^112/,
    /^084/,
    /^091/,
    /^090/,
    /^097/,
    /^087/,
    /^399/,
    /^136/
];

module.exports = function (cmc7) {
    for (var i in validChecks) {
        if (validChecks[i].test(cmc7))
            return true;
    }
    return false;
};
