'use strict';

angular.module('padApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'ngAnimate', 'angular-loading-bar', 'ngGridPanel', 'infinite-scroll', 'chart.js', 'ngNumeraljs', 'LocalStorageModule', 'dc.angular']).config(function ($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider, seoServiceProvider) {
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
  localStorageServiceProvider.setPrefix('padApp');

  seoServiceProvider.config({
    title: 'PAD',
    description: 'El Programa de Alfabetización Digital es la propuesta pedagógica de la DTE para acompañar a los docentes en la enseñanza TIC, destinada a las escuelas primarias y CEC de la Provincia de Buenos Aires.',
    keyboards: ['pad', 'buenos aires', 'ba', 'educacion', 'programa provincial', 'alfabetización digital', 'escritorio digital'],
    resetOnChange: true
  });
}).run(function ($rootScope, $state, $stateParams, localStorageService, seoService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.showCartoon = false;
  $rootScope.repository = 'local';
  $rootScope.favoritos = [];
  $rootScope.favoritosSupported = localStorageService.isSupported;

  if (localStorageService.isSupported) {
    var fav = localStorageService.get('favoritos');

    if (fav === undefined || fav === null) {
      localStorageService.set('favoritos', []);
    }

    $rootScope.favoritos = localStorageService.get('favoritos');
  }

  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.showCartoon = false;
    $rootScope.area = '';
  });
});
//# sourceMappingURL=app.js.map

'use strict';

angular.module('padApp').controller('BienvenidoCtrl', function () {});
//# sourceMappingURL=bienvenido.controller.js.map

'use strict';

angular.module('padApp').config(function ($stateProvider) {
  $stateProvider.state('bienvenido', {
    url: '/bienvenido',
    abstract: true,
    templateUrl: 'app/bienvenido/bienvenido.html',
    controller: function controller($scope) {
      $scope.menuItems = [{
        state: 'bienvenido.presentacion',
        title: 'Presentación'
      }, {
        state: 'bienvenido.acercade',
        title: 'Acerca del PAD'
      }];
    }
  }).state('bienvenido.presentacion', {
    url: '/Presentacion',
    views: {
      'content': {
        templateUrl: 'app/bienvenido/presentacion.html',
        controller: function controller($scope, $window) {}
      }
    }
  }).state('bienvenido.acercade', {
    url: '/Acerca',
    views: {
      content: {
        templateUrl: 'app/bienvenido/acercade.html',
        controller: function controller($scope, $http) {
          $http.get('/api/info').success(function (info) {
            $scope.version = info.version;
            $scope.kernel = info.kernel;
          });
        }
      }
    }
  }).state('bienvenido.encuadres', {
    url: '/Encuadres',
    views: {
      'content': {
        templateUrl: 'app/bienvenido/encuadres.html',
        controller: function controller($scope, $window, $http) {
          $http.get('/api/design/encuadres').success(function (data) {
            $scope.encuadres = data;
          });
        }
      }
    }
  });
});
//# sourceMappingURL=bienvenido.js.map

'use strict';

angular.module('padApp').controller('DesignCtrl', function ($rootScope, $scope, $stateParams, $http, $timeout, AreaFactory, seoService) {

  var _ = window._;

  // area is subarea?
  var rootArea = AreaFactory.subarea($stateParams.area);
  if (rootArea !== undefined) {
    $stateParams.axis = $stateParams.subarea;
    $stateParams.subarea = $stateParams.area;
    $stateParams.area = rootArea;
  }

  $scope.target = $stateParams.area;
  $scope.titleArea = $stateParams.area;
  $scope.subarea = $stateParams.subarea;
  $scope.axis = $stateParams.axis;
  $scope.eje = $stateParams.eje;

  $scope.lvl = 0;

  $scope.axisCollection = [];
  $scope.areaCollection = [];

  // request the current area
  $http.get('/api/design/area/' + $scope.target).success(function (data) {

    $rootScope.area = data.shortname;
    $rootScope.showCartoon = true;

    // has subareas?
    if (data.subareas !== undefined && data.subareas.length > 0) {
      if ($scope.subarea !== undefined && $scope.subarea !== null && $scope.subarea !== '') {

        var a = _.findWhere(data.subareas, { name: $scope.subarea });

        if (a === undefined) {
          return;
        }

        $scope.titleArea = a.name;

        // set the area axis
        $scope.axisCollection = a.axis;
      } else {
        $scope.areaCollection = data.subareas;
        createMeta(true);
        return;
      }
    } else {
      $scope.axis = $scope.subarea;
      // set the currents axis
      $scope.axisCollection = data.axis;
    }

    createMeta();

    // open the current axis
    $timeout(function () {
      if ($scope.eje !== undefined) {
        var elem = angular.element('div[data-target="' + $scope.eje + '"]');
        if (elem.length > 0) {
          elem.click();
        }
      }
    });
  });

  function createMeta(isSubArea) {

    if (isSubArea) {
      seoService.title('Area ' + $scope.titleArea + ' | PAD');
    } else {
      seoService.title('Area ' + $scope.titleArea + ' | PAD');
    }

    seoService.description('Bloques y ejes correspondientes a el area ' + $scope.titleArea);
    var keys = ['diseño curricular', 'area', 'ejes', 'bloques', $scope.titleArea];

    var axis = [];

    if (isSubArea) {
      //axis = _.flatten(_.map($scope.areaCollection, function(a){ return a.axis; }));
      keys = keys.concat(_.map($scope.areaCollection, function (a) {
        return a.name;
      }));
    } else {
      axis = $scope.axisCollection;
    }

    if (axis.length > 0) {
      keys = keys.concat(_.map(axis, function (a) {
        return a.name;
      }));
      if (!isSubArea) {
        _.each(axis, function (ax) {
          if (ax.blocks !== undefined && ax.blocks.length > 0) {
            keys = keys.concat(_.map(ax.blocks, function (b) {
              return b.name;
            }));
          }
        });
      }
    }

    keys = _.unique(keys);

    seoService.keyboards(keys);
  };
});
//# sourceMappingURL=design.controller.js.map

'use strict';

angular.module('padApp').config(function ($stateProvider) {
  $stateProvider.state('design', {
    url: '/diseño/:area/:subarea?/:axis?eje',
    templateUrl: 'app/design/design.html',
    controller: 'DesignCtrl'
  });
});
//# sourceMappingURL=design.js.map

'use strict';

angular.module('padApp').directive('delayedModel', function () {
  return {
    scope: {
      model: '=delayedModel'
    },
    link: function link(scope, element, attrs) {

      element.val(scope.model);

      scope.$watch('model', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          element.val(scope.model);
        }
      });

      var timeout;
      element.on('keyup paste search', function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          scope.model = element[0].value;
          element.val(scope.model);
          scope.$apply();
        }, attrs.delay || 500);
      });
    }
  };
}).directive('pinPreload', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    scope: {
      ngSrc: '@'
    },
    link: function link(scope, element, attrs) {
      element.hide();
      element.on('load', function () {
        element.addClass('in');
        element.show();
        element.parent().children('.pin-preload').hide();
      }).on('error', function () {
        //
      });

      scope.$watch('ngSrc', function (newVal) {
        element.removeClass('in');
      });
    }
  };
}]);
//# sourceMappingURL=common.directives.js.map

'use strict';

angular.module('padApp').directive('padAsideMenu', function () {
  return {
    template: ['  <ul>', '    <li data-target="bienvenida">', '      <a ui-sref="bienvenido.presentacion" data-toggle="tooltip" data-placement="top" title="Bienvenida"><div class="expand"></div></a>', '    </li>', '    <li data-target="cloud">', '      <a ui-sref="tangibles.design({area: \'PAD en acción\', axis: \'PAD en acción\', block: \'Sin Especificar\'})" data-toggle="tooltip" data-placement="right" title="PAD en acción"><div class="expand"></div></a>', '    </li>', '    <li data-target="orientaciones">', '      <a ui-sref="orientacion" data-toggle="tooltip" data-placement="right" title="Orientaciones"><div class="expand"></div></a>', '    </li>', '    <li data-target="transversales">', '      <a ui-sref="transversales" data-toggle="tooltip" data-placement="right" title="Transversales"><div class="expand"></div></a>', '    </li>', '    <li data-target="contacto">', '      <a href="http://servicios2.abc.gov.ar/lainstitucion/organismos/direccion_de_tecnologia_educativa/pad/contacto.html"  target="_blank"', '         data-toggle="tooltip" data-placement="bottom" title="Contacto"><div class="expand"></div></a>', '    </li>', '  </ul>', '  <div class="center-aside-menu"></div>'].join('\n'),
    restrict: 'A',
    link: function link(scope, element) {
      $('a[data-toggle="tooltip"]').tooltip();

      element.bind('click', function () {
        element.toggleClass('active');
        event.stopPropagation();
      });

      angular.element(window.document).bind('click', function () {

        if (element.hasClass('active')) {
          element.removeClass('active');
        }
      });
    }
  };
}).directive('padMenuAreas', function ($rootScope, $timeout) {
  // remove from here
  $(function () {

    $('#aside-area-menu').click(function (e) {
      $('.bg-lock').toggleClass('showing');
    });

    $('.bg-lock').click(function () {
      if ($('.bg-lock').hasClass('showing')) {
        /*if (scope.menu.opened === true) {
           scope.menu.hide();
        }*/
        setTimeout(function () {
          $('.bg-lock').removeClass('showing');
        }, 300);
        //$('.bg-lock').removeClass('showing');
        event.stopPropagation();
      }
    });
  });
  return {
    templateUrl: 'app/templates/menu-areas.html',
    restrict: 'A',
    link: function link(scope, element) {
      scope.menu = element.roulette();

      var bubbleHover = $('#bubble_hover')[0];
      //var bubbleClick = $('#bubble_click')[0];

      var areaCartoonActive = false;

      // close the aside menu when 
      // click outside
      angular.element(window.document).bind('click', function (e) {
        if ($('#aside-menu').hasClass('active')) {
          $('#aside-menu').removeClass('active');
        }
        if (scope.menu.opened === true) {
          scope.menu.hide();
          element.addClass('inactive');
        }

        e.stopPropagation();
      });

      // stop rotation
      element.bind('click', function (e) {
        var br = element.children('.border-roulette');

        var rotation = br.rotation();
        br.rotation(rotation);
        element.toggleClass('inactive');
        scope.menu.toggle(window.Math.convertDegs('degs', rotation));
        e.stopPropagation();
      });

      // on item hover
      element.children('ul.roulette').children('li').hover(function (e) {
        // get the hover element
        var elem = $(e.currentTarget);
        // get the area attribute 
        var area = elem.children('a').children('.item-area').attr('data-area');

        if (e.type === 'mouseover' || e.type === 'mouseenter') {
          bubbleHover.play();

          // hide border (fix that thing)
          element.children('.border-roulette').hide();

          // set the current area to the cartoon
          element.children('.center-roulette-area').attr('data-area', area);

          // paint the center
          element.children('.center-roulette-area').addClass('active');

          // set the current area to the cartoon
          $('#area-cartoon-hover').attr('data-area', area);
          // showthe cartoon
          $('#area-cartoon-hover').addClass('active');

          areaCartoonActive = $('#area-cartoon').hasClass('active');

          if (areaCartoonActive) {
            $('#area-cartoon').removeClass('active');
          }
        } else {
          // remove the center
          element.children('.center-roulette-area').removeClass('active');

          // show border (fix that thing)
          element.children('.border-roulette').show();
        }
      });

      // hide the cartoon when mouse leave the item
      element.children('ul.roulette').children('li').on('mouseleave', function () {
        $('#area-cartoon-hover').removeClass('active');
        if (areaCartoonActive) {
          $('#area-cartoon').addClass('active');
        }
      });

      // when item is clicked remove the lock background
      element.children('ul.roulette').children('li').click(function (e) {
        //bubbleHover.play();

        $('#area-cartoon-hover').removeClass('active');

        if ($('.bg-lock').hasClass('showing')) {
          if (scope.menu.opened === true) {
            scope.menu.hide();
          }
          setTimeout(function () {
            $('.bg-lock').removeClass('showing');
          }, 500);
        }
        e.stopPropagation();
      });
    }
  };
});
//# sourceMappingURL=menus.directive.js.map

'use strict';

