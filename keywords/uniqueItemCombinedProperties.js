'use strict';

var SCALAR_TYPES = ['number', 'integer', 'string', 'boolean', 'null'];

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'array',
    errors: true,
    compile: function (keys, parentSchema, it) {
      var equal = it.util.equal;
      var scalar = getScalarKeys(keys, parentSchema);

      // eslint-disable-next-line complexity
      return function validate(data) {
        if (data.length > 1) {
          var updated_keys = JSON.parse(JSON.stringify(keys));
          for (var z = 0; z < updated_keys.length; z++)
            updated_keys[z] = updated_keys[z].split(',');
          for (var k = 0; k < updated_keys.length; k++) {
            for (var m = 0; m < updated_keys[k].length; m++) {
              var i, key = updated_keys[k][m];
              if (scalar[k][m]) {
                var hash = {};
                for (i = data.length; i--;) {
                  if (!data[i] || typeof data[i] != 'object') continue;
                  var prop = data[i][key];
                  if (prop && typeof prop == 'object') continue;
                  if (typeof prop == 'string') prop = '"' + prop;
                  if (hash[prop]) {
                    validate.errors = constructError(key);
                    return false;
                  }
                  hash[prop] = true;
                }
              } else {
                for (i = data.length; i--;) {
                  if (!data[i] || typeof data[i] != 'object') continue;
                  for (var j = i; j--;) {
                    if (data[j] && typeof data[j] == 'object' && equal(data[i][key], data[j][key])) {
                      validate.errors = constructError(keys[k]);
                      return false;
                    }
                  }
                }
              }
            }
          }
        }
        return true;
      };
    },
    metaSchema: {
      type: 'array',
      items: { type: 'string' }
    }
  };

  ajv.addKeyword('uniqueItemCombinedProperties', defFunc.definition);
  return ajv;
};


function getScalarKeys(keys, schema) {
  return keys.map(function (key) {
    var properties = schema.items && schema.items.properties;
    var propType = properties && properties[key] && properties[key].type;
    return Array.isArray(propType)
      ? propType.indexOf('object') < 0 && propType.indexOf('array') < 0
      : SCALAR_TYPES.indexOf(propType) >= 0;
  });
}


function constructError(keys) {
  const keyword = 'uniqueItemCombinedProperties';
  return [{
    keyword,
    params: { keyword },
    message: 'should have unique ' + keys,
  }];
}
