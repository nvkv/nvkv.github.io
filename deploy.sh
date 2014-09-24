#!/bin/bash

git checkout develop
runhaskell site.hs rebuild

rm -rf /tmp/_site
cp -R ./_site /tmp/
cp ./CNAME /tmp/_site/

git checkout master

rm -rf *

cp -R /tmp/_site/* .

git commit -a
git push origin master
