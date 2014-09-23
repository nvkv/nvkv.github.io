#!/bin/bash

git checkout develop
runhaskell site.hs rebuild

rm -rf /tmp/_site
cp -R ./_site /tmp/

git checkout master