angular.module('padApp').directive('tangiblesScroller', ['Tangibles', '$timeout', function (Tangibles, $timeout) {
  var _ = window._;

  return {
    templateUrl: 'app/templates/tangibles-scroller.html',
    scope: {
      query: '=tangiblesScroller',
      take: '=tangiblesTake'
    },
    link: function link(scope, element, attrs) {
      var take = scope.take || 10;
      var skip = 0;
      scope.tangibles = [];
      scope.busy = true;
      scope.noResults = false;

      var _reload = function _reload() {
        scope.busy = true;

        Tangibles
        // query, take, skip
        .queryp(scope.query, take, skip).then(function (data) {
          scope.tangibles = scope.tangibles.concat(data.items);
          scope.noResults = scope.tangibles.length === 0;
          console.log(data);
          if (data.total === scope.tangibles.length) {
            return;
          }

          scope.busy = false;
          skip += take;
        });
      };

      scope.$watch('query', function (newVal, oldVal) {

        if (Object.equals(newVal, oldVal) === true) {
          return;
        }

        scope.tangibles = [];
        take = scope.take || 10;
        scope.busy = true;
        _reload();
      });

      scope.loadMore = function () {
        if (scope.busy) {
          return;
        }
        _reload();
      };
    }
  };
}]);
//# sourceMappingURL=tangibles.directive.js.map

'use strict';

angular.module('padApp').controller('MainCtrl', function ($rootScope, $timeout, seoService, $stateParams) {
  seoService.title('Bienvenidos | PAD');
  seoService.description('El Programa de Alfabetización Digital es la propuesta pedagógica de la DTE para acompañar a los docentes en la enseñanza TIC, destinada a las escuelas primarias y CEC de la Provincia de Buenos Aires.');
  seoService.keyboards(['pad', 'buenos aires', 'ba', 'educacion', 'programa provincial', 'alfabetización digital', 'escritorio digital']);

  $rootScope._localip = $rootScope._localip || $stateParams.ip;
  $rootScope._mode = $rootScope._mode || $stateParams.mode;
  $rootScope._port = $rootScope._port || $stateParams.port;

  var html = '<div class="text-center"><strong>Tu PAD en Red</strong></div>' + '<div class="text-center">Tu estudiantes pueden acceder en su navegador desde</div>' + '<div class="text-center"><strong>http://' + $rootScope._localip + ':' + $rootScope._port + '</strong></div>';

  if ($rootScope._localip === '127.0.0.1') {
    html = '<div class="text-center"><strong>Tu PAD en Red</strong></div>' + '<div class="text-center">Al parecer no estas conectado a una red</div>';
  }

  $('document').ready(function () {
    $('#to-info').popover({
      placement: 'bottom',
      html: true,
      content: html,
      show: 0,
      hide: 200
    });

    $('#to-info').click(function () {
      //$(this).popover('toggle');
    });
  });
});
//# sourceMappingURL=main.controller.js.map

'use strict';

angular.module('padApp').config(function ($stateProvider) {
  $stateProvider.state('main', {
    url: '/?mode&ip&port',
    templateUrl: 'app/main/main.html',
    controller: 'MainCtrl'
  }).state('orientacion', {
    url: '/Orientacion',
    templateUrl: 'app/main/orientacion.html',
    controller: function controller() {}
  }).state('transversales', {
    url: '/Transversales',
    templateUrl: 'app/main/transversales.html',
    controller: 'TransversalesCtrl'
  });
});
//# sourceMappingURL=main.js.map

'use strict';

angular.module('padApp').controller('TransversalesCtrl', function ($scope, $http, $timeout) {

  $scope.areaCollection = [];

  $http.get('/api/design/transversales').success(function (data) {

    $scope.areaCollection = data;

    $timeout(function () {});
  });
});
//# sourceMappingURL=transversales.controller.js.map

'use strict';

angular.module('padApp').controller('PanelCtrl', function () {});
//# sourceMappingURL=panel.controller.js.map

'use strict';

angular.module('padApp').config(function ($stateProvider) {
  $stateProvider.state('panel', {
    url: '/panel',
    abstract: true,
    template: '<div ui-view></div>'
  }).state('panel.stats', {
    url: '/stats',
    templateUrl: 'app/panel/stats/stats.html',
    controller: 'StatsCtrl'
  });
});
//# sourceMappingURL=panel.js.map

'use strict';

var numeral = window.numeral;

angular.module('padApp').controller('StatsCtrl', function ($scope, $rootScope, $http, AreaFactory, seoService) {

  $scope.collapse = function (ele) {
    //console.log(ele);
    $('#' + ele).collapse('toggle');
  };

  $scope.charOptions = {
    animationEasing: "easeOutQuart",
    animationSteps: 30
  };

  seoService.title('Estadísticas | PAD');
  seoService.description('Estadísticas sobre el contenido');
  seoService.keyboards(['estadisticas', 'area', 'ejes', 'bloques']);

  var createStats = function createStats(theareas, data) {
    var res = [];

    var _curricular = {};

    var pluckArea = function pluckArea(cda) {
      var a = _curricular[AreaFactory.single(cda.name)] = {
        name: AreaFactory.single(cda.name)
      };
      a.axis = {};
      _.each(cda.axis, function (iax) {
        var bls = _.map(iax.blocks, function (b) {
          return b.name;
        });

        if (bls.length === 0) {
          bls.push('Sin Especificar');
        }
        a.axis[iax.name] = { blocks: bls };
      });
    };

    _.each(theareas, function (cda) {
      if (cda.subareas && cda.subareas.length > 0) {
        _.each(cda.subareas, function (scda) {
          pluckArea(scda);
        });
      } else {
        pluckArea(cda);
      }
    });

    data = _.map(data, function (item) {
      item.area = AreaFactory.single(item.area);
      return item;
    });

    var areas = _.groupBy(data, 'area');

    // AREAS
    _.each(Object.keys(areas), function (a) {

      //console.log(a);

      var CDA = _curricular[a];
      if (CDA === undefined) {
        console.log('Unknown area ' + a);
      }

      var area = {
        name: a,
        axis: [],
        length: areas[a].length,
        size: _.sum(areas[a], function (ai) {
          return ai.size;
        }),
        shortname: _.kebabCase(a)
      };

      var ct = areas[a];

      var axises = _.groupBy(ct, 'axis');

      // AXIS
      _.each(Object.keys(axises), function (ax) {

        var CDax = CDA.axis[ax];
        var amissing = CDax === undefined;

        var axis = {
          name: ax,
          blocks: [],
          length: axises[ax].length,
          size: _.sum(axises[ax], function (axi) {
            return axi.size;
          }),
          missing: amissing
        };

        var ct = axises[ax];

        // BLOCKS
        var blockes = _.groupBy(ct, 'block');

        _.each(Object.keys(blockes), function (b) {

          var ba = AreaFactory.blockAlias(b);
          var bn = b;
          if (ba !== b) {
            bn = ba;
          }

          var bmissing = true;

          if (CDax !== undefined) {

            bmissing = !_.include(CDax.blocks, bn);
          }

          var block = {
            name: bn,
            length: blockes[b].length,
            size: _.sum(blockes[b], function (bi) {
              return bi.size;
            }),
            missing: bmissing
          };

          axis.blocks.push(block);
        });

        area.axis.push(axis);
      });

      res.push(area);
    });

    res = _.sortBy(res, 'name');

    var musica = _.find(res, function (a) {
      return a.name === 'Ed. Artística - Música';
    });
    var danza = _.find(res, function (a) {
      return a.name === 'Ed. Artística - Danza';
    });

    _.each(musica.axis, function (ma) {
      _.each(ma.blocks, function (b) {
        //console.log("_largeBlockAlias['Ed. Artística - Música"+ma.name+AreaFactory.blockAlias(b.name)+"'] = '"+b.name+"';")
      });
    });

    _.each(danza.axis, function (ma) {
      _.each(ma.blocks, function (b) {
        //console.log("_largeBlockAlias['Ed. Artística - Danza"+ma.name+AreaFactory.blockAlias(b.name)+"'] = '"+b.name+"';")
      });

      $scope.total = Object.keys(data).length;
      $scope.areas = res;
      //console.log(JSON.stringify($scope.areas, null, 2));
      //console.log($scope.areas);

      $scope.labels = [];
      $scope.data = [];

      $scope.labelsSize = [];
      $scope.dataSize = [];

      _.each(Object.keys(areas), function (key) {

        var size = _.sum(_.map(areas[key], function (item) {
          return item.size;
        }));

        var formatedSize = numeral(size).format('0 b');
        $scope.labelsSize.push(key + ' (' + formatedSize + ')');
        $scope.dataSize.push(size);

        $scope.labels.push(key);
        $scope.data.push(areas[key].length);
      });

      $scope.totalSize = _.sum($scope.dataSize);
      //console.log($scope.totalSize);
    });
  };

  $http.get('/api/design/areas').success(function (theareas) {

    $http.get('/epm/stats/' + $rootScope.repository).success(function (data) {
      createStats(theareas, data);
    }).error(function (err) {
      console.log('/epm/stats/' + $rootScope.repository);
      console.log(err);
    });
  }).error(function (err) {
    console.log('/epm/design/areas');
    console.log(err);
  });
});
//# sourceMappingURL=stats.controller.js.map

'use strict';

