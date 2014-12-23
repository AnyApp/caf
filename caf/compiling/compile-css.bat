cd ..\src\caf-css
del ..\..\css\caf-all.css
copy /b idangerous.swiper.css+utils\icons.css+snap.css+utils\elementTransitions.css+dialogs.css+utils\checkboxes.css+utils\animations.css+utils\responsive.css+utils\min-heights.css+utils\heights.css+utils\max-heights.css+utils\lineHeights.css+utils\font-sizes.css+utils\widths.css+utils\paddings.css+utils\absolutes.css+utils\margins.css+caf.css+utils\margins.css ..\..\css\caf-all.css
copy /b ..\..\css\caf-all.css ..\..\compiling\caf-all.css
cd ..\..\compiling
java -jar yuicompressor-2.4.8.jar -o caf.min.css caf-all.css
copy /b caf.min.css ..\core\caf.min.css

@echo off
echo user admin> ftpcmd.dat
echo CodLetTech9192>> ftpcmd.dat
echo cd /domains/codletech.net/public_html/CAF/core>> ftpcmd.dat
echo put caf.min.css>> ftpcmd.dat
echo quit>> ftpcmd.dat
ftp -n -s:ftpcmd.dat ftp.codletech.net
del ftpcmd.dat

