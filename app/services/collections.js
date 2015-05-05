(function(){

    var app = angular.module("services.collections",[]);

    app.constant("PATHC",{
        FACTORIES               :   config.API.host+'factory/load',
        COLLECTIONS             :   config.API.host+'catalogue-collection/load/status/0,1',
        COLLECTION_CARD         :   config.API.host+'catalogue-collection/get-collection-products/collectionId/',
        IMAGES_PATH             :   config.API.imagehost+'/files/factory/attachments/',
        FACTORYCOLLECTIONS      :   config.API.host+"catalogue-collection/load/status/0/factoryId/",
        CREATECOLLECTION        :   config.API.host+"catalogue-collection/create",
        UPDATECOLLECTION        :   config.API.host + "catalogue-collection/update",
        LOADFILES               :   config.API.host+'catalogue/loadfiles',
        DELETE_FILES             :   config.API.host+'catalogue/deletefile',
        LOADPRODUCTS            :   config.API.host+'catalogue-collection/add-collection-product',
        CANCELPRODUCT           :   config.API.host+'catalogue-collection/delete-collection-product/',
        CANCELCOLLECTION        :   config.API.host+'catalogue-collection/cancel/',
        LOADSIZES               :   config.API.host+'size/load',
        LOADORDERTYPES          :   config.API.host+'order-type/load/',
        ORDERCREATE             :   config.API.host+'order/create',
        PRODUCTSCREATE          :   config.API.host+'create.php',
        PRODUCTUPDATE           :   config.API.host+'catalogue/update',
        ADDORDERTOCOLLECTION    :     config.API.host+'catalogue-collection/add-order-collection',
        CREATEPRODUCTFACTORY    :     config.API.host+'order/create-factory-row',
        LOADSTATUSES            :     config.API.host+'status/load/type/factoryCatalogue',
        LOADONECOLLECTION       :    config.API.host+"catalogue-collection/load/id/",
        GETORDER                :    config.API.host+"order/get/id/",
        GETORDERROWS            :     config.API.host+"order/get-rows/id/",
        SENDORDER               :     config.API.host+"order/send-notification/id/"
    });

    app.factory("CollectionService", ["PATHC", 'RestFactory', '$modal', "$http",
        function(PATHC, RestFactory, $modal, $http) {

            /**
             *
             * @param files
             * @returns {Array}
             * @private
             */
            function _getArray(files){

                var array=[];

                for (var i=0;i<files.length;i++){

                    array.push(files[i].path);
                }

                return array;
            }







            return {

                /**
                 * Get All factories
                 *
                 * @returns {*}
                 */
                getFactories: function () {
                   // return RestFactory.request(PATHC.FACTORIES);
                    return $http.get(PATHC.FACTORIES);
                },

                /**
                 *
                 * @param factories
                 * @returns {Array}
                 */
                getFactoriesByGroup:function(factories){

                    var factory=[];

                        /*factories[6].factoryGroup.id=2;
                        factories[17].factoryGroup.id=2;*/

                    for(var f in factories){

                        if(factories[f].factoryGroup.id=="2"){
                            if( factories[f].factory.name == '') factories[f].factory.name = 'Other'
                            factory.push(
                                {
                                    name        :   factories[f].factory.name,
                                    phone       :  JSON.parse(factories[f].factory.phone),
                                    email       :   factories[f].email,
                                    address     :   factories[f].factoryAddress,
                                    preview     :   _getArray(factories[f].factoryFiles),
                                    id          :   f,
                                    currencyId  :   factories[f].factory.currencyId
                                }
                            )
                        }
                    }
                    //console.log(factory);
                    return factory;
                },

                /**
                 *
                 * @param factories
                 * @returns {Array}
                 */
                parseFactory: function(factories){
                    //console.log(factories);
                    var factory=[];

                    for( var f in factories){

                        factory.push(
                            {
                                name        :   factories[f].factory.name,
                                phone       :  JSON.parse(factories[f].factory.phone),
                                email       :   factories[f].email,
                                address     :   factories[f].factoryAddress,
                                preview     :   _getArray(factories[f].factoryFiles),
                                id          :   f,
                                currencyId  :   factories[f].factory.currencyId
                            }
                        )
                    }
                    //console.log("parser",factory);
                    return factory;
                },

                /**
                 * Get collection statuses
                 *
                 * @returns {*}
                 */
                getCollectionStatuses: function () {

                    //return RestFactory.request(PATHC.LOADSTATUSES);
                    return $http.get(PATHC.LOADSTATUSES);
                },

                /**
                 * Get All Collections
                 *
                 * @param params
                 * @returns {*}
                 */
                getCollections: function (url) {

                    return RestFactory.request(url);
                },

                getCurrentCollection:function(id){
                    var url= PATHC.LOADONECOLLECTION + id;
                    return RestFactory.request(url);
                },

                /**
                 *  Return filtered collections
                 *
                 * @param factories
                 * @returns {Array}
                 */
                filterCollections : function(response, factories, statuses) {
                    console.log(response);
                    var collections = [];

                    angular.forEach(response, function(value) {

                        angular.forEach(factories, function(factory) {
                            if(factory.id == value.factoryId) {
                                value.factoryName = factory.name;
                                value.factoryFiles = factory.files;
                                value.factoryPhone = JSON.parse(factory.phone);
                                value.factoryId = factory.id;
                            }
                        });

                        angular.forEach(statuses, function(status) {

                            if(status.id == value.status) {
                                value.statusName = status.name;
                            }
                        });
                        collections.push(value);
                    });

                    // using an iteratee function to sort collection by dateCreate
                    var sorted = _.sortBy(collections, 'createDate').reverse();

                    return sorted;
                },

                /**
                 * Send order created
                 *
                 * @param id
                 * @returns {*}
                 */
                sendCreatedOrder : function(id){

                    var url = PATHC.SENDORDER+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get order by Id
                 *
                 * @param id
                 * @returns {*}
                 */
                getOrder : function(id){

                    var url = PATHC.GETORDER+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get order rows by OrderId
                 *
                 * @param id
                 * @returns {*}
                 */
                getOrderRows : function(id){

                    var url = PATHC.GETORDERROWS+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get order rows by OrderId
                 *
                 * @param id
                 * @returns {*}
                 */
                fetchSizesCount : function(sizes, rows){
                    console.log('Response rows', _.first(rows).catalogueProduct);
                    console.log('Items sizes', sizes);
                },

                /**
                 * Get collections by factory
                 *
                 * @param id
                 * @returns {*}
                 */
                getFactoryCollections : function(id){

                    var url = PATHC.FACTORYCOLLECTIONS+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get Card of selected collection
                 *
                 * @returns {*}
                 */
                getCollectionCard: function (id) {

                    var url = PATHC.COLLECTION_CARD+id;
                    return RestFactory.request(url);
                },

                /**
                 * Get compare product index
                 *
                 * @param items
                 * @param object product
                 */
                compareProduct: function(items, product) {

                    var i;
                    angular.forEach(items, function(collection, index) {

                        if(collection.catalogueProduct.id === product.id) {

                            i = index;
                        }
                    });

                    return i;
                },

                /**
                 * Check filled sizes
                 *
                 * @param object sizes
                 * @return boolean
                 */
                isSizeExists: function(sizes) {

                    var size = [];
                    angular.forEach(sizes, function(sizeObj) {

                        if(sizeObj.count != '0' && sizeObj.count != '') {
                            size.push(sizeObj);
                        }
                    });

                    return (size.length > 0);
                },

                /**
                 * Check filled sizes from all collection
                 *
                 * @param object items
                 * @return boolean
                 */
                isSizesExists: function(items) {
                    console.log(items);
                    var i,length=items.length;
                    for(i=0;i<length;i++){

                        if(_.findKey(items[i].sizes,"count","0")||_.findKey(items[i].sizes,"count","")||_.findKey(items[i].sizes,"count",0)){
                            return false;
                        }
                    }
                    return true
                },
                /**
                 *
                 * @param products
                 * @param allSizes
                 * @returns {*}
                 */
                validationProducts:function(products,allSizes){
                    //console.log("validation",products);

                    var length=products.length,
                        sizes,
                        message,
                        reg=/^[,.\/-]/,
                        index;

                    for(var i=0;i<length;i++){
                        //article validation
                        if(products[i].article==""){
                            message="Please enter article in row #"+(i+1);
                            return message;
                        }
                        //size validation
                        if(products[i].sizes==""){
                        message='Please enter size in row #'+(i+1);
                        return message;
                        }
                        //slice first symbols if not size
                        if(reg.exec(products[i].sizes)){
                            index=reg.exec(products[i].sizes).index;
                            products[i].sizes=products[i].sizes.slice(index+1);
                        }
                        //make size array
                        if(typeof products[i].sizes==='string'){
                            products[i].sizes=products[i].sizes.split(/[,.\/-]+/);
                        }
                        //convert to UpperCase
                        for(var j=0;j<products[i].sizes.length;j++){
                            products[i].sizes[j]=products[i].sizes[j].toUpperCase();
                        }
                        //price validation
                        if(products[i].price==""){
                            message='Please enter price in row #'+(i+1);
                            return message;
                        }
                        if( _.isNaN(parseFloat(products[i].price))){
                            message='Please use only numbers and point in price fields. Row #'+(i+1);
                            return message;
                        }
                        else{
                            products[i].price=products[i].price.replace(",",".");
                        }
                    }
                    console.log(products);
                    return -1;//true
                },
                /**
                 *
                 * @param data
                 * @param collection
                 * @param sizes
                 * @returns {Array}
                 */
                buildProductsArray: function(data,collection,currency) {
                    console.log(data,collection,currency);
                    var array=[];

                    angular.forEach(data,function(value,i){

                        var photos = [];
                        angular.forEach(value.photos,function(img) {
                            this.push(img.id);
                        },photos);
                        //console.log(sizes);
                        var product = {
                            articul     :   value.article,
                            price       :   value.price,
                            collectionId:   collection.id,
                            photos      :   photos,
                            sizes       :   value.sizes,
                            currencyId  :   currency,
                            factoryId   :   parseInt(collection.factoryId)

                        };
                        this.push(product);

                    },array);
                    console.log(array);
                    return array;
                },

                /**
                 *
                 * @param products
                 */
                loadProducts: function(products) {
                    var params = {},i = 1;
                    angular.forEach(products,function(value,key) {
                        params['product'+i] = value;
                        i++;
                    });
                    var query = $.param(params);

                    return RestFactory.request(PATHC.LOADPRODUCTS,"POST", products);
                },
                /**
                 * Extract server response data requested by collectionId
                 *
                 * @param data
                 * @returns {Array}
                 */
                extractProducts: function(data) {
                    console.log("extract products",data);
                    for (var first in data) break;
                    var first = data[first], res = [];

                    if(_.isEmpty(first) === false) {

                        angular.forEach(first, function(collections, index) {

                            angular.forEach(collections, function(product) {

                                product.inOrder = false;

                                // assign sizes count to product
                                if(product.hasOwnProperty('sizes') && _.isEmpty(product.sizes) == false) {
                                    angular.forEach(product.sizes, function(value, index) {

                                        product.sizes[index].name = product.sizes[index].name.toUpperCase();
                                        product.sizes[index].count = '0';
                                    });
                                }

                                if(product.catalogueProduct.status == 1) {
                                    product.inOrder = true;
                                }

                                res.push(product);
                            });
                        });
                    }
                    return res;
                },

                /**
                 * Cancel collection
                 */
                cancelCollection: function (collectionId) {

                    //return RestFactory.request(PATHC.CANCELCOLLECTION, 'PUT', $.param({'id' : collectionId}));
                    return RestFactory.request(PATHC.CANCELCOLLECTION, 'PUT', {'id' : collectionId});
                },

                /**
                 * Check if collection is ordered
                 *
                 * return boolean
                 */
                isOrderByItems: function (items) {

                    var isOrder = _.map(items, 'inOrder');
                    return  isOrder.indexOf(true) !== -1;
                },

                /**
                 * Check if collection has ordered all items
                 *
                 * return boolean
                 */
                isOrderAll: function (items) {

                    var orderedItems =  _.findIndex(items, 'inOrder', false);

                    if(orderedItems== -1) return true;
                    else return false;
                },

                /**
                 * Delete product
                 */
                deleteProduct: function (collectionId, productId) {

                    var url = PATHC.CANCELPRODUCT+'collectionId/'+collectionId+'/productId/'+productId;

                    return RestFactory.request(url, 'DELETE');
                },

                /**
                 * Save product
                 */
                /*saveProduct: function (product) {

                    var params = {
                        'id' : product.catalogueProduct.id,
                        'articul' : product.catalogueProduct.articul,
                        'name'    : product.catalogueProduct.name,
                        'price'   : product.catalogueProduct.price,
                        'currencyId' : product.currency.id,
                        'sizes'     :   (function() {
                            var sizes = [];
                            angular.forEach(product.sizes, function(value, index){
                                sizes.push({
                                    id : value.id,
                                    name : value.name
                                })
                            });

                            return sizes;
                        })(product)
                    };

                    return RestFactory.request(PATHC.PRODUCTUPDATE, 'PUT', params);
                },*/

                /**
                 * Get image path
                 *
                 * @returns {*}
                 */
                getImagePath: function() {

                    return PATHC.IMAGES_PATH;
                },

                /**
                 * Load sizes
                 *
                 * @returns {*}
                 */
                loadSizes: function () {

                    return RestFactory.request(PATHC.LOADSIZES);
                },

                /**
                 * Load types
                 *
                 * @returns {*}
                 */
                loadOrderTypes: function () {

                    return RestFactory.request(PATHC.LOADORDERTYPES);
                },

                /**
                 *  Show Modal window
                 *
                 * @param path
                 * @param data
                 * @returns {*}
                 */
                showModal : function(path,size) {

                    var TEMPLATE={
                        NEW                 :   "/modules/buyer/views/collection/choose_factory.html",
                        CHOOSE              :   "/modules/buyer/views/collection/choose_collection.html",
                        ADDORDER            :   "/modules/buyer/views/collection/add_order.html",
                        CANCEL_COLLECTION   :   "/modules/buyer/views/collection/ask_collection.html",
                        CANCEL_PRODUCT      :   "/modules/buyer/views/collection/ask_product.html",
                        PROGRESS            :   "/modules/buyer/views/collection/progress_to_upload.html"
                    };

                    var s;
                    _.isUndefined(size) ? s="sm":s=size ;

                    var modal= $modal.open({
                        templateUrl : TEMPLATE[path],
                        controller : "ModalController",
                        size:s,
                        backdrop:'static'
                    });
                    return modal;
                },

                /**
                 *
                 * @param factoryId
                 * @returns {*}
                 */
                createCollection : function(factoryId){
                    console.log("id",factoryId);
                    var data={
                        factoryId:factoryId,
                        name:"collection"
                    };

                    return RestFactory.request(PATHC.CREATECOLLECTION,"POST",data);
                },

                updateCollection: function(id,status){
                    console.log(id);

                    return RestFactory.request(PATHC.UPDATECOLLECTION,"PUT",{'id' : id,status:status});
                },
                /**
                 *
                 * @param data
                 * @param name
                 */
                inSession:function(data,name){
                   localStorage[name]=angular.toJson(data);
                },
                /**
                 *
                 * @param name
                 * @returns {Object|Array|string|number|*}
                 */
                fromSession:function(name){
                    /*console.log(name);*/
                    return angular.fromJson(localStorage[name]);//localStorage.collection
                },
                /**
                 *
                 * @param key
                 */
                deleteSession:function(key){
                    localStorage.removeItem(key);
                },

                /**
                 *
                 * @param photo
                 * @returns {*}
                 */
                uploadFiles : function(file) {

                    var fd=new FormData();

                    fd.append('file[]',file);

                    return $http.post(PATHC.LOADFILES,fd,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        });

                    /*var fd=new FormData();
                    fd.append('file[]',file);
                    RestFactory.uploader(PATHC.LOADFILES,fd);*/


                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                deleteFiles: function(id){

                    return RestFactory.request(PATHC.DELETE_FILES,'POST',{id:id});
                },
                /**
                 *
                 * @param items
                 * @param key
                 * @param value
                 * @param increment
                 * @returns {*}
                 */
                completeProducts:function(items,key,value,increment){
                    //console.log(key);
                    for(var i=0;i<items.length;i++){
                        if(items[i][key]==""){
                            items[i][key]=value;
                            if(increment){
                                value++;
                            }
                        }
                    }
                    return items;
                },


                /**
                 * create new order
                 * @param buyerId
                 * @param collection
                 * @param currencyId
                 * @returns {*}
                 */
                orderCreate: function (buyerId,collection,currencyId,type) {
                    var typeId;
                    (!type)?typeId=1:typeId=type.typeId;
                    var params = {
                        'buyerId'       :   buyerId,
                        'factoryId'     :   collection.factoryId,
                        'type'          :   typeId,//type.typeId,
                        'currencyId'    :   currencyId
                    };
                    return RestFactory.request(PATHC.ORDERCREATE,"POST", params).then(function(response){
                        if(response.id) {
                            var params = {
                                'id'        :   parseInt(collection.id),
                                'orderId'   :   parseInt(response.id)
                            };
                            return RestFactory.request(PATHC.ADDORDERTOCOLLECTION,"PUT", params);
                        }
                        else return false;
                    });
                },

                /**
                 * Create product
                 *
                 * @param data
                 * @returns {*}
                 */
                productsCreate: function (data, orderId) {
                  /* console.log("pc",data);*/

                    var create = [];
                    create.push({
                        'method' : 'catalogue.createProductsBatch',
                        'params'  : {
                            'tokien_id'  : config.API.tokien_id,
                            'products'   : []
                        }
                    });

                    if(_.keys(data,'items')){

                        angular.forEach(data.items, function(item) {

                            var product = {}, photos = [];
                            product.tmpPhotos       = (function(item) {

                                angular.forEach(item.files, function(file) {
                                    photos.push(file.path);
                                });
                                return JSON.stringify(photos);
                            })(item);

                            product.factoryArticul  = parseInt(item.catalogueProduct.articul);
                            product.factoryId       = item.catalogueProduct.factoryId;
                            product.price           = item.catalogueProduct.price;
                            create[0].params.products.push(product);
                        });
                    }
                    /*console.log(create);*/
                    return RestFactory.request(PATHC.PRODUCTSCREATE, "POST", $.param({'data' : create})).then(function(backend) {
                            /*console.log("backend",backend);*/
                        if (backend.result) {

                            var response = JSON.parse(backend.result),
                                products = [];

                            if(data.items.length == Object.keys(response).length) {

                                // Compared front <-> backend created products

                                angular.forEach(data.items, function (frontendProduct) {

                                    if(!_.isEmpty(frontendProduct.sizes)) {

                                        angular.forEach(frontendProduct.sizes, function (size) {
                                            var tmp = {};

                                            if(size.count != '0') {

                                                tmp.id = frontendProduct.catalogueProduct.id,
                                                    tmp.articul =   (function() {
                                                        return _.pluck(_.filter(response, function(backProduct) {

                                                            // compare products
                                                            if(backProduct.factoryArticul == frontendProduct.catalogueProduct.articul) {
                                                                return backProduct.articul;
                                                            }
                                                        }), 'articul').toString();
                                                    })(frontendProduct.catalogueProduct);

                                                tmp.productId = (function() {
                                                    return _.pluck(_.filter(response, function(backProduct) {

                                                        // compare products
                                                        if(backProduct.factoryArticul == frontendProduct.catalogueProduct.articul) {
                                                            return backProduct.id;
                                                        }
                                                    }), 'id').toString();

                                                })(frontendProduct.catalogueProduct);

                                                tmp.sizeId  =   size.id;
                                                tmp.count   =   size.count;
                                                tmp.price   =   frontendProduct.catalogueProduct.price;
                                                tmp.orderId =   (!_.isUndefined(orderId)) ? orderId :data.collection.orderId;
                                                tmp.factoryArticul =   frontendProduct.catalogueProduct.articul;
                                            }

                                            products.push(tmp);
                                        });
                                    }
                                });
                                /*RestFactory.request(PATHC.UPDATECOLLECTION,"PUT",
                                    {
                                        id:data.collection.id,
                                        factoryId:data.collection.factoryId,
                                        status:1
                                    }).then(
                                    function(response){
                                        console.log("PUT ",response);
                                    }
                                );*/
                                console.log("products",products);
                                return RestFactory.request(PATHC.CREATEPRODUCTFACTORY,"POST", products);
                            }
                        }
                    });
                }
            };
        }]);
})();
