$(document).ready(function() {  

  $(document).on("click", "#saveButton", function() {
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    $.ajax({
        method: "POST",
        url: "/articles/saved/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
  });

  $(document).on("click", "#saveNote", function() {
      var id = $(this).data("id");
      var body = $("." + id).val().trim()
      var title = $("#" + id).val().trim()

      console.log(body)
      console.log(title)

      $.ajax({
          method: "POST",
          url: "/articles/" + id,
          data: {
            title: title,
            body: body
          }
      })
      .done(function() {
      window.location="/saved"
      });
     
  });

  $(document).on("click", "#deleteNote", function() {
    var id = $(this).data("id");
    console.log(id);
    $.ajax({
      method: "DELETE",
      url: "/delete/notes/" + id
    });
      location.href = "/saved";
  });

  $(document).on("click", "#deleteArticle", function() {
    var id = $(this).data("id");
    console.log(id);
    $.ajax({
      method: "DELETE",
      url: "/delete/article/" + id
    });
      location.href = "/saved";
  });

});