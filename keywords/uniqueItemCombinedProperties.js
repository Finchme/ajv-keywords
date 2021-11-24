'use strict';

var SCALAR_TYPES = ['number', 'integer', 'string', 'boolean', 'null'];

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    type: 'array',
    errors: true,
    compile: function (keys, parentSchema, it) {
      var equal = it.util.equal;
      var updated_keys = JSON.parse(JSON.stringify(keys));
      for (var z = 0; z < updated_keys.length; z++)
        updated_keys[z] = updated_keys[z].split(',');
      var scalar = getScalarKeys(updated_keys, parentSchema);

      // eslint-disable-next-line complexity
      return function validate(data) {
        if (data.length > 1) {
          for (var k = 0; k < updated_keys.length; k++) {
            var i, curr_keys = updated_keys[k];
            if (scalar[k]) {
              var hash = {};
              var hash_indexes = {};
              for (i = data.length; i--;) {
                if (!data[i] || typeof data[i] != 'object') continue;
                var force_break = false;
                var prop_list = [];
                for (var y = 0; y < curr_keys.length; y++) {
                  var prop = data[i][curr_keys[y]];
                  if (prop && typeof prop == 'object') { force_break = true; continue; }
                  if (typeof prop == 'string') prop = '"' + prop;
                  prop_list.push(prop);
                }
                if (force_break) continue;
                if (hash[prop_list]) {
                  validate.errors = constructError(curr_keys, [i, hash_indexes[prop_list]]);
                  return false;
                }
                hash[prop_list] = true;
                hash_indexes[prop_list] = i;
              }
            } else {
              for (i = data.length; i--;) {
                if (!data[i] || typeof data[i] != 'object') continue;
                for (var j = i; j--;) {
                  if (data[j] && typeof data[j] == 'object') {
                    var is_match = true;
                    for (var x = 0; x < curr_keys.length; x++) {
                      if (!equal(data[i][curr_keys[x]], data[j][curr_keys[x]])) {
                        is_match = false;
                        break;
                      }
                    }
                    if (is_match) {
                      validate.errors = constructError(curr_keys, [j, i]);
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


function constructError(keys, indexes) {
  const keyword = 'uniqueItemCombinedProperties';
  return [{
    keyword,
    params: { keyword },
    message: 'should NOT have duplicate items property ' + keys + ' (items ## ' + indexes.join(' and ') + ' are identical)',
  }];
}
