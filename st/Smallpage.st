Smalltalk current createPackage: 'Smallpage' properties: #{'methods'->[object Object]. 'inheritedMethods'->[object Object]. 'klass'->Array. '_size'->a BlockClosure. '_at_put_'->a BlockClosure}!
Object subclass: #SPCouchConnector
	instanceVariableNames: 'couchUrl database'
	category: 'Smallpage'!
!SPCouchConnector commentStamp!
"CouchDB connector for Smallpage app."!

!SPCouchConnector methodsFor: 'accessing'!

couchUrl
	^couchUrl
!

couchUrl: aCouchUrl
	couchUrl := aCouchUrl.
!

database
	^database.
!

database: aDatabaseName
	database := aDatabaseName.
! !

!SPCouchConnector methodsFor: 'initialization'!

initialize
	super initialize.
	"This is debug url"
	couchUrl := 'https://semka.cloudant.com/'.
! !

!SPCouchConnector methodsFor: 'requesting'!

request: document callback: aBlock
	|result data|
	result := jQuery ajax: (couchUrl, database, '/' , document)
				  options: #{
					'type' -> 'GET'.
					'success' -> [:response | aBlock value: response].
					'error' -> [:error | Transcript show: 'error'].
					'dataType' -> 'jsonp'}.
	^data
! !

Widget subclass: #SPProfiles
	instanceVariableNames: 'profiles'
	category: 'Smallpage'!

!SPProfiles methodsFor: 'connection'!

documentReceived: aDocument
	"Handle async documents collection loading"
	profiles := aDocument rows.
	self appendToJQuery: ('#profiles' asJQuery).
! !

!SPProfiles methodsFor: 'initialization'!

initialize
	|connector|
	super initialize.
	connector := SPCouchConnector new database: 'profiles'.
	connector request: '_design/profiles/_view/all'
			 callback: [:result | self documentReceived: result].
! !

!SPProfiles methodsFor: 'rendering'!

renderOn: html
	html div with: [
		html h1 with: 'Привет'.
          	html p with: 'Меня зовут Семён Новиков.'.
          	html p with: 'Вот примерный список способов со мной связаться:'.
          	profiles do: [:each |
			html a href: (each value url); 
                                   with: (html img src: (each value icon))].
          	html p with: [
                  html with: 'Если Вы по делу, то может быть вам нужно посмотреть моё '.
                  html a href: 'http://sdfgh153.moikrug.ru'; with: 'резюме '.
                  html with: 'или '.
                  html a href: 'http://github.com/semka/'; with: 'код.'].
        	html	p with: [
                  	html with: 'Я работаю в прекрасной конторе '.
                  	html a href: 'http://gipis.ru'; with: 'Gipis'. 
                	html with: ', где пишу софт для iOS. '.
                	html with: 'Люблю математику, жену и академическую музыку. Очень медленно думаю и правда не знаю, что значит мой ник.']].
! !

Widget subclass: #SPContent
	instanceVariableNames: 'content'
	category: 'Smallpage'!

!SPContent methodsFor: 'connection'!

documentReceived: document
	content := document.
	self clean.
	self appendToJQuery: ('#about_me' asJQuery).
!

requestAboutMe
	|connector|
	connector := SPCouchConnector new database: 'texts'.
	connector request: 'about_me'
			 callback: [:result | self documentReceived: result].
! !

!SPContent methodsFor: 'rendering'!

renderOn: html
	'#content' asJQuery html: (content text).
!

clean
	"Clean up html widget"
	('#about_me' asJQuery) html: ''.
! !

Widget subclass: #SPArticles
	instanceVariableNames: 'articles'
	category: 'Smallpage'!

!SPArticles methodsFor: 'connection'!

documentReceived: articlesList
	articles := articlesList rows.
	self appendToJQuery: ('#articles' asJQuery).
!

requestArticles
	|connector|
	connector := SPCouchConnector new database: 'articles'.
	connector request: '_design/all/_view/all_documents'
			callback: [:result | self documentReceived: result].
! !

!SPArticles methodsFor: 'rendering'!

clean
	"Clean up html widget"
	('#articles' asJQuery) html: ''.
!

renderOn: html
	html ol with: [
		articles do: [:each | 
                              html li with: [
                                html a href: ((each value) url); with: (each key)]]].
! !

