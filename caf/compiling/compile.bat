cd ..\caf-js
copy /b libs\jsface.js+Classes\FormUtils\*+Classes\Templating\*+Classes\Interfaces\*+Classes\Utils\*+Classes\UI\*+Classes\Objects\Object.js+Classes\Objects\Label.js+Classes\Objects\Button.js+Classes\Objects\Container.js+Classes\Objects\Dialog\Dialog.js+Classes\Objects\Structure\AppContainer.js+Classes\Objects\SideMenu\*+Classes\Objects\List.js+Classes\Objects\DropMenu\DropMenu.js+Classes\Objects\Structure\Footer.js+Classes\Objects\Structure\Header.js+Classes\Objects\Structure\Content.js+Classes\Objects\Structure\Page.js+Classes\Objects\Image.js+Classes\Objects\Slider\Pagination.js+Classes\Objects\Slider\SliderWrapper.js+Classes\Objects\Slider\SliderSlide.js+Classes\Objects\Slider\Slider.js+Classes\Objects\Slider\Gallery.js+Classes\Objects\Row.js+Classes\Objects\ImageTitleRow.js+Classes\Objects\ImageTitleContentRow.js+Classes\Objects\TabsContainer.js+Classes\Objects\Tab.js+Classes\Objects\Form\Form.js+Classes\Objects\Form\Input.js+Classes\Objects\Form\InputEmail.js+Classes\Caf.js+caf.js+caf-utils.js+caf-platforms.js+caf-ui.js+caf-attributes.js+caf-ui-view.js+caf-ui-swipers.js+caf-forms.js+caf-ui-dialogs.js+caf-net.js+caf-local-storage.js+caf-pager.js+libs\overthrow.js+libs\placeholders.js+libs\pico-modal.js+libs\snap.js+libs\idangerous.swiper.js+libs\underscore.js+libs\JSONfn.js ..\compiling\caf-compiled.js
cd ..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.js caf-compiled.js
copy /b caf.min.js ..\js\caf.min.js

cd ..\caf-css
del ..\css\caf-all.css
copy /b idangerous.swiper.css+snap.css+dialogs.css+utils\animations.css+utils\responsive.css+utils\heights.css+utils\min-heights.css+utils\font-sizes.css+utils\widths.css+utils\paddings.css+utils\absolutes.css+utils\margins.css+caf.css ..\css\caf-all.css
