/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';



/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["css/app.css","469801c254efa28a56d39538d771e9d9"],["css/app.min.css","7cca6571ca031c0d90447d34100735be"],["css/icheques.css","e2dc8f7124fc08f9b3307a25a0f25d02"],["css/icheques.min.css","1051e0d494cd9edde603f9bca7bcd486"],["css/jive.css","0e41cc9f4ec05bdc8cf7e94af51ee179"],["css/jive.min.css","0e41cc9f4ec05bdc8cf7e94af51ee179"],["css/projuris.css","fbe9b725ad7ef7331c2a7e9e23718e4b"],["css/projuris.min.css","fbe9b725ad7ef7331c2a7e9e23718e4b"],["css/proshield-site.css","a2c2f5b85056b164f45d8101d5635532"],["css/proshield-site.min.css","a2c2f5b85056b164f45d8101d5635532"],["css/proshield.css","a76228f5b7aa4a08766fb2bd622370bf"],["css/proshield.min.css","a76228f5b7aa4a08766fb2bd622370bf"],["css/screen.css","c3f3a65e91fda0b2fc9df6cd8d3fa9b0"],["fonts/fontawesome-webfont.svg","2980083682e94d33a66eef2e7d612519"],["images/android/drawable-hdpi/ic_launcher.png","76c94848ef927c64f00c76636269b093"],["images/android/drawable-ldpi/ic_launcher.png","c3769cc06761b25f9978bfe3ce6579f3"],["images/android/drawable-mdpi/ic_launcher.png","bd30ec042cf6722bac218dacf783efd2"],["images/android/drawable-xhdpi/ic_launcher.png","f087a1a4b5b6dd07e726b3d0c1fb87fd"],["images/android/drawable-xxhdpi/ic_launcher.png","6e0e8eaa850c8b41a53c65efdbb683aa"],["images/android/drawable-xxxhdpi/ic_launcher.png","f5977008ec44695b7a7cdc92acfb4eb9"],["images/android/playstore-icon.png","cca60c78c74ff8b61ab6270727b7c4aa"],["images/arrow.svg","7aa4bc7eee562d691adffb88f6cc85f2"],["images/bipbop-logo-460.png","c7919873f86f8b4a8b7ece676589cc9d"],["images/cc/american.png","4b18371769a97c15f044073ab919406a"],["images/cc/blue-blue-circles.png","a2f49d2c4955be724fbffe50a0f2909d"],["images/cc/blue-red-circles.png","59e709ec215b8a28ebbde377d3913253"],["images/cc/blue-yellow-stripes.png","f811e4e4b100bcb9ac4425dc8d03cee2"],["images/cc/cvv-american.png","60e9b79f2a414e94d7219b0d6d26542f"],["images/cc/cvv-blue.png","01abbfadd05717b6ceebcaa5e19e6f7f"],["images/cc/cvv-gray.png","467422ff2cfcfeafd05206d6e5e65d8e"],["images/cc/delta.png","36621f71919daa218a0c2f51a248664b"],["images/cc/electro.png","2d4f0520bdcad1284127a27f5caf182b"],["images/cc/paypal.png","03a08b4291970b137bb69719d54e72f5"],["images/cc/red-yellow-circles.png","cee79ea49a97207b1a9f9147c880f39f"],["images/cc/solo.png","51e4787b46411482de0f342274570382"],["images/cc/switch.png","77b1a3a54d7dc29ec9aca5ce25f76ebb"],["images/cc/western.png","51dbe60bf74084537c9a3f57b3ebadc0"],["images/cc/white-orange-wave.png","e850bd0042ffc1f1f4180ac2a1699c6e"],["images/check.png","9b297d915472c9ee4c8f29b9c1888811"],["images/escudo.png","601063b2c639fea13f61e1490878a02d"],["images/escudo.svg","5e57c5a168d41ed0621272dc0cb03db0"],["images/favicon-escudo.png","13dbe777f9be4e83a9a9ef9d83a97a0f"],["images/favicon-projuris.png","770e21ec44c7cfd61b36602b9dc34264"],["images/favicon.png","60463ed637a1fd256c99700e85ca70c5"],["images/foguete.png","b32f065686a3307fc5c0ea322231dd8b"],["images/foguete.svg","07be716f9c2d50dbb82c29f000b6a28e"],["images/foguete_highres.png","6e1e851d2ddb55eb7f4048539f678d4c"],["images/foguete_linkedin.png","54700a9306782fd02490d7cf6f5da485"],["images/harlan.png","47f72c9bac0d5e98d907f97f2ebf84a0"],["images/icheques/background.jpg","4f5f0a244bccafe89f81dc8387dc37d3"],["images/icheques/cheque.svg","c6485710e086b1d5185aa4819cf310ea"],["images/icheques/favicon.png","eeed8a9435d96db15e7e302edaf58fc5"],["images/icheques/founder.jpg","9b88ec964bc638f97654497d1da117da"],["images/icheques/logo-icon.png","3b8fc353178e4c3170c4b767f4741bfc"],["images/icheques/logo-icon.svg","429a06fee310f5af6b2403bb3aede29c"],["images/icheques/logo-text.svg","f46e2a93e69c6910be4414d7b359607f"],["images/icheques/logo.svg","d81a864c4f29512b53f4b60dc0093ae2"],["images/icheques/texture.jpg","aee3bce135c920ffec7f20be51fab91d"],["images/ios/AppIcon.appiconset/Icon-40.png","83cd66f8beb5508bdd1d3585b84c6fe5"],["images/ios/AppIcon.appiconset/Icon-40@2x.png","ac615665b80a9774f311356d7c2690e3"],["images/ios/AppIcon.appiconset/Icon-40@3x.png","5a873d5059dd37123b1534b2348311e8"],["images/ios/AppIcon.appiconset/Icon-60@2x.png","5a873d5059dd37123b1534b2348311e8"],["images/ios/AppIcon.appiconset/Icon-60@3x.png","dcc5be15fd794ba8c46b8e1244672951"],["images/ios/AppIcon.appiconset/Icon-76.png","61fc7e171e72bf968dad883b925ce29d"],["images/ios/AppIcon.appiconset/Icon-76@2x.png","b80bc4bc4723a7be95fcac1b1e048d07"],["images/ios/AppIcon.appiconset/Icon-Small.png","512160ae6b4e04c0483b39c81c408327"],["images/ios/AppIcon.appiconset/Icon-Small@2x.png","4b8b1d7c1681bb8976a007f19994a97d"],["images/ios/AppIcon.appiconset/Icon-Small@3x.png","570aada6b5760f91c27f17cd7c5dc8cf"],["images/ios/Icon-60.png","7ca19604bb2d3c21de186926f56cda4c"],["images/ios/Icon-72.png","76c94848ef927c64f00c76636269b093"],["images/ios/Icon-72@2x.png","6e0e8eaa850c8b41a53c65efdbb683aa"],["images/ios/Icon-Small-50.png","ba197d9f92924b8c48a01e4fda8575b9"],["images/ios/Icon-Small-50@2x.png","cc93769225831f7ef1c84306500420b8"],["images/ios/Icon.png","24280f275e528be6c4719c120ddad9c1"],["images/ios/Icon@2x.png","0fd1e6cf353db59ffffbe4b8c5bc00e7"],["images/ios/iTunesArtwork.png","4a6554120474f3d46aed83b64fcaa3d6"],["images/ios/iTunesArtwork@2x.png","bf70c6f24d059ab3c0421efdb036d550"],["images/projuris.png","899982a364c1fa5dc1e8f2ae4684a417"],["images/security-warning.svg","9c75a9fe7bd4ecce6a91906152e5e31e"],["images/site/antecedentes/lock.png","6597067b63b8661a75310a376525f475"],["images/site/antecedentes/money.png","7d0ae44c70af1aae2bf5697de01c3e66"],["images/site/antecedentes/screenshoots/0.png","e406d944c6fff597421f7145052de157"],["images/site/antecedentes/screenshoots/1.png","a2631abe4d37f321f0fcef85f6fbc803"],["images/site/antecedentes/screenshoots/2.png","4f6076bb22b119bc5553dc8595d25e5e"],["images/site/antecedentes/screenshoots/3.png","eb45baf896e3979b550449c90c287c56"],["images/site/antecedentes/screenshoots/4.png","89e127a49018411530d37eceb9fd2b59"],["images/site/antecedentes/screenshoots/5.png","4f524e5b3fc894803483a8e78991cf54"],["images/site/antecedentes/time.png","2302e82ec534aa2ea8c2a849d78379cf"],["images/site/lock.png","6597067b63b8661a75310a376525f475"],["images/site/money.png","7d0ae44c70af1aae2bf5697de01c3e66"],["images/site/screenshoots/0.png","e406d944c6fff597421f7145052de157"],["images/site/screenshoots/1.png","a2631abe4d37f321f0fcef85f6fbc803"],["images/site/screenshoots/2.png","4f6076bb22b119bc5553dc8595d25e5e"],["images/site/screenshoots/3.png","eb45baf896e3979b550449c90c287c56"],["images/site/screenshoots/4.png","89e127a49018411530d37eceb9fd2b59"],["images/site/screenshoots/5.png","4f524e5b3fc894803483a8e78991cf54"],["images/site/time.png","2302e82ec534aa2ea8c2a849d78379cf"],["images/textures/brilliant.png","2d8584e19c4f34c793273a72a305a89f"],["images/textures/cross-stripes.png","e82e0f6662ca9a03172b44d155574133"],["images/textures/dark-dotted-2.png","24a88d17b7161ff492188ea41b73bcfe"],["images/textures/dark-geometric.png","ffbbf9dfbc4446817badc84358872bba"],["images/textures/dark-matter.png","1ab4daa4643fcc71c4d1521c9ec0132f"],["images/textures/diagmonds-light.png","b761884d1352bff4398a1ffc011b9691"],["images/watchkit/AppIcon.appiconset/Icon-24@2x.png","bd30ec042cf6722bac218dacf783efd2"],["images/watchkit/AppIcon.appiconset/Icon-27.5@2x.png","0faa61b53a1e6374a643bce06395170a"],["images/watchkit/AppIcon.appiconset/Icon-29@2x.png","4b8b1d7c1681bb8976a007f19994a97d"],["images/watchkit/AppIcon.appiconset/Icon-29@3x.png","570aada6b5760f91c27f17cd7c5dc8cf"],["images/watchkit/AppIcon.appiconset/Icon-40@2x.png","ac615665b80a9774f311356d7c2690e3"],["images/watchkit/AppIcon.appiconset/Icon-44@2x.png","2caa23b9e49691019d4509eb2682704d"],["images/watchkit/AppIcon.appiconset/Icon-86@2x.png","71e94eadefd053a8cc4da25635d5f3c7"],["images/watchkit/AppIcon.appiconset/Icon-98@2x.png","5b95a1e8ae23d12c92e5c2c838ef6456"],["images/wizard_1.svg","e3e023e9e9744ed7f40fd4c787c924d0"],["images/wizard_2.svg","7834ba8fa28264e77c0669d63e88cf44"],["images/wizard_3.svg","b89dc192359ff76e8cd3c521948c5efa"],["index.css.html","ea144ab66ff8b84f24e09ea4e368cabb"],["index.dev.html","762516607fa7de56664b0c2d97e229ee"],["index.html","2b133a93696a4d9a6b827f0005068bf5"],["js/app-installer.js","7e00a1af6906993956cbf43a0f3381b0"],["js/icheques.js","7252f5f9dab4633b71382c759c33900e"],["js/juristek.js","2b7c05b734d65b21b293bd45523cd63f"],["js/portofolio-icheques.js","3238b2ff6729aa305224a9acd7a8d6ec"],["js/portofolio-projuris.js","c6e241b7f051e312beffc2d1dfa22d4a"],["js/proshield.js","93c081b4a9ef7d2d06fd6fc40dc400b5"],["js/sinesp.js","09388f64fbfd6b7bc93549f217f48bf9"],["js/socialprofile.js","08b72b770caf57af3f23bcf9f3833432"],["js/spcnet.js","d88f93042275cb3d0b60fd6870a6a81c"],["js/sw.js","4ffdbb4ebf02d52338e9f80a96b772c3"],["plugins/templates/icheques-site.html","efdac9546d6e0a9a0be53dad32c8825e"],["plugins/templates/proshield-site.html","0a326c9e3bdc480134b20afd1b447d25"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, now) {
    now = now || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') + 'sw-precache=' + now;

    return urlWithCacheBusting.toString();
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) === -1;
        }).map(function(cacheName) {
          var urlWithCacheBusting = getCacheBustedUrl(CurrentCacheNamesToAbsoluteUrl[cacheName],
            now);

          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName], response);
              }

              console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) === 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html')) {
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});