angular.module('padApp').factory('AreaFactory', [function () {

  var _single = {};
  _single['CEC'] = 'CEC';
  _single['Centros Educativos Complementarios'] = 'CEC';
  _single['Ciencias Naturales'] = 'Ciencias Naturales';
  _single['Ciencias Sociales'] = 'Ciencias Sociales';
  _single['Educación Artística'] = 'Educación Artística';
  _single['Ed. Artística - Danza'] = 'Ed. Artística - Danza';
  _single['Ed. Artística - Música'] = 'Ed. Artística - Música';
  _single['Ed. Artística - Plástica'] = 'Ed. Artística - Plástica';
  _single['Ed. Artística - Música'] = 'Ed. Artística - Música';
  _single['Educación Artística - Música'] = 'Ed. Artística - Música';
  _single['Educación Física'] = 'Educación Física';
  _single['EOE'] = 'EOE';
  _single['Equipos de Orientación Escolar'] = 'EOE';
  _single['Inglés'] = 'Inglés';
  _single['Matemática'] = 'Matemática';
  _single['Orientación PAD'] = 'Orientación PAD';
  _single['PAD en acción'] = 'PAD en acción';
  _single['Herramientas Digitales'] = 'Herramientas Digitales';
  _single['Prácticas del Lenguaje'] = 'Prácticas del Lenguaje';
  _single['Temas Transversales'] = 'Temas Transversales';

  var _subarea = {};
  _subarea['Ed. Artística - Plástica'] = 'Educación Artística';
  _subarea['Ed. Artística - Música'] = 'Educación Artística';
  _subarea['Ed. Artística - Danza'] = 'Educación Artística';
  _subarea['Ed. Artística - Teatro'] = 'Educación Artística';

  var _alias = {};
  _alias['PAD en acción'] = 'pea';
  _alias['Herramientas Digitales'] = 'hd';
  _alias['Inglés'] = 'ing';
  _alias['Ciencias Naturales'] = 'cn';
  _alias['Educación Física'] = 'ef';
  _alias['Ciencias Sociales'] = 'cs';
  _alias['Matemática'] = 'mat';
  _alias['Prácticas del Lenguaje'] = 'pdl';
  _alias['Educación Artística'] = 'edar';
  _alias['Ed. Artística - Plástica'] = 'edarp';
  _alias['Ed. Artística - Música'] = 'edarm';
  _alias['Ed. Artística - Danza'] = 'edard';
  _alias['Ed. Artística - Teatro'] = 'edart';
  _alias['EOE'] = 'eoe';
  _alias['CEC'] = 'cec';
  _alias['Orientación PAD'] = 'op';
  _alias['Temas Transversales'] = 'tt';

  var _query = {};
  _query['PAD en acción'] = [{ 'content.area': 'PAD en acción' }];
  _query['Herramientas Digitales'] = [{ 'content.area': 'Herramientas Digitales' }];
  _query['Inglés'] = [{ 'content.area': 'Inglés' }];
  _query['Ciencias Naturales'] = [{ 'content.area': 'Ciencias Naturales' }];
  _query['Educación Física'] = [{ 'content.area': 'Educación Física' }];
  _query['Ciencias Sociales'] = [{ 'content.area': 'Ciencias Sociales' }];
  _query['Matemática'] = [{ 'content.area': 'Matemática' }];
  _query['Prácticas del Lenguaje'] = [{ 'content.area': 'Prácticas del Lenguaje' }];
  _query['Ed. Artística - Plástica'] = [{ 'content.area': 'Ed. Artística - Plástica' }];
  _query['Ed. Artística - Música'] = [{ 'content.area': 'Ed. Artística - Música' }, { 'content.area': 'Educación Artística - Música' }];
  _query['Ed. Artística - Danza'] = [{ 'content.area': 'Ed. Artística - Danza' }];
  _query['Ed. Artística - Teatro'] = [{ 'content.area': 'Ed. Artística - Teatro' }];
  _query['EOE'] = [{ 'content.area': 'Equipos de Orientación Escolar' }, { 'content.area': 'EOE' }];
  _query['CEC'] = [{ 'content.area': 'Centros Educativos Complementarios' }, { 'content.area': 'CEC' }];
  _query['Orientación PAD'] = [{ 'content.area': 'Orientación PAD' }];
  _query['Temas Transversales'] = [{ 'content.area': 'Temas Transversales' }];

  var _blockAlias = {};
  _blockAlias['Contexto sociocultural (Ed.Ar. - Música - Materiales)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Música - Materiales)'] = 'Lenguaje';
  _blockAlias['Producción (Ed.Ar. - Música - Materiales)'] = 'Producción';
  _blockAlias['Recepción (Ed.Ar. - Música - Materiales)'] = 'Recepción';

  _blockAlias['Contexto sociocultural (Ed.Ar. - Música - Lenguaje)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Música - Lenguaje)'] = 'Lenguaje';
  _blockAlias['Producción (Ed.Ar. - Música - Lenguaje)'] = 'Producción';
  _blockAlias['Recepción (Ed.Ar. - Música - Lenguaje)'] = 'Recepción';

  _blockAlias['Contexto sociocultural (Ed.Ar. - Música - Composición)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Música - Composición)'] = 'Lenguaje';
  _blockAlias['Producción (Ed.Ar. - Música - Composición)'] = 'Producción';
  _blockAlias['Recepción (Ed.Ar. - Música - Composición)'] = 'Recepción';

  _blockAlias['Contexto sociocultural (Ed.Ar. - Danza - El cuerpo)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Danza - El cuerpo)'] = 'Lenguaje';
  _blockAlias['Producción (Ed.Ar. - Danza - El cuerpo)'] = 'Producción';
  _blockAlias['Recepción (Ed.Ar. - Danza - El cuerpo)'] = 'Recepción';

  _blockAlias['Contexto sociocultural (Ed.Ar. - Danza - Lenguaje)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Danza - Lenguaje)'] = 'Lenguaje';
  _blockAlias['Recepción (Ed.Ar. - Danza - Lenguaje)'] = 'Recepción';
  _blockAlias['Producción (Ed.Ar. - Danza - Lenguaje)'] = 'Producción';

  _blockAlias['Contexto sociocultural (Ed.Ar. - Danza - Discursos)'] = 'Contexto sociocultural';
  _blockAlias['Lenguaje (Ed.Ar. - Danza - Discursos)'] = 'Lenguaje';
  _blockAlias['Producción (Ed.Ar. - Danza - Discursos)'] = 'Producción';
  _blockAlias['Recepción (Ed.Ar. - Danza - Discursos)'] = 'Recepción';

  var _inverseBlockAlias = {};
  _inverseBlockAlias['Ed. Artística - MúsicaSala de DocentesSin Especificar'] = 'Sin Especificar';
  _inverseBlockAlias['Ed. Artística - MúsicaComposiciónProducción'] = 'Producción (Ed.Ar. - Música - Composición)';
  _inverseBlockAlias['Ed. Artística - MúsicaComposiciónContexto sociocultural'] = 'Contexto sociocultural (Ed.Ar. - Música - Composición)';
  _inverseBlockAlias['Ed. Artística - MúsicaComposiciónLenguaje'] = 'Lenguaje (Ed.Ar. - Música - Composición)';
  _inverseBlockAlias['Ed. Artística - MúsicaComposiciónRecepción'] = 'Recepción (Ed.Ar. - Música - Composición)';
  _inverseBlockAlias['Ed. Artística - MúsicaMateriales del Lenguaje MusicalProducción'] = 'Producción (Ed.Ar. - Música - Materiales)';
  _inverseBlockAlias['Ed. Artística - MúsicaMateriales del Lenguaje MusicalContexto sociocultural'] = 'Contexto sociocultural (Ed.Ar. - Música - Materiales)';
  _inverseBlockAlias['Ed. Artística - MúsicaMateriales del Lenguaje MusicalLenguaje'] = 'Lenguaje (Ed.Ar. - Música - Materiales)';
  _inverseBlockAlias['Ed. Artística - MúsicaMateriales del Lenguaje MusicalRecepción'] = 'Recepción (Ed.Ar. - Música - Materiales)';
  _inverseBlockAlias['Ed. Artística - MúsicaOrganización del Lenguaje MusicalProducción'] = 'Producción (Ed.Ar. - Música - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - MúsicaOrganización del Lenguaje MusicalLenguaje (Ed.Ar. - Música - Lenguaje)'] = 'Lenguaje (Ed.Ar. - Música - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - MúsicaOrganización del Lenguaje MusicalLenguaje'] = 'Contexto sociocultural (Ed.Ar. - Música - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - MúsicaOrganización del Lenguaje MusicalRecepción'] = 'Recepción (Ed.Ar. - Música - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - DanzaEl cuerpo en relación con...Contexto sociocultural'] = 'Contexto sociocultural (Ed.Ar. - Danza - El cuerpo)';
  _inverseBlockAlias['Ed. Artística - DanzaEl cuerpo en relación con...Producción'] = 'Producción (Ed.Ar. - Danza - El cuerpo)';
  _inverseBlockAlias['Ed. Artística - DanzaEl cuerpo en relación con...Lenguaje'] = 'Lenguaje (Ed.Ar. - Danza - El cuerpo)';
  _inverseBlockAlias['Ed. Artística - DanzaEl cuerpo en relación con...Recepción'] = 'Recepción (Ed.Ar. - Danza - El cuerpo)';
  _inverseBlockAlias['Ed. Artística - DanzaLa danza como lenguajeRecepción'] = 'Recepción (Ed.Ar. - Danza - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - DanzaLa danza como lenguajeLenguaje (Ed.Ar. - Danza - Lenguaje)'] = 'Lenguaje (Ed.Ar. - Danza - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - DanzaLa danza como lenguajeLenguaje'] = 'Contexto sociocultural (Ed.Ar. - Danza - Lenguaje)';
  _inverseBlockAlias['Ed. Artística - DanzaSala de DocentesSin Especificar'] = 'Sin Especificar';
  _inverseBlockAlias['Ed. Artística - DanzaLos discursos corporales y el contexto socio–culturalContexto sociocultural'] = 'Contexto sociocultural (Ed.Ar. - Danza - Discursos)';
  _inverseBlockAlias['Ed. Artística - DanzaLos discursos corporales y el contexto socio–culturalProducción'] = 'Producción (Ed.Ar. - Danza - Discursos)';
  _inverseBlockAlias['Ed. Artística - DanzaLos discursos corporales y el contexto socio–culturalLenguaje'] = 'Lenguaje (Ed.Ar. - Danza - Discursos)';
  _inverseBlockAlias['Ed. Artística - DanzaLos discursos corporales y el contexto socio–culturalRecepción'] = 'Recepción (Ed.Ar. - Danza - Discursos)';

  var single = function single(area) {
    return _single[area];
  };

  var alias = function alias(area) {
    return _alias[single(area)];
  };

  var subarea = function subarea(area) {
    return _subarea[single(area)];
  };

  var query = function query(area) {
    return _query[single(area)];
  };

  var addAlias = function addAlias(item) {
    if (item === undefined) {
      return;
    }

    var a = 'unknown';
    if (item.hasOwnProperty('area')) {
      a = item.area;
    } else if (item.hasOwnProperty('content')) {
      if (item.content.hasOwnProperty('area')) {
        a = item.content.area;
      }
    }

    item.sarea = alias(a);
  };

  var blockAlias = function blockAlias(block) {
    var b = _blockAlias[block];
    if (b !== undefined) {
      return b;
    }
    return block;
  };

  var inverseBlockAlias = function inverseBlockAlias(area, axis, block) {
    var b = _inverseBlockAlias[area + axis + block];
    if (b !== undefined) {
      return b;
    }
    return block;
  };

  return {
    alias: alias,
    subarea: subarea,
    single: single,
    normalize: single,
    query: query,
    addAlias: addAlias,
    blockAlias: blockAlias,
    inverseBlockAlias: inverseBlockAlias
  };
}]);
//# sourceMappingURL=area.factory.js.map

'use strict';

angular.module('padApp').service('Tangibles', ['$http', '$rootScope', '$q', 'AreaFactory', 'Favoritos', function ($http, $rootScope, $q, AreaFactory, Favoritos) {
  // loadsh
  var _ = window._;

  return {
    // query plus
    queryp: function queryp(query, take, skip) {
      var def = $q.defer();
      var url = '/epm/queryp/' + $rootScope.repository;

      $http.post(url, { query: query, take: take, skip: skip }).success(function (data) {
        data.items = _.map(data.items, function (item) {
          AreaFactory.addAlias(item);
          item.like = Favoritos.isFavorito(item.uid);
          item.content.block = AreaFactory.blockAlias(item.content.block);
          item.content.tags = item.content.tags.split(',');
          return item;
        });
        def.resolve(data);
      }).error(function (e) {
        def.reject(e);
      });

      return def.promise;
    },
    // regular query
    query: function query(_query) {
      var def = $q.defer();
      var url = '/epm/query/' + $rootScope.repository;

      $http.post(url, _query).success(function (data) {
        data = _.map(data, function (item) {
          AreaFactory.addAlias(item);
          item.like = Favoritos.isFavorito(item.uid);
          item.content.block = AreaFactory.blockAlias(item.content.block);
          item.content.tags = item.content.tags.split(',');
          return item;
        });
        def.resolve(data);
      }).error(function (e) {
        def.reject(e);
      });

      return def.promise;
    }
  };
}]).service('Tangible', ['$http', '$rootScope', '$q', 'AreaFactory', 'Favoritos', function ($http, $rootScope, $q, AreaFactory, Favoritos) {
  // loadsh
  var _ = window._;

  return {
    // query plus
    findByUid: function findByUid(uid) {
      var def = $q.defer();
      var url = '/epm/metadata/' + $rootScope.repository + '/' + uid;

      $http.get(url).success(function (data) {
        AreaFactory.addAlias(data);
        data.like = Favoritos.isFavorito(data.uid);
        data.content.block = AreaFactory.blockAlias(data.content.block);
        data.content.tags = data.content.tags.split(',');
        def.resolve(data);
      }).error(function (e) {
        def.reject(e);
      });

      return def.promise;
    }
  };
}]).factory('Favoritos', ['localStorageService', '$rootScope', '$q', function (localStorageService, $rootScope, $q) {
  // loadsh
  var _ = window._;

  var _getFavoritos = function _getFavoritos() {
    return localStorageService.get('favoritos');
  };

  var saveFavoritos = function saveFavoritos() {
    localStorageService.set('favoritos', $rootScope.favoritos);
  };

  return {
    // query plus
    toggle: function toggle(uid) {

      var favs = _getFavoritos();
      if (_.includes(favs, uid)) {
        _.remove($rootScope.favoritos, function (item) {
          return uid === item;
        });
        saveFavoritos();
        return false;
      } else {
        if ($rootScope.favoritos instanceof Array) {
          $rootScope.favoritos.push(uid);
          saveFavoritos();
          return true;
        }
      }
    },
    isFavorito: function isFavorito(uid) {
      var favs = _getFavoritos();
      return _.includes(favs, uid);
    },
    getFavoritos: function getFavoritos() {
      return _getFavoritos();
    }
  };
}]);
//# sourceMappingURL=tangibles.service.js.map

'use strict';

