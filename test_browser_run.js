// Browser DOM Mock for testing
var window = {
  addEventListener: function(e, cb) {},
  location: { href: 'http://localhost:8080' }
};
var document = {
  addEventListener: function(e, cb) { if (e === 'DOMContentLoaded') cb(); },
  getElementById: function(id) {
    return {
      textContent: '',
      innerHTML: '',
      value: '',
      style: {},
      classList: { toggle: function(){}, add: function(){}, remove: function(){} },
      addEventListener: function(){}
    };
  },
  querySelectorAll: function(sel) { return []; }
};
var localStorage = {
  getItem: function() { return null; },
  setItem: function() {}
};
var alert = function(msg) { print("ALERT: " + msg); };
var console = {
  log: function() { print.apply(null, arguments); },
  error: function() { print.apply(null, arguments); }
};

// Load extracted code
load('extracted_test.js');

print("--- INITIALIZATION TEST ---");
APP.init();
print("APP.init() succeeded without throwing!");
print("Ads count: " + NMC_DATA_STORE.adsData.length);
print("Leads count: " + NMC_DATA_STORE.leadsData.length);
