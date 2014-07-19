cd ..\caf-js
copy /b caf.js+caf-utils.js+caf-platforms.js+caf-ui.js+caf-attributes.js+caf-ui-view.js+caf-ui-swipers.js+caf-forms.js+caf-ui-dialogs.js+caf-net.js+caf-local-storage.js+caf-pager.js+libs\overthrow.js+libs\placeholders.js+libs\pico-modal.js+libs\idangerous.swiper.js ..\compiling\caf-compiled.js
cd ..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.js caf-compiled.js
copy /b caf.min.js ..\js\caf.min.js
