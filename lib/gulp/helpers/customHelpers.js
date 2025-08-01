'use strict';

const helpers = module.exports;

/**
 * Returns an object literal within an array based on passed property (name:value pair)
 *
 *  <!-- key_messages = [
 *   {'key_message': 'Home',    'description': 'Home Slide'},
 *   {'key_message': 'Patient', 'description': 'Patient Slide'},
 *   {'key_message': 'MOA',     'description': 'MOA Slide'}
 * ] -->
 *
 * ```handlebars
 * {{lookupCollectionObject key_messages 'key_message' 'Patient'}}
 * <!-- results in: '{'key_message': 'Patient', 'description': 'Patient Slide'}' -->
 * ```
 * @author Steven Britton
 * @date   2017-10-13
 * @param  {Array}      `collection`
 * @param  {String}     `name`
 * @param  {String}     `value`
 * @return {Object}
 * */
helpers.lookupCollectionObject = function (collection, name, value) {

  if (!Array.isArray(collection)){
    console.log('{{lookupCollectionObject}} helper expects the first argument to be an array.');
    return '';
  } else if (name === ''){
    console.log('{{lookupCollectionObject}} helper expects the second argument to be an object property name.');
    return '';
  } else if (value === ''){
    console.log('{{lookupCollectionObject}} helper expects the third argument to be an object property value.');
    return '';
  }

  for (let i = 0, j = collection.length; i < j; i++) {
    if (collection[i][name] && collection[i][name] === value) {

      // add index to the returned object
      collection[i].index = i;

      return collection[i];
    }
  }

  return null;
};

/**
 * Returns an array of matches based on passed property (name:value pair)
 *
 *  <!-- key_messages = [
 *   {'key_message': 'Home',    'description': 'Home Slide', css: 'new'},
 *   {'key_message': 'Patient', 'description': 'Patient Slide'},
 *   {'key_message': 'MOA',     'description': 'MOA Slide', css: 'new'}
 * ] -->
 *
 * ```handlebars
 * {{lookupCollectionArray key_messages 'css' 'new'}}
 * <!-- results in: '[
 *     {'key_message': 'Home', 'description': 'Home Slide', css: 'new'},
 *     {'key_message': 'MOA',     'description': 'MOA Slide', css: 'new'}
 *     ]
 *      -->
 * ```
 * @author Steven Britton
 * @date   2017-10-13
 * @param  {Array}      `collection`
 * @param  {String}     `name`
 * @param  {String}     `value`
 * @param  {String}     `endIndex`
 * @return {Array}
 */
helpers.lookupCollectionArray = function (collection, name, value, endIndex) {

  const retArray = [];

  if (!Array.isArray(collection)){
    console.log('{{lookupCollectionArray}} helper expects the first argument to be an array.');
    return '';
  } else if (name === ''){
    console.log('{{lookupCollectionArray}} helper expects the second argument to be an object property name.');
    return '';
  } else if (value === ''){
    console.log('{{lookupCollectionArray}} helper expects the third argument to be an object property value.');
    return '';
  }

  if (endIndex){
    collection = collection.slice(0, endIndex);
  }

  for (let i = 0, j = collection.length; i < j; i++) {
    if (collection[i][name] && collection[i][name] === value) {

      // add index to the returned object
      collection[i].index = i;

      retArray.push(collection[i]);
    }
  }

  return retArray;
};

helpers.withIndex = function (array, idx, options) {

  if (!Array.isArray(array)){
    console.log('{{withIndex}} helper expects the first argument to be an array.');
    return '';
  }
  return options.fn(array[idx]);
};
