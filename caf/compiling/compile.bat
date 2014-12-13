cd ..\src\caf-js
copy /b libs\jsface.js+Classes\FormUtils\*+Classes\Data\*+Classes\Utils\*+Classes\UI\*+Classes\Themes\*+Classes\Templating\*+Classes\Objects\Object.js+Classes\Objects\Container.js+Classes\Objects\Structure\Template.js+Classes\Objects\Dialog\DialogContainer.js+Classes\Objects\Dialog\Dialog.js+Classes\Objects\Structure\AppContainer.js+Classes\Objects\Structure\MainView.js+Classes\Objects\SideMenu\*+Classes\Objects\List.js+Classes\Objects\Structure\Footer.js+Classes\Objects\Structure\Header.js+Classes\Objects\Structure\Content.js+Classes\Objects\Structure\Page.js+Classes\Objects\Structure\TemplatePage.js+Classes\Objects\Slider\Pagination.js+Classes\Objects\Slider\SliderWrapper.js+Classes\Objects\Slider\SliderSlide.js+Classes\Objects\Slider\Slider.js+Classes\Objects\Slider\Gallery.js+Classes\Objects\Widgets\Label.js+Classes\Objects\Widgets\*+Classes\Objects\Structure\Tab.js+Classes\Objects\Structure\Tabber.js+Classes\Objects\Form\Form.js+Classes\Objects\Form\Input.js+Classes\Objects\Form\InputEmail.js+Classes\Initialize\*+Classes\Builder\*+Classes\Crypto\*+libs\jquery.min.js+libs\jquery.nicescroll.js+libs\placeholders.js+libs\overthrow.js+libs\snap.js+libs\routie.js+libs\ionic.bundle.min.js+libs\idangerous.swiper.js+libs\underscore.js+libs\JSONfn.js  ..\..\compiling\caf-compiled.js
cd ..\..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.js caf-compiled.js
copy /b caf-compiled.js caf.min.js
copy /b caf-compiled.js ..\js\caf.min.js
copy /b caf-compiled.js ..\core\caf.min.js
#copy /b caf.min.js ..\js\caf.min.js
#copy /b caf.min.js ..\core\caf.min.js

cd ..\src\caf-css
del ..\..\css\caf-all.css
copy /b idangerous.swiper.css+utils\icons.css+snap.css+utils\elementTransitions.css+dialogs.css+utils\animations.css+utils\responsive.css+utils\min-heights.css+utils\heights.css+utils\max-heights.css+utils\lineHeights.css+utils\font-sizes.css+utils\widths.css+utils\paddings.css+utils\absolutes.css+utils\margins.css+caf.css+utils\margins.css ..\..\css\caf-all.css
copy /b ..\css\caf-all.css ..\compiling\caf-all.css
cd ..\..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.css caf-all.css
copy /b caf.min.css ..\core\caf.min.css

@echo off
echo user admin> ftpcmd.dat
echo CodLetTech9192>> ftpcmd.dat
echo cd /domains/codletech.net/public_html/CAF/core>> ftpcmd.dat
echo put caf.min.js>> ftpcmd.dat
echo put caf.min.css>> ftpcmd.dat
echo quit>> ftpcmd.dat
ftp -n -s:ftpcmd.dat ftp.codletech.net
del ftpcmd.dat

