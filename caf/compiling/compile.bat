cd ..\caf-js
copy /b libs\jsface.js+Classes\FormUtils\*+Classes\Templating\*+Classes\Interfaces\*+Classes\Utils\*+Classes\UI\*+Classes\Objects\Object.js+Classes\Objects\Label.js+Classes\Objects\Button.js+Classes\Objects\DropMenuItem.js+Classes\Objects\Container.js+Classes\Objects\AppContainer.js+Classes\Objects\List.js+Classes\Objects\DropMenu.js+Classes\Objects\Page.js+Classes\Objects\Slider.js+Classes\Objects\Gallery.js+Classes\Objects\Row.js+Classes\Objects\ImageTitleRow.js+Classes\Objects\ImageTitleContentRow.js+Classes\Objects\TabsContainer.js+Classes\Objects\Tab.js+Classes\Objects\Form.js+Classes\Objects\Input.js+Classes\Objects\Inputs\InputEmail.js+Classes\Caf.js+caf.js+caf-utils.js+caf-platforms.js+caf-ui.js+caf-attributes.js+caf-ui-view.js+caf-ui-swipers.js+caf-forms.js+caf-ui-dialogs.js+caf-net.js+caf-local-storage.js+caf-pager.js+libs\overthrow.js+libs\placeholders.js+libs\pico-modal.js+libs\snap.js+libs\idangerous.swiper.js+libs\underscore.js+libs\JSONfn.js ..\compiling\caf-compiled.js
cd ..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.js caf-compiled.js
copy /b caf.min.js ..\js\caf.min.js

cd ..\caf-css
del ..\css\caf-all.css
copy /b idangerous.swiper.css+snap.css+dialogs.css+utils\responsive.css+utils\heights.css+utils\min-heights.css+utils\font-sizes.css+utils\widths.css+utils\paddings.css+utils\absolutes.css+utils\margins.css+caf.css ..\css\caf-all.css