angular.module('padApp').controller('TangibleCtrl', function ($rootScope, $scope, $stateParams, $http, $timeout, Tangible, Favoritos, seoService) {

  var uid = $stateParams.uid;

  $http.get('/api/info').success(function (info) {
    $scope.isDesktop = info.mode === 'desktop';
  });

  $scope.accedio = false;

  Tangible.findByUid(uid).then(function (data) {
    $scope.tangible = data;

    if ($scope.tangible === undefined) {
      return;
    }

    var d = $scope.tangible.content.description;
    var s = $scope.tangible.content.source;
    $scope.tangible.hasDescription = d !== '' && d !== undefined && d !== null;
    var hasSource = s !== '' && s !== undefined && s !== null;

    if (hasSource) {

      $timeout(function () {
        $('#source').linkify();
        $('[data-toggle="tooltip"]').tooltip();
      });
    }

    seoService.title($scope.tangible.content.title + ' | ' + $scope.tangible.content.area);
    seoService.description($scope.tangible.content.content);
    seoService.keyboards($scope.tangible.content.tags);
  });

  $scope.take = 10;
  $scope.query = {};
  $scope.showRel = false;

  $scope.addFavoritos = function () {
    $scope.tangible.like = Favoritos.toggle($scope.tangible.uid);
  };

  $scope.relFirst = function () {
    if ($scope.tangible === undefined) {
      return;
    }

    $scope.showRel = true;

    var tags = $scope.tangible.content.tags;

    if (typeof tags === 'string') {
      tags = tags.spli(',');
    }

    var mtags = _.map(tags, function (t) {
      return _.escapeRegExp(_.trim(t));
    });

    var etag = '(' + mtags.join('|') + ')';

    $scope.query = { 'content.tags': { $regex: etag }, $not: { uid: { $regex: uid } } };
    $('#header-relations').hide();
  };
});
//# sourceMappingURL=tangible.controller.js.map

'use strict';

angular.module('padApp').controller('TangiblesCtrl', function ($rootScope, $scope, $stateParams, $timeout, AreaFactory, seoService) {

  $scope.area = $stateParams.area;
  $scope.sarea = AreaFactory.alias($stateParams.area);
  $scope.axis = $stateParams.axis;
  $scope.block = $stateParams.block;

  $scope.iniciando = true;

  $scope.query = {};
  $scope.take = 15;

  var sections = [$scope.area];

  var q = [];

  if ($scope.area !== undefined) {
    q = AreaFactory.query($scope.area);
  }

  if ($scope.axis !== undefined) {
    _.each(q, function (a) {
      a['content.axis'] = $scope.axis;
    });
    sections.push($scope.axis);
  }

  if ($scope.block !== undefined) {
    _.each(q, function (a) {
      var ba = AreaFactory.inverseBlockAlias($scope.area, $scope.axis, $scope.block);
      if (ba !== $scope.block) {
        a['content.block'] = { $in: [ba, $scope.block] };
        console.log(a);
      } else {
        a['content.block'] = $scope.block;
      }
    });
    sections.push($scope.block);
  }

  if (q.length === 1) {
    q = q[0];
  } else if (q.length > 1) {
    q = { $or: q };
  }

  $timeout(function () {
    $scope.query = q;
    $scope.iniciando = false;
  }, 500);

  seoService.title(sections.join(' - ') + ' | PAD');
  seoService.description('Contenido correspondiente a  ' + sections.join(' - '));
  seoService.keyboards(['contenido digital', 'diseño curricular'].concat(sections));
}).controller('TagTangiblesCtrl', function ($scope, $stateParams, $timeout, $http, seoService) {

  $scope.tag = $stateParams.tag;
  var etag = _.escapeRegExp(_.trim($scope.tag));

  $scope.take = 10;
  $scope.query = {};
  $scope.iniciando = true;

  $timeout(function () {
    $scope.query = { 'content.tags': { $regex: etag } };
    $scope.iniciando = false;
  }, 500);

  seoService.title('Palabra clave ' + $stateParams.tag + ' | PAD');
  seoService.description('Resultados para palabra clave ' + $stateParams.tag);
  seoService.keyboards(['contenido digital', 'diseño curricular', 'tag', 'palabra clave', $stateParams.tag]);
}).controller('SearchTangiblesCtrl', function ($scope, $state, $stateParams, $location, $timeout, $http, seoService) {
  $scope.texto = $stateParams.texto;
  $scope.searchText = $scope.texto;

  var trimTexto = _.trim($scope.texto);
  $scope.iniciando = true;

  function _search() {
    if ($scope.searchText === undefined) {
      return;
    }
    /*if ($scope.searchText === trimTexto) {
      return;
    }*/
    //$state.go('tangibles.buscar', {texto: $scope.searchText });
    $stateParams['texto'] = $scope.searchText;
    $state.params['texto'] = $scope.searchText;
    $location.search('texto', $scope.searchText);

    _realseSearch($scope.searchText);
  }

  $scope.search = function () {
    _search();
  };

  $scope.query = {};

  function _realseSearch(target) {
    trimTexto = _.trim(target);
    var texto = _.escapeRegExp(trimTexto);

    $scope.query = {
      $or: [{ 'content.tags': { $regex: texto.scapeRegex() } }, { 'content.content': { $regex: texto.scapeRegex() } }, { 'content.title': { $regex: texto.scapeRegex() } }, { 'uid': { $regex: texto.scapeRegex() } }]
    };

    seoService.title('Búsqueda para ' + target + ' | PAD');
    seoService.description('Resultados de busqueda para ' + target);
    seoService.keyboards(['contenido digital', 'busqueda', 'diseño curricular', 'tag', 'palabra clave', target]);
  }

  $timeout(function () {
    //_search();

    $scope.$watch('searchText', function () {
      _search();
    });

    $scope.iniciando = false;
    $('#searchInput').focus();
  }, 500);
}).controller('FavoritosTangiblesCtrl', function ($scope, $rootScope, $stateParams, $timeout, $http, Favoritos, seoService) {
  $scope.take = 10;
  $scope.query = {};
  $scope.iniciando = true;

  $timeout(function () {
    var favs = Favoritos.getFavoritos();
    $scope.query = { 'uid': { '$in': $rootScope.favoritos } };
    $scope.iniciando = false;

    seoService.title('Mis pines | PAD');
    seoService.description('Contenido en favoritos');
    seoService.keyboards(['contenido digital', 'busqueda', 'diseño curricular', 'favoritos']);
  }, 500);
});
//# sourceMappingURL=tangibles.controller.js.map

'use strict';

angular.module('padApp').config(function ($stateProvider) {
  $stateProvider.state('tangibles', {
    url: '/tangibles',
    abstract: true,
    template: '<ui-view/>'
  }).state('tangibles.design', {
    url: '/diseño/:area/:axis/:block',
    templateUrl: 'app/tangibles/tangibles.html',
    controller: 'TangiblesCtrl'
  }).state('tangibles.buscar', {
    url: '/buscar?texto?',
    templateUrl: 'app/tangibles/tangibles.search.html',
    controller: 'SearchTangiblesCtrl'
  }).state('tangibles.tag', {
    url: '/tag/:tag',
    templateUrl: 'app/tangibles/tangibles.tag.html',
    controller: 'TagTangiblesCtrl'
  }).state('tangibles.favoritos', {
    url: '/favoritos',
    templateUrl: 'app/tangibles/tangibles.favoritos.html',
    controller: 'FavoritosTangiblesCtrl'
  }).state('tangibles.ver', {
    url: '/ver/:uid',
    templateUrl: 'app/tangibles/tangible.html',
    controller: 'TangibleCtrl'
  });
});
//# sourceMappingURL=tangibles.js.map

'use strict';

(function (window, angular, undefined) {
  'use strict';

  /*
   * add this line on the head
   */

  var dcAngular = angular.module('dc.angular', []);

  dcAngular.provider('seoService', function () {

    var _config = {
      title: '',
      description: '',
      keyboards: [],
      resetOnChange: true
    };

    this.config = function (ops) {
      ops = ops || {};

      _config.title = ops.title || '';
      _config.description = ops.description || '';
      _config.keyboards = ops.keyboards || [];
      _config.resetOnChange = ops.resetOnChange || true;
    };

    this.$get = ['$rootScope', '$window', '$document', '$timeout', function ($rootScope, $window, $document, $timeout) {

      var self = this;

      self.config = _config;

      self.title = '';
      self.description = '';
      self.keyboards = [];

      if (!$document) {
        $document = document;
      } else if ($document[0]) {
        $document = $document[0];
      }

      var title = function title(value) {

        if (value !== undefined && value !== null) {
          self.title = value;

          //set on document
          $timeout(function () {
            $document.title = self.title || $document.title;
          });
        }

        return self.title;
      };

      var description = function description(value) {
        if (value !== undefined && value !== null) {
          self.description = value;

          angular.element('meta[name=description]').remove();
          angular.element('head').append('<meta name="description" content="' + self.description + '">');
        }

        return self.description;
      };

      var keyboards = function keyboards(value, append) {
        append = append || false;

        if (value !== undefined && value !== null) {
          if (self.keyboards instanceof Array === false) {
            self.keyboards = [];
          }

          //convert to array
          if (typeof value === 'string') {
            value = [value];
          } else if (value instanceof Array === false) {
            value = [];
          }

          if (append === true) {
            self.keyboards = self.keyboards.concat(value);
          } else {
            self.keyboards = value;
          }

          angular.element('meta[name=keyboards]').remove();
          angular.element('head').append('<meta name="keyboards" content="' + self.keyboards.join(',') + '">');
        }

        return self.keyboards;
      };

      var reset = function reset() {
        title(_config.title);
        description(_config.description);
        keyboards(_config.keyboards);
      };

      reset();

      $rootScope.$on('$stateChangeStart', function () {
        if (self.config.resetOnChange === true) {
          reset();
        }
      });

      $rootScope.$on('$routeChangeStart', function () {
        if (self.config.resetOnChange === true) {
          reset();
        }
      });

      return {
        title: title,
        description: description,
        keyboards: keyboards
      };
    }];
  });
})(window, window.angular);
//# sourceMappingURL=dc.angular.js.map

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;
/*
 * Utils
 */

(function ($, window, document, undefined) {
  'use strict';

  var Math = window.Math;

  Math.convertDegs = function (type, num) {
    if (type == "rads") {
      return num * 180 / Math.PI;
    }

    if (type == "degs") {
      return num * Math.PI / 180;
    }
  };

  $.fn.rotation = function (degs) {

    if (degs === undefined) {
      var f = this.first();
      var elem = $(f);

      var matrix = elem.css("-webkit-transform") || elem.css("-moz-transform") || elem.css("-ms-transform") || elem.css("-o-transform") || elem.css("transform");

      if (matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      } else {
        var angle = 0;
      }

      if (angle < 0) {
        angle += 360;
      }

      return angle;
    }

    return this.each(function () {
      var elem = $(this);
      elem.css({
        '-webkit-transform': 'rotate(' + degs + 'deg)',
        '-moz-transform': 'rotate(' + degs + 'deg)',
        '-ms-transform': 'rotate(' + degs + 'deg)',
        '-o-transform': 'rotate(' + degs + 'deg)',
        'transform': 'rotate(' + degs + 'deg)'
      });
    });
  };

  Object.equals = function (x, y) {
    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) return false;
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (var p in x) {
      if (!x.hasOwnProperty(p)) continue;
      // other properties were tested using x.constructor === y.constructor

      if (!y.hasOwnProperty(p)) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

      if (x[p] === y[p]) continue;
      // if they have the same strict value or identity then they are equal

      if (_typeof(x[p]) !== "object") return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

      if (!Object.equals(x[p], y[p])) return false;
      // Objects and Arrays must be tested recursively
    }

    for (p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
      // allows x[ p ] to be set to undefined
    }
    return true;
  };

  String.prototype.scapeRegex = function () {
    var self = this;
    var specialChars = [{ val: 'a', regex: /[áàãâä]/g }, { val: 'e', regex: /[éèêë]/g }, { val: 'i', regex: /[íìîï]/g }, { val: 'o', regex: /[óòõôö]/g }, { val: 'u', regex: /[úùûü]/g }, { val: 'n', regex: /[ñ]/g }, { val: 'A', regex: /[ÁÀÃÂÄ]/g }, { val: 'E', regex: /[ÉÈÊË]/g }, { val: 'I', regex: /[ÍÌÎÏ]/g }, { val: 'O', regex: /[ÓÒÕÔÖ]/g }, { val: 'U', regex: /[ÚÙÛ]/g }, { val: 'N', regex: /[Ñ]/g }];

    specialChars.forEach(function (r) {
      self = self.replace(r.regex, r.val);
    });

    return self;
  };
})(jQuery, window, document);

