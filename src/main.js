require(['mustache', 'browsers', 'features'], function (Mustache, browsers, features) {
  var featureTemplate = document.getElementById('feature').innerHTML,
      resultCountTemplate = document.getElementById('count').innerHTML,
      resultCountWrapper = document.getElementById('result-count')
      resultsWrapper = document.getElementById('results'),
      splashWrapper = document.getElementById('splash-page'),
      search = document.getElementById('search');

  function find(input) {
    var result = [];

    function findAux(feature) {
      var keywords = feature.keywords || [];

      keywords.push(feature.name);

      for (var i = 0; i < keywords.length; i++) {
        if (keywords[i].indexOf(input) !== -1) {
          result.push(feature);
          break;
        }
      }
      if (feature.features) {
        feature.features.forEach(findAux);
      }
    }

    Object.keys(features).forEach(function (featureId) {
      var feature = features[featureId];
      findAux(features[featureId]);
    });

    return result.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  function debounce(fn, n) {
    var timeout,
        args;

    return function () {
      args = arguments;

      var later = function () {
        timeout = null;
        fn.apply(null, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, n);
    };
  }

  function renderFeatures(features) {
    resultsWrapper.innerHTML = features.map(function (feature) {
      return Mustache.render(featureTemplate, feature);
    }).join('');
  }

  function renderResultCount(features) {
    resultCountWrapper.innerHTML = Mustache.render(resultCountTemplate, { number: features.length, singular: features.length === 1 });
  }

  var updateHash = debounce(function (value) {
    location.hash = "#" + encodeURIComponent(value);
  }, 1000);


  search.addEventListener('input', function (e) {
    var input = search.value.trim();

    if (document.documentElement.classList.contains("splash")) {
      document.documentElement.classList.remove("splash");
      document.documentElement.classList.add("search");
    }

    if (input !== "") {
      var results = find(input);

      renderFeatures(results);
      renderResultCount(results);
      updateHash(input);
    } else {
      renderFeatures([]);
      updateHash("");
      renderResultCount([]);
    }
  }, true);

  var hash = decodeURIComponent(location.hash.trim().replace('#', ''));

  if (hash !== "") {
    search.value = hash;
    var results = find(hash);
    renderFeatures(results);
    renderResultCount(results);
    document.documentElement.classList.add('search');
  } else {
    document.documentElement.classList.add('splash');
  }
});
