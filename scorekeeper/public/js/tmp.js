    function buildPyramid(rows) {
      var container = document.getElementById('pyramid_container')
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < (i + 1); j++) {
          var div = document.createElement('div');
          div.setAttribute('id', i + j);
          $(div).addClass('building_block');
          div.innerText = ((rows - i) * 100);
          container.appendChild(div);
        }

        var div = document.createElement('div');
        container.appendChild(div);
      }
    }

