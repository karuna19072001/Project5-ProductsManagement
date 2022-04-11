const isrequestBody = (requestBody) => {
    return Object.keys(requestBody).length > 0
}



const isValid = (value) => {
    if (typeof value === "undefined" || value === null)
        return false
    if (typeof value === "string" && value.trim().length === 0)
        return false
    else
        return true
}


module.exports.isrequestBody=isrequestBody
module.exports.isValid=isValid