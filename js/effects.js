$(document).ready(function() 
{
    $("#oop-articles-url").click(function() {
	toggleVisibility("#oop-articles");
    });
});

function toggleVisibility(element) 
{
    if ($(element).css("display") == "none") {
	$(element).slideDown("fast")
    } else {
	$(element).slideUp("fast")
    }    
}