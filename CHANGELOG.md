# [3.4.0](https://github.com/stfsy/node-amy/compare/v3.3.0...v3.4.0) (2021-08-03)


### Bug Fixes

* component template added in wrong order ([ab7c886](https://github.com/stfsy/node-amy/commit/ab7c88648d71e1682199953970024b7c8ae43471))


### Features

* update node html light ([81994a7](https://github.com/stfsy/node-amy/commit/81994a7a68c242ecf19734bc262fcc3b2de2350c))



# [3.3.0](https://github.com/stfsy/node-amy/compare/v3.2.0...v3.3.0) (2021-07-07)


### Bug Fixes

* dash is not a valid character ([60e13a4](https://github.com/stfsy/node-amy/commit/60e13a4e3b2f17fb10c02387f6247266d3ef576d))


### Features

* support and validation for js components ([a9fe3fc](https://github.com/stfsy/node-amy/commit/a9fe3fc2ab17266651028948b2abfe36ce940303))



# [3.2.0](https://github.com/stfsy/node-amy/compare/v3.1.0...v3.2.0) (2021-07-07)


### Bug Fixes

* component with multiple root els not rendered correctly ([88c43a6](https://github.com/stfsy/node-amy/commit/88c43a61553f280fe11821314e4fc46296f14e90))
* no fallback if registry disabled ([e09ae9a](https://github.com/stfsy/node-amy/commit/e09ae9a714b532a6eab6481837a478dc9968d28f))


### Features

* add component registry reader ([e945a9c](https://github.com/stfsy/node-amy/commit/e945a9cc321b9f0f906a034c557f8d0cce786719))
* add options object and initliaze reader ([1267041](https://github.com/stfsy/node-amy/commit/126704125a0dce1516f32d204c9bc626b924cb82))
* add prefix to application components ([d5f7d2c](https://github.com/stfsy/node-amy/commit/d5f7d2c8aedddd0405e96834c9df7115608b619d))
* inject template elements into components slots ([cd2c0be](https://github.com/stfsy/node-amy/commit/cd2c0be384ca90b3979c5e4990e76f30b8c48b1e))
* update html light ([1032acf](https://github.com/stfsy/node-amy/commit/1032acf47e59549aa4bb190331783b7caf0d9572))
* update node-html-light ([40047a1](https://github.com/stfsy/node-amy/commit/40047a1b1fe86cfc66789bb272af292110cd494c))
* use component registry to resolve components ([7c49bf2](https://github.com/stfsy/node-amy/commit/7c49bf27a8674b65e577fd439e5ebd7ddb517cb4))


### Performance Improvements

* resolve path only if content not already cached ([6e39cfb](https://github.com/stfsy/node-amy/commit/6e39cfbad7303057eb9cd3486f32769f5b9ec222))



# [3.1.0](https://github.com/stfsy/node-amy/compare/v3.0.0...v3.1.0) (2021-07-05)


### Features

* update node-html-light ([2ff10ed](https://github.com/stfsy/node-amy/commit/2ff10ed12c47301ca2040eb36be83b32d3f4e2a7))



# [3.0.0](https://github.com/stfsy/node-amy/compare/v2.8.0...v3.0.0) (2021-07-04)


### Bug Fixes

* attributes of root nodes are not interpolated ([b494ffc](https://github.com/stfsy/node-amy/commit/b494ffc48124123f76524c84704113337ad6f51c))
* error trying to retrieve cached file ([97f0667](https://github.com/stfsy/node-amy/commit/97f066705e9ad624f0b2d56070bd080274628575))
* not all attributes are interpolated ([7048525](https://github.com/stfsy/node-amy/commit/70485253f54d1c465054c1c430231b4ea63a82f9))


### Features

* add callbacks for all commands ([5ead935](https://github.com/stfsy/node-amy/commit/5ead935f7a664e9167e7b22e548014c7378f2ed3))
* add canInterpolate method ([9d35ea5](https://github.com/stfsy/node-amy/commit/9d35ea5e27bd8713f8f586e427d917e862f410be))
* add interpolate with tokens function ([e0fd804](https://github.com/stfsy/node-amy/commit/e0fd8048117f4145239ee54adf005274d54decdc))
* add new compiler that uses precompilation ([a09e440](https://github.com/stfsy/node-amy/commit/a09e4403a997d65ea7896ef7666e19374a45c38d))
* add path builder ([5735e6c](https://github.com/stfsy/node-amy/commit/5735e6c11d59b5b06e06c8fbe451a53175dc42a7))
* add precompiling reader class ([5012672](https://github.com/stfsy/node-amy/commit/5012672948f95cb819d58d8d76344b942144d53a))
* add public method to get interpolatables ([824eff3](https://github.com/stfsy/node-amy/commit/824eff3618d6053c2d8dfa3e7a5674bb1e809f83))
* remove certain attributes if value "false" ([7cdd0f2](https://github.com/stfsy/node-amy/commit/7cdd0f2650ea3c8619411e26199d4a73bb195a3f))
* update node-html-light ([cc589cf](https://github.com/stfsy/node-amy/commit/cc589cf3417db97eb6a6baca1197f2d363e62647))
* use and export new compiler ([31b8b3d](https://github.com/stfsy/node-amy/commit/31b8b3d6e440e3ec8422306c8200752e21f14c80))
* use precompiling reader for interpolation ([ef32968](https://github.com/stfsy/node-amy/commit/ef329687f103711201a0512b81f478c27f02a047))



# [2.8.0](https://github.com/stfsy/node-amy/compare/v2.7.0...v2.8.0) (2021-06-25)



# [2.7.0](https://github.com/stfsy/node-amy/compare/v2.6.0...v2.7.0) (2021-06-25)



# [2.6.0](https://github.com/stfsy/node-amy/compare/v2.5.0...v2.6.0) (2021-06-25)


### Bug Fixes

* nodes not appended if comment is root ([abb0944](https://github.com/stfsy/node-amy/commit/abb094486655573e21e57242def6a8396cc93835))


### Features

* update node-html-light ([dbd0be4](https://github.com/stfsy/node-amy/commit/dbd0be42d516123b560e6fa19ed0cf5d210169ba))



# [2.5.0](https://github.com/stfsy/node-amy/compare/v2.4.0...v2.5.0) (2021-03-29)


### Features

* add hasher ([24fc976](https://github.com/stfsy/node-amy/commit/24fc976f40a7023f604ef19c68c90e3a94264c5b))
* add script style tag hasher component ([f45d4b2](https://github.com/stfsy/node-amy/commit/f45d4b2127e3e120d98f650665423bde99701bae))
* expose script style tag hasher ([fda07d6](https://github.com/stfsy/node-amy/commit/fda07d69723230a9786e6fdf110a75ad0a2d32bf))
* update dependencies ([c81c02f](https://github.com/stfsy/node-amy/commit/c81c02fa9a8e6ce62844c3e7597d94ff4df7aae2))



# [2.4.0](https://github.com/stfsy/node-amy/compare/v2.3.0...v2.4.0) (2021-03-24)


### Features

* allow caching of html files ([fcf0477](https://github.com/stfsy/node-amy/commit/fcf0477c4f2b9a2189ba242e6b579aa6818b12cb))
* update dependencies ([60fb6b4](https://github.com/stfsy/node-amy/commit/60fb6b473b13e68eb179898c2e1eeb9105cd0e40))



# [2.3.0](https://github.com/stfsy/node-amy/compare/v2.2.0...v2.3.0) (2021-03-20)


### Features

* update dependencies ([37f13d7](https://github.com/stfsy/node-amy/commit/37f13d76c65e7da7844e8e513ddd1757a7f7ea62))



# [2.2.0](https://github.com/stfsy/node-amy/compare/v2.1.0...v2.2.0) (2021-02-05)


### Bug Fixes

* if command does not execute following for each ([ecf6e68](https://github.com/stfsy/node-amy/commit/ecf6e680dac4861641c8dad6e40eaee245b058de))



# [2.1.0](https://github.com/stfsy/node-amy/compare/v2.0.1...v2.1.0) (2021-02-04)


### Bug Fixes

* include not executed if comments are removed ([0002e60](https://github.com/stfsy/node-amy/commit/0002e60a9b6624096c2926c307b346eb70ca88fe))
* node 14 doesnt like dir access mode ([8cf7e8a](https://github.com/stfsy/node-amy/commit/8cf7e8a36da1e9d050df6222e1515087b9db9fe6))


### Features

* make fs promise a dev dependency only ([f38c497](https://github.com/stfsy/node-amy/commit/f38c497132f7dd2a95e2b7b74cf3eadcf7c09047))
* update node-html-light to 2.2.0 ([2cc8177](https://github.com/stfsy/node-amy/commit/2cc81772d08f3b3dc03495981804c69e203300e1))



## [2.0.1](https://github.com/stfsy/node-amy/compare/v2.0.0...v2.0.1) (2021-01-29)


### Bug Fixes

* runtime compiler needs to pass remove comments ([2dbff78](https://github.com/stfsy/node-amy/commit/2dbff7820a80300afcbd7720701a866ad937c461))



# [2.0.0](https://github.com/stfsy/node-amy/compare/v1.10.0...v2.0.0) (2021-01-29)


### Features

* remove comment nodes on production ([a54d527](https://github.com/stfsy/node-amy/commit/a54d527f8818cff74afeeac1694dc24e87cdccd6))
* update dependencies ([35f6e36](https://github.com/stfsy/node-amy/commit/35f6e36505bdbab24b3cad030b8af7b17d1736bd))



# [1.10.0](https://github.com/stfsy/node-amy/compare/v1.9.0...v1.10.0) (2021-01-17)


### Features

* add if command ([43b1909](https://github.com/stfsy/node-amy/commit/43b1909ebdc08871ee2a07739251543d416a31cf))
* allow conditionals to follow if command ([19fe151](https://github.com/stfsy/node-amy/commit/19fe1518d1bbb905ccdcebaaaf627be80a69ee6c))
* check if conditional command is in command array ([5e5d4d8](https://github.com/stfsy/node-amy/commit/5e5d4d89ac90b66e41a2439230eb550af87bb07f))



# [1.9.0](https://github.com/stfsy/node-amy/compare/v1.8.0...v1.9.0) (2020-11-10)


### Bug Fixes

* forEach does not respect array order ([05737cb](https://github.com/stfsy/node-amy/commit/05737cb1dcaf852c05a11e5b4015430604cc622e))


### Features

* update dependencies ([6dc2682](https://github.com/stfsy/node-amy/commit/6dc2682d3fb53e8b2b674b2e8f11856e8cd80b1a))



# [1.8.0](https://github.com/stfsy/node-amy/compare/v1.7.0...v1.8.0) (2020-10-16)


### Features

* update node html light ([8c8d74a](https://github.com/stfsy/node-amy/commit/8c8d74ab6e5b75ac9fa58b233b116ca5a1eb721a))



# [1.7.0](https://github.com/stfsy/node-amy/compare/v1.6.0...v1.7.0) (2020-10-15)



# [1.6.0](https://github.com/stfsy/node-amy/compare/v1.5.1...v1.6.0) (2020-10-15)


### Features

* interpolate inline style script attrs too ([6e2c186](https://github.com/stfsy/node-amy/commit/6e2c186d95e3fc81144119b7ea6c9009a8e80eb4))



## [1.5.1](https://github.com/stfsy/node-amy/compare/v1.5.0...v1.5.1) (2020-08-21)


### Bug Fixes

* add command does not add nodes ([dce6c04](https://github.com/stfsy/node-amy/commit/dce6c045e3e4b74b0b0860b05444a842e1cb4537))



# [1.5.0](https://github.com/stfsy/node-amy/compare/v1.3.0...v1.5.0) (2020-08-21)


### Bug Fixes

* main property points nowhere ([3d95f52](https://github.com/stfsy/node-amy/commit/3d95f5262fe0b0c12f6144094d97e684cbbc083e))
* nodes cache last rendered state ([f16592e](https://github.com/stfsy/node-amy/commit/f16592eb7a69757afcd3954345930f4924a6d177))


### Features

* add runtime compiler ([8eaff51](https://github.com/stfsy/node-amy/commit/8eaff516847e4adc5e6dbbab1fb8041acfc94b9b))
* add template inclusion functionality ([9319039](https://github.com/stfsy/node-amy/commit/93190390a5f6f44e13008b55cd29b36df95d9b24))
* allow digits too ([81f6e19](https://github.com/stfsy/node-amy/commit/81f6e197fb7ca06f6c9dfa05aa237f6ce8a18627))
* expose dynamic compiler ([bfeb13e](https://github.com/stfsy/node-amy/commit/bfeb13e168d5db4f0df46ef656fe62faa5ac12d1))
* read node only once on init ([bf772b3](https://github.com/stfsy/node-amy/commit/bf772b33c6ae7a1527262e4f24b7bb7997d62c71))
* remove certain attributes if value is falsy ([55a1581](https://github.com/stfsy/node-amy/commit/55a1581bee86c1857d17459d7d802ae37d70d835))
* update dependencies ([6c78247](https://github.com/stfsy/node-amy/commit/6c78247246c79d1cff7cca01f7f5c0f83d7b2ed3))
* update dependencies ([6d2967c](https://github.com/stfsy/node-amy/commit/6d2967c98d0c5c13eda276ccf6e0def62b0148fd))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/stfsy/node-amy/compare/v1.3.0...v1.4.0) (2020-03-22)


### Features

* update dependencies ([6d2967c](https://github.com/stfsy/node-amy/commit/6d2967c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/stfsy/node-amy/compare/v1.0.1...v1.1.0) (2017-05-12)


### Bug Fixes

* **compiler2.js:** use appendChildAfter fn of parent node ([215fae4](https://github.com/stfsy/node-amy/commit/215fae4))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/stfsy/node-amy/compare/v1.0.0...v1.0.1) (2017-02-11)


### Bug Fixes

* **charCodeValidator/*.js:** fix requiring base validator fails ([93aa3bf](https://github.com/stfsy/node-amy/commit/93aa3bf))
* **package.json:** fix node-html-light version ([02ee2a5](https://github.com/stfsy/node-amy/commit/02ee2a5))



<a name="1.0.0"></a>
# 1.0.0 (2017-02-11)



