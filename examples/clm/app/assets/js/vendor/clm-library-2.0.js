// JavaScript Library for CLM v2.0
// http://veevasystems.com
// 
// Copyright © 2013 Veeva Systems, Inc. All rights reserved.
//
// Updates to the JavaScript Library will be posted to the Veeva CRM Customer Support Portal.
//
// The com.veeva.clm namespace should be utilized when calling the JavaScript functions.
//          Example: "com.veeva.clm.getDataForCurrentObject("Account","ID", myAccountID);"
//
// JavaScript library will return in the following format:
// {sucess:true, obj_name:[{"Id":"0001929312"}, {record2}, ...]}
// or
// {success:false, code:####, message:"message_text"}
// #### - denotes the specific error code (1000 is from the underlying API, 2000 is from the JavaScript library)
//          2000 - Callback function is missing
//          2001 - Callback is not a JavaScript function
//          2002 - <parameter_name> is empty
//          2100 - Request (%@) failed: %@
// message_text - begins with the JavaScript library function name and a ":". If the error comes from the underlying API, the full message 
// from the API will be appended to the message_text
//
//
// Except for gotoSlide, the JavaScript functions respect My Setup, Restricted Products on Account, Allowed Products on Call and on TSF.  
// goToSlide respects all of the above when media is launched from a Call or an Account. goToSlide does not respect Restricted Products 
// and Allowed Products when media is launched from the home page.
//
//
// Use the JavaScript functions in a chain, i.e. call the second JavaScript function only in the first function's callback function or
// after the callback of the first function is finished.
// Because the underlying API calls are asynchronous, this may result in unexpected return values if the JavaScript functions are
// not properly chained.
//
//
// Veeva recommends caution when retrieving/saving data using the following field types and to always perform rigorous testing:
//      Long Text Area
//      Rich Text Area
//      Encrypted Text Area


