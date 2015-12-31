var __ = require('lazy.js');

var tokens = [{"gcm_token":"vtrobot_gcm_token"},{"gcm_token":"APA91bEt49iUfKHkqdTu6YXdCs-jazPLowlDAwCmFZk9qV9gZ-bUHzicirQoojVvIiQwyc58aSdtHZXXAsLFcCbNkL9W7abGcbEYGpiGwefsdaZZjq-eLru23QPtN0g9ogZ7CDE4AIz0"},{"gcm_token":"APA91bEMKwnXyx0maS0Vg4AfFhUbL-DVurklEr4-JHUvhcGzXzueQ1aSnBto1RGbW9uZv-BWVnDOn8-1bfAY0C5XCPoRfPgjYjUhqS-iAwFaS5PEm9Ki9S3DjgBFhPIOQBIFMp6CSBOA"},{"gcm_token":"APA91bHL8Tjau4Ex4oJeO9r3kgFSwAPdy4AS8qHPXqj7sUkb-KwfinLV-HhA7b-35IKlBkdDA082DJytMDG19-Y1ONXfTwhqX-hSawOGMw6Lr5weuy0TOfmY_Da2yWnTT7nv_iLnB2Ig"},{"gcm_token":"APA91bGupaNpwOSQfBU5OOGcrTR_ATWh_33wNtuYTAlAIuFRyg6fOE_x5N4_G__MxQdZS8jROj5tvt0YMyEPiMq2mPwUVaxGXfA3VSmABm4A4SeD6iWFhGMYyhhgiVMKavZKUQVGdOch"}];


var tt = __(tokens).indexBy('gcm_token');
tt.forEach(function(k) {
  console.log(k.gcm_token);
});
