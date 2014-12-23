cd ..\src\caf-js
copy /b libs\jsface.js+Classes\FormUtils\*+Classes\Data\*+Classes\Utils\*+Classes\UI\*+Classes\Themes\*+Classes\Templating\*+Classes\Objects\Object.js+Classes\Objects\Container.js+Classes\Objects\Structure\Template.js+Classes\Objects\Dialog\DialogContainer.js+Classes\Objects\Dialog\Dialog.js+Classes\Objects\Structure\AppContainer.js+Classes\Objects\Structure\MainView.js+Classes\Objects\SideMenu\*+Classes\Objects\List.js+Classes\Objects\Structure\Footer.js+Classes\Objects\Structure\Header.js+Classes\Objects\Structure\Content.js+Classes\Objects\Structure\Page.js+Classes\Objects\Structure\TemplatePage.js+Classes\Objects\Slider\Pagination.js+Classes\Objects\Slider\SliderWrapper.js+Classes\Objects\Slider\SliderSlide.js+Classes\Objects\Slider\Slider.js+Classes\Objects\Slider\Gallery.js+Classes\Objects\Widgets\Label.js+Classes\Objects\Widgets\*+Classes\Objects\Structure\Tab.js+Classes\Objects\Structure\Tabber.js+Classes\Objects\Form\Form.js+Classes\Objects\Form\Input.js+Classes\Objects\Form\Checkbox.js+Classes\Objects\Form\InputEmail.js+Classes\Initialize\*+Classes\Builder\*+Classes\Crypto\*+Classes\API\*+libs\jquery.min.js+libs\fastclick.js+libs\jquery.nicescroll.js+libs\placeholders.js+libs\overthrow.js+libs\snap.js+libs\routie.js+libs\idangerous.swiper.js+libs\underscore.js+libs\JSONfn.js  ..\..\compiling\caf.min.js
cd ..\..\compiling
copy /b caf-compiled.js ..\..\js\caf.min.js
copy /b caf.min.js ..\core\caf.min.js

@echo off
echo user admin> ftpcmd.dat
echo CodLetTech9192>> ftpcmd.dat
echo cd /domains/codletech.net/public_html/CAF/core>> ftpcmd.dat
echo put caf.min.js>> ftpcmd.dat
echo quit>> ftpcmd.dat
ftp -n -s:ftpcmd.dat ftp.codletech.net
del ftpcmd.dat

