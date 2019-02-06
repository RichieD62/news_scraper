$(document).ready(function() {  

  $(document).on("click", "#saveNote", function() {
      event.preventDefault();
      var id = $(this).data("id");
      var baseURL = window.location.origin;
      var body = $("#noteBody").val().trim();
      var title = $("#noteTitle").val().trim();

      $.ajax({
          method: "POST",
          url: baseURL + "/articles/" + id,
          data: {
            title: title,
            body: body
          }
      })
      .done(function() {
      $("#noteTitle").val(""); 
      $("#noteBody").val("");
      });
     
  });

  $(document).on("click", "#deleteNote", function() {
    event.preventDefault();
    var id = $(this).data("id");
    console.log(id);
    $.ajax({
      method: "DELETE",
      url: "/delete/notes/" + id
    });
      location.href = "/articles";
  });

});