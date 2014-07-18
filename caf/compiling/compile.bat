cd ..\caf-js
copy /b caf.js+caf-utils.js+idangerous.swiper.js ..\compiling\caf-compiled.js
cd ..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.js caf-compiled.js
copy /b caf.min.js ..\js\caf.min.js