/*!
 * 
 * Menu Roulette - PAD
 *
 * Copyright (c) 2014 - Dirección de Tecnología Educativa
 * Licencia GPL v3 http://www.gnu.org/licenses/gpl-3.0.html
 */

(function ($, window, undefined) {
  'use strict';

  // Librería global de Matemática

  var Math = window.Math;

  var Menu = function Menu(elem, opciones) {
    var self = this;

    var opts = $.extend({}, $.fn.roulette.defaults, opciones);

    var w = elem.width();

    self.opened = false;

    self.show = function (degs) {
      var count = 0;
      var radio = w / 2;

      elem.children('ul.roulette').children('li').each(function () {
        var $l = $(this);
        $l._roulettePosition(count++, radio, degs);
      });

      // TODO: warning
      self.opened = true;
    };

    self.hide = function () {
      elem.children('ul.roulette').children('li').each(function () {
        var count = 0;
        var $l = $(this);
        $l.stop().animate({ 'top': w / 2 + 'px', 'left': w / 2 + 'px' }, { duration: 400 + count++ * 15 });
      });
      // TODO: warning
      self.opened = false;
    };

    self.toggle = function (degs) {
      if (self.opened === true) {
        self.hide();
      } else {
        self.show(degs);
      }
    };

    //init 
    elem.children('ul.roulette').children('li').each(function () {
      var count = 0;
      var $l = $(this);
      $l.stop().css({ 'top': w / 2 + 'px', 'left': w / 2 + 'px' });
    });
    return self;
  };

  $.fn._roulettePosition = function (h, radio, initAngle, w, cb) {
    return this.each(function () {
      var elem = $(this);

      initAngle = initAngle || 0;

      // definicion del angulo 360 en Radianes
      var A360 = parseFloat(2 * Math.PI);

      var dif = parseFloat(A360 / 7);

      var angulo = initAngle + dif * h - Math.PI / 2;

      var y = Math.round(radio * Math.sin(angulo));
      var x = Math.round(radio * Math.cos(angulo));

      var rm = Math.floor(Math.random() * 250) + 30;

      elem.stop().css({ 'top': w / 2 + 'px', 'left': w / 2 + 'px' }).animate({
        'top': y + radio,
        'left': x + radio
      }, {
        duration: 150 + rm
      }, cb);
    });
  };

  $.fn.roulette = function (opciones) {

    var elem = $(this).first();
    return new Menu(elem, opciones);
  };

  $.fn.roulette.defaults = {
    anchoAlto: 300,
    posicion: 'middle center',
    initAngle: 0
  };
})(jQuery, window);
//# sourceMappingURL=menu.roulette.js.map

'use strict';

angular.module('padApp').factory('Modal', function ($rootScope, $modal) {
  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's scope
   * @param  {String} modalClass - (optional) class(es) to be applied to the modal
   * @return {Object}            - the instance $modal.open() returns
   */
  function openModal(scope, modalClass) {
    var modalScope = $rootScope.$new();
    scope = scope || {};
    modalClass = modalClass || 'modal-default';

    angular.extend(modalScope, scope);

    return $modal.open({
      templateUrl: 'components/modal/modal.html',
      windowClass: modalClass,
      scope: modalScope
    });
  }

  // Public API here
  return {

    /* Confirmation modals */
    confirm: {

      /**
       * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
       * @param  {Function} del - callback, ran when delete is confirmed
       * @return {Function}     - the function to open the modal (ex. myModalFn)
       */
      delete: function _delete(del) {
        del = del || angular.noop;

        /**
         * Open a delete confirmation modal
         * @param  {String} name   - name or info to show on modal
         * @param  {All}           - any additional args are passed straight to del callback
         */
        return function () {
          var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

          deleteModal = openModal({
            modal: {
              dismissable: true,
              title: 'Confirm Delete',
              html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
              buttons: [{
                classes: 'btn-danger',
                text: 'Delete',
                click: function click(e) {
                  deleteModal.close(e);
                }
              }, {
                classes: 'btn-default',
                text: 'Cancel',
                click: function click(e) {
                  deleteModal.dismiss(e);
                }
              }]
            }
          }, 'modal-danger');

          deleteModal.result.then(function (event) {
            del.apply(event, args);
          });
        };
      }
    }
  };
});
//# sourceMappingURL=modal.service.js.map