var com;
if (com == null) com = {};
if (com.veeva == undefined) com.veeva = {};
com.veeva.clm = {

    /////////////////////// Addresses ///////////////////////

    // 1
    // Returns an array of record IDs of all addresses (Address_vod__c) for a particular account (Account)
    // account - specifies the record ID of the account of which to get all related addresses
    // callback - call back function which will be used to return the information
    getAddresses_Account: function(account, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("account", account);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getAddresses_Account", callback, ret);
            return;
        }
        window["com_veeva_clm_accountAddresses"] = function(result) {
            com.veeva.clm.wrapResult("getAddresses_Account", callback, result);
        }

        query = "veeva:queryObject(Address_vod__c),fields(ID),where(WHERE Account_vod__c=\"" + account + "\"),com_veeva_clm_accountAddresses(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_accountAddresses(com.veeva.clm.testResult.common);
    },

    // 2
    // Returns the values of the specified fields for specified Address (Address_vod__c) record
    // record - specifies the record ID of the Address to get fields from
    // fields - list of field api names to return a value for, this parameter should be an array
    // callback - call back function which will be used to return the information
    getAddressFields: function(record, fields, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("record", record);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getAddressFields", callback, ret);
            return;
        }
        if (fields == undefined || fields == null) {
            fields = ["ID"];
        }

        window["com_veeva_clm_addressValues"] = function(result) {
            com.veeva.clm.wrapResult("getAddressFields", callback, result);
        }

        query = "veeva:queryObject(Address_vod__c),fields(" + this.joinFieldArray(fields) + "),where(WHERE IdNumber=\"" + record + "\"),com_veeva_clm_addressValues(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_addressValues(com.veeva.clm.testResult.common);
    },


    /////////////////////// Products ///////////////////////

    // Returns an array of record IDs of all products (Product_vod__c) of a specified type that the User has access to
    // type - specifies the Product Type (Product_Type_vod__c field on Product_vod__c) 
    // callback - call back function which will be used to return the information
    getProduct_MySetup: function(type, callback) {
        // check parameter

        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("type", type);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getProduct_MySetup", callback, ret);
            return;
        }


        window["com_veeva_clm_productMysetup"] = function(result) {
            com.veeva.clm.wrapResult("getProduct_MySetup", callback, result);
        };


        query = "veeva:queryObject(Product_vod__c),fields(ID),where(WHERE Product_Type_vod__c=\"" + type + "\"),com_veeva_clm_productMysetup(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_productMysetup(com.veeva.clm.testResult.common);

    },

    /////////////////////// Record Type Support ///////////////////////

    // Returns an array of record IDs of all RecordType records (RecordType) for a particular object
    // object - specifies the API name of the object of which to get all active RecordTypes 
    // callback - call back function which will be used to return the information
    getRecordType_Object: function(object, callback) {

        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getRecordType_Object", callback, ret);
            return;
        }

        window["com_veeva_clm_objectRecordTypes"] = function(result) {
            com.veeva.clm.wrapResult("getRecordType_Object", callback, result);
        }

        query = "veeva:queryObject(RecordType),fields(ID),where(WHERE SobjectType=\"" + object + "\" and IsActive == YES),com_veeva_clm_objectRecordTypes(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_objectRecordTypes(com.veeva.clm.testResult.common);
    },

    /////////////////////// Surveys ///////////////////////

    // 1
    // Returns an array of record IDs of all Survey Questions (Survey_Question_vod__c) for a specific Survey (Survey_vod__c)
    // Results are returned in ascending order based on the Order_vodc field on Survey Question_vod_c.
    // survey - specifies the record ID of the Survey to get all related Survey Questions from
    // callback - call back function which will be used to return the information
    getSurveyQuestions_Survey: function(survey, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("survey", survey);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getSurveyQuestions_Survey", callback, ret);
            return;
        }

        window["com_veeva_clm_surveyQuestions"] = function(result) {
            com.veeva.clm.wrapResult("getSurveyQuestions_Survey", callback, result);
        }

        query = "veeva:queryObject(Survey_Question_vod__c),fields(ID),where(WHERE Survey_vod__c=\"" + survey + "\"),sort(Order_vod__c,asc),com_veeva_clm_surveyQuestions(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_surveyQuestions(com.veeva.clm.testResult.common);

    },

    // 2
    // Returns an array of record IDs of all Questions Responses (Question_Response_vod__c object) for a specific Survey 
    // Target (Survey_Target_vod__c). Results are returned in ascending order based on the Order_vod__c field on Question_Response_vod__c.
    // surveytarget - specifies the record ID of the Survey Target to get all related Question Responses from
    // callback - call back function which will be used to return the information
    getQuestionResponse_SurveyTarget: function(surveytarget, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("surveytarget", surveytarget);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getQuestionResponse_SurveyTarget", callback, ret);
            return;
        }
        window["com_veeva_clm_targetResponses"] = function(result) {
            com.veeva.clm.wrapResult("getQuestionResponse_SurveyTarget", callback, result);
        }

        query = "veeva:queryObject(Question_Response_vod__c),fields(ID),where(WHERE Survey_Target_vod__c=\"" + surveytarget + "\"),sort(Order_vod__c,asc),com_veeva_clm_targetResponses(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_targetResponses(com.veeva.clm.testResult.common);
    },

    // 3
    // Returns an array of record IDs of all Survey Targets (Survey_Target_vod__c) for a specific account (Account), for a 
    // specific Survey (Survey_vod__c)
    // account - specifies the record ID of the Account to get all related Survey Targets from
    // survey - specifies the record ID of the Survey to get all related Survey Targets from.  Can be made optional by putting in "".
    // callback - call back function which will be used to return the information
    getSurveyTarget_Account: function(account, survey, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("account", account);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getSurveyTarget_Account", callback, ret);
            return;
        }

        window["com_veeva_clm_accountSurveyTargets"] = function(result) {
            com.veeva.clm.wrapResult("getSurveyTarget_Account", callback, result);
        }

        query = null;
        if (survey == null || survey == "") {
            query = "veeva:queryObject(Survey_Target_vod__c),fields(ID),where(WHERE Account_vod__c=\"" + account + "\"),com_veeva_clm_accountSurveyTargets(result)";
        } else {
            query = "veeva:queryObject(Survey_Target_vod__c),fields(ID),where(WHERE Account_vod__c=\"" + account + "\" AND Survey_vod__c=\"" + survey + "\"),com_veeva_clm_accountSurveyTargets(result)";
        }
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_accountSurveyTargets(com.veeva.clm.testResult.common);
    },


    /////////////////////// Order Management ///////////////////////

    // * Campaign and Contract based Pricing Rules are not supported by the JavaScript Library for CLM Order Management functions"
    // 1
    // Returns an array of record IDs of all products (Product_vod__c) of type Order that have valid list prices 
    //          Valid list price = Pricing Rule (Pricing_Rule_vod__c) of record type List Price (List_Price_Rule_vod) where current date is 
    //          between Start Date (Start_Date_vod__c) and End Date (End_Date_vod__c)
    // callback - call back function which will be used to return the information
    // account/account group - specifies the record ID of an Account or the matching text for the Account Group. Can be made optional 
    // by putting in "". When utilized, returns an array of record IDs of all products (Product_vod__c) of type Order 
    // that have valid list price records which specify the Account or Account Group.
    getProduct_OrderActive_Account: function(accountOrAccountGroup, callback) {
        var orderProducts;
        var ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // c, product
        window["com_veeva_clm_ordersWithListPrice"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success) {
                orderIds = [];
                if (result.Pricing_Rule_vod__c && result.Pricing_Rule_vod__c.length > 0) {
                    for (i = 0; i < result.Pricing_Rule_vod__c.length; i++) {
                        orderIds.push(result.Pricing_Rule_vod__c[i].Product_vod__c);
                    }
                }

                ret.success = true;
                ret.Product_vod__c = orderIds;
                com.veeva.clm.wrapResult("getProduct_OrderActive_Account", callback, ret);
            } else {
                com.veeva.clm.wrapResult("getProduct_OrderActive_Account", callback, result);
            }
        };

        // b, got record type id
        window["com_veeva_clm_listPriceTypeId"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success && result.RecordType && result.RecordType.length > 0) {
                listPriceRecordTypeId = result.RecordType[0].ID;

                // c, fetch product which has <list price> pricing rules
                var ids = [];
                for (i = 0; i < orderProducts.length; i++) {
                    ids.push(orderProducts[i].ID);
                }

                dateString = com.veeva.clm.getCurrentDate();

                query = null;
                if (accountOrAccountGroup == null || accountOrAccountGroup == "") {
                    query = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID,Product_vod__c),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND Start_Date_vod__c <= \"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\" AND Product_vod__c IN " + com.veeva.clm.joinStringArrayForIn(ids) + "), com_veeva_clm_ordersWithListPrice(result)";
                } else {
                    query = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID,Product_vod__c),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND (Account_vod__c=\"" + accountOrAccountGroup + "\" OR Account_Group_vod__c = \"" + accountOrAccountGroup + "\") AND Start_Date_vod__c <=\"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\" AND Product_vod__c IN " + com.veeva.clm.joinStringArrayForIn(ids) + "), com_veeva_clm_ordersWithListPrice(result)";
                }

                if (!com.veeva.clm.testMode) {
                    com.veeva.clm.runAPIRequest(query);
                } else {
                    com_veeva_clm_ordersWithListPrice(testResult.listPrices)
                }


            } else {
                com.veeva.clm.wrapResult("getProduct_OrderActive_Account", callback, result);
            }
        };

        // a, get order products
        this.getProduct_MySetup("Order", function(result) {
            // got the list order products,
            if (result.success) {

                orderProducts = result.Product_vod__c;
                if (orderProducts && orderProducts.length > 0) {
                    // b, find out List Price record type id
                    recordTypeQuery = "veeva:queryObject(RecordType),fields(ID),where(WHERE SobjectType=\"Pricing_Rule_vod__c\" AND Name_vod__c=\"List_Price_Rule_vod\"),com_veeva_clm_listPriceTypeId(result)";
                    if (!com.veeva.clm.testMode)
                        com.veeva.clm.runAPIRequest(recordTypeQuery);
                    else
                        com_veeva_clm_listPriceTypeId(testResult.listPriceRecordType);
                } else {
                    ret.success = true;
                    ret.Product_vod__c = [];
                    com.veeva.clm.wrapResult("getProduct_OrderActive_Account", callback, ret);
                    return;
                }
            } else {
                // ERROR when geting Product of order type.
                com.veeva.clm.wrapResult("getProduct_OrderActive_Account", callback, result);
            }
        });

    },

    // 2
    // Returns an array of record IDs of all products (Product_vod__c) of type Kit Component (Product_Type_vod__c field) who have 
    // parent product (Parent_Product_vod__c) = product
    // product - specifies the record ID of the product of which to get all related Kit Components from  
    // callback - call back function which will be used to return the information
    getProduct_KitComponents: function(product, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("product", product);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getProduct_KitComponents", callback, ret);
            return;
        }
        window["com_veeva_clm_childKitItems"] = function(result) {
            com.veeva.clm.wrapResult("getProduct_KitComponents", callback, result);
        };


        query = "veeva:queryObject(Product_vod__c),fields(ID),where(WHERE Product_Type_vod__c=\"Kit Item\" AND Parent_Product_vod__c=\"" + product + "\"),com_veeva_clm_childKitItems(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_childKitItems(com.veeva.clm.testResult.common);
    },

    // 3
    // Returns an array of record IDs of Product Groups (Product_Group_vod__c) that the specified product (Product_vod__c) is part of
    // product - specifies the record ID of the product of which to get all related Product Groups from
    // callback - call back function which will be used to return the information
    getProductGroup_Product: function(product, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("product", product);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getProductGroup_Product", callback, ret);
            return;
        }
        window["com_veeva_clm_productProductGroups"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            var ret = {};
            if (result != null && result.success) {
                var rows = result.Product_Group_vod__c;
                var groupIds = [];
                if (rows && rows.length > 0) {
                    for (i = 0; i < rows.length; i++) {
                        groupIds.push(rows[i].Product_Catalog_vod__c);
                    }
                }

                ret.success = true;
                ret.Product_vod__c = groupIds;

                com.veeva.clm.wrapResult("getProductGroup_Product", callback, ret);
            } else if (result != null) {
                com.veeva.clm.wrapResult("getProductGroup_Product", callback, result);
            } else {
                // is not expected from low-level API
            }
        };


        query = "veeva:queryObject(Product_Group_vod__c),fields(ID,Product_Catalog_vod__c),where(WHERE Product_vod__c=\"" + product + "\"),com_veeva_clm_productProductGroups(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_productProductGroups(com.veeva.clm.testResult.common);
    },


    // 4
    // Returns an array of record IDs of the last 10 Orders (Order_vod__c) for a particular account (Account)
    // The order of last ten orders is based on the field Order_Date_vod__c, descending.
    // account - specifies the record ID of the account of which to get all related orders
    // callback - call back function which will be used to return the information
    getLastTenOrders_Account: function(account, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("account", account);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getLastTenOrders_Account", callback, ret);
            return;
        }

        window["com_veeva_clm_accountLastTenOrders"] = function(result) {
            com.veeva.clm.wrapResult("getLastTenOrders_Account", callback, result);
        };


        query = "veeva:queryObject(Order_vod__c),fields(ID),where(WHERE Account_vod__c=\"" + account + "\"),sort(Order_Date_vod__c,desc),limit(10),com_veeva_clm_accountLastTenOrders(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_accountLastTenOrders(com.veeva.clm.testResult.common);
    },

    // 5
    // Returns an array of record IDs of all Order Lines (Order_Line_vod__c) for a particular order (Order_vod__c)
    // order - specifies the record ID of the order of which to get all related order lines
    // callback - call back function which will be used to return the information
    getOrderLines_Order: function(order, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("order", order);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getOrderLines_Order", callback, ret);
            return;
        }
        window["com_veeva_clm_orderLines"] = function(result) {
            com.veeva.clm.wrapResult("getOrderLines_Order", callback, result);
        };


        query = "veeva:queryObject(Order_Line_vod__c),fields(ID),where(WHERE Order_vod__c=\"" + order + "\"),com_veeva_clm_orderLines(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(query);
        else
            com_veeva_clm_orderLines(com.veeva.clm.testResult.common);
    },

    // 6
    // DEPRECATED - Please use getListPrice_Product_Account
    // Returns an array of record IDs for the currently valid List Price (Pricing_Rule_vod__c) for a specific product (Product_vod__c)
    //          Valid list price = Pricing Rule (Pricing_Rule_vod__c) of record type List Price (List_Price_Rule_vod) where current date is 
    //          between Start Date (Start_Date_vod__c) and End Date (End_Date_vod__c)
    // product - specifies the record ID of the product of which to get the List Price for
    // callback - call back function which will be used to return the information
    getListPrice_Product: function(product, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("product", product);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getListPrice_Product", callback, ret);
            return;
        }


        window["com_veeva_clm_productPricingRules"] = function(result) {
            com.veeva.clm.wrapResult("getListPrice_Product", callback, result);
        };

        // 2
        window["com_veeva_clm_listPriceTypeId_getListPrice_Product"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success && result.RecordType && result.RecordType.length > 0) {
                listPriceRecordTypeId = result.RecordType[0].ID;

                // 2.1, fetch pricing rules for the product

                dateString = com.veeva.clm.getCurrentDate();
                query = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND Product_vod__c = \"" + product + "\"" + " AND Start_Date_vod__c <= \"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\"), com_veeva_clm_productPricingRules(result)";
                if (!com.veeva.clm.testMode)
                    com.veeva.clm.runAPIRequest(query);
                else
                    com_veeva_clm_productPricingRules(com.veeva.clm.testResult.listPrices);
            } else {
                com.veeva.clm.wrapResult("getListPrice_Product", callback, result);
            }

        };

        // 1, fetch list price record type first
        recordTypeQuery = "veeva:queryObject(RecordType),fields(ID),where(WHERE SobjectType=\"Pricing_Rule_vod__c\" AND Name_vod__c=\"List_Price_Rule_vod\"),com_veeva_clm_listPriceTypeId_getListPrice_Product(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(recordTypeQuery);
        else
            com_veeva_clm_listPriceTypeId_getListPrice_Product(testResult.listPriceRecordType);

    },

    // 7
    // Requires that an Account be specified in order for any result to be returned.
    // Returns the record ID for the currently valid List Price (Pricing_Rule_vod__c) for a specific product (Product_vod__c) and Account combination. Respects the Account and Account Group List Price hierarchy.
    // Valid list price = Pricing Rule (Pricing_Rule_vod__c) of record type List Price (List_Price_Rule_vod) where current date is between Start Date (Start_Date_vod__c) and End Date (End_Date_vod__c)
    // product - specifies the record ID of the product of which to get the Pricing Rule for
    // account - specifies the Account for which to select List Prices for
    // callback - call back function which will be used to return the information
    getListPrice_Product_Account: function(product, account, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("product", product);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, ret);
            return;
        }
        ret = this.checkArgument("account", account);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, ret);
            return;
        }

        window["com_veeva_clm_productDefaultPricingRules"] = function(result) {
            com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, result);
        };

        window["com_veeva_clm_get_productDefaultPricingRules"] = function() {

            dateString = com.veeva.clm.getCurrentDate();
            groupQuery = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND Product_vod__c = \"" + product + "\"" + " AND Account_Group_vod__c=\"\" AND Account_vod__c=\"\"" + " AND Start_Date_vod__c <= \"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\"), com_veeva_clm_productDefaultPricingRules(result)";
            if (!com.veeva.clm.testMode)
                com.veeva.clm.runAPIRequest(groupQuery);
            else {
                // TODO
                com_veeva_clm_productDefaultPricingRules(com.veeva.clm.testResult.listPrices);
            }
        };

        window["com_veeva_clm_productAccountGroupPricingRules"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success && result.Pricing_Rule_vod__c.length == 0) {
                // try account group
                com_veeva_clm_get_productDefaultPricingRules();
            } else
                com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, result);
        };

        // 4 pricing rule for account group 
        window['com_veeva_clm_accountGroup'] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success) {
                accountGroup = result.Account.Account_Group_vod__c;
                if (accountGroup != undefined && accountGroup != "") {
                    dateString = com.veeva.clm.getCurrentDate();
                    groupQuery = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND Product_vod__c = \"" + product + "\"" + " AND Account_Group_vod__c=\"" + accountGroup + "\"" + " AND Start_Date_vod__c <= \"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\"), com_veeva_clm_productAccountGroupPricingRules(result)";
                    if (!com.veeva.clm.testMode)
                        com.veeva.clm.runAPIRequest(groupQuery);
                    else {
                        // TODO
                        com_veeva_clm_productAccountGroupPricingRules(com.veeva.clm.testResult.listPrices);
                    }
                } else {
                    com_veeva_clm_get_productDefaultPricingRules();
                }
            } else {
                com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, result);
            }
        };

        // 3 account group 
        window["com_veeva_clm_productAccountPricingRules"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success && result.Pricing_Rule_vod__c.length == 0) {
                // try account group
                com.veeva.clm.getDataForObject("Account", account, "Account_Group_vod__c", com_veeva_clm_accountGroup);
            } else
                com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, result);
        };

        // 2
        window["com_veeva_clm_listPriceTypeId_getListPrice_Product_Account"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success && result.RecordType && result.RecordType.length > 0) {
                listPriceRecordTypeId = result.RecordType[0].ID;

                dateString = com.veeva.clm.getCurrentDate();
                query = "veeva:queryObject(Pricing_Rule_vod__c),fields(ID),where(WHERE RecordTypeId=\"" + listPriceRecordTypeId + "\" AND Product_vod__c = \"" + product + "\"" + " AND Account_vod__c=\"" + account + "\"" + " AND Start_Date_vod__c <= \"" + dateString + "\" AND End_Date_vod__c >= \"" + dateString + "\"), com_veeva_clm_productAccountPricingRules(result)";

                if (!com.veeva.clm.testMode)
                    com.veeva.clm.runAPIRequest(query);
                else
                    com_veeva_clm_productAccountPricingRules(com.veeva.clm.testResult.listPrices);
            } else {
                com.veeva.clm.wrapResult("getListPrice_Product_Account", callback, result);
            }

        };

        // 1, fetch list price record type first
        recordTypeQuery = "veeva:queryObject(RecordType),fields(ID),where(WHERE SobjectType=\"Pricing_Rule_vod__c\" AND Name_vod__c=\"List_Price_Rule_vod\"),com_veeva_clm_listPriceTypeId_getListPrice_Product_Account(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(recordTypeQuery);
        else
            com_veeva_clm_listPriceTypeId_getListPrice_Product_Account(testResult.listPriceRecordType);

    },

    /////////////////////// Functions to replace exising API calls ///////////////////////  

    // 1
    // Returns the value of a field for a specific record related to the current call
    // object -  Limited to the following keywords: Account, TSF, User, Address, Call, Presentation, and KeyMessage. 
    // field- field api name to return a value for
    // callback - call back function which will be used to return the information
    getDataForCurrentObject: function(object, field, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getDataForCurrentObject", callback, ret);
            return;
        }


        ret = this.checkArgument("field", field);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getDataForCurrentObject", callback, ret);
            return;
        }

        window["com_veeva_clm_getCurrentObjectField"] = function(result) {
            // TODO result format
            com.veeva.clm.wrapResult("getDataForCurrentObject", callback, result);
        }

        lowerName = object.toLowerCase();

        request = "veeva:getDataForObjectV2(" + object + "),fieldName(" + field + "),com_veeva_clm_getCurrentObjectField(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);
        else
            com_veeva_clm_getCurrentObjectField(com.veeva.clm.testResult.common);
    },

    // 2
    // Returns the value of a field for a specific record
    // object - specifies the object api name (object keywords used in getDataForCurrentObject are not valid, except for Account and User)
    // record - specifies the record id. 
    // field- field api name to return a value for
    // callback - call back function which will be used to return the information
    getDataForObject: function(object, record, field, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getDataForObject", callback, ret);
            return;
        }


        ret = this.checkArgument("record", record);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getDataForObject", callback, ret);
            return;
        }

        ret = this.checkArgument("field", field);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getDataForObject", callback, ret);
            return;
        }

        window["com_veeva_clm_getObjectField"] = function(result) {
            // TODO result format
            com.veeva.clm.wrapResult("getDataForObject", callback, result);
        }


        request = "veeva:getDataForObjectV2(" + object + "),objId(" + record + "),fieldName(" + field + "),com_veeva_clm_getObjectField(result)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);
        else
            com_veeva_clm_getObjectField(com.veeva.clm.testResult.common);

    },


    // 3
    // Creates a new record for the specified object
    // object - specifies the object api name
    // values - json object with the fields and values to be written to the new record
    // callback - call back function which will be used to return the information
    // NOTE: This function returns success: true as long as the user has access to the object. 
    //       If the user does not have access to one of the fields specified, success: true and an error code and message specifying which fields are not accessible
    //       are still returned, however, and the fields the user does have access to are still updated. Account creation is not supported.
    createRecord: function(object, values, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("createRecord", callback, ret);
            return;
        }


        ret = this.checkArgument("values", values);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("createRecord", callback, ret);
            return;
        }

        request = "veeva:saveObjectV2(" + object + "),value(" + JSON.stringify(values) + "),callback(com_veeva_clm_createRecord)";
        window["com_veeva_clm_createRecord"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success) {
                ret = {};
                ret.success = true;
                ret[object] = {};
                ret[object].ID = result.objectId;
                if (result.code != undefined) {
                    ret.code = result.code;
                    ret.message = result.message;
                }
                com.veeva.clm.wrapResult("createRecord", callback, ret);
            } else {
                ret = {};
                ret.success = false;
                ret.code = 2100;
                ret.message = "Request: " + request + " failed: " + result.message;
                com.veeva.clm.wrapResult("createRecord", callback, ret);
            }
        };

        // create record
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);
        else
            com_veeva_clm_createRecord(com.veeva.clm.testResult.common);
    },

    // 4
    // Updates a specified record
    // object - specifies the object api name
    // record - specifies the record id to be updated
    // values - json object with the fields and values updated on the record
    // callback - call back function which will be used to return the information
    // NOTE: This function returns success: true as long as the user has access to the object. 
    //       If the user does not have access to one of the fields specified, success: true and an error code and message specifying which fields are not accessible
    //       are still returned, however, and the fields the user does have access to are still updated.
    updateRecord: function(object, record, values, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("updateRecord", callback, ret);
            return;
        }

        ret = this.checkArgument("record", record);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("updateRecord", callback, ret);
            return;
        }

        ret = this.checkArgument("values", values);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("updateRecord", callback, ret);
            return;
        }
        // Id is required for updating existing record
        values.IdNumber = record;

        // create record
        request = "veeva:saveObjectV2(" + object + "),value(" + JSON.stringify(values) + "),callback(com_veeva_clm_updateRecord)";

        window["com_veeva_clm_updateRecord"] = function(result) {
            result = com.veeva.clm.formatResult(result);
            if (result.success) {
                ret = {};
                ret.success = true;
                ret[object] = {};
                ret[object].ID = result.objectId;
                if (result.code != undefined) {
                    ret.code = result.code;
                    ret.message = result.message;
                }
                com.veeva.clm.wrapResult("updateRecord", callback, ret);
            } else {
                ret = {};
                ret.success = false;
                ret.code = 2100;
                ret.message = "Request: " + request + " failed: " + result.message;
                com.veeva.clm.wrapResult("updateRecord", callback, ret);
            }
        };

        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);
        else
            com_veeva_clm_updateRecord(com.veeva.clm.testResult.common);
    },

    // 5
    // Navigates to the specified key message (Key_Message_vod__c)
    // key message - external ID field of the key message to jump to. Usually is Media_File_Name_vod__c, but does not have to be.
    // clm presentation - external ID of the CLM Presentation if the key message is in a different CLM Presentation. 
    // Usually is Presentation_Id_vod__c, but does not have to be. Can be made optional by putting in "".
    gotoSlide: function(keyMessage, presentation) {

        ret = this.checkArgument("keyMessage", keyMessage);
        if (ret.success == false) {
            return ret;
        }

        request = null;
        if (presentation == undefined || presentation == null || presentation == "") {
            // goto within current presenation
            request = "veeva:gotoSlide(" + keyMessage + ")";
        } else {
            request = "veeva:gotoSlide(" + keyMessage + "," + presentation + ")";
        }

        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);

    },

    // 6
    // Navigates to the next slide based on the CLM Presentation Slide display order
    nextSlide: function() {
        request = "veeva:nextSlide()";
        com.veeva.clm.runAPIRequest(request);
    },

    // 7
    // Navigates to the previous slide based on the CLM Presentation Slide display order
    prevSlide: function() {
        request = "veeva:prevSlide()";
        com.veeva.clm.runAPIRequest(request);
    },

    // 8
    // Returns the value of the field in UTC format.  Only works with field of type Date or Datetime.
    // object - specifies the object api name (object keywords used in getDataForCurrentObject are not valid, except for Account)
    // record - specifies the record id. 
    // field- field api name to return a value for
    // callback - call back function which will be used to return the information
    getUTCdatetime: function(object, record, field, callback) {
        ret = this.checkCallbackFunction(callback);
        if (ret.success == false)
            return ret;

        // check arguments
        ret = this.checkArgument("object", object);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getUTCdatetime", callback, ret);
            return;
        }


        ret = this.checkArgument("record", record);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getUTCdatetime", callback, ret);
            return;
        }

        ret = this.checkArgument("field", field);
        if (ret.success == false) {
            com.veeva.clm.wrapResult("getUTCdatetime", callback, ret);
            return;
        }

        window["com_veeva_clm_getUTCdatetime"] = function(result) {
            // TODO result format
            com.veeva.clm.wrapResult("getUTCdatetime", callback, result);
        }


        request = "veeva:getDataForObjectV3(" + object + "),objId(" + record + "),fieldName(" + field + "),getUTCdatetime(true),callback(com_veeva_clm_getUTCdatetime)";
        if (!com.veeva.clm.testMode)
            com.veeva.clm.runAPIRequest(request);
        else
            com_veeva_clm_getUTCdatetime(com.veeva.clm.testResult.common);

    },

    /////////////////////// Supporting Functions ///////////////////////

    // join string array to a in expression
    joinStringArrayForIn: function(result) {
        var ret = "";
        if (result.length > 0) {
            for (i = 0; i < result.length; i++) {
                if (i == 0)
                    ret += "{\"" + result[i] + "\"";
                else {
                    ret += ",\"" + result[i] + "\"";
                }

            }
            ret += "}";
        }

        return ret;
    },

    joinFieldArray: function(fields) {
        var ret = "";
        if (fields.length > 0) {
            for (i = 0; i < fields.length; i++) {
                if (i == 0)
                    ret += fields[i];
                else {
                    ret += "," + fields[i];
                }

            }
        }

        return ret;
    },

    isFunction: function(toCheck) {
        var getType = {};
        return toCheck && getType.toString.call(toCheck) === '[object Function]';
    },

    checkCallbackFunction: function(toCheck) {
        // check arguments
        ret = {};
        if (toCheck == undefined) {
            ret.success = false;
            ret.code = 2000
            ret.message = "callback is missing";
            return ret;
        }

        if (this.isFunction(toCheck) == false) {
            ret.success = false;
            ret.code = 2001;
            ret.message = "callback is not a JavaScript function";
        } else {
            ret.success = true;
        }

        return ret;
    },

    checkArgument: function(name, value) {
        ret = {};
        ret.success = true;
        if (value == undefined || value == null || value == "") {
            ret.success = false;
            ret.code = 2002;
            ret.message = name + " is empty";
        }


        return ret;
    },

    getCurrentDate: function() {
        var currentDate = new Date();
        dateString = currentDate.getFullYear().toString();
        month = currentDate.getMonth() + 1;
        if (month < 10) {
            dateString += "-0" + month;
        } else {
            dateString += "-" + month;
        }
        date = currentDate.getDate();
        if (date < 10) {
            dateString += "-0" + date;
        } else {
            dateString += "-" + date;
        }

        return dateString;
    },

    formatResult: function(result) {
        if (com.veeva.clm.isWin8()) {
            if (typeof result == "string") {
                result = eval("(" + result + ")");
            }
        }
        return result;
    },

    wrapResult: function(apiName, userCallback, result) {
        result = com.veeva.clm.formatResult(result);
        if (result.success)
            userCallback(result);
        else {
            result.message = apiName + ": " + result.message;
            userCallback(result);
        }
    },

    runAPIRequest: function(request) {
        if (com.veeva.clm.isWin8()) {
            window.external.notify(request);
        } else {
            document.location = request;
        }
    },

    isWin8: function() {
        if (navigator.platform.toLowerCase().indexOf("win") >= 0)
            return true;
        else
            return false;
    },

    listPriceRecordTypeId: null,
    accountId: null,
    addressId: null,
    callId: null,
    tsfId: null,
    userId: null,
    presentationId: null,
    keyMessageId: null,
    testMode: false,
    testResult: null

};