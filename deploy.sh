#!/bin/bash

# Скрипт для для автоматического обновления блога на gh-pages. 

USAGE="Запускаем так: ./deploy.sh \"Сообщение о коммите\" 

Пример:
  ./deploy.sh \"Обновление стиля.\"
" 

# При любой ошибке скрипт вылетает...
set -e

# Проверяем наличие коммит-сообщения...  
if [ "$1" = "" ]
then
    echo "А сообщение о коммите где?" 
    echo "$USAGE" 
    exit 1
fi

# Устанавливаем переменную, для нашего коммит-сообщения...  
COMMIT_MESSAGE=$1

echo "Заливаем в мастер..."
git commit -a -m "$COMMIT_MESSAGE"
git push -f origin master

echo "Собираем новую версию сайта..."
ghc site.hs
./site rebuild

echo "Копируем во временное место, предварительно удалив старое, если нужно..."
rm -rf /tmp/_site/ || true 1> /dev/null
cp -R _site /tmp/

echo "Переключаемся на gh-pages..."
git checkout gh-pages

echo "Копируем прямо в корень содержимое подготовленного каталога _site..."
cp -R /tmp/_site/* .

echo "Учитываем все последние новшества..."
git add .
git commit -a -m "$COMMIT_MESSAGE"

echo "Заливаем на GitHub Pages..."
git push -f origin gh-pages

echo "Возвращаемся в мастер..."
git checkout master

echo "Готово!"