angular.module("padApp").run(["$templateCache", function($templateCache) {$templateCache.put("components/modal/modal.html","<div class=\"modal-header\">\n  <button ng-if=\"modal.dismissable\" type=\"button\" ng-click=\"$dismiss()\" class=\"close\">&times;</button>\n  <h4 ng-if=\"modal.title\" ng-bind=\"modal.title\" class=\"modal-title\"></h4>\n</div>\n<div class=\"modal-body\">\n  <p ng-if=\"modal.text\" ng-bind=\"modal.text\"></p>\n  <div ng-if=\"modal.html\" ng-bind-html=\"modal.html\"></div>\n</div>\n<div class=\"modal-footer\">\n  <button ng-repeat=\"button in modal.buttons\" ng-class=\"button.classes\" ng-click=\"button.click($event)\" ng-bind=\"button.text\" class=\"btn\"></button>\n</div>");
$templateCache.put("app/bienvenido/acercade.html","<div class=\"aboutus\">\n    <h4>¿Qué es el PAD?</h4>\n\n    <p>El Programa de Alfabetización Digital es la propuesta pedagógica de la DTE para acompañar a los docentes en la enseñanza TIC, destinada a las escuelas primarias y CEC de la Provincia de Buenos Aires.</p>\n    \n    <p>Desde el equipo del PAD trabajamos articuladamente en dos áreas:</p>\n    <ul>\n      <li>la de Producción y curación de asistentes digitales: donde seleccionamos y producimos recursos digitales para la enseñanza</li>       \n      <li>la de Acompañamiento territorial: que, desde nuestros talleres, presentaciones, capacitaciones, acompañamientos situados, etc. Hacemos llegar el PAD a todos los rincones de la Provincia.</li>\n    </ul>\n\n    <h4>¿Cuál es nuestro propósito?</h4>\n\n    <p>Desde el PAD queremos acompañar a los docentes y brindarles recursos para enseñar con TIC, en un mundo donde el conocimiento se construye de manera diferente y  nos propone el desafío de enseñar y aprender de manera diferente....\n    Desde ese lugar el Programa de Alfabetización Digital proyecta líneas de acción articuladas con las direcciones de nivel primario , CEC y los diversos planes, programas y proyectos que las atraviesan para, de manera conjunta, asistir y potenciar a las escuelas en  la ampliación de horizontes para los alumnos. Esto será posible integrando de manera pertinente las TIC al desarrollo curricular para fortalecer las situaciones de enseñanza y promocionar la adquisición de aprendizajes significativos por parte de los alumnos.\n    Para ello ponemos a disposición este espacio al que llamamos “escritorio” y que, enmarcado en los Diseños Curriculares, ha sido pensado para que los docentes hagan una verdadera apropiación y los utilicen de acuerdo con sus propios criterios y las necesidades que se les presentan en cada situación de enseñanza. Nuestra intención no es ofrecer recetas ni propuestas cerradas; por el contrario, apostamos al protagonismo de la intervención del docente, no sólo para que conviertan estos recursos en asistentes digitales para la enseñanza, sino también para que puedan crear y compartir los propias producciones en este espacio. Queremos que la comunidad educativa en su conjunto sea productora de contenidos digitales para la enseñanza, se sume a este proyecto, lo enriquezca y sea parte activa en esta experiencia colectiva de educar a nuestros niños, desde los lenguajes y las posibilidades que les presenta el mundo actual.\n    Asimismo, tenemos en nuestro horizonte estar físicamente presentes acompañando a los docentes en la apropiación de una enseñanza con TIC y para ello desarrollamos un sinfín de actividades territoriales, como las visitas a escuelas, acompañamientos situados, “desembarcos” (donde el equipo PAD, en acuerdo con la escuela entra al aula y acompaña a los docentes en sus clases), presentaciones, talleres a docentes, directores, inspectores y otros actores que deseen formar parte de este proceso.\n    </p>\n\n    <h4>¿Quiénes hacemos el PAD?</h4>\n\n    <p>El Programa de Alfabetización Digital está integrado por un equipo multidisciplinario de profesionales de la educación. La conformación de nuestro equipo tuvo en consideración la posibilidad de abordar desde perspectivas didácticas y pedagógicas la inclusión curricular de las TIC, proceso complejo que sin dudas demanda de un conjunto de saberes de diversa índole. Es por ello que somos un equipo compuesto por especialistas de las áreas curriculares del nivel Primario (Prácticas del Lenguaje, Matemática, Ciencias Sociales, Ciencias Naturales, Ed. Artística, Ed. Física), psicólogos especializados en CEC, pedagogos, docentes, directores, técnicos, desarrolladores, diseñadores e ilustradores, que conocemos en profundidad los lineamientos del Diseño Curricular de la provincia (documento que organiza el escritorio del PAD y la principal estrategia de trabajo del equipo) y trabajamos articuladamente para pensar, seleccionar y producir recursos digitales para potenciar la enseñanza y los aprendizajes en las aulas.</p>\n\n    <h4>¿Qué vas a encontrar en este espacio?</h4>\n\n    <p>El equipo PAD inició el armado del “escritorio” a mediados de 2013. En ese momento, se definió el diseño a adoptar y se inició la curación de tangibles en la Web. Hablamos de “curación” en tanto búsqueda, selección y organización de recursos ya existentes.\n    En la actualidad, el equipo del PAD se encuentra produciendo sus propios asistentes digitales para la enseñanza, a partir de un trabajo articulado entre los especialistas y los integrantes del equipo técnico, responsables últimos del buen funcionamiento del escritorio y por lo tanto figuras centrales de nuestro equipo.\n    En este sentido, es importante decir que el “escritorio” fue diseñado y puesto en marcha a partir del desarrollo de un concepto de imagen propio, que tiene en consideración diferentes elementos como lo bonarense, lo escolar, lo digital, entre otras cosas.\n    En este espacio vas a encontrar entonces asistentes digitales para la enseñanza de Prácticas del Lenguaje, Matemática, Ciencias Sociales, Ciencias Naturales, Educación Física, Inglés, Educación Artística, y para los CEC.\n    La arquitectura del “escritorio” responde no sólo a la distinción de las área curriculares, sino también a los núcleos de contenidos que plantea el Diseño Curricular de la Pcia para cada una de ellas.\n    Todos los materiales disponibles en el “escritorio” cuentan con sus respectivas fichas técnicas, que indican la relación con el diseño curricular, y orientan sobre sus posibles usos para la enseñanza.\n    Haciendo click, podrá descargar diversidad de asistentes digitales: Videos, textos digitales, audiolibros, mapas, imágenes, presentaciones, gráficos, aplicaciones, tutoriales, simulaciones.</p>\n\n    <h4>Versión</h4>\n\n    <p>La versión actual es {{version}}, kernel {{kernel}}</p>\n\n    <h4>Distribuido bajo la Licencia GNU GPL v3</h4>\n    <p>\n      Copyright (c) 2013-2015 Dirección de Tecnología Educativa de Buenos Aires (Dte-ba)\n    </p>\n    <p>La aplicación PAD es Software Libre; Usted puede redistribuirlo y/o modificarlo bajo los términos de la Licencia Pública General de la GNU según los datos publicados por la Free Software Foundation, de la versión 3 de la Licencia, o bien, a su elección, cualquier versión posterior. </br>\n    Usted debe haber recibido una copia de la Licencia Pública General de la GNU junto con este programa, si no es asi, ingrese en <a href=\"http://www.gnu.org/licenses/gpl-3.0.html\" target=\"_blank\">Aquí</a>.</p>\n\n    <h4>¿Encontraste un Error?</h4>\n\n    <p>Reportalo <a href=\"https://github.com/Dte-ba/pad/issues\" target=\"_blank\">aquí</a></p>\n\n  </div>");
$templateCache.put("app/bienvenido/bienvenido.html","<div class=\"container\">\n  \n  <div class=\"row welcome-wrap\">\n    <div class=\"col-sm-11 col-sm-offset-1\">\n\n      <div class=\"row\">\n        <div class=\"col-xs-10 col-xs-offset-2 col-sm-12 col-sm-offset-0 col-md-12 col-md-offset-0 col-lg-12 col-lg-offset-0\">\n          <ul id=\"menu-welcome\">\n            <li ng-repeat=\"item in menuItems\" data-target=\"{{item.title}}\"  ng-class=\"{ active: $state.includes(item.state) }\">\n              <a data-toggle=\"tooltip\" data-placement=\"bottom\" \n                 ui-sref=\"{{item.state}}\" title=\"{{item.title}}\"><div class=\"expand\"></div></a>\n            </li>\n            <!--<li data-target=\"Marco General\"  ng-class=\"{ active: $state.includes(item.state) }\">\n              <a data-toggle=\"tooltip\" data-placement=\"bottom\" \n                 href=\"/assets/files/marco_general.pdf\" target=\"_blank\" title=\"Marco General\"><div class=\"expand\"></div></a>\n            </li>-->\n          </ul>\n        </div>\n      </div>\n\n      <div class=\"welcome-content\">\n        <div ui-view=\"content\"></div>\n      </div>\n    </div>\n  </div>\n</div>");
$templateCache.put("app/bienvenido/encuadres.html","<div class=\"encuadre\">\n  <div class=\"row\">\n      <!--<div ng-repeat=\"encuadre in encuadres\" class=\"col-sm-4 col-md-3 col-lg-2\">\n        <div class=\"eje\">\n          <a ng-href=\"{{encuadre.file}}\" target=\"_blank\" >\n            <div class=\"img-wrap\">\n              <img ng-src=\"{{encuadre.cover}}\" alt=\"{{encuadre.alt}}\">\n            </div>\n            \n            <div class=\"title-wrap\">\n              {{encuadre.alt}}\n            </div>\n          </a>\n         </div>\n      </div>-->\n  </div>\n</div>");
$templateCache.put("app/bienvenido/marco.html","");
$templateCache.put("app/bienvenido/presentacion.html","<div class=\"aboutus\">\n  <h4>Autoridades</h4>\n\n  <ul class=\"creditos-ceremonial\">\n    <li>\n      <p><strong>Gobernadora</strong> <br>\n      <span>Lic. María Eugenia Vidal</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Vicegobernador</strong> <br>\n      <span>Dr. Daniel Salvador</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Directora General de Cultura y Educación</strong> <br>\n      <span>Dr. Alejandro Finocchiaro</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Vicepresidente 1º del Consejo General de Cultura y Educación</strong> <br>\n      <span>Dr. Claudio Crissio</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Jefe de Gabinete de Asesores</strong> <br>\n      <span>Don Javier Mezzamico</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Subsecretario de Educación</strong> <br>\n      <span>Lic. Sergio Siciliano</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Director Provincial de Tecnología de la Educación</strong> <br>\n      <span>Lic. Gustavo Goenaga</span>\n      </p>\n    <li>\n    </li>\n      <p><strong>Tecnología Educativa</strong> <br>\n      <span>Prof. Liliana Vigolo</span>\n      </p>\n      </li>\n  </ul>\n\n  <h4>Equipo del Programa de Alfabetización Digital -PAD-</h4>\n\n  <ul class=\"creditos-coordinadora\">\n    <li>\n      <p>\n        <strong>Coordinadora</strong></br>\n        <span>Juliana Ricardo</span>\n      </p>\n    </li>\n  </ul>\n\n  <ul class=\"creditos-equipo\">\n    <li><strong>Equipo técnico-pedagógico</strong></li>\n    <li><span>Analía González</span></li>\n    <!--<li><span>Andrés Gomel</span></li>-->\n    <li><span>Patricia Adamini</span></li>\n    <!--<li><span>Christian Beri</span></li>-->\n    <!--<li><span>Pedro Luis Peretti</span></li>-->\n    <li><span>Eugenia Heredia</span></li>\n    <li><span>Graciela Fernández Troiano</span></li>\n    <li><span>Silvia Perassolo</span></li>\n    <!--<li><span>Viviana Verón</span></li>-->\n    <li><span>Miriam Inés Volosín</span></li>\n    <li><span>Amadeo Carrizo</span></li>\n    <li><span>Leandro Radesh</span></li>\n    <li><span>Silvia Ramírez</span></li>\n    <li><span>Debora Arce</span></li>\n    <li><span>Silvia Perassolo</span></li>\n    <li><span>Leonardo Lambardi</span></li>\n    <li><span>Marisa Velazquez</span></li>\n    <li><span>Rocio Velazquez</span></li>\n    <li><span>Liliana Sabat</span></li>\n  </ul>\n\n  <ul class=\"creditos-equipo\">\n    <li><strong>Equipo de desarrollo</strong></li>\n    <li><span>Delmo Carrozzo <small>(Arq. de software)</small></span></li>\n    <li><span>Rodrigo Bonilla <small>(Diseño UI & UX)</small></span></li>\n    <!--<li><span>Juan José Monteleone</span></li>-->\n    <li><span>Germán Villafañe <small>(Implementación)</small></span></li>\n    <li><span>Miguel Verón <small>(Análisis de software)</small></span></li>\n  </ul>\n\n  <p class=\"agradecimientos\">\n    Un Gracias inmenso a Adriana Vidal, Verónica Wogeschaffen , Silvia Bon, Julio Shinca, Fernando M. Waltos, Rosana Froiz, Andrés Gomel, Christian Beri, Pedro Luis Peretti, Viviana Verón, Juan José Monteleone y Alejandro Palestrini; por sus aportes a este proyecto, y especialmente a María Elene Patzer por haber soñado y hecho posible el entorno pedagógico PAD, con trabajo, compromiso y calidez.\n  </p>\n\n  <div class=\"aboutus-footer\">\n    <p><small>Producido por la DTE</small></p>\n    <p><small>Dirección General de Cultura y Educación</small></p>\n    <p><small>Provincia de Buenos Aires</small></p>\n  </div>\n</div>\n");
$templateCache.put("app/design/design.html","<div class=\"container-fluid\">\n    \n  <div class=\"section-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n        <h1 data-area=\"{{area}}\">\n          <a title=\"Volver\" href=\"javascript:window.history.back()\" class=\"go-back\"><i class=\"fa fa-chevron-circle-left\"></i></a> {{titleArea}}</h1>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\" ng-hide=\"axisCollection.length === 0\">\n    <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n\n       <grid-panel repeat=\"eje in axisCollection\" class=\"grid-panel-ejes\"\n                   on-panel-opened=\"panelIsOpened(eje)\" on-panel-closed=\"panelIsClosed(eje)\">\n         <grid-panel-item>\n            <div>\n              <div class=\"eje\" data-target=\"{{eje.name}}\" data-owner=\"{{$parent.$parent.target}}\">\n                <a ng-show=\"eje.blocks.length===0\" ui-sref=\"tangibles.design({area: $parent.$parent.titleArea, axis: eje.name, block: \'Sin Especificar\'})\">\n                  <div class=\"img-wrap\">\n                    <img ng-src=\"{{eje.img}}\" alt=\"{{eje.name}}\">\n                  </div>\n                  <div class=\"title-wrap\">\n                    {{eje.name}}\n                  </div>\n                </a>\n                <a ng-hide=\"eje.blocks.length===0\">\n                  <div class=\"img-wrap\">\n                    <img ng-src=\"{{eje.img}}\" alt=\"{{eje.name}}\">\n                  </div>\n                  <div class=\"title-wrap\">\n                    {{eje.name}}\n                  </div>\n                </a>\n               </div>\n            </div>\n        </grid-panel-item>\n        <grid-panel-content class=\"grid-panel-content-block\">\n            <div>\n              <h4 class=\"eje-bloque\">{{eje.name}}</h4>\n              <ul class=\"blocks-list\">\n                <li ng-repeat=\"bloque in eje.blocks\">\n                  <a ui-sref=\"tangibles.design({area: $parent.$parent.$parent.titleArea, axis: eje.name, block: bloque.name})\">\n                    <div class=\"img-wrap\">\n                      <img ng-src=\"{{bloque.img}}\" alt=\"{{bloque.name}}\">\n                    </div>\n                    <div class=\"title-wrap\">\n                      {{bloque.name}}\n                    </div>\n                  </a>\n                </li>\n              </ul>\n              <div ng-show=\"eje.blocks.length == 0\">\n                <p style=\"font-size: 120%\">Esta sección no contiene bloques, <a class=\"btn btn-default\" ui-sref=\"tangibles.design({area: $parent.$parent.target, axis: eje.name, block: \'Sin Especificar\'})\">click aquí</a> para acceder al contenido.</p>\n              </div>\n            </div>\n        </grid-panel-content>\n       </grid-panel>\n    </div>\n  </div>\n\n  <div class=\"row\" ng-hide=\"areaCollection.length === 0\">\n    <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n      \n      <ul class=\"area-list\">\n        <li class=\"eje\" data-target=\"{{area.name}}\" ng-repeat=\"area in areaCollection\">\n          <a ui-sref=\"design({area: $parent.target, subarea: area.name})\">\n            <div class=\"img-wrap\">\n              <img ng-src=\"{{area.img}}\" alt=\"{{area.name}}\">\n            </div>\n            <div class=\"title-wrap\">\n              {{area.name}}\n            </div>\n          </a>\n         </li>\n      </ul>\n\n    </div>\n  </div>\n\n  <div class=\"footer-divider\"></div>\n\n</div>");
$templateCache.put("app/main/main.html","<div class=\"menu-roulette\" pad-menu-areas ng-class=\"{ inactive: !menu.opened }\"></div>");
$templateCache.put("app/main/orientacion.html","<div class=\"container\">\n  \n  <div class=\"row welcome-wrap\">\n    <div class=\"col-sm-11 col-sm-offset-1\">\n\n      <div class=\"row\">\n        \n        <div class=\"aboutus\">\n          <h4>Materiales de trabajo para la integración de las TIC en las escuelas primarias</h4>\n\n          <p>Esta serie de materiales breves de trabajo para la integración de las TIC en las escuelas primarias bonaerenses invita a todos los docentes a pensar los cambios y permanencias, los desafíos y oportunidades que nos ofrece la política de la integración de TIC en las escuelas y en las aulas y en cómo es posible, a partir de ellas, potenciar las propuestas de enseñanza, mejorar las condiciones de trabajo y enriquecer los aprendizajes de todos los alumnos y alumnas de nuestras escuelas.</p>\n\n          <p>\n            Los materiales se ofrecerán disponibles en distintos formatos y soportes para ampliar la oferta de accesos de los docentes a instancias de formación respecto del uso de las TIC. Asimismo se integrarán en un blog dependiente del PAD en el sitio ABC con opción de una lectura hipertextual entre los distintos materiales con el objeto de que los docentes puedan ir produciendo según sus expectativas y necesidades, diferentes trayectos, accesos y atajos para reflexionar sobre sus prácticas.\n          </p>\n            \n          <p>Algunos de los títulos que se incluyen en la etapa 1 de esta colección son:</p>\n\n          <ul>\n            <li>\n              <strong>La integración de TIC en la enseñanza</strong>\n              <p>Este material propone un acercamiento a las continuidades y rupturas que supone integrar la TIC en las prácticas docentes, proponiendo una mirada acerca del lugar pedagógico de las TIC para la enseñanza de las diferentes áreas curriculares, y presenta el PAD como estrategia de la política digital de la provincia en este sentido.</p>\n            </li>\n            <li>\n              <strong>La gestión escolar con TIC en las escuelas primarias de la Provincia.</strong>\n              <p>Este documento problematiza el lugar de las TIC en la gestión de las escuelas, y sus potencialidades como herramientas para la conducción y la organización institucional.</p>\n            </li>\n            <li>\n              <strong>La gestión del aula con TIC.</strong>\n              <p>El lugar de la planificación y las intervenciones del docente en la reconfiguración del tiempo y el espacio aúlico; la posibilidad de diversificar los contenidos y los niveles de aproximación al conocimiento; las prácticas del lenguaje que se pueden propiciar a partir de las TIC, entre otras alternativas que genera la incorporación de las netbook en el aula.</p>\n            </li>\n            <li>\n              <strong>La reconfiguración de la enseñanza en diálogo con los procesos de lectura y escritura propiciadas por la TIC.</strong>\n              <p>La posibilidad de propiciar otros diálogos, otros modos de construir los textos, los sentidos y la dimensión comunicacional del aula.</p>\n            </li>\n            <li>\n              <strong>El PAD como programa provincial para la enseñanza con TIC:</strong>\n              <p>Fundamentación, objetivos y desarrollo del PAD en el marco de la DTE-DPPE y DPEP. El Diseño Curricular provincial como marco para la construcción del PAD.</p>\n            </li>\n            <li>\n              <strong>El PAD llega a las escuelas.</strong>\n              <p>Presentación de equipamiento y las netbooks: para qué sirven, cómo se usan, qué posibilidades ofrecen para la enseñanza. Cómo resolver las mínimas cuestiones técnicas para su aprovechamiento.</p>\n            </li>\n            <li>\n              <strong>El PAD en las aulas</strong>\n              <p>El lugar de los asistentes digitales para la enseñanza de las áreas curriculares: criterios para su selección e incorporación en propuestas de enseñanza enmarcadas en el Diseño Curricular del Nivel. “Lo común” y “lo diferente”: los aspectos comunes y generales a la hora de diseñar situaciones de enseñanza con recursos digitales, y las especificidades de las áreas curriculares en dicho proceso.</p>\n            </li>\n          </ul>\n          \n          <p class=\"importante\">\n            <strong>IMPORTANTE:</strong> <i>Esta descripción engloba al primer alcance de una serie de documentos que se incluirán en esta sección. Hoy acercamos el primero de esta serie. En una segunda etapa, se ofrecerán desarrollos vinculados a las áreas curriculares y a la gestión institucional.</i>\n          </p>\n\n        </div>\n\n      </div>\n    </div>\n  </div>\n</div>");
$templateCache.put("app/main/transversales.html","<div class=\"container-fluid transversales\">\n  <div class=\"section-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n        <h1>Temas Transversales</h1>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n\n       <grid-panel repeat=\"area in areaCollection\" class=\"grid-panel-ejes\"\n                   on-panel-opened=\"panelIsOpened(area)\" on-panel-closed=\"panelIsClosed(area)\">\n         <grid-panel-item>\n            <div>\n              <div class=\"eje\" data-target=\"{{area.name}}\">\n                <a ng-show=\"area.axis.length===0\" ui-sref=\"tangibles.design({area: area.name, axis: \'Sin Especificar\', block: \'Sin Especificar\' })\">\n                  <div class=\"img-wrap\">\n                    <img ng-src=\"{{area.img}}\" alt=\"{{area.name}}\">\n                  </div>\n                  <div class=\"title-wrap\">\n                    {{area.name}}\n                  </div>\n                </a>\n                <a ng-hide=\"area.axis.length===0\">\n                  <div class=\"img-wrap\">\n                    <img ng-src=\"{{area.img}}\" alt=\"{{area.name}}\">\n                  </div>\n                  <div class=\"title-wrap\">\n                    {{area.name}}\n                  </div>\n                </a>\n               </div>\n            </div>\n        </grid-panel-item>\n        <grid-panel-content class=\"grid-panel-content-block\">\n            <div>\n              <h4>{{area.name}}</h4>\n              <ul class=\"blocks-list\">\n                <li ng-repeat=\"ax in area.axis\">\n                  <a ui-sref=\"tangibles.design({area: area.name, axis: ax.name, block: \'Sin Especificar\'})\">\n                    <div class=\"img-wrap\">\n                      <img ng-src=\"{{ax.img}}\" alt=\"{{ax.name}}\">\n                    </div>\n                    <div class=\"title-wrap\">\n                      {{ax.name}}\n                    </div>\n                  </a>\n                </li>\n              </ul>\n            </div>\n        </grid-panel-content>\n       </grid-panel>\n    </div>\n  </div>\n\n  <div class=\"footer-divider\"></div>\n\n</div>");
$templateCache.put("app/tangibles/tangible.html","<div class=\"container-fluid\">\n  <div class=\"section-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n        <h1 class=\"tangibles-current-section\">\n          <a title=\"Volver\" \n            href=\"javascript:window.history.back()\" \n            class=\"go-back\"><i class=\"fa fa-chevron-circle-left\"></i>\n          </a>\n          <a ui-sref=\"design({area: tangible.content.area})\" \n             data-area=\"{{tangible.sarea}}\"\n             class=\"btn btn-info larea\">\n            <i class=\"fa fa-caret-left\"></i> {{tangible.content.area}}\n          </a>\n          <a ui-sref=\"design({area: tangible.content.area, eje: tangible.content.axis})\"\n             data-area=\"{{tangible.sarea}}\" class=\"btn btn-info laxis\">\n            <i class=\"fa fa-caret-left\"></i> {{tangible.content.axis}}\n          </a>\n          <a ui-sref=\"tangibles.design({\n                    area: tangible.content.area,\n                    axis: tangible.content.axis, \n                    block: tangible.content.block})\"\n              data-area=\"{{tangible.sarea}}\" class=\"btn btn-info lblock\">\n          <i class=\"fa fa-caret-left\"></i> {{tangible.content.block}}</a></h1>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"container tangible-content\">\n  <div class=\"tangible-header clearfix\">\n    \n    <a href=\"/epm/dl/local/{{tangible.uid}}\" class=\"like pull-right\" target=\"_blank\"\n      data-toggle=\"tooltip\" data-placement=\"top\" title=\"Descargar Paquete\">\n      <i class=\"fa fa-cloud-download fa-2x\" aria-hidden=\"true\"></i>\n    </a>\n    <a href=\"javascript:void(0)\" class=\"like pull-right\" ng-click=\"addFavoritos()\" \n      data-toggle=\"tooltip\" data-placement=\"top\" title=\"Agregar/Quitar de Mis pines\">\n      <i ng-show=\"tangible.like\" class=\"fa fa-thumb-tack fa-2x\"></i>\n      <i ng-hide=\"tangible.like\" class=\"fa fa-thumb-tack fa-2x unlike\"></i>\n    </a>\n    <h3>{{tangible.content.title}}</h3>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-sm-6 text-center\">\n      <img class=\"text-center\" style=\"max-width: 100%\" \n           ng-src=\"/epm/asset/local/{{tangible.uid}}/cover/content\"\n           alt=\"{{tangible.title}}\"/>\n    </div>\n    <div class=\"col-sm-6 tangible-body\">\n      <h3><i class=\"fa fa-info-circle\"></i> Ficha Técnica</h3>\n      <blockquote class=\"datasheet\">\n        <p ng-bind-html=\"tangible.content.content\"></p>  \n        <footer><i class=\"fa fa-certificate\"></i> {{tangible.content.contentAuthor}} <cite id=\"source\" title=\"Fuente\">{{tangible.content.source}}</cite></footer>\n      </blockquote>\n      <div class=\"alert alert-info\" role=\"alert\" ng-show=\"accedio\">\n        <p><i class=\"fa fa-info\"></i> Se abrirá una nueva pestaña, si su navegador no soporta el contenido el mismo será descargado a su equipo.</p>\n        <p ng-show=\"tangible.hasDescription\"><i class=\"fa fa-warning\"></i> {{tangible.content.description}}</p>\n        <hr>\n        <a class=\"btn btn-primary\" style=\"width: 100%;\"\n         href=\"/epm/content/local/{{tangible.uid}}\" target=\"_blank\">Aceptar</a>\n      </div>\n      <a class=\"btn btn-default btn-tangible\" style=\"width: 100%;\"\n         ng-hide=\"accedio\" ng-click=\"accedio=true\"\n         href=\"javascript:void(0)\">Acceder al Contenido</a>\n    </div>\n    <div class=\"col-sm-12\">\n      <hr>\n      <ul class=\"tangible-tags\">\n        <li class=\"cloud text-center\">\n          <i class=\"fa fa-tag\"></i>\n        </li>\n        <li ng-repeat=\"tag in tangible.content.tags\">\n          <a ui-sref=\"tangibles.tag({tag: tag})\">{{tag}}</a>\n        </li>\n      </ul>\n    </div>\n  </div>\n</div>\n\n<div class=\"container-fluid\" >\n  <div class=\"row\" id=\"header-relations\">\n    <div class=\"col-sm-12 text-center\">\n      <p><a class=\"btn btn-default relacionado-first\"\n            ng-click=\"relFirst()\"><i class=\"fa fa-tags\"></i> Mostrar contenido relacionado</a></p>\n    </div>\n  </div>\n  <div ng-show=\"showRel\">\n    <div class=\"row\">\n      <hr>\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n        <h3 class=\"relacionados text-center\"><i class=\"fa fa-tags\"></i> Paquete relacionados</h3>\n        <hr>\n        <ng-include src=\"\'app/templates/area-legend.html\'\"></ng-include>\n      </div>\n    </div>\n    <div class=\"tangibles-wrapper\">\n      <div class=\"row\">\n        <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n          <div class=\"alert alert-info\" role=\"alert\" ng-show=\"noResults\">\n            <p class=\"text-center\"><i class=\"fa fa-warning\"></i> No hay resultados para mostrar</p>\n          </div>\n        </div>\n      </div>\n      <div tangibles-scroller=\"query\" tangibles-take=\"take\"></div>\n    </div>\n  </div>\n</div>");
$templateCache.put("app/tangibles/tangibles.favoritos.html","<div class=\"container-fluid\">\n  <div class=\"section-tagibles-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-2 text-right\">\n        <div style=\"margin-top: 18px\">\n          <a href=\"javascript:window.history.back()\" \n             class=\"go-back\"><i class=\"fa fa-chevron-circle-left fa-2x\"></i></a>\n         </div>        \n      </div>\n      <div class=\"col-sm-8 col-md-8 col-lg-10\">\n        <h1><i class=\"fa fa-thumb-tack\"></i> Mis pines</h1>\n      </div>\n    </div>\n  </div>\n  <div class=\"tangibles-wrapper\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n        <div class=\"alert alert-info\" role=\"alert\" ng-show=\"iniciando\">\n          <p class=\"text-center\"><i class=\"fa fa-spinner fa-pulse\"></i> Preparando el contenido ...</p>\n        </div>\n      </div>\n    </div>\n    <div tangibles-scroller=\"query\" tangibles-take=\"take\"></div>\n  </div>\n</div>");
$templateCache.put("app/tangibles/tangibles.html","<div class=\"container-fluid\">\n  <div class=\"section-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n        <h1 class=\"tangibles-current-section\">\n          <a title=\"Volver\" href=\"javascript:window.history.back()\" class=\"go-back\"><i class=\"fa fa-chevron-circle-left\"></i></a>\n          <a ui-sref=\"design({area: area})\" \n             data-area=\"{{sarea}}\"\n             class=\"btn btn-info larea\">\n            <i class=\"fa fa-caret-left\"> </i> {{area}}\n          </a>\n          <a ui-sref=\"design({area: area, eje: axis})\" \n             data-area=\"{{sarea}}\" class=\"btn btn-info laxis\">\n            <i class=\"fa fa-caret-left\"> </i> {{axis}}\n          </a>\n          <span href=\"\" data-area=\"{{sarea}}\" class=\"lblock\">{{block}}</span></h1>\n      </div>\n    </div>\n  </div>\n  <div class=\"tangibles-wrapper\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n        <div class=\"alert alert-info\" role=\"alert\" ng-show=\"iniciando\">\n          <p class=\"text-center\"><i class=\"fa fa-spinner fa-pulse\"></i> Preparando el contenido ...</p>\n        </div>\n      </div>\n    </div>\n    <div tangibles-scroller=\"query\" tangibles-take=\"take\"></div>\n  </div>\n</div>");
$templateCache.put("app/tangibles/tangibles.search.html","<div class=\"container-fluid\">\n  <div class=\"row\">\n    <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-10 col-lg-offset-1\">\n      <form class=\"form-horizontal\" ng-submit=\"search()\">\n        <p></p>\n        <div class=\"row\">\n          <div class=\"col-sm-2 text-right\">\n            <a href=\"javascript:window.history.back()\" class=\"go-back\"><i class=\"fa fa-chevron-circle-left fa-2x\"></i></a>\n          </div>\n          <div class=\"col-sm-8\">\n            <div class=\"form-group\">\n              <div class=\"input-group\">\n                <input id=\"searchInput\" class=\"form-control\" type=\"search\" delayed-model=\"searchText\" data-delay=\"500\" autofocus>  \n                <span class=\"input-group-btn\">\n                  <button class=\"btn btn-default\" type=\"submit\"><i class=\"fa fa-search\"></i></button>\n                </span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </form>\n      <ng-include src=\"\'app/templates/area-legend.html\'\"></ng-include>\n    </div>\n  </div>\n  <hr>\n  <div class=\"tangibles-wrapper\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n        <div class=\"alert alert-info\" role=\"alert\" ng-show=\"iniciando\">\n          <p class=\"text-center\"><i class=\"fa fa-spinner fa-pulse\"></i> Preparando el contenido ...</p>\n        </div>\n      </div>\n    </div>\n    <div tangibles-scroller=\"query\" tangibles-take=\"take\"></div>\n  </div>\n</div>");
$templateCache.put("app/tangibles/tangibles.tag.html","<div class=\"container-fluid\">\n  <div class=\"section-tagibles-header\">\n    <div class=\"row\">\n      <div class=\"col-sm-2 text-right\">\n        <div style=\"margin-top: 18px\">\n          <a href=\"javascript:window.history.back()\" \n             class=\"go-back\"><i class=\"fa fa-chevron-circle-left fa-2x\"></i></a>\n         </div>        \n      </div>\n      <div class=\"col-sm-8 col-md-8 col-lg-10\">\n        <h1>Resultados para el Tag: {{tag}}</h1>\n      </div>\n    </div>\n  </div>\n  <div class=\"tangibles-wrapper\">\n    <div class=\"row\">\n      <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n        <div class=\"alert alert-info\" role=\"alert\" ng-show=\"iniciando\">\n          <p class=\"text-center\"><i class=\"fa fa-spinner fa-pulse\"></i> Preparando el contenido ...</p>\n        </div>\n      </div>\n    </div>\n    <div tangibles-scroller=\"query\" tangibles-take=\"take\"></div>\n  </div>\n</div>");
$templateCache.put("app/templates/area-legend.html","<ul class=\"legend text-center\">\n  <li data-area=\"cn\">\n    <a href=\"javascript:void(0)\" \n       title=\"Ciencias Naturales\" ng-click=\"filter(\'Ciencias Naturales\')\">\n      <i class=\"fa fa-circle\"></i> CN</li>\n    </a>\n  <li data-area=\"cs\">\n    <a href=\"javascript:void(0)\" \n       title=\"Ciencias Sociales\" ng-click=\"filter(\'Ciencias Sociales\')\">\n      <i class=\"fa fa-circle\"></i> CS</li>\n    </a>\n  <li data-area=\"edar\">\n    <a href=\"javascript:void(0)\" \n       title=\"Educación Artística\" ng-click=\"filter(\'Educación Artística\')\">\n      <i class=\"fa fa-circle\"></i> EA</li>\n    </a>\n  <li data-area=\"ef\">\n    <a href=\"javascript:void(0)\" \n       title=\"Educación Física\" ng-click=\"filter(\'Educación Física\')\">\n      <i class=\"fa fa-circle\"></i> EF</li>\n    </a>\n  <li data-area=\"ing\">\n    <a href=\"javascript:void(0)\" \n       title=\"Inglés\" ng-click=\"filter(\'Inglés\')\">\n      <i class=\"fa fa-circle\"></i> ING</li>\n    </a>\n  <li data-area=\"mat\">\n    <a href=\"javascript:void(0)\" \n       title=\"Matemática\" ng-click=\"filter(\'Matemática\')\">\n      <i class=\"fa fa-circle\"></i> M</li>\n    </a>\n  <li data-area=\"pdl\">\n    <a href=\"javascript:void(0)\" \n       title=\"Prácticas del Lenguaje\" ng-click=\"filter(\'Prácticas del Lenguaje\')\">\n      <i class=\"fa fa-circle\"></i> PDL</li>\n    </a>\n  <li data-area=\"pea\">\n    <a href=\"javascript:void(0)\" \n       title=\"PAD en acción\" ng-click=\"filter(\'PAD en acción\')\">\n      <i class=\"fa fa-circle\"></i> PA</li>\n    </a>\n  <li data-area=\"cec\">\n    <a href=\"javascript:void(0)\" \n       title=\"Centros Educativos Complementarios\" ng-click=\"filter(\'Centros Educativos Complementarios\')\">\n      <i class=\"fa fa-circle\"></i> CEC</li>\n    </a>\n  <li data-area=\"eoe\">\n    <a href=\"javascript:void(0)\" \n       title=\"Equipos de Orientación Escolar\" ng-click=\"filter(\'Equipos de Orientación Escolar\')\">\n      <i class=\"fa fa-circle\"></i> EOE</li>\n    </a>\n</ul>");
$templateCache.put("app/templates/menu-areas.html","<audio preload=\"auto\" id=\"bubble_click\" src=\"assets/sound/bubble_click.mp3\"></audio>\n<audio preload=\"auto\" id=\"bubble_hover\" src=\"assets/sound/bubble_hover.mp3\"></audio>\n\n<ul class=\"roulette\">\n  <li class=\"bg-ing\">\n    <a ui-sref=\"design({area: \'Inglés\'})\">\n      <div data-area=\"ing\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-ef\">\n    <a ui-sref=\"design({area: \'Educación Física\'})\">\n      <div data-area=\"ef\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-cs\">\n    <a ui-sref=\"design({area: \'Ciencias Sociales\'})\">\n      <div data-area=\"cs\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-mat\">\n    <a ui-sref=\"design({area: \'Matemática\'})\">\n      <div data-area=\"mat\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-edart\">\n    <a ui-sref=\"design({area: \'Educación Artística\'})\">\n      <div data-area=\"edar\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-pdl\">\n    <a ui-sref=\"design({area: \'Prácticas del Lenguaje\'})\">\n      <div data-area=\"pdl\" class=\"item-area\"></div>\n    </a>\n  </li>\n  <li class=\"bg-cn\">\n    <a ui-sref=\"design({area: \'Ciencias Naturales\'})\">\n      <div data-area=\"cn\" class=\"item-area\"></div>\n    </a>\n  </li>\n</ul>\n<div class=\"center-roulette\"></div>\n<div class=\"border-roulette\"></div>\n<div class=\"center-roulette-area\"></div>");
$templateCache.put("app/templates/tangibles-scroller.html","\n<div infinite-scroll=\'loadMore()\' infinite-scroll-distance=\'1\' infinite-scroll-disabled=\'busy\' class=\"tangibles-columns\">\n  <div ng-repeat=\"tangible in tangibles\" >\n    <a ui-sref=\"tangibles.ver({uid: tangible.uid})\" title=\"{{tangible.content.title}}\">\n      <div class=\"pin\" data-area=\"{{tangible.sarea}}\">\n        <div class=\"text-right like-zone\">\n          <i ng-show=\"tangible.like\" class=\"fa fa-thumb-tack\"></i>\n          <i ng-hide=\"tangible.like\" class=\"fa fa-thumb-tack unlike\"></i>\n        </div>\n        <div class=\"pin-preload\">\n          <div class=\"i-wrapper\"><i class=\"fa fa-spinner fa-pulse fa-2x\"></i></div>\n        </div>\n        <img class=\"img-responsive\" pin-preload\n             ng-src=\"/epm/asset/local/{{tangible.uid}}/cover/front\"\n             alt=\"{{tangible.content.title}}\">\n        <p class=\"pin-caption\">{{tangible.content.title}}</p>\n      </div>\n    </a>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3\">\n    <div class=\"alert alert-warning\" role=\"alert\" ng-show=\"noResults\">\n      <p class=\"text-center\"><i class=\"fa fa-warning\"></i> No hay resultados para mostrar</p>\n    </div>\n  </div>\n</div>");
$templateCache.put("app/panel/stats/stats.html","<div class=\"container stats\">\n  <div class=\"page-header\">\n    <h2>{{total}} tangibles <small>{{ totalSize | numeraljs:\'00.00 b\' }}</small></h2>\n  </div>\n  \n  <hr>\n    \n    <div class=\"row\">\n      <div class=\"col-sm-6\">\n        <p><h3><i class=\"fa fa-cubes\"></i> Cantidad de paquetes</h3></p>\n        <canvas id=\"pie\" class=\"chart chart-pie\"\n          chart-data=\"data\" chart-labels=\"labels\" chart-legend=\"true\" chart-options=\"charOptions\">\n        </canvas> \n      </div>\n      <div class=\"col-sm-6\">\n        <p><h3><i class=\"fa fa-database\"></i> Tamaño del paquete</h3></p>\n        <canvas id=\"pie\" class=\"chart chart-pie\"\n          chart-data=\"dataSize\" chart-labels=\"labelsSize\" chart-legend=\"true\"  chart-options=\"charOptions\">\n        </canvas> \n      </div>\n    </div>\n\n  <hr>\n  <h2>Detalle</h2>\n  <hr>\n\n  <div class=\"panel-group\" id=\"accordion\" role=\"tablist\" aria-multiselectable=\"true\">\n    <div class=\"panel panel-default\" ng-repeat=\"area in areas\">\n      <div class=\"panel-heading\" role=\"tab\" id=\"heading{{$index}\">\n        <h3 class=\"panel-title\">\n          <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#accordion\" ng-click=\"collapse(\'area\' + $index)\"\n             href=\"javascript:void(0)\" aria-expanded=\"true\" aria-controls=\"area{{$index}}\">\n            <ul class=\"st-legend\">\n              <li>{{area.name}}</li>\n              <li><small><i class=\"fa fa-cubes\"></i> {{area.length}}</small></li>\n              <li><small><i class=\"fa fa-database\"></i> {{ area.size | numeraljs:\'00.00 b\' }}</small></li>\n            </ul>\n          </a>\n        </h3>\n      </div>\n      <div id=\"area{{$index}}\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"heading{{$index}\">\n        <div class=\"panel-body\">\n          <ul >\n            <li ng-repeat=\"ax in area.axis\">\n              <ul class=\"st-legend axis\">\n                <li>{{ax.name}}</li>\n                <li><small>({{ax.length}})</small></li>\n                <li><small>{{ ax.size | numeraljs:\'00.00 b\' }}</small></li>\n                <li ng-show=\"ax.missing\"><span class=\"label label-danger\">miss</span></li>\n              </ul>\n              <ul>\n                <li ng-repeat=\"bl in ax.blocks\">\n                  <ul class=\"st-legend block\">\n                    <li>{{bl.name}}</li>\n                    <li><small>({{bl.length}})</small></li>\n                    <li><small>{{ bl.size | numeraljs:\'00.00 b\' }}</small></li>\n                    <li><small> <a ui-sref=\"tangibles.design({ area:area.name, axis: ax.name, block: bl.name  })\" target=\"_blank\"><i class=\"fa fa-link\"></i></a></li>\n                    <li ng-show=\"bl.missing\"><span class=\"label label-danger\">miss</span></li>\n                  </ul>\n                </li>\n              </ul>\n            </li>\n          </ul>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <!--\n  <article ng-repeat=\"area in areas\">\n    <h4>{{area.name}}\n        <span class=\"label label-primary\"> {{area.length}}</span>\n        <span class=\"label label-info\">{{ area.size | numeraljs:\'00.00 b\' }}</span>\n    </h4>\n    <ul>\n      <li ng-repeat=\"ax in area.axis\">\n        <p>{{ax.name}}\n          <strong>  {{ax.length}}<strong> \n          <strong> {{ ax.size | numeraljs:\'00.00 b\' }}<strong> \n        </p>\n        <ul>\n          <li ng-repeat=\"bl in ax.blocks\">\n            <p>{{bl.name}}\n              <strong> {{bl.length}}</strong>\n              <strong> {{ bl.size | numeraljs:\'00.00 b\' }}</strong>\n            </p>\n          </li>\n        </ul>\n      </li>\n    </ul>\n  </article>\n  -->\n\n</div>");}]);