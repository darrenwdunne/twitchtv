$(document).ready(function() {
  $('#inputSearch').focus();
  showSearchResults(false);
  queryTwitch('');
  //  setInterval(queryTwitch, 1000);
});

$("#checkbox-mature").click(function() {
  // refresh the view
  console.log("checkbox clicked");
  queryTwitch('');
})

$(document).keypress(function(e) {
  if (e.which == 13) {
    // enter pressed
    console.log('Enter pressed');
    processEnter();
  }
});

$("[data-toggle='buttons'] .btn").each(function(i, el) {
  var $button = $(el);
  var checked = $button.find("input[type='checkbox']").prop("checked");
  if (checked) {
    $button.addClass("active");
  } else {
    $button.removeClass("active");
  }
});

// .on is the definitive solution to handle keypress and paste in an input field
$('#inputSearch').on('input', function(data) {
  var txt = $('#inputSearch').val();
  if (txt === '') {
    showSearchResults(false);
  } else {
    queryWiki(txt);
  }
});

function queryTwitch() {
  //  $.getJSON('https://api.twitch.tv/kraken/streams/freecodecamp?callback=?', function(data) {
  //$.getJSON('https://api.twitch.tv/kraken/streams/featured?callback=?', function(data) {
  // Note: "featured" doesn't appear to require the callback?
  $.getJSON('https://api.twitch.tv/kraken/streams/featured', function(data) {
    console.log('getJSON returned:'+data);
    $('#searchResultsTableHolder').empty();

    if (data.featured === undefined) {
      showSearchError(true);
    } else {
      showSearchError(false);
      makeTable($('#searchResultsTableHolder'), data);
    }
  });
}

function showSearchError(err) {
  if (err) {
    $('.form-group').addClass('has-error');
    $('#helpBlock').text('Not found in Wikipedia');
    $('#searchResultsDiv').hide();
    //    $('#inputSearch').addClass('')
  } else {
    $('.form-group').removeClass('has-error');
  }
}


function makeTable(container, data) {
  var table = $('<table id="searchResultsTable"/>').addClass('table table-hover table-bordered table-condensed');
  table.append('<thead class="thead-inverse"><tr><th>Channel</th><th>Name</th><th>Preview</th></tr></thead><tbody>');

  $.each(data.featured, function(k, v) {
    // filter out the mature items?
    if($("#checkbox-mature").is(':checked')) {
      console.log("mature is selected");
      var row = generateTableRow(v.title, v.stream.channel.url, v.image, v.stream.preview.small, v.stream.channel.mature);
      table.append(row);
    } else {
      // filter out the mature ones
      if (v.stream.channel.mature === false) {
        var r = generateTableRow(v.title, v.stream.channel.url, v.image, v.stream.preview.small, v.stream.channel.mature);
        table.append(r);
      }
    }
  });
  table.append('</tbody>');
  showSearchResults(true);
  return container.append(table);
}

function generateTableRow(title, channelURL, image, preview, mature) {
  var aTitle = '<a href="' + channelURL + '" target="blank">' + title + '</a>';
  var aImage = '<img class="image-channel" src="' + image + '"></img>';
  var aPreview = '<img src="' + preview + '"></img>';
  var row = $('<tr/>');
  row.append('<td>' + aImage + '</td><td class="vert-align">' + aTitle + '</td><td>' + aPreview + '</td>');
  if (mature) {
    row.addClass("danger");
  }

  return row;
}

function showSearchResults(show) {
  if (show) {
    $('#searchResultsDiv').show();
    $('#helpBlock').text('Tip: hit Enter to automatically open the first item');
    $('#helpBlock').show();

    // Interesting: jQuery cannot find the rows yet - need to delay until the table has been added to the DOM
    setTimeout(attachListenersToTableRows, 200);
  } else {
    $('#searchResultsDiv').hide();
    $('#helpBlock').hide();
  }
}

function attachListenersToTableRows() {
  $('#searchResultsTable tr').click(function() {
    var row = $(this).find('a');
    if (row !== undefined) {
      var href = row.attr('href');
      if (href !== undefined) {
        openURL(href);
      }
    }
  });
}

function processEnter() {
  // if the table is visible, auto-launch the first URL in the table
  var firstLink = $('#searchResultsTableHolder table a:first');
  if (firstLink !== undefined) {
    openURL(firstLink[0]);
  }
}

function openURL(url) {
  var win = window.open(url, '_blank');
  if (win) {
    win.focus();
  } else {
    //Browser has blocked it
    alert('Please allow popups');
  }

}
